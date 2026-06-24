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
        if (e.button === 0) { 
            toggle = 1 << this.A;
            this.currentDown &= ~toggle;
        } else if (e.button === 2) { 
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

// --- CONFIGURATION MANETTE XBOX ---
GameBoyAdvanceKeypad.prototype.gamepadHandler = function (gamepad) {
    let value = 0;

    // --- Sticks Analogiques (Zone morte à 0.5)
    const AXIS_THRESHOLD = 0.5;
    const axisX = gamepad.axes[0]; // Stick Gauche - Horizontal
    const axisY = gamepad.axes[1]; // Stick Gauche - Vertical

    if (axisX < -AXIS_THRESHOLD) value |= 1 << this.LEFT;
    if (axisX > AXIS_THRESHOLD) value |= 1 << this.RIGHT;
    if (axisY < -AXIS_THRESHOLD) value |= 1 << this.UP;
    if (axisY > AXIS_THRESHOLD) value |= 1 << this.DOWN;

    // --- Croix Directionnelle (D-Pad)
    if (gamepad.buttons[12]?.pressed) value |= 1 << this.UP;     // Haut
    if (gamepad.buttons[13]?.pressed) value |= 1 << this.DOWN;   // Bas
    if (gamepad.buttons[14]?.pressed) value |= 1 << this.LEFT;   // Gauche
    if (gamepad.buttons[15]?.pressed) value |= 1 << this.RIGHT;  // Droite

    // --- Boutons d'action Xbox
    if (gamepad.buttons[0]?.pressed) value |= 1 << this.B; // Bouton A (Xbox) -> GBA B
    if (gamepad.buttons[1]?.pressed) value |= 1 << this.A; // Bouton B (Xbox) -> GBA A
    if (gamepad.buttons[2]?.pressed) value |= 1 << this.B; // Bouton X (Xbox) -> GBA B (Doublon confort)
    
    // --- Gâchettes (L et R)
    if (gamepad.buttons[4]?.pressed) value |= 1 << this.L; // LB (Xbox) -> GBA L
    if (gamepad.buttons[5]?.pressed) value |= 1 << this.R; // RB (Xbox) -> GBA R

    // --- Menus (Start et Select)
    if (gamepad.buttons[9]?.pressed) value |= 1 << this.START;  // Bouton Menu/Start (Xbox)
    if (gamepad.buttons[8]?.pressed) value |= 1 << this.SELECT; // Bouton Affichage/Back (Xbox)

    // --- Synchronisation directe avec le cœur de l'émulateur
    this.currentDown = ~value & 0x3FF;
};

// --- GESTION CONNEXION / DÉCONNEXION ---
GameBoyAdvanceKeypad.prototype.gamepadConnectHandler = function (gamepad) {
    console.log("🎮 Manette Xbox connectée :", gamepad.id);
    this.gamepads.push(gamepad);
};

GameBoyAdvanceKeypad.prototype.gamepadDisconnectHandler = function (gamepad) {
    console.log("❌ Manette Xbox déconnectée :", gamepad.id);
    this.gamepads = this.gamepads.filter(g => g !== gamepad);
};

// --- POLLING DE LA MANETTE ---
GameBoyAdvanceKeypad.prototype.pollGamepads = function () {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
        if (pad) {
            this.gamepadHandler(pad);
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

    // Lancement de la boucle invisible en arrière-plan
    const self = this;
    function loop() {
        self.pollGamepads();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
};
