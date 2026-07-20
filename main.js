import { Game } from "./js/Game.js";
import { CanvasManager } from "./js/CanvasManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const gameCanvas = document.getElementById("game");
  const touchControls = document.getElementById("touch-controls");

  if (!gameCanvas) {
    console.error("Το Canvas με id='game' δεν βρέθηκε!");
    return;
  }

  // Landscape class
  document.body.classList.add("playing-platformer");

  // Προσπάθεια για landscape
  try {
    if (screen.orientation && typeof screen.orientation.lock === "function") {
      screen.orientation.lock("landscape").catch(() => {});
    }
  } catch (e) {}

  gameCanvas.style.display = "block";

  if (touchControls) {
    touchControls.style.display = "block";
  }

  const canvasManager = new CanvasManager(gameCanvas);

  new Game(canvasManager);
});
