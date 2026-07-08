/* ================= MAP ================= */
export class GameMap {
  constructor() {
    this.data = [];
  }
  load(matrix) {
    this.data = matrix;
  }
  isWall(x, y) {
    const c = Math.floor(x);
    const r = Math.floor(y);
    if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return true;
    return this.data[r][c] === 1;
  }
  draw(ctx, tile, lavaFrame) {
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        // Background
        ctx.fillStyle = "#2a7";
        ctx.fillRect(c * tile, r * tile, tile, tile);

        // Walls (εκτός τελευταίας σειράς)
        if (r < MAP_ROWS - 1 && this.data[r][c] === 1) {
          ctx.fillStyle = "#555";
          ctx.fillRect(c * tile, r * tile, tile, tile);
        }

        // Lava
        if (r === MAP_ROWS - 1) {
          ctx.drawImage(
            sprites.lava,
            lavaFrame * 16,
            0,
            16,
            16,
            c * tile,
            r * tile,
            tile,
            tile,
          );
        }
      }
    }
  }
}
