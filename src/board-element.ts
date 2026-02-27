export abstract class BoardElement {
    protected x: number;
    protected y: number;
    protected color: string;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    abstract isPointInElement(x: number, y: number): boolean;
    abstract draw(ctx: CanvasRenderingContext2D): void;

    public drag(
        boardCursorX: number,
        boardCursorY: number,
        cursorOffsetX: number,
        cursorOffsetY: number
    ) {
        this.x = boardCursorX - cursorOffsetX;
        this.y = boardCursorY - cursorOffsetY;
    }

    public getPosition() {
        return {
            x: this.x,
            y: this.y,
        };
    }
}
