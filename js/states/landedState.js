import { GAME_STATE } from '../constants.js';

export const landedState = {
    id: GAME_STATE.LANDED,
    handleKeyDown(key, context) {
        if (key === 'Enter') {
            context.startGame();
        } else if (key === 'Escape') {
            context.returnToMainMenu();
        }
    }
};
