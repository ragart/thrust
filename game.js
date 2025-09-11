
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const WIDTH = 800;
const HEIGHT = 600;
const GRAVITY = 0.05;
const THRUST_POWER = 0.1;
const ROTATION_SPEED = 0.05;

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
    rotatingRight: false
};

// Landscape
const landscape = [];
const LANDSCAPE_SEGMENTS = 50;
const segmentWidth = WIDTH / LANDSCAPE_SEGMENTS;
for (let i = 0; i <= LANDSCAPE_SEGMENTS; i++) {
    landscape.push({ x: i * segmentWidth, y: HEIGHT - 100 + Math.random() * 50 });
}


// --- Input Handling ---
document.addEventListener('keydown', (e) => {
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
});

document.addEventListener('keyup', (e) => {
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
});

// --- Game Loop ---
function update() {
    // --- Physics ---
    // Rotation
    if (player.rotatingLeft) {
        player.angle -= ROTATION_SPEED;
    }
    if (player.rotatingRight) {
        player.angle += ROTATION_SPEED;
    }

    // Thrust
    if (player.thrust) {
        player.velocity.x += Math.cos(player.angle) * THRUST_POWER;
        player.velocity.y += Math.sin(player.angle) * THRUST_POWER;
    }

    // Gravity
    player.velocity.y += GRAVITY;

    // Update position
    player.x += player.velocity.x;
    player.y += player.velocity.y;

    // --- Collision Detection ---
    // Landscape
    for (let i = 0; i < landscape.length - 1; i++) {
        const p1 = landscape[i];
        const p2 = landscape[i+1];

        // Simple collision with floor
        if (player.x > p1.x && player.x < p2.x && player.y + player.radius > p1.y) {
             resetPlayer();
        }
    }
    // Walls
     if (player.x - player.radius < 0 || player.x + player.radius > WIDTH) {
        resetPlayer();
    }
    if (player.y - player.radius < 0) {
        resetPlayer();
    }


    // --- Drawing ---
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw landscape
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(landscape[0].x, landscape[0].y);
    for (let i = 1; i < landscape.length; i++) {
        ctx.lineTo(landscape[i].x, landscape[i].y);
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
    if (player.thrust) {
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


    requestAnimationFrame(update);
}

function resetPlayer() {
    player.x = WIDTH / 2;
    player.y = 100;
    player.velocity = { x: 0, y: 0 };
    player.angle = 0;
}


// Start the game
resetPlayer();
update();
