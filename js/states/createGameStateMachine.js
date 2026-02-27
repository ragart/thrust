import { GAME_STATE } from '../constants.js';
import { StateMachine } from './StateMachine.js';
import { startState } from './startState.js';
import { playingState } from './playingState.js';
import { pausedState } from './pausedState.js';
import { landedState } from './landedState.js';
import { crashedState } from './crashedState.js';

export function createGameStateMachine(context) {
    return new StateMachine({
        states: {
            [GAME_STATE.START]: startState,
            [GAME_STATE.PLAYING]: playingState,
            [GAME_STATE.PAUSED]: pausedState,
            [GAME_STATE.LANDED]: landedState,
            [GAME_STATE.CRASHED]: crashedState
        },
        context,
        initialStateId: GAME_STATE.START
    });
}
