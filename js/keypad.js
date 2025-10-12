function GameBoyAdvanceKeypad() {
    this.KEYCODE_LEFT = 37;
    this.KEYCODE_UP = 38;
    this.KEYCODE_RIGHT = 39;
    this.KEYCODE_DOWN = 40;
    this.KEYCODE_START = 13;
    this.KEYCODE_SELECT = 220;
    this.KEYCODE_A = 90;
    this.KEYCODE_B = 88;
    this.KEYCODE_L = 65;
    this.KEYCODE_R = 83;

    this.A = 0;
    this.B = 1;
    this.SELECT = 2;
    this.START = 3;
    this.RIGHT = 4;
    this.LEFT = 5;
    this.UP = 6;
    this.DOWN = 7;
    this.R = 8;
    this.L = 9;

    this.currentDown = 0x03FF;
    this.eatInput = false;
    this.gamepads = [];
}

// --- GESTION CLAVIER ---
GameBoyAdvanceKeypad.prototype.keyboardHandler = function (e) {
    var toggle = 0;
    switch (e.keyCode) {
        case this.KEYCODE_START: toggle = this.START; break;
        case this.KEYCODE_SELECT: toggle = this.SELECT; break;
        case this.KEYCODE_A: toggle = this.A; break;
        case this.KEYCODE_B: toggle = this.B; break;
        case this.KEYCODE_L: toggle = this.L; break;
        case this.KEYCODE_R: toggle = this.R; break;
        case this.KEYCODE_UP: toggle = this.UP; break;
        case this.KEYCODE_RIGHT: toggle = this.RIGHT; break;
        case this.KEYCODE_DOWN: toggle = this.DOWN; break;
        case this.KEYCODE_LEFT: toggle = this.LEFT; break;
        default: return;
    }

    toggle = 1 << toggle;
    if (e.type === "keydown") {
        this.currentDown &= ~toggle;
    } else {
        this.currentDown |= toggle;
    }

    if (this.eatInput) e.preventDefault();
};

// --- GESTION SOURIS (A = clic gauche, B = clic droit) ---
GameBoyAdvanceKeypad.prototype.mouseHandler = function (e) {
    let toggle = null;

    if (e.type === "mousedown") {
        if (e.button === 0) { // clic gauche
            toggle = 1 << this.A;
            this.currentDown &= ~toggle;
        } else if (e.button === 2) { // clic droit
            toggle = 1 << this.B;
            this.currentDown &= ~toggle;
        }
    } else if (e.type === "mouseup") {
        if (e.button === 0) {
            toggle = 1 << this.A;
            this.currentDown |= toggle;
        } else if (e.button === 2) {
            toggle = 1 << this.B;
            this.currentDown |= toggle;
        }
    }

    if (this.eatInput && toggle !== null) e.preventDefault();
};

// --- GESTION MANETTE XBOX ---
GameBoyAdvanceKeypad.prototype.gamepadHandler = function (gamepad) {
    let value = 0;

    // --- Stick gauche (axes analogiques)
    const AXIS_THRESHOLD = 0.5;
    const axisX = gamepad.axes[0];
    const axisY = gamepad.axes[1];

    if (axisX < -AXIS_THRESHOLD) value |= 1 << this.LEFT;
    if (axisX > AXIS_THRESHOLD) value |= 1 << this.RIGHT;
    if (axisY < -AXIS_THRESHOLD) value |= 1 << this.UP;
    if (axisY > AXIS_THRESHOLD) value |= 1 << this.DOWN;

    // --- Croix directionnelle (D-Pad)
    if (gamepad.buttons[14]?.pressed) value |= 1 << this.LEFT;
    if (gamepad.buttons[15]?.pressed) value |= 1 << this.RIGHT;
    if (gamepad.buttons[12]?.pressed) value |= 1 << this.UP;
    if (gamepad.buttons[13]?.pressed) value |= 1 << this.DOWN;

    // --- Boutons principaux Xbox
    if (gamepad.buttons[0]?.pressed) value |= 1 << this.B; // A (Xbox) → B (GBA)
    if (gamepad.buttons[1]?.pressed) value |= 1 << this.A; // B (Xbox) → A (GBA)
    if (gamepad.buttons[4]?.pressed) value |= 1 << this.L; // LB
    if (gamepad.buttons[5]?.pressed) value |= 1 << this.R; // RB

    // --- Start / Select
    if (gamepad.buttons[9]?.pressed) value |= 1 << this.START;  // Start
    if (gamepad.buttons[8]?.pressed) value |= 1 << this.SELECT; // Back

    // --- Appliquer l'état
    this.currentDown = ~value & 0x3FF;
};

// --- GESTION CONNEXION / DÉCONNEXION ---
GameBoyAdvanceKeypad.prototype.gamepadConnectHandler = function (gamepad) {
    console.log("🎮 Manette connectée :", gamepad.id);
    this.gamepads.push(gamepad);
};

GameBoyAdvanceKeypad.prototype.gamepadDisconnectHandler = function (gamepad) {
    console.log("❌ Manette déconnectée :", gamepad.id);
    this.gamepads = this.gamepads.filter(g => g !== gamepad);
};

// --- POLLING MANETTE ---
GameBoyAdvanceKeypad.prototype.pollGamepads = function () {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
        if (pad) {
            this.gamepadHandler(pad);
            // Debug (tu peux activer pour voir les boutons)
            // console.log(pad.buttons.map(b => b.pressed), pad.axes);
            break;
        }
    }
};

// --- ENREGISTREMENT DES ÉVÉNEMENTS ---
GameBoyAdvanceKeypad.prototype.registerHandlers = function () {
    window.addEventListener("keydown", this.keyboardHandler.bind(this), true);
    window.addEventListener("keyup", this.keyboardHandler.bind(this), true);

    window.addEventListener("mousedown", this.mouseHandler.bind(this), true);
    window.addEventListener("mouseup", this.mouseHandler.bind(this), true);
    window.addEventListener("contextmenu", e => e.preventDefault(), true);

    window.addEventListener("gamepadconnected", e => this.gamepadConnectHandler(e.gamepad));
    window.addEventListener("gamepaddisconnected", e => this.gamepadDisconnectHandler(e.gamepad));
};