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

// --- FONCTIONS DE SECOURS APPELÉES PAR TON CODE HTML ---
GameBoyAdvanceKeypad.prototype.keydown = function (key) {
    if (key !== undefined && key !== null) {
        this.currentDown &= ~(1 << key);
    }
};

GameBoyAdvanceKeypad.prototype.keyup = function (key) {
    if (key !== undefined && key !== null) {
        this.currentDown |= (1 << key);
    }
};

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

    if (e.type === "keydown") {
        this.keydown(toggle);
    } else {
        this.keyup(toggle);
    }

    if (this.eatInput) e.preventDefault();
};

// --- GESTION SOURIS (A = clic gauche, B = clic droit) ---
GameBoyAdvanceKeypad.prototype.mouseHandler = function (e) {
    if (e.type === "mousedown") {
        if (e.button === 0) this.keydown(this.A);
        else if (e.button === 2) this.keydown(this.B);
    } else if (e.type === "mouseup") {
        if (e.button === 0) this.keyup(this.A);
        else if (e.button === 2) this.keyup(this.B);
    }
    if (this.eatInput && (e.button === 0 || e.button === 2)) e.preventDefault();
};

// --- ENREGISTREMENT DES ÉVÉNEMENTS ---
GameBoyAdvanceKeypad.prototype.registerHandlers = function () {
    window.addEventListener("keydown", this.keyboardHandler.bind(this), true);
    window.addEventListener("keyup", this.keyboardHandler.bind(this), true);

    window.addEventListener("mousedown", this.mouseHandler.bind(this), true);
    window.addEventListener("mouseup", this.mouseHandler.bind(this), true);
    window.addEventListener("contextmenu", e => e.preventDefault(), true);
};
