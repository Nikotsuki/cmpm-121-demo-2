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
let currentLine: Marker_line;
let redo_stack: Marker_line[] = [];
let thickness: number = 1;
let mouse_cursor: Cursor;

interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}

function handleMouseDown(event: MouseEvent) {
  currentLine = new Marker_line(event.offsetX, event.offsetY);
}

function handleMouseMove(event: MouseEvent) {
  mouse_cursor = new Cursor(event.offsetX, event.offsetY);
  if (currentLine && event.buttons === 1){
    currentLine.drag(event.offsetX, event.offsetY);
    currentLine.display(ctx);
  }
  dispatchToolMovedEvent();
}

canvas.addEventListener('mouseup', () => {
  // Finalize the line on mouseup
  lines.push(currentLine);
  currentLine = null!;
});

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);


function dispatchDrawingChangedEvent() {
  const event = new CustomEvent('drawing-changed');
  canvas.dispatchEvent(event);
}

function dispatchToolMovedEvent(){
  const event = new CustomEvent('tool-moved');
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

canvas.addEventListener('tool-moved', () =>{
  if (ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(5, 5, 256, 256);
    mouse_cursor.display(ctx);
    dispatchDrawingChangedEvent();
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
    console.log(lines);
    const undo_line: Marker_line = lines.pop()!;
    console.log(undo_line);
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

// thick button
const thick: HTMLButtonElement = document.querySelector("#thick")!;
thick.addEventListener("click", () => {
  thickness = 6;
});

// thin button
const thin: HTMLButtonElement = document.querySelector("#thin")!;
thin.addEventListener("click", () => {
  thickness = 1;
});

class Cursor implements Displayable{

  private init_x: number = 0;
  private init_y: number = 0;

  constructor(_x: number, _y: number){
    this.init_x = _x;
    this.init_y = _y;
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "white";
    ctx.arc(this.init_x, this.init_y, thickness/2, 0, 2 * Math.PI, true);
    ctx.stroke();
  }

}


// Marker Class
class Marker_line implements Displayable{

  public line: Point[] = [];

  constructor(init_x: number, init_y: number) {
    this.line.push({x: init_x, y: init_y});
  }
  
  public drag(x: number, y: number){
    this.line.push({x, y});
  }

  display(ctx: CanvasRenderingContext2D): void {
    if (this.line.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(this.line[0].x, this.line[0].y);
    for (const point of this.line) {
        ctx.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = 'black';
    ctx.lineWidth = thickness;
    ctx.stroke();
    ctx.closePath();
  }

}