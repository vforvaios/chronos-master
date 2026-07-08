import { VIEW_COLS, MAP_ROWS } from "./Config.js";
/* ================= CANVAS ================= */
export class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    window.addEventListener("resize", () => this.resize());
    this.resize();
  }
  resize() {
    const ratio = MAP_ROWS / VIEW_COLS;
    let w = innerWidth,
      h = w * ratio;
    if (h > innerHeight) {
      h = innerHeight;
      w = h / ratio;
    }
    this.canvas.width = w;
    this.canvas.height = h;
    this.tile = w / VIEW_COLS;
  }
}
