import { BoardElement } from "./board-element";

export class Square extends BoardElement {
    private width: number;
    private height: number;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {
        super(x, y, color);

        this.width = width;
        this.height = height;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    public isPointInElement(x: number, y: number): boolean {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }
}
