const BLOCKED_KEYS = ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'];

export function initializeInputHandlers({
    startPrompt,
    onKeyDown,
    onKeyUp
}) {
    startPrompt.textContent = 'Press Enter to Start';

    document.addEventListener('keydown', (event) => {
        if (BLOCKED_KEYS.includes(event.key)) {
            event.preventDefault();
        }

        onKeyDown(event.key);
    });

    document.addEventListener('keyup', (event) => {
        onKeyUp(event.key);
    });
}
