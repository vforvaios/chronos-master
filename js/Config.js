import runRightImg from "../run_right.png"; // Αν είναι στον ίδιο φάκελο με το αρχείο αυτό
import runLeftImg from "../run_left.png";
import idleRightImg from "../idle_right.png";
import idleLeftImg from "../idle_left.png";
import lavaImg from "../lava.png";

export const MAP_COLS = 40;
export const MAP_ROWS = 15;
export const VIEW_COLS = 20;

/* ================= ΦΟΡΤΩΣΗ SPRITES ================= */
export const sprites = {
  runRight: new Image(),
  runLeft: new Image(),
  idleRight: new Image(),
  idleLeft: new Image(),
  lava: new Image(),
};
sprites.runRight.src = runRightImg;
sprites.runLeft.src = runLeftImg;
sprites.idleRight.src = idleRightImg;
sprites.idleLeft.src = idleLeftImg;
sprites.lava.src = lavaImg;

sprites.lava.onload = () => console.log("Lava loaded");
sprites.lava.onerror = () => console.error("Lava NOT FOUND");
