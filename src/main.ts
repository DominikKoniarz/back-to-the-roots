import type { BoardElement } from "./board-element";
import { Square } from "./square";
import "./style.css";

const getRootElement = () => {
    const root = document.querySelector("#app");

    if (!root || !(root instanceof HTMLDivElement)) {
        throw new Error("Root element not found");
    }

    return root;
};

class Board {
    private static canvas: HTMLCanvasElement;
    private static elements: BoardElement[] = [];

    private static cursorX: number = 0;
    private static cursorY: number = 0;

    private static draggedElement: BoardElement | null = null;
    private static dragOffsetX: number = 0;
    private static dragOffsetY: number = 0;

    private static lastClickTimestamp: number | null = null;

    private static resizeCanvas() {
        const ctx = this.canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Context not found");
        }

        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
        const height = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));

        this.canvas.width = width;
        this.canvas.height = height;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    private static getRandomColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    private static getRandomPosition() {
        return {
            x: Math.floor(Math.random() * this.canvas.clientWidth),
            y: Math.floor(Math.random() * this.canvas.clientHeight),
        };
    }

    private static getRandomSize() {
        return {
            width: Math.floor(Math.random() * 150) + 50, // 50-200
            height: Math.floor(Math.random() * 150) + 50, // 50-200
        };
    }

    private static updateCursorPosition(event: MouseEvent) {
        const cursorX =
            event.clientX - this.canvas.getBoundingClientRect().left;
        const cursorY = event.clientY - this.canvas.getBoundingClientRect().top;

        this.cursorX =
            cursorX < 0
                ? 0
                : cursorX > this.canvas.clientWidth
                ? this.canvas.clientWidth
                : cursorX;
        this.cursorY =
            cursorY < 0
                ? 0
                : cursorY > this.canvas.clientHeight
                ? this.canvas.clientHeight
                : cursorY;
    }

    public static clearCanvas() {
        const ctx = this.canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Context not found");
        }

        ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    }

    private static renderElements() {
        const ctx = this.canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Context not found");
        }

        let lastElementToRender: BoardElement | null = null;

        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];

            if (this.draggedElement === element) {
                lastElementToRender = element;
                continue;
            }

            element.draw(ctx);
        }

        if (lastElementToRender) {
            lastElementToRender.draw(ctx);
        }
    }

    private static drawSquare(
        ctx: CanvasRenderingContext2D,
        color: string,
        position: { x: number; y: number },
        size: { width: number; height: number }
    ) {
        const square = new Square(
            position.x,
            position.y,
            size.width,
            size.height,
            color
        );

        this.elements.push(square);
        square.draw(ctx);
    }

    static registerEvents() {
        window.addEventListener("resize", () => {
            this.resizeCanvas();
            this.drawRandomSquares();
        });

        this.canvas.addEventListener("mousemove", (event) => {
            this.updateCursorPosition(event);

            if (this.draggedElement) {
                this.draggedElement.drag(
                    this.cursorX,
                    this.cursorY,
                    this.dragOffsetX,
                    this.dragOffsetY
                );
                this.clearCanvas();
                this.renderElements();
            }
        });

        this.canvas.addEventListener("mousedown", (event) => {
            this.updateCursorPosition(event);

            let draggedElement: BoardElement | null = null;

            for (let i = this.elements.length - 1; i >= 0; i--) {
                const element = this.elements[i];

                if (element.isPointInElement(this.cursorX, this.cursorY)) {
                    draggedElement = element;
                    break;
                }
            }

            if (!draggedElement) {
                this.draggedElement = null;
                return;
            }

            const draggedElementPosition = draggedElement.getPosition();

            this.dragOffsetX = this.cursorX - draggedElementPosition.x;
            this.dragOffsetY = this.cursorY - draggedElementPosition.y;
            this.draggedElement = draggedElement;
        });

        this.canvas.addEventListener("mouseup", () => {
            this.draggedElement = null;
        });

        this.canvas.addEventListener("click", () => {
            if (
                this.lastClickTimestamp &&
                Date.now() - this.lastClickTimestamp < 300
            ) {
                this.lastClickTimestamp = Date.now();

                this.drawSquare(
                    this.canvas.getContext("2d")!,
                    this.getRandomColor(),
                    {
                        x: this.cursorX,
                        y: this.cursorY,
                    },
                    this.getRandomSize()
                );
            }

            this.lastClickTimestamp = Date.now();
        });
    }

    // draw 5 random squares
    static drawRandomSquares() {
        const ctx = this.canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Context not found");
        }

        for (let i = 0; i < 5; i++) {
            const color = this.getRandomColor();
            const position = this.getRandomPosition();
            const size = this.getRandomSize();

            this.drawSquare(ctx, color, position, size);
        }
    }

    static init() {
        if (this.canvas) {
            return;
        }

        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.border = "1px solid black";
        this.canvas.style.backgroundColor = "white";

        const root = getRootElement();

        root.appendChild(this.canvas);

        this.resizeCanvas();
        this.drawRandomSquares();
        this.registerEvents();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    Board.init();
});
