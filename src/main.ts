import "./style.css";

const header = document.createElement("h1");
const APP_NAME = "Drawsome";
const app = document.querySelector<HTMLDivElement>("#app")!;

header.innerHTML = APP_NAME;
app.append(header);


const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "black";
ctx.fillRect(3, 3, 270, 270);
ctx.fillStyle = "white";
ctx.fillRect(10, 10, 256, 256);


