/* ================= COINS ================= */
export class CoinManager {
  constructor() {
    this.coins = [];
  }
  load(coinList) {
    this.coins = coinList.map((c) => ({ x: c.x, y: c.y, col: false }));
  }
  check(player) {
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    for (const c of this.coins) {
      if (!c.col && Math.hypot(cx - c.x, cy - c.y) < 0.8) c.col = true;
    }
  }
  draw(ctx, tile) {
    ctx.fillStyle = "gold";
    for (const c of this.coins) {
      if (!c.col) {
        ctx.beginPath();
        ctx.arc(c.x * tile, c.y * tile, tile * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
