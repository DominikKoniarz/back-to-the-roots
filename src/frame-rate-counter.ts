import { getRootElement } from "./helpers";

export class FrameRateCounter {
    private static frameRateCounter: HTMLDivElement | null = null;
    private static frameRate: number = 0;
    private static lastFrameTime: number | null = null;
    private static frameCount: number = 0;
    private static accumulatedTime: number = 0;
    private static animationFrameId: number | null = null;

    private static createFrameRateCounter() {
        if (this.frameRateCounter) {
            return this.frameRateCounter;
        }

        const frameRateCounter = document.createElement("div");
        frameRateCounter.style.position = "absolute";
        frameRateCounter.style.top = "0";
        frameRateCounter.style.left = "0";
        frameRateCounter.style.color = "white";
        frameRateCounter.style.fontSize = "16px";
        frameRateCounter.style.fontWeight = "bold";
        frameRateCounter.style.zIndex = "1000";
        frameRateCounter.style.userSelect = "none";

        this.frameRateCounter = frameRateCounter;
        return frameRateCounter;
    }

    private static updateFrameRateCounter() {
        if (!this.frameRateCounter) {
            return;
        }

        this.frameRateCounter.textContent = `FPS: ${this.frameRate.toFixed(2)}`;
    }

    private static measureFrameRate(currentTime: number) {
        if (this.lastFrameTime === null) {
            this.lastFrameTime = currentTime;
            return;
        }

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        if (deltaTime <= 0) {
            return;
        }

        this.frameCount += 1;
        this.accumulatedTime += deltaTime;

        // Update about 4x per second to reduce text flicker.
        if (this.accumulatedTime >= 250) {
            this.frameRate = (this.frameCount * 1000) / this.accumulatedTime;
            this.updateFrameRateCounter();
            this.frameCount = 0;
            this.accumulatedTime = 0;
        }
    }

    private static tick = (currentTime: number) => {
        this.measureFrameRate(currentTime);
        this.animationFrameId = requestAnimationFrame(this.tick);
    };

    private static resetState() {
        this.frameRate = 0;
        this.lastFrameTime = null;
        this.frameCount = 0;
        this.accumulatedTime = 0;
    }

    public static init() {
        if (this.animationFrameId !== null) {
            return;
        }

        const root = getRootElement();
        const frameRateCounter = this.createFrameRateCounter();

        if (!frameRateCounter.isConnected) {
            root.appendChild(frameRateCounter);
        }

        this.resetState();
        this.updateFrameRateCounter();
        this.animationFrameId = requestAnimationFrame(this.tick);
    }
}
