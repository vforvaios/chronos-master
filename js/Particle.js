export class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 0.15 + 0.05; // Μικρά κομματάκια (σε units)
    // Τυχαία ταχύτητα για να πεταχτούν προς όλες τις κατευθύνσεις
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.8) * 8; // Πιο πολύ προς τα πάνω
    this.gravity = 15;
    this.alpha = 1; // Διαφάνεια που θα σβήνει σιγά σιγά
    this.life = 0.5; // Θα ζουν για μισό δευτερόλεπτο
  }

  update(dt) {
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.alpha = Math.max(0, this.life / 0.5); // Ξεθωριάζει
  }

  draw(ctx, tileSize, cameraX) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "red"; // Το χρώμα του εχθρού
    ctx.fillRect(
      (this.x - cameraX) * tileSize,
      this.y * tileSize,
      this.size * tileSize,
      this.size * tileSize,
    );
    ctx.restore();
  }
}
