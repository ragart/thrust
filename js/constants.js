export const WIDTH = 800;
export const HEIGHT = 600;
export const GRAVITY = 0.05;
export const THRUST_POWER = 0.1;
export const ROTATION_SPEED = 0.05;
export const MAX_LANDING_SPEED_Y = 2;
export const MAX_LANDING_SPEED_X = 2;
export const MAX_LANDING_ANGLE = 0.1;
export const INITIAL_FUEL = 1000;
export const THRUST_FUEL_CONSUMPTION = 1;
export const MAX_SUBSTEP_DISTANCE = 4;
export const BASE_FRAME_MS = 1000 / 60;
export const RESPAWN_GRACE_MS = 600;
export const START_GRACE_MS = 4000;
export const TOUCHDOWN_EFFECT_MS = 350;
export const CRASH_EFFECT_MS = 500;
export const CRASH_RESPAWN_DELAY_MS = 700;

export const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LANDED: 'landed',
    CRASHED: 'crashed'
};
