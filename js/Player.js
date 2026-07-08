import { sprites } from "./Config.js";
/* ================= PLAYER ================= */
export class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.w = 0.7; // από 0.5
    this.h = 1; // από 0.9
    this.speed = 5;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 15;
    this.jumpForce = -10;
    this.grounded = false;
    this.direction = "right";
    this.isMoving = false;
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameSpeed = 0.1;
    this.totalFrames = 8;
  }
  spawn(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }
  updatePhysics(dir, map, dt) {
    this.vx = dir.x * this.speed;
    this.vy += this.gravity * dt;
    if (dir.x > 0) {
      this.direction = "right";
      this.isMoving = true;
    } else if (dir.x < 0) {
      this.direction = "left";
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    this.x += this.vx * dt;
    if (this.vx > 0) {
      if (
        map.isWall(this.x + this.w, this.y) ||
        map.isWall(this.x + this.w, this.y + this.h - 0.05)
      )
        this.x = Math.floor(this.x + this.w) - this.w;
    } else if (this.vx < 0) {
      if (
        map.isWall(this.x, this.y) ||
        map.isWall(this.x, this.y + this.h - 0.05)
      )
        this.x = Math.floor(this.x) + 1;
    }

    this.y += this.vy * dt;
    this.grounded = false;
    if (this.vy > 0) {
      if (
        map.isWall(this.x, this.y + this.h) ||
        map.isWall(this.x + this.w - 0.05, this.y + this.h)
      ) {
        this.y = Math.floor(this.y + this.h) - this.h;
        this.vy = 0;
        this.grounded = true;
      }
    } else if (this.vy < 0) {
      if (
        map.isWall(this.x, this.y) ||
        map.isWall(this.x + this.w - 0.05, this.y)
      ) {
        this.y = Math.floor(this.y) + 1;
        this.vy = 0;
      }
    }
    if (dir.jump && this.grounded) {
      this.vy = this.jumpForce;
      this.grounded = false;
    }
    this.frameTimer += dt;
    if (this.frameTimer >= this.frameSpeed) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % this.totalFrames;
    }
  }
  draw(ctx, tile) {
    let currentImg = this.isMoving
      ? this.direction === "right"
        ? sprites.runRight
        : sprites.runLeft
      : this.direction === "right"
        ? sprites.idleRight
        : sprites.idleLeft;
    const TARGET_WIDTH = 2.5;
    const TARGET_HEIGHT = TARGET_WIDTH * (80 / 96);
    const renderX = (this.x - 0.95) * tile;
    const renderY = (this.y + this.h - TARGET_HEIGHT + 0.56) * tile;
    ctx.drawImage(
      currentImg,
      this.frameIndex * 96,
      0,
      96,
      80,
      renderX,
      renderY,
      TARGET_WIDTH * tile,
      TARGET_HEIGHT * tile,
    );
  }
}
