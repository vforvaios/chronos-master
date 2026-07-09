import { MAP_ROWS, MAP_COLS } from "./Config.js";

export function generateDynamicLevel(levelNumber) {
  let enemies = [];
  // 1. Δημιουργία άδειου χάρτη με περιμετρικούς τοίχους
  let map = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    map[r] = [];
    for (let c = 0; c < MAP_COLS; c++) {
      if (r === 0 || c === 0 || c === MAP_COLS - 1) {
        map[r][c] = 1;
      } else {
        map[r][c] = 0;
      }
    }
  }

  // 2. Πλατφόρμα εκκίνησης (Safe Zone) κάτω αριστερά
  for (let c = 1; c <= 6; c++) {
    map[MAP_ROWS - 2][c] = 1;
  }

  // 3. Ορισμός Υψών για τους 3 Ορόφους (Διαφορά 3 blocks αντί για 4)
  // 1ος όροφος: row 12, 2ος όροφος: row 9, 3ος όροφος: row 6
  let floor1 = MAP_ROWS - 3; // 12
  let floor2 = floor1 - 3; // 9
  let floor3 = floor2 - 3; // 6

  // --- ΟΡΟΦΟΣ 1: Κίνηση προς τα ΔΕΞΙΑ ---
  let curX = 7;
  while (curX < MAP_COLS - 6) {
    let w = Math.floor(Math.random() * 2) + 2; // πλάτος 2-3
    let hJump = Math.floor(Math.random() * 2); // 0 ή 1 για μικρή ποικιλία
    for (let i = 0; i < w; i++) {
      if (curX + i < MAP_COLS - 5) {
        map[floor1 + hJump][curX + i] = 1;
        // ΕΔΩ ΜΠΑΙΝΕΙ Ο ΕΧΘΡΟΣ: Αν δεν είναι στην αρχή, βάλε εχθρό ακριβώς 1 block πάνω από το tile!
        if (curX + i > 7 && Math.random() < 0.15) {
          enemies.push({ x: curX + i, y: floor1 + hJump - 1 });
        }
      }
    }
    curX += w + Math.floor(Math.random() * 2) + 1; // κενό 1-2 blocks
  }

  // === ΣΚΑΛΑ ΣΥΝΔΕΣΗΣ: ΑΠΟ ΟΡΟΦΟ 1 ΣΕ ΟΡΟΦΟ 2 (Τέρμα Δεξιά) ===
  // Φτιάχνουμε σκαλοπάτια που ανεβαίνουν ομαλά προς τα αριστερά για να μπει ο παίκτης στον 2ο όροφο
  map[floor1 - 1][MAP_COLS - 3] = 1; // Πρώτο σκαλοπάτι
  map[floor1 - 2][MAP_COLS - 5] = 1; // Δεύτερο σκαλοπάτι
  map[floor2][MAP_COLS - 4] = 1; // Αρχή του 2ου ορόφου
  map[floor2][MAP_COLS - 3] = 1;

  // --- ΟΡΟΦΟΣ 2: Κίνηση προς τα ΑΡΙΣΤΕΡΑ ---
  curX = MAP_COLS - 6;
  while (curX > 6) {
    let w = Math.floor(Math.random() * 2) + 2;
    let hJump = Math.floor(Math.random() * 2);
    for (let i = 0; i < w; i++) {
      if (curX - i > 4) {
        map[floor2 + hJump][curX - i] = 1;

        // ΕΔΩ ΜΠΑΙΝΕΙ Ο ΕΧΘΡΟΣ:
        if (Math.random() < 0.15) {
          enemies.push({ x: curX - i, y: floor2 + hJump - 1 });
        }
      }
    }
    curX -= w + Math.floor(Math.random() * 2) + 1;
  }

  // === ΣΚΑΛΑ ΣΥΝΔΕΣΗΣ: ΑΠΟ ΟΡΟΦΟ 2 ΣΕ ΟΡΟΦΟ 3 (Τέρμα Αριστερά) ===
  // Σκαλοπάτια για να ανέβει ο παίκτης στον τελευταίο όροφο
  map[floor2 - 1][2] = 1;
  map[floor2 - 2][4] = 1;
  map[floor3][3] = 1;
  map[floor3][2] = 1;

  // --- ΟΡΟΦΟΣ 3: Κίνηση ξανά προς τα ΔΕΞΙΑ (Εκεί είναι η πόρτα) ---
  curX = 5;
  let lastX = 5;
  while (curX < MAP_COLS - 4) {
    let w = Math.floor(Math.random() * 2) + 3; // πλάτος 3-4 blocks
    let hJump = Math.floor(Math.random() * 2);
    for (let i = 0; i < w; i++) {
      if (curX + i < MAP_COLS - 2) {
        map[floor3 + hJump][curX + i] = 1;

        // ΕΔΩ ΜΠΑΙΝΕΙ Ο ΕΧΘΡΟΣ (Μακριά από την πόρτα):
        if (curX + i < lastX - 2 && Math.random() < 0.15) {
          enemies.push({ x: curX + i, y: floor3 + hJump - 1 });
        }
      }
    }
    lastX = curX + Math.floor(w / 2);
    curX += w + Math.floor(Math.random() * 2) + 1;
  }

  // 4. Αυτόματη δημιουργία νομισμάτων
  let coins = [];
  for (let r = 2; r < MAP_ROWS - 1; r++) {
    for (let c = 2; c < MAP_COLS - 2; c++) {
      if (map[r][c] === 1 && Math.random() < 0.12) {
        if (map[r - 1][c] === 0) {
          coins.push({ x: c + 0.5, y: r - 1.2 });
        }
      }
    }
  }

  // 5. Η πόρτα στο τέλος του 3ου ορόφου
  let doorX = lastX;
  let doorY = floor3 - 1.6;
  if (map[floor3 + 1][Math.floor(lastX)] === 1) doorY += 1;

  // 6. Γεννήτρια Γρίφων
  let num1 = Math.floor(Math.random() * (levelNumber * 2)) + 3;
  let num2 = Math.floor(Math.random() * (levelNumber * 2)) + 2;
  let correctAns = num1 * num2;
  let wrongAns = correctAns + (Math.random() > 0.5 ? 4 : -4);
  if (wrongAns === correctAns) wrongAns += 3;
  let isCorrectA = Math.random() > 0.5;

  let puzzle = {
    title: `ΛΑΒΥΡΙΝΘΟΣ ΖΙΚ-ΖΑΚ (LEVEL ${levelNumber})`,
    line1: `Φτάσατε στην κορυφή του ορόφου!`,
    line2: `Λύστε το: ${num1} x ${num2} = ?`,
    optA: isCorrectA ? String(correctAns) : String(wrongAns),
    optB: isCorrectA ? String(wrongAns) : String(correctAns),
    correct: isCorrectA ? "A" : "B",
  };

  return {
    map: map,
    playerStart: { x: 2.5, y: MAP_ROWS - 3.5 },
    door: { x: doorX, y: doorY },
    coins: coins,
    puzzle: puzzle,
    enemies: enemies,
  };
}
