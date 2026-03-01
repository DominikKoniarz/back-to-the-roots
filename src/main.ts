import type { BoardElement } from "./board-element";
import { Circle } from "./circle";
import { FrameRateCounter } from "./frame-rate-counter";
import { getRootElement } from "./helpers";
import { Square } from "./square";
import "./style.css";

class Board {
    private static canvas: HTMLCanvasElement;
    private static elements: BoardElement[] = [];

    // TODO: handle 2D context management !

    private static cursorX: number = 0;
    private static cursorY: number = 0;

    private static draggedElement: BoardElement | null = null;
    private static dragOffsetX: number = 0;
    private static dragOffsetY: number = 0;

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

    private static getRandomRadius() {
        return Math.floor(Math.random() * 100) + 50; // 50-150
    }

    private static getCursorPosition() {
        return {
            x: this.cursorX,
            y: this.cursorY,
        } as const;
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

        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];

            element.draw(ctx);
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

    private static drawCircle(
        ctx: CanvasRenderingContext2D,
        color: string,
        position: { x: number; y: number },
        radius: number
    ) {
        const circle = new Circle(position.x, position.y, radius, color);
        this.elements.push(circle);
        circle.draw(ctx);
    }

    private static drawRandomElement(mode: "random" | "cursor") {
        const random = Math.random();

        const position =
            mode === "random"
                ? this.getRandomPosition()
                : this.getCursorPosition();

        if (random < 0.5) {
            return this.drawSquare(
                this.canvas.getContext("2d")!,
                this.getRandomColor(),
                position,
                this.getRandomSize()
            );
        }

        return this.drawCircle(
            this.canvas.getContext("2d")!,
            this.getRandomColor(),
            position,
            this.getRandomRadius()
        );
    }

    private static handleCursorStyle(event: MouseEvent) {
        if (this.draggedElement) {
            window.document.body.style.cursor = "grabbing";
            return;
        }

        const isPointInCanvas = event.target === this.canvas;

        if (!isPointInCanvas) {
            window.document.body.style.cursor = "default";
            return;
        }

        let shouldBeCursorPointer = false;

        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];

            if (element.isPointInElement(this.cursorX, this.cursorY)) {
                shouldBeCursorPointer = true;
                break;
            }
        }

        if (shouldBeCursorPointer) {
            window.document.body.style.cursor = "pointer";
        } else {
            window.document.body.style.cursor = "default";
        }
    }

    private static registerEvents() {
        window.addEventListener("resize", () => {
            this.resizeCanvas();
            // this.removeAllElements();
            // this.drawRandomElements();

            this.elements.forEach((element) => {
                element.draw(this.canvas.getContext("2d")!);
            });
        });

        window.addEventListener("mousemove", (event) => {
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

            this.handleCursorStyle(event);
        });

        window.addEventListener("mousedown", (event) => {
            this.updateCursorPosition(event);

            const isPointInCanvas = event.target === this.canvas;

            if (!isPointInCanvas) {
                return;
            }

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
            } else {
                const draggedElementPosition = draggedElement.getPosition();

                this.dragOffsetX = this.cursorX - draggedElementPosition.x;
                this.dragOffsetY = this.cursorY - draggedElementPosition.y;
                this.draggedElement = draggedElement;

                // bubble up the element to the top of the stack (end of the array)
                this.elements.push(
                    this.elements.splice(
                        this.elements.indexOf(draggedElement),
                        1
                    )[0]
                );
                this.renderElements(); // TODO: could this be optimized?
                // rendering of elements is a little bit screwed
            }

            this.handleCursorStyle(event);
        });

        window.addEventListener("mouseup", (event) => {
            this.draggedElement = null;

            this.handleCursorStyle(event);
        });

        this.canvas.addEventListener("dblclick", () => {
            this.drawRandomElement("cursor");
        });
    }

    // draw 5 random elements
    private static drawRandomElements() {
        for (let i = 0; i < 5; i++) {
            this.drawRandomElement("random");
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
        this.drawRandomElements();
        this.registerEvents();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    Board.init();
    FrameRateCounter.init();
});
