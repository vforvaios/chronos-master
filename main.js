import { Game } from "./js/Game.js";
import { DoodleGame } from "./js/DoodleGame.js";
import { CanvasManager } from "./js/CanvasManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const menuDiv = document.getElementById("main-menu");
  const gameCanvas = document.getElementById("game");
  const btnPlatformer = document.getElementById("btn-platformer");
  const btnDoodle = document.getElementById("btn-doodle");
  const touchControls = document.getElementById("touch-controls");
  const btnBack = document.getElementById("btn-back-to-menu");

  const canvasManager = new CanvasManager(gameCanvas);
  let activeGame = null;

  // Ασφαλής συνάρτηση για αλλαγή προσανατολισμού (Συμβατή και με Android 9)
  const changeOrientation = (mode) => {
    try {
      if (screen.orientation && typeof screen.orientation.lock === "function") {
        if (mode === "landscape") {
          screen.orientation
            .lock("landscape")
            .then(() => console.log("Orientation locked to landscape"))
            .catch((err) => console.warn("Orientation lock rejected:", err));
        } else if (mode === "portrait") {
          screen.orientation
            .lock("portrait")
            .then(() => console.log("Orientation locked to portrait"))
            .catch((err) => console.warn("Orientation lock rejected:", err));
        } else {
          try {
            screen.orientation.unlock();
          } catch (e) {
            // Σιωπηλό fail αν δεν υποστηρίζεται το unlock
          }
        }
      } else if (screen.lockOrientation) {
        // Fallback για παλιότερους browsers / WebViews
        if (mode === "landscape") screen.lockOrientation("landscape");
        else if (mode === "portrait") screen.lockOrientation("portrait");
        else screen.unlockOrientation();
      }
    } catch (error) {
      console.warn(
        "Το orientation lock απέτυχε, αλλά το παιχνίδι συνεχίζει κανονικά:",
        error,
      );
    }
  };

  // Επιστροφή στο κεντρικό μενού
  const showMenu = () => {
    if (activeGame && typeof activeGame.destroy === "function") {
      activeGame.destroy();
    }
    activeGame = null;

    gameCanvas.style.display = "none";
    if (touchControls) touchControls.style.display = "none";
    btnBack.style.display = "none";
    menuDiv.style.display = "flex";

    // Ξεκλείδωμα οθόνης κατά την επιστροφή στο μενού
    changeOrientation("unlock");
  };

  // Σύνδεση του κουμπιού επιστροφής
  btnBack.addEventListener("click", showMenu);

  // Επιλογή 1: Το Dark Platformer με τους γρίφους (LANDSCAPE)
  btnPlatformer.addEventListener("click", () => {
    menuDiv.style.display = "none";
    gameCanvas.style.display = "block";
    if (touchControls) touchControls.style.display = "block"; // Ενεργοποίηση joystick
    btnBack.style.display = "block"; // Εμφάνιση κουμπιού "Μενού"

    // Κλείδωμα σε Landscape προσανατολισμό
    changeOrientation("landscape");

    // Επαναφορά διαστάσεων του Platformer
    gameCanvas.width = 800;
    gameCanvas.height = 450;

    activeGame = new Game(canvasManager, showMenu);
  });

  // Επιλογή 2: Το Doodle Jump Clone (PORTRAIT)
  btnDoodle.addEventListener("click", () => {
    menuDiv.style.display = "none";
    gameCanvas.style.display = "block";
    if (touchControls) touchControls.style.display = "none"; // Απενεργοποίηση joystick
    btnBack.style.display = "block"; // Εμφάνιση κουμπιού "Μενού"

    // Κλείδωμα σε Portrait προσανατολισμό
    changeOrientation("portrait");

    // Ρύθμιση ψηλού και λεπτού canvas για το Doodle Jump
    gameCanvas.width = 380;
    gameCanvas.height = 680;

    activeGame = new DoodleGame(canvasManager, showMenu);
  });
});
