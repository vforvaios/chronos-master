import { Player } from "./Player.js";
import { Particle } from "./Particle.js";
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

import bgMusicUrl from "../bgmusic.mp3"; // Προσάρμοσε τη διαδρομή αν είναι σε άλλον φάκελο (π.χ. ../bgmusic.mp3)
import lavaSoundUrl from "../lava_sound.mp3";

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
    this.particles = [];
    this.maxLives = 3;
    this.lives = this.maxLives;

    // 1. Απλά ορίζουμε τη μεταβλητή, ΔΕΝ φορτώνουμε το αρχείο ακόμα
    this.lavaAudio = null;
    this.bgAudio = null;

    // 2. Η συνάρτηση που θα «ξεκλειδώσει» τον ήχο στο πρώτο άγγιγμα
    const unlockAudio = () => {
      // Δημιουργούμε τα Audio objects χρησιμοποιώντας τα σωστά Webpack imports
      if (!this.lavaAudio) {
        this.lavaAudio = new Audio(lavaSoundUrl);
        this.lavaAudio.loop = true;
        this.lavaAudio.volume = 0.4;
      }

      if (!this.bgAudio) {
        this.bgAudio = new Audio(bgMusicUrl);
        this.bgAudio.loop = true;
        this.bgAudio.volume = 0.4;
      }

      // Ξεκινάμε την αναπαραγωγή και των δύο
      this.lavaAudio
        .play()
        .then(() => console.log("Lava sound started successfully!"))
        .catch((err) => console.log("Lava audio failed:", err));

      this.bgAudio
        .play()
        .then(() => {
          console.log("Background music started successfully!");
          // Αφαιρούμε τους listeners μόνο όταν ξεκινήσει επιτυχώς η μουσική
          removeListeners();
        })
        .catch((err) => console.log("Background music failed:", err));
    };

    // Βοηθητική συνάρτηση για καθαρισμό των listeners
    const removeListeners = () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("touchend", unlockAudio);
    };

    // 3. Ακούμε όλα τα πιθανά events (το touchend και touchstart κάνουν τη διαφορά στα κινητά)
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    window.addEventListener("touchend", unlockAudio);

    // Ξεκινάμε από το Level 1
    this.currentLevelIndex = 1;

    this.door = new Door(() => {
      this.isPaused = true;
      this.puzzle.activate();
    });

    this.light = new LightSystem(this.map, this.coins, this.door, this);

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
    this.lives = this.maxLives;
    this.loadLevel(this.currentLevelIndex);
  }

  loop(t) {
    const dt = Math.min((t - this.last) / 1000, 0.1);
    this.last = t;
    this.update(dt);
    this.draw();
    requestAnimationFrame((e) => this.loop(e));
  }

  loseLife() {
    this.lives--;

    if (this.lives <= 0) {
      // Game Over
      this.lives = this.maxLives;
      this.currentLevelIndex = 1;
      this.loadLevel(this.currentLevelIndex);
      return;
    }

    // Respawn στην ίδια πίστα
    this.player.spawn(2.5, MAP_ROWS - 3.5);
  }

  update(dt) {
    if (this.isPaused) return;
    this.player.updatePhysics(this.input.dir(), this.map, dt);
    this.coins.check(this.player);
    this.door.check(this.player);

    // Ανανέωση σωματιδίων
    this.particles = this.particles.filter((p) => {
      p.update(dt);
      return p.life > 0; // Κρατάμε μόνο όσα ζουν ακόμα
    });

    // === ΔΙΟΡΘΩΣΗ ΕΔΩ: Ενημέρωση κίνησης εχθρών με το .data ===
    if (this.enemies) {
      // Χρησιμοποιούμε φίλτρο για να κρατάμε μόνο τους ζωντανούς εχθρούς
      this.enemies = this.enemies.filter((enemy) => {
        enemy.update(this.map.data);

        // Έλεγχος αν υπάρχει σύγκρουση
        if (enemy.checkCollision(this.player)) {
          // ΚΟΛΠΟ MARIO: Αν ο παίκτης πέφτει προς τα κάτω (vy > 0)
          // ΚΑΙ η βάση του παίκτη είναι κοντά στο κεφάλι του εχθρού
          const isStomping =
            this.player.vy > 0 &&
            this.player.y + this.player.h <= enemy.y + 0.3;

          if (isStomping) {
            // Ο παίκτης αναπηδάει ελαφρώς αφού πάτησε τον εχθρό
            this.player.vy = -6;

            // === ΔΗΜΙΟΥΡΓΙΑ ΚΟΜΜΑΤΙΩΝ ===
            // Δημιουργούμε 15 κομματάκια στη θέση του εχθρού
            for (let i = 0; i < 15; i++) {
              this.particles.push(
                new Particle(
                  enemy.x + enemy.width / 2,
                  enemy.y + enemy.height / 2,
                ),
              );
            }

            // Επιστρέφουμε false για να αφαιρεθεί αυτός ο εχθρός από τον πίνακα (πεθαίνει!)
            return false;
          } else {
            // Αν τον ακούμπησε από το πλάι ή από κάτω, ο παίκτης χάνει
            // this.loadLevel(this.currentLevelIndex);
            this.loseLife();
          }
        }
        return true; // Ο εχθρός παραμένει ζωντανός
      });
    }

    // ΑΥΤΟΜΑΤΟ RESTART ΑΝ ΠΕΣΕΙ ΣΤΟ ΚΕΝΟ:
    const deathY = MAP_ROWS - 1.1;

    // Αν βρίσκεται χαμηλά και δεν είναι στη Safe Zone
    if (this.player.y > deathY && this.player.x > 7) {
      // this.loadLevel(this.currentLevelIndex);
      this.loseLife();
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

    this.particles.forEach((p) => p.draw(ctx, tile, 0));

    ctx.restore();

    ctx.fillStyle = "white";
    ctx.font = `${tile / 2}px Arial`;
    ctx.fillText(`❤️ ${this.lives}`, 20, 35);
    // LAYER 4: UI / Παζλ
    this.puzzle.draw();
  }

  destroy() {
    // 1. Σταματάμε το update loop του παιχνιδιού
    this.isPaused = true;

    // 2. Σταματάμε τη μουσική υπόκρουσης (Background Music)
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0; // Επαναφορά στην αρχή
      this.bgAudio = null;
    }

    // 3. Σταματάμε τον ήχο της λάβας
    if (this.lavaAudio) {
      this.lavaAudio.pause();
      this.lavaAudio.currentTime = 0;
      this.lavaAudio = null;
    }

    console.log("Το Dark Platformer καταστράφηκε και οι ήχοι σταμάτησαν!");
  }
}
