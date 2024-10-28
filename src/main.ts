import "./style.css";

const header = document.createElement("h1");
const APP_NAME = "Drawsome";
const app = document.querySelector<HTMLDivElement>("#app")!;

header.innerHTML = APP_NAME;
app.append(header);


const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.clearRect(0,0, canvas.width, canvas.height);

canvas.style.cursor = "none";

type Point = { x: number, y: number };
let lines: Marker_line[] = []; 
let currentLine: Marker_line | null = null;
let redo_stack: Marker_line[] = [];
let thickness: number = 2;
let Marker_cursor: Cursor | null = null;
let symbol: string = "o";

interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}

function notify(name: string) {
  canvas.dispatchEvent(new Event(name));
}

function handleMouseDown(event: MouseEvent) {
  currentLine = new Marker_line(event.offsetX, event.offsetY, thickness);
}

function handleMouseMove(event: MouseEvent) {
  Marker_cursor = new Cursor(event.offsetX, event.offsetY, symbol);
  notify("tool-moved");
  if (currentLine && event.buttons === 1){
    currentLine.drag(event.offsetX, event.offsetY);
    currentLine.display(ctx);
    //notify('drawing-changed');
  }
}

canvas.addEventListener('mouseup', () => {
  if (currentLine){
    lines.push(currentLine);
  }
  currentLine = null;
  notify('drawing-changed');
});

canvas.addEventListener("mouseout", () => {
  Marker_cursor = null;
  notify("tool-moved");
});

canvas.addEventListener("mouseenter", (e) => {
  Marker_cursor = new Cursor(e.offsetX, e.offsetY, symbol);
  notify("tool-moved");
});

canvas.addEventListener("mouseenter", (e) => {
  Marker_cursor = new Cursor(e.offsetX, e.offsetY, symbol);
  notify("cursor-changed");
});

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);

canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);

// redraw function
function redraw(){
  if (ctx) {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    for(const line of lines){
        line.display(ctx);
    }
  }
  if (Marker_cursor){
    Marker_cursor.display(ctx);
  }
}


// clear button
const clear: HTMLButtonElement = document.querySelector("#clear")!;
clear.addEventListener("click", () => {
  ctx.clearRect(0,0, canvas.width, canvas.height);
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
  thickness = 6;
});

// thin button
const thin: HTMLButtonElement = document.querySelector("#thin")!;
thin.addEventListener("click", () => {
  symbol = "o";
  thickness = 2;
});

// woozy button
const woozy: HTMLButtonElement = document.querySelector("#woozy")!;
woozy.addEventListener("click", () => {
  symbol = "🥴";

  notify('tool-moved');
});

// moai button
const moai: HTMLButtonElement = document.querySelector("#moai")!;
moai.addEventListener("click", () => {
  symbol = "🗿";
  notify('tool-moved');
});

// china button
const china: HTMLButtonElement = document.querySelector("#china")!;
china.addEventListener("click", () => {
  symbol = "🇨🇳";
  notify('tool-moved');
});


//Cursor Class
class Cursor implements Displayable {

  private x: number;
  private y: number;
  private symbol: string;

  constructor(x: number, y:number, symbol: string) {
    this.x = x;
    this.y = y;
    this.symbol = symbol;
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#000000";
    const size = thickness * 5;
    ctx.font = size + "px monospace";
    ctx.fillText(this.symbol, this.x - 4, this.y + 10);
  }

  public update_pos(x: number, y: number){
    this.x = x;
    this.y = y;
  }
}


// Marker Class
class Marker_line implements Displayable{

  public line: Point[] = [];
  public marker_thickness: number;

  constructor(init_x: number, init_y: number, _thickness: number) {
    this.line.push({x: init_x, y: init_y});
    this.marker_thickness = _thickness;
  }
  
  public drag(x: number, y: number){
    this.line.push({x, y});
  }

  display(ctx: CanvasRenderingContext2D): void {
    if (this.line.length === 0) return;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = this.marker_thickness;
    ctx.beginPath();
    ctx.moveTo(this.line[0].x, this.line[0].y);
    for (const point of this.line) {
        ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }

}