export class DoodleGame {
  constructor(canvasManager, onBackToMenu) {
    this.canvas = canvasManager.canvas;
    this.ctx = canvasManager.ctx;
    this.onBackToMenu = onBackToMenu; // Callback για να γυρνάει στο μενού

    this.gravity = 0.4;
    this.bounceVelocity = -12;
    this.score = 0;
    this.gameOver = false;
    this.animationFrameId = null;

    this.player = {
      x: this.canvas.width / 2 - 20,
      y: this.canvas.height - 150,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      speed: 6,
    };

    this.platforms = [];
    this.platformWidth = 70;
    this.platformHeight = 15;

    this.keys = {};
    this.initEvents();
    this.initPlatforms();
    this.animate();
  }

  initPlatforms() {
    this.platforms = [];
    this.platforms.push({
      x: this.canvas.width / 2 - this.platformWidth / 2,
      y: this.canvas.height - 50,
    });

    for (let i = 0; i < 7; i++) {
      this.platforms.push({
        x: Math.random() * (this.canvas.width - this.platformWidth),
        y: this.canvas.height - i * 90 - 150,
      });
    }
  }

  initEvents() {
    this._keydown = (e) => {
      this.keys[e.code] = true;
      if (this.gameOver && e.code === "Space") this.resetGame();
      if (e.code === "Escape") this.destroy(this.onBackToMenu); // Esc για έξοδο στο μενού
    };
    this._keyup = (e) => {
      this.keys[e.code] = false;
    };

    window.addEventListener("keydown", this._keydown);
    window.addEventListener("keyup", this._keyup);
  }

  resetGame() {
    this.player.x = this.canvas.width / 2 - 20;
    this.player.y = this.canvas.height - 150;
    this.player.vx = 0;
    this.player.vy = 0;
    this.score = 0;
    this.gameOver = false;
    this.initPlatforms();
    this.animate();
  }

  update() {
    if (this.gameOver) return;

    if (this.keys["ArrowLeft"]) this.player.vx = -this.player.speed;
    else if (this.keys["ArrowRight"]) this.player.vx = this.player.speed;
    else this.player.vx = 0;

    this.player.x += this.player.vx;

    if (this.player.x + this.player.width < 0)
      this.player.x = this.canvas.width;
    if (this.player.x > this.canvas.width) this.player.x = -this.player.width;

    this.player.vy += this.gravity;
    this.player.y += this.player.vy;

    if (this.player.vy > 0) {
      this.platforms.forEach((platform) => {
        if (
          this.player.x + this.player.width > platform.x &&
          this.player.x < platform.x + this.platformWidth &&
          this.player.y + this.player.height >= platform.y &&
          this.player.y + this.player.height <=
            platform.y + this.platformHeight + this.player.vy
        ) {
          this.player.vy = this.bounceVelocity;
        }
      });
    }

    if (this.player.y < this.canvas.height / 2) {
      let diff = this.canvas.height / 2 - this.player.y;
      this.player.y = this.canvas.height / 2;
      this.score += Math.floor(diff);

      this.platforms.forEach((platform) => {
        platform.y += diff;
      });
    }

    this.platforms.forEach((platform) => {
      if (platform.y > this.canvas.height) {
        platform.y = 0 - this.platformHeight;
        platform.x = Math.random() * (this.canvas.width - this.platformWidth);
      }
    });

    if (this.player.y > this.canvas.height) {
      this.gameOver = true;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Φόντο Doodle Jump
    this.ctx.fillStyle = "#eef2f3";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#2ecc71";
    this.platforms.forEach((platform) => {
      this.ctx.fillRect(
        platform.x,
        platform.y,
        this.platformWidth,
        this.platformHeight,
      );
    });

    this.ctx.fillStyle = "#e67e22";
    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
    );

    this.ctx.fillStyle = "#333";
    this.ctx.font = "20px Arial";
    this.ctx.fillText("Score: " + this.score, 20, 35);

    if (this.gameOver) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = "#fff";
      this.ctx.font = "30px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "GAME OVER",
        this.canvas.width / 2,
        this.canvas.height / 2 - 20,
      );
      this.ctx.font = "18px Arial";
      this.ctx.fillText(
        "Τελικό Σκορ: " + this.score,
        this.canvas.width / 2,
        this.canvas.height / 2 + 20,
      );
      this.ctx.fillText(
        "SPACE για Replay | ESC για Μενού",
        this.canvas.width / 2,
        this.canvas.height / 2 + 60,
      );
      this.ctx.textAlign = "start";
    }
  }

  animate() {
    this.update();
    this.draw();
    if (!this.gameOver) {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  // Καθαρισμός όταν βγαίνουμε από το παιχνίδι
  destroy(callback) {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener("keydown", this._keydown);
    window.removeEventListener("keyup", this._keyup);
    if (callback) callback();
  }
}
