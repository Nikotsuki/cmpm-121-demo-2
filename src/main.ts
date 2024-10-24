import "./style.css";

const header = document.createElement("h1");
const APP_NAME = "Drawsome";
const app = document.querySelector<HTMLDivElement>("#app")!;

header.innerHTML = APP_NAME;
app.append(header);

type Point = { x: number, y: number };

const lines_array: Point[][] = [];
let currentLine: Point[] = []; 

const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(5, 5, 256, 256);

function handleMouseMove(event: MouseEvent)  {
  const point: Point = { x: event.clientX, y: event.clientY };
  currentLine.push(point);
  dispatchDrawingChangedEvent();
}

function handleMouseDown(_event: MouseEvent) {
  currentLine = [];
  lines_array.push(currentLine);
}

function dispatchDrawingChangedEvent() {
  const event = new CustomEvent('drawing-changed');
  canvas.dispatchEvent(event);
}

canvas.addEventListener('drawing-changed', () => {
  console.log("print");
  ctx.fillStyle = "white";
  ctx.fillRect(5, 5, 256, 256);
  lines_array.forEach(line => {
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
    });
});

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);

// clear button
const clear: HTMLButtonElement = document.querySelector("#clear")!;
clear.addEventListener("click", () => {
  ctx.fillStyle = "white";
  ctx.fillRect(5, 5, 256, 256);
});




