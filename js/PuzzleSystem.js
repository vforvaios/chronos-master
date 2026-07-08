export /* ================= DYNAMIC PUZZLE SYSTEM ================= */
class PuzzleSystem {
  constructor(canvasManager, onSolve) {
    this.cm = canvasManager;
    this.onSolve = onSolve;
    this.active = false;
    this.message = "";
    this.data = null;
    window.addEventListener("click", (e) => this.checkClick(e));
    window.addEventListener(
      "touchstart",
      (e) => {
        if (this.active) this.checkClick(e.touches[0]);
      },
      { passive: true },
    );
  }
  load(puzzleData) {
    this.data = puzzleData;
    this.message = "Λύσε το γρίφο για να περάσεις την πύλη!";
  }
  activate() {
    this.active = true;
    document.getElementById("touch-controls").style.opacity = "0";
  }
  checkClick(e) {
    if (!this.active || !this.data) return;
    const rect = this.cm.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const tile = this.cm.tile;
    const btnY_Min = 8.5 * tile;
    const btnY_Max = 10 * tile;

    // Κουμπί Αριστερά (A)
    if (mx >= 6 * tile && mx <= 9 * tile && my >= btnY_Min && my <= btnY_Max) {
      this.handleAnswer("A");
    }
    // Κουμπί Δεξιά (B)
    if (
      mx >= 11 * tile &&
      mx <= 14 * tile &&
      my >= btnY_Min &&
      my <= btnY_Max
    ) {
      this.handleAnswer("B");
    }
  }
  handleAnswer(choice) {
    if (choice === this.data.correct) {
      this.message = "ΣΩΣΤΟ! Φόρτωση επόμενης πίστας...";
      setTimeout(() => {
        this.active = false;
        if ("ontouchstart" in window || navigator.maxTouchPoints > 0)
          document.getElementById("touch-controls").style.opacity = "1";
        this.onSolve();
      }, 1500);
    } else {
      this.message = "Λάθος απάντηση! Δοκίμασε ξανά.";
    }
  }
  draw() {
    if (!this.active || !this.data) return;
    const ctx = this.cm.ctx;
    const tile = this.cm.tile;
    ctx.fillStyle = "rgba(25, 15, 10, 0.95)";
    ctx.fillRect(3 * tile, 3 * tile, 14 * tile, 9 * tile);
    ctx.strokeStyle = "#4a2c11";
    ctx.lineWidth = 4;
    ctx.strokeRect(3 * tile, 3 * tile, 14 * tile, 9 * tile);
    ctx.fillStyle = "#d1c4a5";
    ctx.textAlign = "center";
    ctx.font = `bold ${tile * 0.65}px 'Courier New'`;
    ctx.fillText(this.data.title, 10 * tile, 4.5 * tile);
    ctx.font = `${tile * 0.55}px 'Courier New'`;
    ctx.fillText(this.data.line1, 10 * tile, 5.6 * tile);
    ctx.fillText(this.data.line2, 10 * tile, 6.2 * tile);
    ctx.fillStyle = "#e67e22";
    ctx.font = `italic ${tile * 0.43}px 'Courier New'`;
    ctx.fillText(this.message, 10 * tile, 7.4 * tile);

    // Σχεδίαση Κουμπιών με τα δυναμικά κείμενα
    ctx.fillStyle = "#3a221d";
    ctx.fillRect(5.5 * tile, 8.5 * tile, 4 * tile, 1.5 * tile);
    ctx.fillStyle = "#d1c4a5";
    ctx.font = `bold ${tile * 0.45}px 'Courier New'`;
    ctx.fillText(this.data.optA, 7.5 * tile, 9.4 * tile);
    ctx.fillStyle = "#3a221d";
    ctx.fillRect(10.5 * tile, 8.5 * tile, 4 * tile, 1.5 * tile);
    ctx.fillStyle = "#d1c4a5";
    ctx.fillText(this.data.optB, 12.5 * tile, 9.4 * tile);
    ctx.textAlign = "left";
  }
}
