export class Enemy {
  constructor(x, y) {
    // Στρογγυλοποιούμε το Y ώστε να πατάει ακριβώς στην αρχή του tile
    this.x = x;
    this.y = Math.floor(y) + 0.2; // Το 0.2 συμπληρώνει το ύψος (0.8) για να ακουμπάει το κάτω block
    this.width = 0.8;
    this.height = 0.8;
    this.speed = 0.02;
    this.direction = 1;
  }

  update(map) {
    if (!map || !map[0]) return;

    // 1. Υπολογισμός επόμενης θέσης X
    let nextX = this.x + this.speed * this.direction;

    // Όρια οθόνης
    if (nextX < 0 || nextX + this.width >= map[0].length) {
      this.direction *= -1;
      return;
    }

    // 2. Έλεγχος για τοίχους (μπροστά του)
    let checkCol =
      this.direction === 1 ? Math.floor(nextX + this.width) : Math.floor(nextX);
    let checkRow = Math.floor(this.y);

    if (map[checkRow] !== undefined && map[checkRow][checkCol] === 1) {
      this.direction *= -1;
      return;
    }

    // 3. Έλεγχος για την άκρη της πλατφόρμας
    // Κοιτάζουμε τη σειρά που βρίσκεται ακριβώς κάτω από τον εχθρό (checkRow + 1)
    let groundRow = checkRow + 1;
    // Ελέγχουμε το block μπροστά, ανάλογα με την κατεύθυνση
    let groundCol =
      this.direction === 1
        ? Math.floor(nextX + this.width - 0.1)
        : Math.floor(nextX + 0.1);

    if (
      map[groundRow] === undefined ||
      map[groundRow][groundCol] === undefined ||
      map[groundRow][groundCol] === 0
    ) {
      this.direction *= -1; // Δεν έχει πάτωμα, γύρνα πίσω!
      return;
    }

    // Αν όλα είναι εντάξει, προχωράει
    this.x = nextX;
  }

  draw(ctx, tileSize, cameraX) {
    // Σχεδίαση χωρίς "αλχημείες" στο Y, αφού η θέση είναι πλέον σωστή
    const screenX = (this.x - cameraX) * tileSize;
    const screenY = this.y * tileSize;

    ctx.fillStyle = "red";
    ctx.fillRect(
      screenX,
      screenY,
      this.width * tileSize,
      this.height * tileSize,
    );
  }

  checkCollision(player) {
    const playerVisualX = player.x - 0.5;
    const playerVisualW = 1.3;

    return (
      this.x < playerVisualX + playerVisualW &&
      this.x + this.width > playerVisualX &&
      this.y < player.y + player.h &&
      this.y + this.height > player.y
    );
  }
}
