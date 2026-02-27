import { GAME_STATE } from '../constants.js';

export const playingState = {
    id: GAME_STATE.PLAYING,
    handleKeyDown(key, context) {
        if (key === 'Escape') {
            context.pauseGame();
            return;
        }

        if (context.getRespawnGraceRemainingMs() > 0) {
            return;
        }

        switch (key) {
            case 'ArrowUp':
                context.setThrust(true);
                break;
            case 'ArrowLeft':
                context.setRotateLeft(true);
                break;
            case 'ArrowRight':
                context.setRotateRight(true);
                break;
        }
    },
    handleKeyUp(key, context) {
        switch (key) {
            case 'ArrowUp':
                context.setThrust(false);
                break;
            case 'ArrowLeft':
                context.setRotateLeft(false);
                break;
            case 'ArrowRight':
                context.setRotateRight(false);
                break;
        }
    }
};
