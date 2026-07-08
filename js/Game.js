import { Player } from "./Player.js";
import { GameMap } from "./GameMap.js";
import { Input } from "./Input.js";
import { CoinManager } from "./CoinManager.js";
import { Door } from "./Door.js";
import { CanvasManager } from "./CanvasManager.js";
import { PuzzleSystem } from "./PuzzleSystem.js";
import { LightSystem } from "./LightSystem.js";
import { Enemy } from "./Enemy.js";
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

    // Αρχικοποίηση εχθρών
    this.enemies = (lvl.enemies || []).map((e) => new Enemy(e.x, e.y));

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

    // === ΔΙΟΡΘΩΣΗ ΕΔΩ: Ενημέρωση κίνησης εχθρών με το .data ===
    if (this.enemies) {
      this.enemies.forEach((enemy) => {
        enemy.update(this.map.data); // Σωστό property!

        // Έλεγχος σύγκρουσης με τον παίκτη
        if (enemy.checkCollision(this.player)) {
          this.loadLevel(this.currentLevelIndex);
        }
      });
    }

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

    // LAYER 1: Χάρτης (Πίσω από το σκοτάδι)
    ctx.save();
    ctx.translate(-this.cameraX, 0);
    this.map.draw(ctx, tile, this.lavaFrame);
    ctx.restore();

    // LAYER 2: Σκοτάδι & Φως
    this.light.draw(ctx, this.canvas.canvas, tile, this.player, this.cameraX);

    // LAYER 3: Χαρακτήρες (Πάνω από το σκοτάδι, αλλά με έλεγχο απόστασης!)
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Σχεδίαση Παίκτη (Πάντα ορατός)
    this.player.draw(ctx, tile);

    // Σχεδίαση Εχθρών ΜΟΝΟ αν είναι κοντά στον παίκτη (μέσα στο φως)
    if (this.enemies) {
      this.enemies.forEach((enemy) => {
        // Υπολογισμός απόστασης (σε blocks) μεταξύ παίκτη και εχθρού
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Αν η απόσταση είναι μικρότερη από 4.5 blocks (όσο είναι περίπου το φως σου), σχεδίασέ τον
        if (distance < 4.5) {
          enemy.draw(ctx, tile, 0);
        }
      });
    }

    ctx.restore();

    // LAYER 4: UI / Παζλ
    this.puzzle.draw();
  }
}
