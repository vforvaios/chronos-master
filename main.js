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

  if (!gameCanvas) {
    console.error("Το Canvas με id='game' δεν βρέθηκε!");
    return;
  }

  const canvasManager = new CanvasManager(gameCanvas);
  let activeGame = null;

  // Με το που ανοίγει η εφαρμογή, χρειαζόμαστε Portrait προσανατολισμό
  document.body.classList.add("needs-portrait");

  // Ασφαλής αλλαγή προσανατολισμού χωρίς await (για αποφυγή NotSupportedError)
  const changeOrientation = (mode) => {
    try {
      if (screen.orientation && typeof screen.orientation.lock === "function") {
        if (mode === "landscape") {
          screen.orientation.lock("landscape").catch((err) => {
            console.warn("Το κλείδωμα σε landscape απορρίφθηκε:", err.message);
          });
        } else if (mode === "portrait") {
          screen.orientation.lock("portrait").catch((err) => {
            console.warn("Το κλείδωμα σε portrait απορρίφθηκε:", err.message);
          });
        } else {
          try {
            screen.orientation.unlock();
          } catch (e) {}
        }
      }
    } catch (error) {
      console.warn(
        "Η αλλαγή προσανατολισμού δεν υποστηρίζεται σε αυτή τη συσκευή.",
      );
    }
  };

  // Επιστροφή στο κεντρικό μενού
  const showMenu = () => {
    if (activeGame && typeof activeGame.destroy === "function") {
      activeGame.destroy();
    }
    activeGame = null;

    // === RESET ΤΟΥ SCROLL ΤΗΣ ΣΕΛΙΔΑΣ ===
    // Αυτό διορθώνει το γλίστρημα του μενού προς τα πάνω!
    window.scrollTo(0, 0);
    if (document.body) document.body.scrollTop = 0;
    if (document.documentElement) document.documentElement.scrollTop = 0;

    // Αφαιρούμε το Landscape φίλτρο και ενεργοποιούμε το Portrait φίλτρο για το μενού
    document.body.classList.remove("playing-platformer");
    document.body.classList.add("needs-portrait");

    gameCanvas.style.display = "none";
    if (touchControls) touchControls.style.display = "none";
    if (btnBack) btnBack.style.display = "none";
    if (menuDiv) menuDiv.style.display = "flex";

    // Προσπάθεια για αυτόματο γύρισμα σε portrait
    changeOrientation("portrait");
  };

  if (btnBack) {
    btnBack.addEventListener("click", showMenu);
  }

  // Επιλογή 1: Dark Platformer (Χρειάζεται LANDSCAPE)
  if (btnPlatformer) {
    btnPlatformer.addEventListener("click", () => {
      if (menuDiv) menuDiv.style.display = "none";
      gameCanvas.style.display = "block";
      if (touchControls) touchControls.style.display = "block";
      if (btnBack) btnBack.style.display = "block";

      // Αλλάζουμε τις κλάσεις: Τώρα θέλουμε Landscape!
      document.body.classList.remove("needs-portrait");
      document.body.classList.add("playing-platformer");

      // Προσπάθεια για αυτόματη αλλαγή
      changeOrientation("landscape");

      gameCanvas.width = 800;
      gameCanvas.height = 450;

      activeGame = new Game(canvasManager, showMenu);
    });
  }

  // Επιλογή 2: Doodle Jump (Χρειάζεται PORTRAIT)
  if (btnDoodle) {
    btnDoodle.addEventListener("click", () => {
      if (menuDiv) menuDiv.style.display = "none";
      gameCanvas.style.display = "block";
      if (touchControls) touchControls.style.display = "none";
      if (btnBack) btnBack.style.display = "block";

      // Θέλουμε Portrait και για το Doodle Jump
      document.body.classList.remove("playing-platformer");
      document.body.classList.add("needs-portrait");

      // Προσπάθεια για αυτόματη αλλαγή
      changeOrientation("portrait");

      gameCanvas.width = 380;
      gameCanvas.height = 680;

      activeGame = new DoodleGame(canvasManager, showMenu);
    });
  }
});
