export class BoardElement {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private color: string;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    public drag(
        boardCursorX: number,
        boardCursorY: number,
        cursorOffsetX: number,
        cursorOffsetY: number
    ) {
        this.x = boardCursorX - cursorOffsetX;
        this.y = boardCursorY - cursorOffsetY;
    }

    public isPointInElement(x: number, y: number) {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }

    public getPosition() {
        return {
            x: this.x,
            y: this.y,
        };
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
