
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');

// Game constants
const WIDTH = 800;
const HEIGHT = 600;
const GRAVITY = 0.05;
const THRUST_POWER = 0.1;
const ROTATION_SPEED = 0.05;
const MAX_LANDING_SPEED_Y = 2;
const MAX_LANDING_SPEED_X = 2;
const MAX_LANDING_ANGLE = 0.1; // Radians, close to zero
const INITIAL_FUEL = 1000;
const THRUST_FUEL_CONSUMPTION = 1;

let gameState = 'start'; // 'start', 'playing', 'landed'

// Canvas setup
canvas.width = WIDTH;
canvas.height = HEIGHT;

// Player
const player = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: 15,
    angle: 0,
    velocity: { x: 0, y: 0 },
    thrust: false,
    rotatingLeft: false,
    rotatingRight: false,
    landed: false,
    fuel: INITIAL_FUEL
};

// Landscape
const landscape = [];
const LANDSCAPE_SEGMENTS = 50;
const segmentWidth = WIDTH / LANDSCAPE_SEGMENTS;
let landingPadPosition;

function generateLandscape() {
    landscape.length = 0;
    landingPadPosition = Math.floor(Math.random() * (LANDSCAPE_SEGMENTS - 5)) + 2;
    for (let i = 0; i <= LANDSCAPE_SEGMENTS; i++) {
        const isLandingPad = i >= landingPadPosition && i <= landingPadPosition + 3;
        const y = isLandingPad ? HEIGHT - 100 : HEIGHT - 100 + Math.random() * 50;
        if (isLandingPad && i > landingPadPosition) {
            landscape[i] = { x: i * segmentWidth, y: landscape[i-1].y, isLandingPad: true };
        } else {
            landscape.push({ x: i * segmentWidth, y: y, isLandingPad: isLandingPad });
        }
    }
}

// --- Input Handling ---
startButton.addEventListener('click', () => {
    startGame();
});

document.addEventListener('keydown', (e) => {
    if (gameState === 'landed' && e.key === 'Enter') {
        startGame();
    }
    if (gameState === 'landed' && e.key === 'ArrowUp') {
        player.landed = false;
        gameState = 'playing';
    }
    if (gameState === 'playing') {
        switch (e.key) {
            case 'ArrowUp':
                player.thrust = true;
                break;
            case 'ArrowLeft':
                player.rotatingLeft = true;
                break;
            case 'ArrowRight':
                player.rotatingRight = true;
                break;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (gameState === 'playing') {
        switch (e.key) {
            case 'ArrowUp':
                player.thrust = false;
                break;
            case 'ArrowLeft':
                player.rotatingLeft = false;
                break;
            case 'ArrowRight':
                player.rotatingRight = false;
                break;
        }
    }
});

// --- Game Loop ---
function update() {
    if (gameState === 'playing' && !player.landed) {
        // --- Physics ---
        // Rotation
        if (player.rotatingLeft) {
            player.angle -= ROTATION_SPEED;
        }
        if (player.rotatingRight) {
            player.angle += ROTATION_SPEED;
        }

        // Thrust
        if (player.thrust && player.fuel > 0) {
            player.velocity.x += Math.cos(player.angle) * THRUST_POWER;
            player.velocity.y += Math.sin(player.angle) * THRUST_POWER;
            player.fuel -= THRUST_FUEL_CONSUMPTION;
        }

        // Gravity
        player.velocity.y += GRAVITY;

        // Update position
        player.x += player.velocity.x;
        player.y += player.velocity.y;

        // --- Collision Detection ---
        checkCollisions();
    }

    // --- Drawing ---
    draw();

    requestAnimationFrame(update);
}

function checkCollisions() {
    // Landscape
    for (let i = 0; i < landscape.length - 1; i++) {
        const p1 = landscape[i];
        const p2 = landscape[i+1];

        if (player.x > p1.x && player.x < p2.x && player.y + player.radius > p1.y) {
            const isLandingZone = p1.isLandingPad && p2.isLandingPad;
            const verticalSpeed = Math.abs(player.velocity.y);
            const horizontalSpeed = Math.abs(player.velocity.x);
            
            // Normalize angle to be between -PI and PI
            const normalizedAngle = (player.angle + Math.PI) % (2 * Math.PI) - Math.PI;
            const isUpright = Math.abs(normalizedAngle - (-Math.PI / 2)) < MAX_LANDING_ANGLE;

            if (isLandingZone && verticalSpeed < MAX_LANDING_SPEED_Y && horizontalSpeed < MAX_LANDING_SPEED_X && isUpright) {
                player.landed = true;
                gameState = 'landed';
                player.velocity = { x: 0, y: 0 };
                player.angle = -Math.PI / 2;
                player.fuel = INITIAL_FUEL;
            } else {
                resetPlayer();
            }
        }
    }
    // Walls
     if (player.x - player.radius < 0 || player.x + player.radius > WIDTH) {
        resetPlayer();
    }
    if (player.y - player.radius < 0) {
        resetPlayer();
    }
}

function draw() {
     // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (gameState === 'start') {
        return;
    }

    // Draw landscape
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(landscape[0].x, landscape[0].y);
    for (let i = 1; i < landscape.length; i++) {
        ctx.strokeStyle = landscape[i].isLandingPad ? 'lime' : '#fff';
        ctx.lineTo(landscape[i].x, landscape[i].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(landscape[i].x, landscape[i].y);
    }
    ctx.stroke();

    // Draw player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.beginPath();
    ctx.moveTo(player.radius, 0);
    ctx.lineTo(-player.radius / 2, -player.radius / 2);
    ctx.lineTo(-player.radius / 2, player.radius / 2);
    ctx.closePath();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.restore();

    // Draw thrust flame
    if (player.thrust && !player.landed && player.fuel > 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        ctx.beginPath();
        ctx.moveTo(-player.radius / 2, 0);
        ctx.lineTo(-player.radius * 1.5, 0);
        ctx.strokeStyle = 'orange';
        ctx.stroke();
        ctx.restore();
    }

    // Draw Fuel
    ctx.fillStyle = 'white';
    ctx.font = '20px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`Fuel: ${Math.ceil(player.fuel)}`, 20, 30);

    if(gameState === 'landed'){
        ctx.fillStyle = 'lime';
        ctx.font = '30px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Landed!', WIDTH / 2, HEIGHT / 2);
        ctx.font = '20px Courier New';
        ctx.fillText('Press Enter to restart', WIDTH / 2, HEIGHT / 2 + 40);
    }
}

function resetPlayer() {
    player.x = WIDTH / 2;
    player.y = 100;
    player.velocity = { x: 0, y: 0 };
    player.angle = 0;
    player.landed = false;
    player.fuel = INITIAL_FUEL;
    gameState = 'playing';
}

function startGame() {
    startScreen.style.display = 'none';
    generateLandscape();
    resetPlayer();
}

// Initial draw
update();
