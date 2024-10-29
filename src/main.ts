import "./style.css";

const header = document.createElement("h1");
const APP_NAME = "Drawsome";
const app = document.querySelector<HTMLDivElement>("#app")!;
header.innerHTML = APP_NAME;
app.append(header);

//canvas setup
const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.clearRect(0,0, canvas.width, canvas.height);
ctx.fillStyle = "white";
ctx.fillRect(5, 5, 256, 256);
canvas.style.cursor = "none";

//variables
type Point = { x: number, y: number };
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
  sticker = new Sticker(event.offsetX, event.offsetY, sticker_symbol, thickness, rotation);
}

//mouse move
function handleMouseMove(event: MouseEvent) {
  Marker_cursor = new Cursor(event.offsetX, event.offsetY, symbol, color, rotation);
  notify("tool-moved");
  if (currentLine && event.buttons === 1){
    currentLine.drag(event.offsetX, event.offsetY);
    currentLine.display(ctx);
  }
  if (sticker && event.buttons === 1){
    sticker.drag(event.offsetX, event.offsetY);
    sticker.display(ctx);
  }
  console.log(rotation);
}

//mouse up
canvas.addEventListener('mouseup', () => {
  if (currentLine){
    lines.push(currentLine);
  }
  if (sticker){
    sticker_list.push(sticker);
  }
  currentLine = null;
  sticker = null;
  notify('drawing-changed');
});

//mouse out
canvas.addEventListener("mouseout", () => {
  Marker_cursor = null;
  notify("tool-moved");
});

//mouse enter
canvas.addEventListener("mouseenter", (e) => {
  Marker_cursor = new Cursor(e.offsetX, e.offsetY, symbol, color, rotation);
  notify("tool-moved");
});

// redraw function
function redraw(){
   if (context) {
     context.clearRect(0,0, canvas.width, canvas.height);
     context.fillStyle = "white";
     context.fillRect(5, 5, 256, 256);
     for(const line of lines){
         line.display(context);
     }
   }
   if (Marker_cursor){
     Marker_cursor.display(context);
   }
   sticker_list.forEach(sticker => sticker.display(context));
}

canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);

function rotateText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, angleDegrees: number) {
  ctx.save();
  ctx.translate(0,0);
  const angle = angleDegrees * Math.PI / 180;
  ctx.rotate(angle);
  ctx.fillText(text, x, y);
  ctx.restore();
}

// clear button
const clear: HTMLButtonElement = document.querySelector("#clear")!;
clear.addEventListener("click", () => {
  ctx.clearRect(0,0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(5, 5, 256, 256);
  lines = [];
  redo_stack = [];
  sticker_list = [];
});

// undo button
const undo: HTMLButtonElement = document.querySelector("#undo")!;
undo.addEventListener("click", () => {
  if (lines.length != 0){
    console.log(lines);
    const undo_line: Marker_line = lines.pop()!;
    console.log(undo_line);
    redo_stack.push(undo_line);
    notify('drawing-changed');
  }
});

// redo button
const redo: HTMLButtonElement = document.querySelector("#redo")!;
redo.addEventListener("click", () => {
  if (redo_stack.length != 0){
    const redo_line: Marker_line = redo_stack.pop()!;
    lines.push(redo_line);
    notify('drawing-changed');
  }
});

// thick button
const thick: HTMLButtonElement = document.querySelector("#thick")!;
thick.addEventListener("click", () => {
  symbol = "o";
  sticker_symbol = "";
  thickness = 6;
});

// thin button
const thin: HTMLButtonElement = document.querySelector("#thin")!;
thin.addEventListener("click", () => {
  symbol = "o";
  sticker_symbol = "";
  thickness = 3;
});

// red button
const red: HTMLButtonElement = document.querySelector("#red")!;
red.addEventListener("click", () => {
  color = "red";
});

// blue button
const blue: HTMLButtonElement = document.querySelector("#blue")!;
blue.addEventListener("click", () => {
  color = "blue";
});

// green button
const green: HTMLButtonElement = document.querySelector("#green")!;
green.addEventListener("click", () => {
  color = "green";
});

// black button
const black: HTMLButtonElement = document.querySelector("#black")!;
black.addEventListener("click", () => {
  color = "black";
});

// woozy button
const woozy: HTMLButtonElement = document.querySelector("#woozy")!;
woozy.addEventListener("click", () => {
  sticker_symbol = "🥴";
  symbol = "🥴";
  notify('tool-moved');
});

// moai button
const moai: HTMLButtonElement = document.querySelector("#moai")!;
moai.addEventListener("click", () => {
  sticker_symbol = "🗿";
  symbol = "🗿";
  notify('tool-moved');
});

// beer button
const beer: HTMLButtonElement = document.querySelector("#beer")!;
beer.addEventListener("click", () => {
  sticker_symbol = "🍺";
  symbol = "🍺";
  notify('tool-moved');
});

// custom button
const custom: HTMLButtonElement = document.querySelector("#custom")!;
custom.addEventListener("click", () => {
  const text = prompt("Custom sticker text","🧽");
  sticker_symbol = text!;
  symbol = text!;
  notify('tool-moved');
});

// export button
const export_button: HTMLButtonElement = document.querySelector("#export")!;
export_button.addEventListener("click", () => {
  const ex_canvas = document.createElement('canvas');
  ex_canvas.width = canvas.width * 4;
  ex_canvas.height = canvas.height * 4;
  const ex_ctx = ex_canvas.getContext("2d");
  ctx.scale(4,4);
  context = ex_ctx!;
  notify('drawing-changed');
  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
  context = ctx;
});

// rotate slider
const rotate: HTMLInputElement = document.querySelector("#rotate")!;
rotate.addEventListener("input", () => {
  rotation = parseInt(rotate.value);
});

//Sticker Class
class Sticker implements Displayable{

  private x: number;
  private y: number;
  private symbol: string;
  private sticker_thickness: number;
  private rotation: number;

  constructor(x: number, y:number, symbol: string, thickness: number, rotation: number) {
    this.x = x;
    this.y = y;
    this.symbol = symbol;
    this.sticker_thickness = thickness;
    this.rotation = rotation;
  }

  public drag(x: number, y: number){
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D): void {
    const size = this.sticker_thickness * 5;
    ctx.font = size + "px monospace";
    ctx.save();
    ctx.translate(0,0);
    const angle = this.rotation * Math.PI / 180;
    ctx.rotate(angle);
    ctx.fillText(this.symbol, this.x, this.y);
    ctx.restore();
  }
}

//Cursor Class
class Cursor implements Displayable {

  private x: number;
  private y: number;
  private symbol: string;
  private color: string;
  private rotation: number;

  constructor(x: number, y:number, symbol: string, color: string, rotation: number) {
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
    ctx.save();
    ctx.translate(0,0);
    const angle = this.rotation * Math.PI / 180;
    ctx.rotate(angle);
    ctx.fillText(this.symbol, this.x, this.y);
    ctx.restore();
  }
}


// Marker Class
class Marker_line implements Displayable{

  public line: Point[] = [];
  public marker_thickness: number;
  private color: string;

  constructor(init_x: number, init_y: number, _thickness: number, color: string) {
    this.line.push({x: init_x, y: init_y});
    this.marker_thickness = _thickness;
    this.color = color;
  }
  
  public drag(x: number, y: number){
    this.line.push({x, y});
  }

  display(ctx: CanvasRenderingContext2D): void {
    if (this.line.length === 0) return;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.marker_thickness;
    ctx.beginPath();
    ctx.moveTo(this.line[0].x, this.line[0].y);
    for (const point of this.line) {
        ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
}