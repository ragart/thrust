import {
    WIDTH,
    GRAVITY,
    THRUST_POWER,
    ROTATION_SPEED,
    THRUST_FUEL_CONSUMPTION,
    MAX_LANDING_SPEED_Y,
    MAX_LANDING_SPEED_X,
    MAX_LANDING_ANGLE,
    MAX_SUBSTEP_DISTANCE
} from './constants.js';

function checkCollisions({ player, landscape, onLanded, onCrash }) {
    for (let i = 0; i < landscape.length - 1; i++) {
        const p1 = landscape[i];
        const p2 = landscape[i + 1];
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
            const normalizedAngle = Math.atan2(Math.sin(player.angle), Math.cos(player.angle));
            const isUpright = Math.abs(normalizedAngle - (-Math.PI / 2)) < MAX_LANDING_ANGLE;

            if (
                isLandingZone &&
                verticalSpeed < MAX_LANDING_SPEED_Y &&
                horizontalSpeed < MAX_LANDING_SPEED_X &&
                isUpright
            ) {
                player.y = terrainY - player.radius;
                onLanded();
                return true;
            }

            player.y = terrainY - player.radius;
            onCrash();
            return true;
        }
    }

    if (player.x - player.radius < 0 || player.x + player.radius > WIDTH) {
        player.x = Math.max(player.radius, Math.min(WIDTH - player.radius, player.x));
        onCrash();
        return true;
    }

    if (player.y - player.radius < 0) {
        player.y = player.radius;
        onCrash();
        return true;
    }

    return false;
}

export function updatePlayerPhysics({ player, landscape, dtScale, onLanded, onCrash }) {
    if (player.rotatingLeft) {
        player.angle -= ROTATION_SPEED * dtScale;
    }

    if (player.rotatingRight) {
        player.angle += ROTATION_SPEED * dtScale;
    }

    if (player.thrust && player.fuel > 0) {
        player.velocity.x += Math.cos(player.angle) * THRUST_POWER * dtScale;
        player.velocity.y += Math.sin(player.angle) * THRUST_POWER * dtScale;
        player.fuel = Math.max(0, player.fuel - THRUST_FUEL_CONSUMPTION * dtScale);
    }

    player.velocity.y += GRAVITY * dtScale;

    const frameVelocityX = player.velocity.x * dtScale;
    const frameVelocityY = player.velocity.y * dtScale;

    const movementMagnitude = Math.max(Math.abs(frameVelocityX), Math.abs(frameVelocityY));
    const substeps = Math.max(1, Math.ceil(movementMagnitude / MAX_SUBSTEP_DISTANCE));

    for (let step = 0; step < substeps; step++) {
        player.x += frameVelocityX / substeps;
        player.y += frameVelocityY / substeps;

        if (checkCollisions({ player, landscape, onLanded, onCrash })) {
            break;
        }
    }
}
