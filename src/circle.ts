import { BoardElement } from "./board-element";

export class Circle extends BoardElement {
    private radius: number;

    constructor(x: number, y: number, radius: number, color: string) {
        super(x, y, 2 * radius, 2 * radius, color);

        this.radius = radius;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    public isPointInElement(x: number, y: number): boolean {
        return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2) <= this.radius;
    }
}
