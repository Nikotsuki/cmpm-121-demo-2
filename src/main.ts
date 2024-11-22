import "./style.css";

const header = document.createElement("h1");
const APP_NAME = "Drawsome";
const app = document.querySelector<HTMLDivElement>("#app")!;
header.innerHTML = APP_NAME;
app.prepend(header);

//canvas setup
const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "white";
ctx.fillRect(5, 5, 256, 256);
canvas.style.cursor = "none";

//variables
type Point = { x: number; y: number };
let lines: Marker_line[] = [];
let currentLine: Marker_line | null = null;
let redo_stack: Marker_line[] = [];
let thickness: number = 3;
let Marker_cursor: Cursor | null = null;
let symbol: string = "o";
let sticker_symbol: string = "";
let sticker: Sticker | null = null;
let sticker_list: Sticker[] = [];
let context: CanvasRenderingContext2D = ctx;
let color: string = "black";
let rotation: number = 0;

interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}

//notify function
function notify(name: string) {
  canvas.dispatchEvent(new Event(name));
}

//mouse down
function handleMouseDown(event: MouseEvent) {
  currentLine = new Marker_line(event.offsetX, event.offsetY, thickness, color);
  sticker = new Sticker(
    event.offsetX,
    event.offsetY,
    sticker_symbol,
    thickness,
    rotation
  );
}
//mouse move
function handleMouseMove(event: MouseEvent) {
  Marker_cursor = new Cursor(
    event.offsetX,
    event.offsetY,
    symbol,
    color,
    rotation
  );
  notify("tool-moved");
  if (currentLine && event.buttons === 1) {
    currentLine.drag(event.offsetX, event.offsetY);
    currentLine.display(ctx);
  }
  if (sticker && event.buttons === 1) {
    sticker.drag(event.offsetX, event.offsetY);
    sticker.display(ctx);
  }
  console.log(rotation);
}
//mouse up
function handleMouseUp() {
  if (currentLine) lines.push(currentLine);
  if (sticker) sticker_list.push(sticker);
  currentLine = null;
  sticker = null;
  notify("drawing-changed");
}
//mouse out
function handleMouseOut() {
  Marker_cursor = null;
  notify("tool-moved");
}
//mouse enter
function handleMouseEnter(e: MouseEvent) {
  Marker_cursor = new Cursor(e.offsetX, e.offsetY, symbol, color, rotation);
  notify("tool-moved");
}

// redraw function: redraws lines, stickers, and cursor
function redraw() {
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.fillRect(5, 5, 256, 256);
    for (const line of lines) line.display(context);
  }
  if (Marker_cursor) Marker_cursor.display(context);
  sticker_list.forEach((sticker) => sticker.display(context));
}

canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mouseout", handleMouseOut);
canvas.addEventListener("mouseenter", handleMouseEnter);

//function to rotate canvas, paste sticker, then restore canvas
function rotateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  angleDegrees: number
) {
  ctx.save();
  ctx.translate(x, y);
  const angle = (angleDegrees * Math.PI) / 180;
  ctx.rotate(angle);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// button event handlers
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(5, 5, 256, 256);
  lines = [];
  redo_stack = [];
  sticker_list = [];
}

function undoAction() {
  if (lines.length != 0) {
    const undo_line: Marker_line = lines.pop()!;
    redo_stack.push(undo_line);
    notify("drawing-changed");
  }
}

function redoAction() {
  if (redo_stack.length != 0) {
    const redo_line: Marker_line = redo_stack.pop()!;
    lines.push(redo_line);
    notify("drawing-changed");
  }
}

function setThickness(newThickness: number) {
  symbol = "o";
  sticker_symbol = "";
  thickness = newThickness;
}

function setColor(newColor: string) {
  color = newColor;
}

function setStickerSymbol(newSymbol: string) {
  sticker_symbol = newSymbol;
  symbol = newSymbol;
  notify("tool-moved");
}

function exportCanvas() {
  const ex_canvas = document.createElement("canvas");
  ex_canvas.width = canvas.width * 4;
  ex_canvas.height = canvas.height * 4;
  const ex_ctx = ex_canvas.getContext("2d");
  ctx.scale(4, 4);
  context = ex_ctx!;
  notify("drawing-changed");
  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
  context = ctx;
}

