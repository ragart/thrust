import {
    RESPAWN_GRACE_MS,
    TOUCHDOWN_EFFECT_MS,
    CRASH_EFFECT_MS,
    CRASH_RESPAWN_DELAY_MS
} from '../constants.js';

export class EffectsTimers {
    constructor() {
        this.respawnGraceRemainingMs = 0;
        this.showLaunchCountdown = false;
        this.touchdownEffectRemainingMs = 0;
        this.crashEffectRemainingMs = 0;
        this.crashRespawnRemainingMs = 0;
    }

    tickVisualEffects(deltaMs) {
        if (this.touchdownEffectRemainingMs > 0) {
            this.touchdownEffectRemainingMs = Math.max(0, this.touchdownEffectRemainingMs - deltaMs);
        }

        if (this.crashEffectRemainingMs > 0) {
            this.crashEffectRemainingMs = Math.max(0, this.crashEffectRemainingMs - deltaMs);
        }
    }

    tickCrashRespawn(deltaMs) {
        this.crashRespawnRemainingMs = Math.max(0, this.crashRespawnRemainingMs - deltaMs);
        return this.crashRespawnRemainingMs <= 0;
    }

    hasRespawnGrace() {
        return this.respawnGraceRemainingMs > 0;
    }

    updateRespawnGrace(deltaMs) {
        this.respawnGraceRemainingMs = Math.max(0, this.respawnGraceRemainingMs - deltaMs);
    }

    getRespawnGraceRemainingMs() {
        return this.respawnGraceRemainingMs;
    }

    triggerTouchdown() {
        this.touchdownEffectRemainingMs = TOUCHDOWN_EFFECT_MS;
    }

    triggerCrash() {
        this.crashEffectRemainingMs = CRASH_EFFECT_MS;
        this.crashRespawnRemainingMs = CRASH_RESPAWN_DELAY_MS;
        this.respawnGraceRemainingMs = 0;
        this.showLaunchCountdown = false;
    }

    resetForSpawn(applyRespawnGrace = true, graceMs = RESPAWN_GRACE_MS, withCountdown = false) {
        this.respawnGraceRemainingMs = applyRespawnGrace ? graceMs : 0;
        this.showLaunchCountdown = applyRespawnGrace && withCountdown;
        this.touchdownEffectRemainingMs = 0;
        this.crashEffectRemainingMs = 0;
        this.crashRespawnRemainingMs = 0;
    }

    clearAll() {
        this.respawnGraceRemainingMs = 0;
        this.showLaunchCountdown = false;
        this.touchdownEffectRemainingMs = 0;
        this.crashEffectRemainingMs = 0;
        this.crashRespawnRemainingMs = 0;
    }

    getRenderSnapshot() {
        return {
            touchdownEffectRemainingMs: this.touchdownEffectRemainingMs,
            crashEffectRemainingMs: this.crashEffectRemainingMs,
            respawnGraceRemainingMs: this.respawnGraceRemainingMs,
            showLaunchCountdown: this.showLaunchCountdown
        };
    }
}
