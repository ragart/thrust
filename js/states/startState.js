import { GAME_STATE } from '../constants.js';

export const startState = {
    id: GAME_STATE.START,
    handleKeyDown(key, context) {
        if (key === 'Enter') {
            context.startGame();
        }
    }
};
