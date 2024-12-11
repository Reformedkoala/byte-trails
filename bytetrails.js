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
        if (Math.random() < 0.1) {
            const newDirection = directions[Math.floor(Math.random() * directions.length)];
            npc.dx = newDirection.dx;
            npc.dy = newDirection.dy;
        }
        moveEntity(npc);
        if (npc.x < 0 || npc.y < 0 || npc.x >= canvasWidth || npc.y >= canvasHeight) {
            npc.dx = -npc.dx;
            npc.dy = -npc.dy;
        }
    }

    function checkCollision(entity) {
        if (entity.x < 0 || entity.y < 0 || entity.x >= canvasWidth || entity.y >= canvasHeight) {
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
        console.log(player.trail);
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

