import { GAME_STATE } from '../constants.js';

export const pausedState = {
    id: GAME_STATE.PAUSED,
    handleKeyDown(key, context) {
        if (key === 'Escape') {
            context.resumeGame();
        } else if (key === 'Enter') {
            context.returnToMainMenu();
        }
    }
};