function rotateCanvas() {
  rotation = parseInt(rotate.value);
}

// button elements
const clear: HTMLButtonElement = document.querySelector("#clear")!;
const undo: HTMLButtonElement = document.querySelector("#undo")!;
const redo: HTMLButtonElement = document.querySelector("#redo")!;
const thick: HTMLButtonElement = document.querySelector("#thick")!;
const thin: HTMLButtonElement = document.querySelector("#thin")!;
const red: HTMLButtonElement = document.querySelector("#red")!;
const blue: HTMLButtonElement = document.querySelector("#blue")!;
const green: HTMLButtonElement = document.querySelector("#green")!;
const black: HTMLButtonElement = document.querySelector("#black")!;
const woozy: HTMLButtonElement = document.querySelector("#woozy")!;
const moai: HTMLButtonElement = document.querySelector("#moai")!;
const beer: HTMLButtonElement = document.querySelector("#beer")!;
const custom: HTMLButtonElement = document.querySelector("#custom")!;
const export_button: HTMLButtonElement = document.querySelector("#export")!;
const rotate: HTMLInputElement = document.querySelector("#rotate")!;

// button event listeners
clear.addEventListener("click", clearCanvas);
undo.addEventListener("click", undoAction);
redo.addEventListener("click", redoAction);
thick.addEventListener("click", () => setThickness(6));
thin.addEventListener("click", () => setThickness(3));
red.addEventListener("click", () => setColor("red"));
blue.addEventListener("click", () => setColor("blue"));
green.addEventListener("click", () => setColor("green"));
black.addEventListener("click", () => setColor("black"));
woozy.addEventListener("click", () => setStickerSymbol("🥴"));
moai.addEventListener("click", () => setStickerSymbol("🗿"));
beer.addEventListener("click", () => setStickerSymbol("🍺"));
custom.addEventListener("click", () => {
  const text = prompt("Custom sticker text", "🧽");
  setStickerSymbol(text!);
});
export_button.addEventListener("click", exportCanvas);
rotate.addEventListener("input", rotateCanvas);

//Sticker Class
class Sticker implements Displayable {
  private x: number;
  private y: number;
  private symbol: string;
  private sticker_thickness: number;
  private rotation: number;

  constructor(
    x: number,
    y: number,
    symbol: string,
    thickness: number,
    rotation: number
  ) {
    this.x = x;
    this.y = y;
    this.symbol = symbol;
    this.sticker_thickness = thickness;
    this.rotation = rotation;
  }

  public drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D): void {
    const size = this.sticker_thickness * 5;
    ctx.font = size + "px monospace";
    rotateText(ctx, this.symbol, this.x, this.y, this.rotation);
  }
}

//Cursor Class
class Cursor implements Displayable {
  private x: number;
  private y: number;
  private symbol: string;
  private color: string;
  private rotation: number;

  constructor(
    x: number,
    y: number,
    symbol: string,
    color: string,
    rotation: number
  ) {
    this.x = x;
    this.y = y;
    this.symbol = symbol;
    this.color = color;
    this.rotation = rotation;
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    const size = thickness * 5;
    ctx.font = size + "px monospace";
    rotateText(ctx, this.symbol, this.x, this.y, this.rotation);
  }
}

// Marker Class
class Marker_line implements Displayable {
  public line: Point[] = [];
  public marker_thickness: number;
  private color: string;

  constructor(
    init_x: number,
    init_y: number,
    _thickness: number,
    color: string
  ) {
    this.line.push({ x: init_x, y: init_y });
    this.marker_thickness = _thickness;
    this.color = color;
  }

  public drag(x: number, y: number) {
    this.line.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D): void {
    if (this.line.length === 0) return;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.marker_thickness;
    ctx.beginPath();
    ctx.moveTo(this.line[0].x - 4, this.line[0].y + 10);
    for (const point of this.line) {
      ctx.lineTo(point.x - 4, point.y + 10);
    }
    ctx.stroke();
  }
}
