import {
    WIDTH,
    HEIGHT,
    INITIAL_FUEL,
    BASE_FRAME_MS,
    RESPAWN_GRACE_MS,
    START_GRACE_MS,
    GAME_STATE
} from './constants.js';
import { drawGame } from './render.js';
import { initializeInputHandlers } from './input.js';
import { updatePlayerPhysics } from './physics.js';
import { createGameStateMachine } from './states/createGameStateMachine.js';
import { createLandscape } from './world/landscape.js';
import { EffectsTimers } from './effects/timers.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startPrompt = document.getElementById('start-prompt');
const startScreen = document.getElementById('start-screen');

let gameState = GAME_STATE.START;
let lastTimestamp = null;
const effectsTimers = new EffectsTimers();

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

function setGameState(nextState) {
    gameState = nextState;
    stateMachine.transitionTo(nextState);
}

function generateLandscape() {
    const generatedLandscape = createLandscape(WIDTH, HEIGHT);
    landscape.length = 0;
    landscape.push(...generatedLandscape);
}

const stateMachine = createGameStateMachine({
    startGame,
    pauseGame,
    resumeGame,
    returnToMainMenu,
    getRespawnGraceRemainingMs: () => effectsTimers.getRespawnGraceRemainingMs(),
    setThrust: (active) => {
        player.thrust = active;
    },
    setRotateLeft: (active) => {
        player.rotatingLeft = active;
    },
    setRotateRight: (active) => {
        player.rotatingRight = active;
    }
});

// --- Input Handling ---
initializeInputHandlers({
    startPrompt,
    onKeyDown: (key) => {
        stateMachine.handleKeyDown(key);
    },
    onKeyUp: (key) => {
        stateMachine.handleKeyUp(key);
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

    effectsTimers.tickVisualEffects(deltaMs);

    if (gameState === GAME_STATE.CRASHED) {
        if (effectsTimers.tickCrashRespawn(deltaMs)) {
            resetPlayer();
        }
    }

    if (gameState === GAME_STATE.PLAYING && !player.landed) {
        if (effectsTimers.hasRespawnGrace()) {
            effectsTimers.updateRespawnGrace(deltaMs);
            clearControlInputs();
        }

        if (effectsTimers.hasRespawnGrace()) {
            draw();
            requestAnimationFrame(update);
            return;
        }

        updatePlayerPhysics({
            player,
            landscape,
            dtScale,
            onLanded: () => {
                player.landed = true;
                setGameState(GAME_STATE.LANDED);
                player.velocity = { x: 0, y: 0 };
                player.angle = -Math.PI / 2;
                clearControlInputs();
                player.fuel = INITIAL_FUEL;
                effectsTimers.triggerTouchdown();
            },
            onCrash: () => {
                triggerCrash();
            }
        });
    }

    // --- Drawing ---
    draw();

    requestAnimationFrame(update);
}

function draw() {
    const effectsSnapshot = effectsTimers.getRenderSnapshot();

    drawGame(ctx, {
        gameState,
        landscape,
        player,
        ...effectsSnapshot
    });
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
    setGameState(GAME_STATE.CRASHED);
    effectsTimers.triggerCrash();
}

function pauseGame() {
    if (gameState !== GAME_STATE.PLAYING) {
        return;
    }

    clearControlInputs();
    setGameState(GAME_STATE.PAUSED);
}

function resumeGame() {
    if (gameState !== GAME_STATE.PAUSED) {
        return;
    }

    clearControlInputs();
    lastTimestamp = null;
    setGameState(GAME_STATE.PLAYING);
}

function returnToMainMenu() {
    clearControlInputs();
    effectsTimers.clearAll();
    player.velocity = { x: 0, y: 0 };
    player.landed = false;
    setGameState(GAME_STATE.START);
    startScreen.style.display = 'flex';
}

function resetPlayer(applyRespawnGrace = true, graceMs = RESPAWN_GRACE_MS, withCountdown = false) {
    player.x = WIDTH / 2;
    player.y = 100;
    player.velocity = { x: 0, y: 0 };
    player.angle = 0;
    player.landed = false;
    player.fuel = INITIAL_FUEL;
    clearControlInputs();
    effectsTimers.resetForSpawn(applyRespawnGrace, graceMs, withCountdown);
    setGameState(GAME_STATE.PLAYING);
}

function startGame() {
    startScreen.style.display = 'none';
    generateLandscape();
    lastTimestamp = null;
    resetPlayer(true, START_GRACE_MS, true);
}

// Initial draw
requestAnimationFrame(update);
