export /* ================= INPUT ================= */
class Input {
  constructor() {
    this.keys = {};
    this.touchX = 0;
    this.touchJump = false;
    window.addEventListener(
      "keydown",
      (e) => (this.keys[e.key.toLowerCase()] = true),
    );
    window.addEventListener(
      "keyup",
      (e) => (this.keys[e.key.toLowerCase()] = false),
    );
    this.initTouchControls();
  }
  initTouchControls() {
    const touchContainer = document.getElementById("touch-controls");
    const joystick = document.getElementById("joystick");
    const knob = document.getElementById("knob");
    const jumpBtn = document.getElementById("jump-btn");
    if (!("ontouchstart" in window || navigator.maxTouchPoints > 0)) return;
    touchContainer.style.display = "block";
    let joystickRect,
      maxDrag = 40;
    let joystickTouchId = null,
      jumpTouchId = null;
    const handleMove = (touch) => {
      let dx = touch.clientX - (joystickRect.left + joystickRect.width / 2);
      let dy = touch.clientY - (joystickRect.top + joystickRect.height / 2);
      const d = Math.hypot(dx, dy);
      if (d > maxDrag) {
        dx = (dx / d) * maxDrag;
        dy = (dy / d) * maxDrag;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const rx = dx / maxDrag;
      this.touchX = rx > 0.3 ? 1 : rx < -0.3 ? -1 : 0;
    };
    joystick.addEventListener(
      "touchstart",
      (e) => {
        if (joystickTouchId !== null) return;
        const t = e.changedTouches[0];
        joystickTouchId = t.identifier;
        joystickRect = joystick.getBoundingClientRect();
        handleMove(t);
      },
      { passive: true },
    );
    joystick.addEventListener(
      "touchmove",
      (e) => {
        for (const t of e.changedTouches) {
          if (t.identifier === joystickTouchId) {
            handleMove(t);
            break;
          }
        }
      },
      { passive: true },
    );
    const endJoy = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joystickTouchId) {
          joystickTouchId = null;
          this.touchX = 0;
          knob.style.transform = "translate(0px,0px)";
        }
      }
    };
    joystick.addEventListener("touchend", endJoy, { passive: true });
    joystick.addEventListener("touchcancel", endJoy, { passive: true });
    jumpBtn.addEventListener(
      "touchstart",
      (e) => {
        if (jumpTouchId !== null) return;
        jumpTouchId = e.changedTouches[0].identifier;
        this.touchJump = true;
      },
      { passive: true },
    );
    const endJump = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === jumpTouchId) {
          jumpTouchId = null;
          this.touchJump = false;
        }
      }
    };
    jumpBtn.addEventListener("touchend", endJump, { passive: true });
    jumpBtn.addEventListener("touchcancel", endJump, { passive: true });
  }
  dir() {
    const right =
      this.keys["d"] || this.keys["arrowright"] || this.touchX === 1 ? 1 : 0;
    const left =
      this.keys["a"] || this.keys["arrowleft"] || this.touchX === -1 ? 1 : 0;
    const jump =
      this.keys["w"] || this.keys["arrowup"] || this.keys[" "] || this.touchJump
        ? 1
        : 0;
    return { x: right - left, jump: jump };
  }
}
