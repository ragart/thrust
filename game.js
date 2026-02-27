
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
const MAX_SUBSTEP_DISTANCE = 4;
const BASE_FRAME_MS = 1000 / 60;
const RESPAWN_GRACE_MS = 600;
const START_GRACE_MS = 4000;
const TOUCHDOWN_EFFECT_MS = 350;
const CRASH_EFFECT_MS = 500;
const CRASH_RESPAWN_DELAY_MS = 700;

let gameState = 'start'; // 'start', 'playing', 'landed', 'crashed'
let lastTimestamp = null;
let respawnGraceRemainingMs = 0;
let showLaunchCountdown = false;
let touchdownEffectRemainingMs = 0;
let crashEffectRemainingMs = 0;
let crashRespawnRemainingMs = 0;

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
    if (gameState === 'playing' && respawnGraceRemainingMs <= 0) {
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
function update(timestamp) {
    if (lastTimestamp === null) {
        lastTimestamp = timestamp;
    }

    const deltaMs = Math.min(50, Math.max(0, timestamp - lastTimestamp));
    const dtScale = deltaMs / BASE_FRAME_MS;
    lastTimestamp = timestamp;

    if (touchdownEffectRemainingMs > 0) {
        touchdownEffectRemainingMs = Math.max(0, touchdownEffectRemainingMs - deltaMs);
    }

    if (crashEffectRemainingMs > 0) {
        crashEffectRemainingMs = Math.max(0, crashEffectRemainingMs - deltaMs);
    }

    if (gameState === 'crashed') {
        crashRespawnRemainingMs = Math.max(0, crashRespawnRemainingMs - deltaMs);
        if (crashRespawnRemainingMs <= 0) {
            resetPlayer();
        }
    }

    if (gameState === 'playing' && !player.landed) {
        if (respawnGraceRemainingMs > 0) {
            respawnGraceRemainingMs = Math.max(0, respawnGraceRemainingMs - deltaMs);
            clearControlInputs();
        }

        if (respawnGraceRemainingMs > 0) {
            draw();
            requestAnimationFrame(update);
            return;
        }

        // --- Physics ---
        // Rotation
        if (player.rotatingLeft) {
            player.angle -= ROTATION_SPEED * dtScale;
        }
        if (player.rotatingRight) {
            player.angle += ROTATION_SPEED * dtScale;
        }

        // Thrust
        if (player.thrust && player.fuel > 0) {
            player.velocity.x += Math.cos(player.angle) * THRUST_POWER * dtScale;
            player.velocity.y += Math.sin(player.angle) * THRUST_POWER * dtScale;
            player.fuel = Math.max(0, player.fuel - THRUST_FUEL_CONSUMPTION * dtScale);
        }

        // Gravity
        player.velocity.y += GRAVITY * dtScale;

        const frameVelocityX = player.velocity.x * dtScale;
        const frameVelocityY = player.velocity.y * dtScale;

        // Update position with substeps to avoid tunneling at high speed
        const movementMagnitude = Math.max(Math.abs(frameVelocityX), Math.abs(frameVelocityY));
        const substeps = Math.max(1, Math.ceil(movementMagnitude / MAX_SUBSTEP_DISTANCE));

        for (let step = 0; step < substeps; step++) {
            player.x += frameVelocityX / substeps;
            player.y += frameVelocityY / substeps;

            // --- Collision Detection ---
            if (checkCollisions()) {
                break;
            }
        }
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
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);

        if (player.x >= minX && player.x <= maxX) {
            const segmentLength = p2.x - p1.x;
            if (segmentLength === 0) {
                continue;
            }

            const t = Math.max(0, Math.min(1, (player.x - p1.x) / segmentLength));
            const terrainY = p1.y + (p2.y - p1.y) * t;

            if (player.y + player.radius < terrainY) {
                continue;
            }

            const isLandingZone = p1.isLandingPad && p2.isLandingPad;
            const verticalSpeed = Math.abs(player.velocity.y);
            const horizontalSpeed = Math.abs(player.velocity.x);
            
            // Normalize angle to be between -PI and PI
            const normalizedAngle = Math.atan2(Math.sin(player.angle), Math.cos(player.angle));
            const isUpright = Math.abs(normalizedAngle - (-Math.PI / 2)) < MAX_LANDING_ANGLE;

            if (isLandingZone && verticalSpeed < MAX_LANDING_SPEED_Y && horizontalSpeed < MAX_LANDING_SPEED_X && isUpright) {
                player.y = terrainY - player.radius;
                player.landed = true;
                gameState = 'landed';
                player.velocity = { x: 0, y: 0 };
                player.angle = -Math.PI / 2;
                clearControlInputs();
                player.fuel = INITIAL_FUEL;
                touchdownEffectRemainingMs = TOUCHDOWN_EFFECT_MS;
                return true;
            } else {
                player.y = terrainY - player.radius;
                triggerCrash();
                return true;
            }
        }
    }
    // Walls
     if (player.x - player.radius < 0 || player.x + player.radius > WIDTH) {
        player.x = Math.max(player.radius, Math.min(WIDTH - player.radius, player.x));
        triggerCrash();
        return true;
    }
    if (player.y - player.radius < 0) {
        player.y = player.radius;
        triggerCrash();
        return true;
    }

    return false;
}

