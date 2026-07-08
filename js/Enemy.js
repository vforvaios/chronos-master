export class Enemy {
  constructor(x, y) {
    this.x = x; // Θέση X σε blocks (π.χ. 5.5)
    this.y = y; // Θέση Y σε blocks
    this.width = 0.8; // Μέγεθος εχθρού (λίγο μικρότερο από 1 block)
    this.height = 0.8;
    this.speed = 0.05; // Ταχύτητα κίνησης
    this.direction = 1; // 1 = Δεξιά, -1 = Αριστερά
  }

  update(map) {
    // Δικλείδα ασφαλείας για το Webpack/Ασυγχρονία
    if (!map || !map[0]) return;

    // 1. Υπολογισμός της επόμενης υποψήφιας θέσης X
    let nextX = this.x + this.speed * this.direction;

    // Όρια οθόνης
    if (nextX < 0 || nextX + this.width >= map[0].length) {
      this.direction *= -1;
      return;
    }

    // 2. Έλεγχος για τοίχους ΜΠΡΟΣΤΑ του
    let checkCol =
      this.direction === 1 ? Math.floor(nextX + this.width) : Math.floor(nextX);
    let checkRow = Math.floor(this.y + this.height / 2); // Ελέγχουμε στο κέντρο του σώματός του

    if (map[checkRow] !== undefined && map[checkRow][checkCol] === 1) {
      this.direction *= -1; // Τοίχος! Γύρνα πίσω
      return;
    }

    // 3. Έλεγχος για την άκρη της πλατφόρμας (Να μην πέσει στο κενό)
    // Κοιτάζουμε ακριβώς 0.2 blocks κάτω από τα πόδια του
    let groundRow = Math.floor(this.y + this.height + 0.2);
    let groundCol =
      this.direction === 1 ? Math.floor(nextX + this.width) : Math.floor(nextX);

    // Αν κάτω από τα πόδια του έχει κενό (0) ή λάβα (MAP_ROWS - 1), άλλαξε κατεύθυνση
    if (
      map[groundRow] === undefined ||
      map[groundRow][groundCol] === undefined ||
      map[groundRow][groundCol] === 0
    ) {
      this.direction *= -1; // Άκρη πλατφόρμας! Γύρνα πίσω
      return;
    }

    // Αν όλα είναι καθαρά, προχώρα!
    this.x = nextX;
  }

  draw(ctx, tileSize, cameraX) {
    // Υπολογισμός θέσης στην οθόνη με βάση την κάμερα
    const screenX = (this.x - cameraX) * tileSize;
    const screenY = this.y * tileSize;

    // Σχεδίαση εχθρού (κόκκινο τετράγωνο ή sprite αν έχεις)
    ctx.fillStyle = "red";
    ctx.fillRect(
      screenX,
      screenY,
      this.width * tileSize,
      this.height * tileSize,
    );
  }

  // Απλό Box Collision για να δούμε αν χτύπησε τον παίκτη
  checkCollision(player) {
    // Στενεύουμε το οπτικό hitbox του παίκτη για να πιάνει μόνο το σώμα
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
