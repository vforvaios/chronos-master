import { Game } from "./js/Game.js";
import { DoodleGame } from "./js/DoodleGame.js";
import { CanvasManager } from "./js/CanvasManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const menuDiv = document.getElementById("main-menu");
  const gameCanvas = document.getElementById("game");
  const btnPlatformer = document.getElementById("btn-platformer");
  const btnDoodle = document.getElementById("btn-doodle");
  const touchControls = document.getElementById("touch-controls");

  // ΤΟ ΝΕΟ ΚΟΥΜΠΙ
  const btnBack = document.getElementById("btn-back-to-menu");

  const canvasManager = new CanvasManager(gameCanvas);
  let activeGame = null;

  // Επιστροφή στο κεντρικό μενού
  const showMenu = () => {
    if (activeGame && typeof activeGame.destroy === "function") {
      activeGame.destroy();
    }
    activeGame = null;

    gameCanvas.style.display = "none";
    if (touchControls) touchControls.style.display = "none";

    btnBack.style.display = "none"; // Κρύβε το κουμπί στο μενού
    menuDiv.style.display = "flex";
  };

  // Όταν ο χρήστης πατάει το κουμπί "← Μενού"
  btnBack.addEventListener("click", showMenu);

  // Επιλογή 1: Dark Platformer
  btnPlatformer.addEventListener("click", () => {
    menuDiv.style.display = "none";
    gameCanvas.style.display = "block";
    if (touchControls) touchControls.style.display = "block";

    btnBack.style.display = "block"; // Εμφάνισε το κουμπί!

    gameCanvas.width = 800;
    gameCanvas.height = 450;
    activeGame = new Game(canvasManager, showMenu);
  });

  // Επιλογή 2: Doodle Jump
  btnDoodle.addEventListener("click", () => {
    menuDiv.style.display = "none";
    gameCanvas.style.display = "block";
    if (touchControls) touchControls.style.display = "none";

    btnBack.style.display = "block"; // Εμφάνισε το κουμπί!

    gameCanvas.width = 380;
    gameCanvas.height = 680;
    activeGame = new DoodleGame(canvasManager, showMenu);
  });
});
