const LANDSCAPE_SEGMENTS = 50;

export function createLandscape(width, height) {
    const landscape = [];
    const segmentWidth = width / LANDSCAPE_SEGMENTS;
    const landingPadPosition = Math.floor(Math.random() * (LANDSCAPE_SEGMENTS - 5)) + 2;

    for (let i = 0; i <= LANDSCAPE_SEGMENTS; i++) {
        const isLandingPad = i >= landingPadPosition && i <= landingPadPosition + 3;
        const y = isLandingPad ? height - 100 : height - 100 + Math.random() * 50;

        if (isLandingPad && i > landingPadPosition) {
            landscape[i] = {
                x: i * segmentWidth,
                y: landscape[i - 1].y,
                isLandingPad: true
            };
        } else {
            landscape.push({
                x: i * segmentWidth,
                y,
                isLandingPad
            });
        }
    }

    return landscape;
}
