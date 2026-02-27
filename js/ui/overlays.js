import { WIDTH, HEIGHT, GAME_STATE } from '../constants.js';

export function drawFuel(ctx, player) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`Fuel: ${Math.ceil(player.fuel)}`, 20, 30);
}

export function drawLaunchCountdown(ctx, gameState, respawnGraceRemainingMs, showLaunchCountdown) {
    if (gameState !== GAME_STATE.PLAYING || respawnGraceRemainingMs <= 0) {
        return;
    }

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

export function drawCrashedOverlay(ctx, gameState) {
    if (gameState !== GAME_STATE.CRASHED) {
        return;
    }

    ctx.fillStyle = '#ff5555';
    ctx.font = '28px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Crashed!', WIDTH / 2, HEIGHT / 2 - 30);
}

export function drawLandedOverlay(ctx, gameState) {
    if (gameState !== GAME_STATE.LANDED) {
        return;
    }

    ctx.fillStyle = 'lime';
    ctx.font = '30px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Landed!', WIDTH / 2, HEIGHT / 2);
    ctx.font = '20px Courier New';
    ctx.fillText('Enter: Restart', WIDTH / 2, HEIGHT / 2 + 40);
    ctx.fillText('Esc: Main Menu', WIDTH / 2, HEIGHT / 2 + 70);
}

export function drawPausedOverlay(ctx, gameState) {
    if (gameState !== GAME_STATE.PAUSED) {
        return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'white';
    ctx.font = '36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', WIDTH / 2, HEIGHT / 2 - 40);
    ctx.font = '20px Courier New';
    ctx.fillText('Esc: Resume', WIDTH / 2, HEIGHT / 2 + 10);
    ctx.fillText('Enter: Main Menu', WIDTH / 2, HEIGHT / 2 + 40);
}
