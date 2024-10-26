import "./style.css";

const header = document.createElement("h1");
const APP_NAME = "Drawsome";
const app = document.querySelector<HTMLDivElement>("#app")!;

header.innerHTML = APP_NAME;
app.append(header);

const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(5, 5, 256, 256);

type Point = { x: number, y: number };
let lines: Marker_line[] = []; 
let currentLine: Marker_line | null = null;
let redo_stack: Marker_line[] = [];

interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}


function handleMouseDown(event: MouseEvent) {
  currentLine = new Marker_line(event.offsetX, event.offsetY);
}


function handleMouseMove(event: MouseEvent) {
  if (currentLine && event.buttons === 1){

    currentLine.drag(event.offsetX, event.offsetY);
    // Clear and redraw the canvas, or optimize by incrementally drawing
    currentLine.display(ctx);
    lines.push(currentLine);
  }
}

canvas.addEventListener('mouseup', () => {
  // Finalize the line on mouseup
  currentLine = null;
});

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);


function dispatchDrawingChangedEvent() {
  const event = new CustomEvent('drawing-changed');
  canvas.dispatchEvent(event);
}


canvas.addEventListener('drawing-changed', () => {
  if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(5, 5, 256, 256);
      for(const line of lines){
          line.display(ctx);
      }
  }
});

// clear button
const clear: HTMLButtonElement = document.querySelector("#clear")!;
clear.addEventListener("click", () => {
  ctx.fillStyle = "white";
  ctx.fillRect(5, 5, 256, 256);
  lines = [];
  redo_stack = [];
});

// undo button
const undo: HTMLButtonElement = document.querySelector("#undo")!;
undo.addEventListener("click", () => {
  if (lines.length != 0){
    console.log(lines.length);
    const undo_line: Marker_line = lines.pop()!;
    console.log(lines.length);
    redo_stack.push(undo_line);
    dispatchDrawingChangedEvent();
  }
});

// redo button
const redo: HTMLButtonElement = document.querySelector("#redo")!;
redo.addEventListener("click", () => {
  if (redo_stack.length != 0){
    const redo_line: Marker_line = redo_stack.pop()!;
    lines.push(redo_line);
    dispatchDrawingChangedEvent();
  }
});

class Marker_line implements Displayable{

  private line: { x: number, y: number }[] = [];

  constructor(init_x: number, init_y: number) {
    this.line.push({x: init_x, y: init_y});
  }
  
  public drag(x: number, y: number){
    const new_p: Point = { x, y };
    this.line.push(new_p);
  }

  display(ctx: CanvasRenderingContext2D): void {
    if (this.line.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(this.line[0].x, this.line[0].y); // Move to start point
    for (const point of this.line) {
        ctx.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
}

}