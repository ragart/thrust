export class StateMachine {
    constructor({ states, context, initialStateId }) {
        this.states = states;
        this.context = context;
        this.currentStateId = initialStateId;
        this.currentState = this.states[this.currentStateId];
    }

    transitionTo(nextStateId) {
        if (!this.states[nextStateId] || nextStateId === this.currentStateId) {
            return;
        }

        if (this.currentState?.onExit) {
            this.currentState.onExit(this.context, this);
        }

        this.currentStateId = nextStateId;
        this.currentState = this.states[this.currentStateId];

        if (this.currentState?.onEnter) {
            this.currentState.onEnter(this.context, this);
        }
    }

    handleKeyDown(key) {
        if (this.currentState?.handleKeyDown) {
            this.currentState.handleKeyDown(key, this.context, this);
        }
    }

    handleKeyUp(key) {
        if (this.currentState?.handleKeyUp) {
            this.currentState.handleKeyUp(key, this.context, this);
        }
    }
}
