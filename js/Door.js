/* ================= DOOR ================= */
class Door {
  constructor(onTrigger) {
    this.x = 0;
    this.y = 0;
    this.w = 1.0;
    this.h = 1.6;
    this.onTrigger = onTrigger;
    this.triggered = false;
  }
  load(x, y) {
    this.x = x;
    this.y = y;
    this.triggered = false;
  }
  check(player) {
    if (
      !this.triggered &&
      player.x < this.x + this.w &&
      player.x + player.w > this.x &&
      player.y < this.y + this.h &&
      player.y + player.h > this.y
    ) {
      this.triggered = true;
      this.onTrigger();
    }
  }
  draw(ctx, tile) {
    ctx.fillStyle = "rgba(90, 50, 20, 0.9)";
    ctx.fillRect(this.x * tile, this.y * tile, this.w * tile, this.h * tile);
    ctx.strokeStyle = "#2b190b";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x * tile, this.y * tile, this.w * tile, this.h * tile);
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(
      (this.x + 0.2) * tile,
      (this.y + 0.8) * tile,
      tile * 0.08,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
