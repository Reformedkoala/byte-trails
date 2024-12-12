document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.querySelector(".play-button");
    let canvas, ctx, gameInterval;

    const canvasWidth = 800;
    const canvasHeight = 600;
    const cellSize = 10;
    let player = { x: 40, y: 40, dx: cellSize, dy: 0, trail: [] };
    let npc = { x: 760, y: 560, dx: -cellSize, dy: 0, trail: [] };
    const directions = [
        { dx: 0, dy: -cellSize }, // Up
        { dx: 0, dy: cellSize },  // Down
        { dx: -cellSize, dy: 0 }, // Left
        { dx: cellSize, dy: 0 },  // Right
    ];

    playButton.addEventListener("click", startGame);

    function startGame() {
        document.querySelector(".game-container").innerHTML = '';

        canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "2px solid #00ffff";
        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d");

        player = { x: 40, y: 40, dx: cellSize, dy: 0, trail: [] };
        npc = { x: 760, y: 560, dx: -cellSize, dy: 0, trail: [] };

        document.addEventListener("keydown", handleKeydown);
        gameInterval = setInterval(gameLoop, 100);
    }

    function handleKeydown(event) {
        const { key } = event;
        if (key === "ArrowUp" && player.dy === 0) {
            player.dx = 0;
            player.dy = -cellSize;
        } else if (key === "ArrowDown" && player.dy === 0) {
            player.dx = 0;
            player.dy = cellSize;
        } else if (key === "ArrowLeft" && player.dx === 0) {
            player.dx = -cellSize;
            player.dy = 0;
        } else if (key === "ArrowRight" && player.dx === 0) {
            player.dx = cellSize;
            player.dy = 0;
        }
    }

    function gameLoop() {
        moveEntity(player);

        moveNpc();

        if (checkCollision(player) || detectCollision(player, npc)) {
            endGame("Yikes! Rezner beat you. Try again!");
            return;
        } else if (checkCollision(npc)) {
            endGame("You beat Rezner! Congratulations!")
            return;
        }

        drawGame();
    }

    function moveEntity(entity) {
        entity.x += entity.dx;
        entity.y += entity.dy;
        entity.trail.push({ x: entity.x, y: entity.y });
    }

    function moveNpc() {
        //console.log(npc.dx)
        //console.log(npc.dy)
        let validDirections = [0,1,2,3]; // U,D,L,R
        let currentDirection = 0;
        if (npc.dx === 0) {
            if (npc.dy === cellSize) { // down
                currentDirection = 1;
                validDirections = validDirections.filter(function(e) { return e !== 0}); // up is not a valid direction
                //console.log("removing up because im going down rn");
            } else if (npc.dy === -cellSize) { // up
                currentDirection = 0;
                validDirections = validDirections.filter(function(e) { return e !== 1}); // down is not a valid direction
                //console.log("removing down because im going up rn");
            } else { console.log("bug with npc velocity in the up/down direction"); }
        } else if (npc.dx === -cellSize) {
            currentDirection = 2;
            validDirections = validDirections.filter(function(e) { return e !== 3}); // right is not a valid direction
            //console.log("removing right because im going left rn");
        } else if (npc.dx === cellSize) {
            currentDirection = 3;
            validDirections = validDirections.filter(function(e) { return e !== 2}); // left is not a valid direction
            //console.log("removing left because im going right rn");
        } else { console.log("bug with npc velocity in the left/right direction"); }

        if (npc.x - (cellSize) < 0) {
            validDirections = validDirections.filter(function(e) { return e !== 2}); // don't go off the map to the left
            console.log("removing left because i'll go off the map");
        } else if (npc.x + (2*cellSize) > canvasWidth) {
            validDirections = validDirections.filter(function(e) { return e !== 3}); // don't go off the map to the right
            console.log("removing right because i'll go off the map");
        } else if (npc.y - (cellSize) < 0) {
            validDirections = validDirections.filter(function(e) { return e !== 0}); // don't go off the map upwards
            console.log("removing up because i'll go off the map");
        } else if (npc.y + (2*cellSize) > canvasHeight) {
            validDirections = validDirections.filter(function(e) { return e !== 1}); // don't go off the map downwards
            console.log("removing down because i'll go off the map");
        }
        for (let dir of validDirections) {
            let trailAhead = false;
            let newMove = { x: npc.x, y: npc.y };
            switch (dir) {
                case 0:
                    newMove.y = newMove.y - cellSize;
                    break;
                case 1:
                    newMove.y = newMove.y + cellSize;
                    break;
                case 2:
                    newMove.x = newMove.x - cellSize;
                    break;
                case 3:
                    newMove.x = newMove.x + cellSize;
                    break;
                default:
                    console.log("bug with valid directions when check if a trail is ahead");
                    break;
            }
            if (newMove.x === player.x && newMove.y === player.y) {
                trailAhead = true;
            } else {
                for (let segment of npc.trail) {
                    if (newMove.x === segment.x && newMove.y === segment.y) {
                        trailAhead = true;
                        break;
                    }
                }
                if (!trailAhead) {
                    for (let segment of player.trail) {
                        if (newMove.x === segment.x && newMove.y === segment.y) {
                            trailAhead = true;
                            break;
                        }
                    }
                }
                
            }
            if (trailAhead) {
                validDirections = validDirections.filter(function(e) { return e !== dir}); // don't run into a trail
                console.log(dir)
                console.log("removing above direction because i'll run into a trail");
            }
        }
        
        if (validDirections.length == 0) {
            moveEntity(npc);
            return;
        } else if (validDirections.includes(currentDirection) && Math.random() > 0.1) {
            moveEntity(npc);
            return;
        } else {
            const newDirection = directions[validDirections[Math.floor(Math.random() * validDirections.length)]];
            console.log(newDirection)
            npc.dx = newDirection.dx;
            npc.dy = newDirection.dy;
            moveEntity(npc);
        }
    }

    function checkCollision(entity) {
        if (entity.x < 0 || entity.y < 0 || entity.x > canvasWidth || entity.y > canvasHeight) {
            return true;
        }

        for (let i = 0; i < entity.trail.length - 1; i++) {
            if (entity.x === entity.trail[i].x && entity.y === entity.trail[i].y) {
                return true;
            }
        }
        return false;
    }

    function detectCollision(entity1, entity2) {
        if (
            entity1.x === entity2.x &&
                entity1.y === entity2.y
        ) {
            return true;
        }

        for (let segment of entity2.trail) {
            if (entity1.x === segment.x && entity1.y === segment.y) {
                return true;
            }
        }

        for (let segment of entity1.trail) {
            if (entity2.x === segment.x && entity2.y === segment.y) {
                return true;
            }
        }

        return false;
    }

    function drawGame() {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = "#00ffff";
        //console.log(player.trail);
        for (let segment of player.trail) {
            ctx.fillRect(segment.x, segment.y, cellSize, cellSize);
        }

        ctx.fillStyle = "#00ffff";
        ctx.fillRect(player.x, player.y, cellSize, cellSize);

        ctx.fillStyle = "#ff5c00";
        for (let segment of npc.trail) {
            ctx.fillRect(segment.x, segment.y, cellSize, cellSize);
        }

        ctx.fillStyle = "#ff5c00";
        ctx.fillRect(npc.x, npc.y, cellSize, cellSize);
    }

    function endGame(winmessage) {
        clearInterval(gameInterval);
        alert(winmessage);
        document.body.removeChild(canvas);
        document.querySelector(".game-container").innerHTML = `
<h1 class="game-title">Byte Trails</h1>
<button class="play-button">Play</button>
<p class="instructions">Welcome to the grid. You are the Player and must defeat Rezner in byte trails.</p> 
<p class="instructions">Use the arrow keys to control your byte-cycle and drive around the screen.</p>
<p class="instructions">If you run into your trail, Rezner's, or the wall you will die. Good luck.</p>
    `; 
        document.querySelector(".play-button").addEventListener("click", startGame);
    }
});

