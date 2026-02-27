import {
    WIDTH,
    HEIGHT,
    TOUCHDOWN_EFFECT_MS,
    CRASH_EFFECT_MS,
    GAME_STATE
} from './constants.js';
import {
    drawFuel,
    drawLaunchCountdown,
    drawCrashedOverlay,
    drawLandedOverlay,
    drawPausedOverlay
} from './ui/overlays.js';

function drawLandscape(ctx, landscape) {
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
}

function drawTouchdownEffect(ctx, gameState, touchdownEffectRemainingMs, player) {
    if (gameState !== GAME_STATE.LANDED || touchdownEffectRemainingMs <= 0) {
        return;
    }

    const effectAlpha = touchdownEffectRemainingMs / TOUCHDOWN_EFFECT_MS;
    const effectRadius = player.radius + 8 + (1 - effectAlpha) * 10;
    ctx.strokeStyle = `rgba(0, 255, 0, ${effectAlpha.toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, effectRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
}

function drawCrashEffect(ctx, gameState, crashEffectRemainingMs, player) {
    if (gameState !== GAME_STATE.CRASHED || crashEffectRemainingMs <= 0) {
        return;
    }

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

function drawPlayer(ctx, player) {
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
}

function drawThrustFlame(ctx, player) {
    if (!player.thrust || player.landed || player.fuel <= 0) {
        return;
    }

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

export function drawGame(ctx, snapshot) {
    const {
        gameState,
        landscape,
        player,
        touchdownEffectRemainingMs,
        crashEffectRemainingMs,
        respawnGraceRemainingMs,
        showLaunchCountdown
    } = snapshot;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (gameState === GAME_STATE.START) {
        return;
    }

    drawLandscape(ctx, landscape);
    drawTouchdownEffect(ctx, gameState, touchdownEffectRemainingMs, player);
    drawCrashEffect(ctx, gameState, crashEffectRemainingMs, player);
    drawPlayer(ctx, player);
    drawThrustFlame(ctx, player);
    drawFuel(ctx, player);
    drawLaunchCountdown(ctx, gameState, respawnGraceRemainingMs, showLaunchCountdown);
    drawCrashedOverlay(ctx, gameState);
    drawLandedOverlay(ctx, gameState);
    drawPausedOverlay(ctx, gameState);
}
