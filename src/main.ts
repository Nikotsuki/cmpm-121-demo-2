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
let lines: Point[][] = []; // Array of arrays to store lines
let currentLine: Point[] = []; // Current drawing line

// Function to handle mouse down events
function handleMouseDown(event: MouseEvent) {
    currentLine = [];
    lines.push(currentLine);
}

// Function to handle mouse move events
function handleMouseMove(event: MouseEvent) {
    if (event.buttons !== 1) return; // Only draw when left mouse button is pressed

    const point: Point = { x: event.offsetX, y: event.offsetY };
    currentLine.push(point);
    dispatchDrawingChangedEvent(); // Notify about the new drawing point
}

// Custom event to notify drawing changes
function dispatchDrawingChangedEvent() {
    const event = new CustomEvent('drawing-changed');
    canvas.dispatchEvent(event);
}

// Event listener to redraw the canvas
canvas.addEventListener('drawing-changed', () => {
    if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(5, 5, 256, 256);
        lines.forEach(line => {
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
    }
});

// Add event listeners for mouse actions
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);


// clear button
const clear: HTMLButtonElement = document.querySelector("#clear")!;
clear.addEventListener("click", () => {
  ctx.fillStyle = "white";
  ctx.fillRect(5, 5, 256, 256);
  lines = [];
});




