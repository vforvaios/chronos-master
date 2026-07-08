import { game } from "../main.js";

export class LightSystem {
  constructor(map, coinManager, door) {
    this.map = map;
    this.coins = coinManager;
    this.door = door;
  }
  draw(ctx, canvas, tile, player, cameraX) {
    const px = (player.x + player.w / 2) * tile;
    const py = (player.y + player.h / 2) * tile;
    const radius = tile * 6;
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    const tctx = temp.getContext("2d");
    tctx.save();
    this.map.draw(tctx, tile, game.lavaFrame);
    tctx.translate(-cameraX, 0);
    this.map.draw(tctx, tile, game.lavaFrame);
    this.coins.draw(tctx, tile);
    this.door.draw(tctx, tile);
    tctx.restore();
    tctx.globalCompositeOperation = "destination-in";
    const screenPx = px - cameraX;
    const g = tctx.createRadialGradient(screenPx, py, 0, screenPx, py, radius);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.5, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    tctx.fillStyle = g;
    tctx.beginPath();
    tctx.arc(screenPx, py, radius, 0, Math.PI * 2);
    tctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.83)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(temp, 0, 0);
  }
}
