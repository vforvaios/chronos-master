import { Player } from "./Player.js";
import { GameMap } from "./GameMap.js";
import { Input } from "./Input.js";
import { CoinManager } from "./CoinManager.js";
import { Door } from "./Door.js";
import { CanvasManager } from "./CanvasManager.js";
import { PuzzleSystem } from "./PuzzleSystem.js";
import { LightSystem } from "./LightSystem.js";
import { generateDynamicLevel } from "./LevelGenerator.js";
import { MAP_ROWS, MAP_COLS } from "./Config.js";

export class Game {
  constructor() {
    this.canvas = new CanvasManager(document.getElementById("game"));
    this.map = new GameMap();
    this.player = new Player();
    this.coins = new CoinManager();
    this.input = new Input();
    this.last = 0;
    this.isPaused = false;
    this.cameraX = 0;
    this.lavaFrame = 0;
    this.lavaTimer = 0;

    // Ξεκινάμε από το Level 1
    this.currentLevelIndex = 1;

    this.door = new Door(() => {
      this.isPaused = true;
      this.puzzle.activate();
    });

    this.light = new LightSystem(this.map, this.coins, this.door);

    this.puzzle = new PuzzleSystem(this.canvas, () => {
      this.nextLevel();
    });

    // Φόρτωσε το level παράγοντάς το δυναμικά!
    this.loadLevel(this.currentLevelIndex);
    requestAnimationFrame((t) => this.loop(t));
  }

  loadLevel(levelNumber) {
    // Παράγουμε ΟΛΑ τα δεδομένα της πίστας On-The-Fly!
    const lvl = generateDynamicLevel(levelNumber);

    this.map.load(lvl.map);
    this.player.spawn(lvl.playerStart.x, lvl.playerStart.y);
    this.coins.load(lvl.coins);
    this.door.load(lvl.door.x, lvl.door.y);
    this.puzzle.load(lvl.puzzle);
    this.isPaused = false;
  }

  nextLevel() {
    this.currentLevelIndex++; // Πάει στο 2, 3, 4... στο άπειρο!
    this.loadLevel(this.currentLevelIndex);
  }

  loop(t) {
    const dt = Math.min((t - this.last) / 1000, 0.1);
    this.last = t;
    this.update(dt);
    this.draw();
    requestAnimationFrame((e) => this.loop(e));
  }
  update(dt) {
    if (this.isPaused) return;
    this.player.updatePhysics(this.input.dir(), this.map, dt);
    this.coins.check(this.player);
    this.door.check(this.player);

    // ΑΥΤΟΜΑΤΟ RESTART ΑΝ ΠΕΣΕΙ ΣΤΟ ΚΕΝΟ:
    const deathY = MAP_ROWS - 1.1;

    // Αν βρίσκεται χαμηλά και δεν είναι στη Safe Zone
    if (this.player.y > deathY && this.player.x > 7) {
      this.loadLevel(this.currentLevelIndex);
    }

    const tile = this.canvas.tile;

    const targetCamX =
      (this.player.x + this.player.w / 2) * tile - this.canvas.canvas.width / 2;
    this.cameraX = Math.max(
      0,
      Math.min(targetCamX, MAP_COLS * tile - this.canvas.canvas.width),
    );

    this.lavaTimer += dt;

    if (this.lavaTimer > 0.25) {
      this.lavaTimer = 0;
      this.lavaFrame = (this.lavaFrame + 1) % 2;
    }
  }
  draw() {
    const ctx = this.canvas.ctx;
    const tile = this.canvas.tile;

    ctx.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);

    // Σκοτάδι + κύκλος φωτός
    this.light.draw(ctx, this.canvas.canvas, tile, this.player, this.cameraX);

    // Παίκτης πάνω από το φως
    ctx.save();
    ctx.translate(-this.cameraX, 0);
    this.player.draw(ctx, tile);
    ctx.restore();

    // Puzzle πάνω απ' όλα
    this.puzzle.draw();
  }
}
