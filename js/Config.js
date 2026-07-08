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
sprites.runRight.src = "../run_right.png";
sprites.runLeft.src = "../run_left.png";
sprites.idleRight.src = "../idle_right.png";
sprites.idleLeft.src = "../idle_left.png";
sprites.lava.src = "../lava.png";

sprites.lava.onload = () => console.log("Lava loaded");
sprites.lava.onerror = () => console.error("Lava NOT FOUND");