function draw() {
     // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (gameState === 'start') {
        return;
    }

    // Draw landscape (batched by segment type)
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    for (let i = 1; i < landscape.length; i++) {
        const p1 = landscape[i - 1];
        const p2 = landscape[i];
        const isLandingSegment = p1.isLandingPad && p2.isLandingPad;

        if (!isLandingSegment) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
    }
    ctx.stroke();

    ctx.strokeStyle = 'lime';
    ctx.beginPath();
    for (let i = 1; i < landscape.length; i++) {
        const p1 = landscape[i - 1];
        const p2 = landscape[i];
        const isLandingSegment = p1.isLandingPad && p2.isLandingPad;

        if (isLandingSegment) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
    }
    ctx.stroke();

    // Draw touchdown effect
    if (gameState === 'landed' && touchdownEffectRemainingMs > 0) {
        const effectAlpha = touchdownEffectRemainingMs / TOUCHDOWN_EFFECT_MS;
        const effectRadius = player.radius + 8 + (1 - effectAlpha) * 10;
        ctx.strokeStyle = `rgba(0, 255, 0, ${effectAlpha.toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, effectRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    // Draw crash effect
    if (gameState === 'crashed' && crashEffectRemainingMs > 0) {
        const effectAlpha = crashEffectRemainingMs / CRASH_EFFECT_MS;
        const outerRadius = player.radius + 12 + (1 - effectAlpha) * 26;
        const innerRadius = player.radius + 4 + (1 - effectAlpha) * 14;

        ctx.strokeStyle = `rgba(255, 120, 0, ${effectAlpha.toFixed(3)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, outerRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 0, 0, ${(effectAlpha * 0.9).toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, innerRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

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

    if (gameState === 'playing' && respawnGraceRemainingMs > 0) {
        let countdownText = 'GO!';
        if (showLaunchCountdown) {
            if (respawnGraceRemainingMs > 3000) {
                countdownText = '3';
            } else if (respawnGraceRemainingMs > 2000) {
                countdownText = '2';
            } else if (respawnGraceRemainingMs > 1000) {
                countdownText = '1';
            }
        }

        ctx.fillStyle = 'white';
        ctx.font = 'bold 64px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(countdownText, WIDTH / 2, HEIGHT / 2);
    }

    if (gameState === 'crashed') {
        ctx.fillStyle = '#ff5555';
        ctx.font = '28px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Crashed!', WIDTH / 2, HEIGHT / 2 - 30);
    }

    if(gameState === 'landed'){
        ctx.fillStyle = 'lime';
        ctx.font = '30px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Landed!', WIDTH / 2, HEIGHT / 2);
        ctx.font = '20px Courier New';
        ctx.fillText('Press Enter to restart', WIDTH / 2, HEIGHT / 2 + 40);
    }
}

function clearControlInputs() {
    player.thrust = false;
    player.rotatingLeft = false;
    player.rotatingRight = false;
}

function triggerCrash() {
    clearControlInputs();
    player.velocity = { x: 0, y: 0 };
    player.landed = false;
    gameState = 'crashed';
    crashEffectRemainingMs = CRASH_EFFECT_MS;
    crashRespawnRemainingMs = CRASH_RESPAWN_DELAY_MS;
    respawnGraceRemainingMs = 0;
    showLaunchCountdown = false;
}

function resetPlayer(applyRespawnGrace = true, graceMs = RESPAWN_GRACE_MS, withCountdown = false) {
    player.x = WIDTH / 2;
    player.y = 100;
    player.velocity = { x: 0, y: 0 };
    player.angle = 0;
    player.landed = false;
    player.fuel = INITIAL_FUEL;
    clearControlInputs();
    respawnGraceRemainingMs = applyRespawnGrace ? graceMs : 0;
    showLaunchCountdown = applyRespawnGrace && withCountdown;
    touchdownEffectRemainingMs = 0;
    crashEffectRemainingMs = 0;
    crashRespawnRemainingMs = 0;
    gameState = 'playing';
}

function startGame() {
    startScreen.style.display = 'none';
    generateLandscape();
    resetPlayer(true, START_GRACE_MS, true);
}

// Initial draw
requestAnimationFrame(update);
