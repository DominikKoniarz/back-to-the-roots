import { BoardElement } from "./board-element";

export class Square extends BoardElement {
    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {
        super(x, y, width, height, color);
    }
}
