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
let lines: Point[][] = []; 
let currentLine: Point[] = []; 
const redo_stack: Point[][] = [];


function handleMouseDown(event: MouseEvent) {
    currentLine = [];
    lines.push(currentLine);
}


function handleMouseMove(event: MouseEvent) {
    if (event.buttons !== 1) return;

    const point: Point = { x: event.offsetX, y: event.offsetY };
    currentLine.push(point);
    dispatchDrawingChangedEvent(); 
}


function dispatchDrawingChangedEvent() {
    const event = new CustomEvent('drawing-changed');
    canvas.dispatchEvent(event);
}


canvas.addEventListener('drawing-changed', () => {
    if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(5, 5, 256, 256);
        for(const line of lines){
            ctx.beginPath();
            for (let i = 0; i < line.length; i++) {
                const point = line[i];
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
            ctx.stroke();
        }
    }
});


canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);


// clear button
const clear: HTMLButtonElement = document.querySelector("#clear")!;
clear.addEventListener("click", () => {
  ctx.fillStyle = "white";
  ctx.fillRect(5, 5, 256, 256);
  lines = [];
});

// undo button
const undo: HTMLButtonElement = document.querySelector("#undo")!;
undo.addEventListener("click", () => {
  if (lines.length != 0){
    const undo_point: Point[] = lines.pop()!;
    redo_stack.push(undo_point);
    dispatchDrawingChangedEvent();
  }
});

// redo button
const redo: HTMLButtonElement = document.querySelector("#redo")!;
redo.addEventListener("click", () => {
  if (redo_stack.length != 0){
    const redo_point: Point[] = redo_stack.pop()!;
    lines.push(redo_point);
    dispatchDrawingChangedEvent();
  }
});