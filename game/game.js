/* game.js (DOM-based Engine) */

const GameState = {
    resources: { biomass: 50, genetic: 0 },
    enemyResources: { biomass: 50, genetic: 0 },
    units: [],     // All creatures
    food: [],      // Biomass & genetic drops
    resourcesNodes: [], // Static gatherable resources
    fx: [],        // Visual effects (lasers, text)
    selectedUnits: [],
    unlocks: { t1: true, t2: false, t3: false, t4: false, t5: false, t6: false, t7: false, t8: false },
    era: 1,
    enemyEra: 1,
    isPlaying: true,
    mapSize: 3000,
    globalTier: 1,
    upgrades: { spines: false, fins: false, swimbladder: false, jaw: false, lungs: false, legs: false, scales: false, muscles: false, apex: false }
};

const TIER_STATS = {
    // Player: Vertebrates
    1: { hp: 40, atk: 5, speed: 2.8, radius: 30, name: 'ピカイア型 [Tier 1]', costBio: 10, costGen: 0 },
    2: { hp: 120, atk: 12, speed: 2.2, radius: 40, name: '甲冑魚型 [Tier 2]', costBio: 25, costGen: 0 },
    '2b': { hp: 70, atk: 25, speed: 4.2, radius: 35, name: '無顎類 [Tier 2]', costBio: 0, costGen: 0 },
    3: { hp: 280, atk: 30, speed: 2.6, radius: 50, name: '硬骨魚型 [Tier 3]', costBio: 60, costGen: 0 },
    '3b': { hp: 180, atk: 65, speed: 3.4, radius: 45, name: '軟骨魚類 [Tier 3]', costBio: 0, costGen: 0 },
    4: { hp: 650, atk: 75, speed: 2.0, radius: 65, name: '肉鰭類(ハイギョ) [頂点]', costBio: 150, costGen: 0 },
    5: { hp: 1500, atk: 150, speed: 2.5, radius: 80, name: '両生類 [陸上・基本]', costBio: 10, costGen: 0 },
    6: { hp: 3500, atk: 250, speed: 2.0, radius: 100, name: '【強靭】四足獣 [T6]', costBio: 25, costGen: 0 },
    '6b': { hp: 2000, atk: 400, speed: 4.0, radius: 85, name: '【俊敏】小型恐竜 [T6]', costBio: 0, costGen: 0 },
    7: { hp: 6000, atk: 400, speed: 1.8, radius: 120, name: '【重装】鎧竜 [T7]', costBio: 60, costGen: 0 },
    '7b': { hp: 4000, atk: 800, speed: 3.5, radius: 100, name: '【獰猛】中型獣脚類 [T7]', costBio: 0, costGen: 0 },
    8: { hp: 12000, atk: 1500, speed: 2.5, radius: 150, name: 'ティラノサウルス型 [覇者]', costBio: 150, costGen: 0 },

    // Enemy: Invertebrates
    'e1': { hp: 40, atk: 5, speed: 2.8, radius: 30, name: '扁形動物 [Tier 1]', costBio: 10, costGen: 0 },
    'e2': { hp: 120, atk: 12, speed: 2.2, radius: 40, name: '三葉虫型 [Tier 2]', costBio: 25, costGen: 0 },
    'e3': { hp: 280, atk: 30, speed: 2.6, radius: 50, name: 'ウミサソリ型 [Tier 3]', costBio: 60, costGen: 0 },
    'e4': { hp: 650, atk: 75, speed: 2.0, radius: 65, name: 'アノマロカリス型 [頂点]', costBio: 150, costGen: 0 },
    'e5': { hp: 1500, atk: 150, speed: 2.5, radius: 80, name: '巨大クモ型 [陸上・基本]', costBio: 10, costGen: 0 },
    'e6': { hp: 3500, atk: 250, speed: 2.0, radius: 100, name: 'オオムカデ型 [T6]', costBio: 25, costGen: 0 },
    'e7': { hp: 6000, atk: 400, speed: 1.8, radius: 120, name: '巨大甲虫型 [T7]', costBio: 60, costGen: 0 },
    'e8': { hp: 12000, atk: 1500, speed: 2.5, radius: 150, name: 'アースロプレウラ型 [覇者]', costBio: 150, costGen: 0 }
};

// --- Assets Loader ---
const ASSETS = {};
const ASSET_PATHS = {
    'bg_main': 'assets/game_bg_1772760797898.png',
    'bg_devonian': 'assets/bg_devonian_1772761234260.png',
    'res_bio': 'assets/res_bio_iso.png',
    'res_gen': 'assets/res_gen_iso.png',
    'unit_t1': 'assets/unit_t1_iso.png',
    'unit_t2': 'assets/unit_jawless.png',
    'unit_t2b': 'assets/unit_agnatha.png',
    'unit_t3': 'assets/unit_bonyfish.png',
    'unit_t3b': 'assets/unit_cartilaginous.png',
    'unit_t4': 'assets/unit_lobefin.png',
    'unit_t5': 'assets/unit_amphibian_1772761218553.png',
    'unit_t7': 'assets/unit_ankylosaurus.png',
    'unit_t7b': 'assets/unit_theropod.png',
    'unit_t8': 'assets/unit_trex.png',
    'unit_e1': 'assets/unit_e1_iso.png',
    'unit_e2': 'assets/unit_trilobite.png',
    'unit_e3': 'assets/unit_eurypterid.png',
    'unit_e4': 'assets/unit_anomalocaris.png',
    'unit_e5': 'assets/unit_spider.png',
    'unit_e6': 'assets/unit_centipede.png',
    'unit_e7': 'assets/unit_beetle.png',
    'unit_e8': 'assets/unit_arthropleura.png'
};

Object.keys(ASSET_PATHS).forEach(k => {
    let img = new Image();
    img.src = ASSET_PATHS[k];
    ASSETS[k] = img;
});

// --- Canvas Elements ---
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const fowCanvas = document.createElement('canvas');
const ctxFow = fowCanvas.getContext('2d', { alpha: true });
const FOW_RES = 4;
fowCanvas.width = GameState.mapSize / FOW_RES;
fowCanvas.height = GameState.mapSize / FOW_RES;

function updateFow() {
    // 1. Fill canvas with semi-transparent mask
    ctxFow.clearRect(0, 0, fowCanvas.width, fowCanvas.height);
    ctxFow.globalCompositeOperation = 'source-over';
    ctxFow.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctxFow.fillRect(0, 0, fowCanvas.width, fowCanvas.height);

    // 2. Clear vision holes for players
    ctxFow.globalCompositeOperation = 'destination-out';
    const players = GameState.units.filter(u => u.isPlayer);
    for (const u of players) {
        if (u.destroyed) continue;
        const x = u.x / FOW_RES;
        const y = u.y / FOW_RES;
        let r = 350 / FOW_RES; // Base vision range
        if (u.tier >= 4) r = 500 / FOW_RES;

        const grad = ctxFow.createRadialGradient(x, y, r * 0.2, x, y, r);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctxFow.fillStyle = grad;
        ctxFow.beginPath();
        ctxFow.arc(x, y, r, 0, Math.PI * 2);
        ctxFow.fill();
    }

    // 3. Enemy Visibility check
    const enemies = GameState.units.filter(u => !u.isPlayer);
    for (const e of enemies) {
        if (e.destroyed) continue;
        let isVisible = false;
        let myVisionBase = 350;

        for (const p of players) {
            if (p.destroyed) continue;
            const dx = p.x - e.x;
            const dy = p.y - e.y;
            const distSq = dx * dx + dy * dy;
            const vision = (p.tier >= 4) ? 500 : myVisionBase;

            if (distSq < vision * vision) {
                isVisible = true;
                break;
            }
        }

        if (isVisible) {
            e.visible = true;
        } else {
            e.visible = false;
        }
    }
}

// --- Camera / Panning / Selection / Move Logic ---
const CAMERA_ZOOM = 0.5; // Zoom out 50% for a much wider view
let camX = 500;
let camY = 2500;
let isSelecting = false;
let startSelect = { x: 0, y: 0 };
let currentSelect = { x: 0, y: 0 };

const keys = { w: false, a: false, s: false, d: false };

window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'w': keys.w = true; break;
        case 'a': keys.a = true; break;
        case 's': keys.s = true; break;
        case 'd': keys.d = true; break;
        case 'b':
            buildTower();
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
        case 'w': keys.w = false; break;
        case 'a': keys.a = false; break;
        case 's': keys.s = false; break;
        case 'd': keys.d = false; break;
    }
});


function screenToWorld(clientX, clientY) {
    let dx = clientX - window.innerWidth / 2;
    let dy = clientY - window.innerHeight / 2;

    dx /= CAMERA_ZOOM;
    dy /= CAMERA_ZOOM;

    const angleX = 60 * Math.PI / 180;
    dy /= Math.cos(angleX);

    const angleZ = 45 * Math.PI / 180;
    let mx = dx * Math.cos(angleZ) + dy * Math.sin(angleZ);
    let my = -dx * Math.sin(angleZ) + dy * Math.cos(angleZ);

    return {
        x: mx + camX,
        y: my + camY
    };
}

function updateCamera() {
    // Camera is purely numerical now, updated in gameLoop.
}

function clampCamera() {
    const margin = window.innerWidth / CAMERA_ZOOM;
    camX = Math.max(-margin, Math.min(GameState.mapSize + margin, camX));
    camY = Math.max(-margin, Math.min(GameState.mapSize + margin, camY));
    updateCamera();
}
clampCamera();

window.addEventListener('mousedown', (e) => {
    if (!GameState.isPlaying) return;
    const isUI = e.target.closest('#ui-layer');
    if (isUI) return;

    if (e.button === 0) {
        isSelecting = true;
        startSelect = screenToWorld(e.clientX, e.clientY);
        currentSelect = { ...startSelect };
        // Store raw client coords for click vs drag threshold
        startSelect.clientX = e.clientX;
        startSelect.clientY = e.clientY;
    } else if (e.button === 2) {
        if (GameState.selectedUnits.length > 0) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            const worldX = worldPos.x;
            const worldY = worldPos.y;

            let targetEnemy = null;
            for (let u of GameState.units) {
                if (!u.isPlayer && !u.destroyed) {
                    const dx = u.x - worldX, dy = u.y - worldY;
                    if (Math.sqrt(dx * dx + dy * dy) < u.radius + 40) {
                        targetEnemy = u; break;
                    }
                }
            }

            if (targetEnemy) {
                GameState.selectedUnits.forEach(u => {
                    u.target = null;
                    u.combatTarget = targetEnemy;
                });
                createMarker(targetEnemy.x, targetEnemy.y, 'rgba(255,0,0,0.8)');
            } else {
                issueMoveCommand(worldX, worldY);
            }
        }
    }
});

window.addEventListener('mousemove', (e) => {
    if (isSelecting) {
        currentSelect = screenToWorld(e.clientX, e.clientY);
    }
});

window.addEventListener('mouseup', (e) => {
    if (isSelecting && e.button === 0) {
        isSelecting = false;

        const minX = Math.min(startSelect.x, currentSelect.x);
        const maxX = Math.max(startSelect.x, currentSelect.x);
        const minY = Math.min(startSelect.y, currentSelect.y);
        const maxY = Math.max(startSelect.y, currentSelect.y);

        let selectedList = [];

        // Distinguish between a Click and a Drag by raw screen movement
        if (Math.abs(e.clientX - startSelect.clientX) < 15 && Math.abs(e.clientY - startSelect.clientY) < 15) {
            // SINGLE CLICK: Test against mapped screen coordinates so clicking the 'body' works
            let closestDist = Infinity;
            let closestU = null;
            GameState.units.forEach(u => {
                if (u.isPlayer && !u.destroyed && u.screenX && u.screenY) {
                    // Center of visual drawing is roughly slightly above the feet
                    let cx = u.screenX;
                    let cy = u.screenY - u.radius * 0.5 * CAMERA_ZOOM;
                    const distSq = Math.pow(cx - e.clientX, 2) + Math.pow(cy - e.clientY, 2);

                    // Allow easy click radius
                    let hitRadius = (u.radius + 20) * CAMERA_ZOOM;
                    if (distSq < hitRadius * hitRadius && distSq < closestDist) {
                        closestDist = distSq;
                        closestU = u;
                    }
                }
            });
            if (closestU) selectedList = [closestU];
        } else {
            // DRAG BOX: Test against world floor coordinates (standard RTS bounding box)
            selectedList = GameState.units.filter(u =>
                u.isPlayer && !u.destroyed &&
                (u.x + u.radius) >= minX && (u.x - u.radius) <= maxX &&
                (u.y + u.radius) >= minY && (u.y - u.radius) <= maxY
            );
        }

        if (e.shiftKey) {
            selectUnits(Array.from(new Set([...GameState.selectedUnits, ...selectedList])));
        } else {
            selectUnits(selectedList);
        }
    }
});

function issueMoveCommand(worldX, worldY) {
    const count = GameState.selectedUnits.length;
    let cols = Math.ceil(Math.sqrt(count));

    GameState.selectedUnits.forEach((u, index) => {
        let offsetX = 0; let offsetY = 0;
        if (count > 1) {
            const row = Math.floor(index / cols);
            const col = index % cols;
            offsetX = (col - (cols - 1) / 2) * 50;
            offsetY = (row - (Math.ceil(count / cols) - 1) / 2) * 50;
        }
        u.setTarget(worldX + offsetX, worldY + offsetY);
        u.combatTarget = null;
    });

    createMarker(worldX, worldY, 'var(--color-primary)');
}

function createMarker(x, y, color) {
    GameState.fx.push({ type: 'marker', x, y, color, life: 30, maxLife: 30 });
}

// Avoid context menu on right click
document.addEventListener('contextmenu', e => e.preventDefault());


// --- Entity Classes ---
class Entity {
    constructor(x, y, className) {
        this.x = x;
        this.y = y;
        this.assetId = className; // Re-using className concept to map to styling
        this.destroyed = false;
        this.visible = true; // Visibility controlled by FOW
    }
    update() {
    }
    draw(ctx) {
    }
    destroy() {
        this.destroyed = true;
    }
}

class Food extends Entity {
    constructor(x, y, isGenetic) {
        super(x, y, `food ${isGenetic ? 'genetic' : ''}`);
        this.isGenetic = isGenetic;
    }
}

class ResourceNode extends Entity {
    constructor(x, y, type, amount = 500, scale = 1) { // 'bio' or 'gen'
        super(x, y, type === 'bio' ? 'res-vent' : 'res-crystal');
        this.type = type;
        this.amount = amount;
        this.radius = (type === 'bio' ? 60 : 45) * scale;
        this.scale = scale;
    }
    update() {
        if (this.amount <= 0 && !this.destroyed) this.destroy();
    }
}

class Unit extends Entity {
    constructor(x, y, isPlayer, tier = 1) {
        let className = `unit-${isPlayer ? 't' + tier : tier}`;

        super(x, y, `unit ${className} ${isPlayer ? '' : 'is-enemy'}`);
        this.isPlayer = isPlayer;
        this.tier = tier;

        const stats = TIER_STATS[this.tier];
        // Lower enemy param modifier
        const paramMod = isPlayer ? 1 : 0.6;

        this.maxHp = stats.hp * paramMod;
        this.hp = this.maxHp;
        this.atk = stats.atk * paramMod;
        this.speed = stats.speed * paramMod;
        this.radius = 40; // Standardized to fit 80x80 icons

        this.target = null;
        this.combatTarget = null;

        // Enemy resource tracking
        if (!isPlayer) {
            this.enemyBio = 0;
            this.enemyGen = 0;
        }
    }

    setTarget(x, y) {
        this.target = { x, y };
        this.combatTarget = null; // moving cancels current combat focus until close again
    }

    takeDamage(amount) {
        if (this.destroyed) return;

        let actualDmg = amount;
        if (this.tier === 2 || this.tier >= 4) {
            actualDmg = amount * 0.5; // Tier 2 and T4+ have built-in armor reduction
        }

        this.hp -= actualDmg;

        showFloatingText(this.x, this.y - 20, `-${Math.ceil(actualDmg)}`, '#fff');

        // Add damage flash effect flag for render loop
        this.damageFlash = 10; // Frames to flash

        if (this.hp <= 0) this.die();
    }

    updateHpBar() {
        // Handled in render loop now
    }

    die() {
        if (this.destroyed) return;

        // Drops
        if (!this.isPlayer) {
            if (Math.random() > 0.4) {
                GameState.food.push(new Food(this.x, this.y, true)); // Genetic
            } else {
                for (let i = 0; i < 3; i++) {
                    GameState.food.push(new Food(this.x + (Math.random() - 0.5) * 40, this.y + (Math.random() - 0.5) * 40, false));
                }
            }
        }

        if (this.isPlayer) {
            const idx = GameState.selectedUnits.indexOf(this);
            if (idx > -1) {
                GameState.selectedUnits.splice(idx, 1);
                selectUnits([...GameState.selectedUnits]);
            }
        }
        if (!this.isPlayer) showFloatingText(this.x, this.y, "Defeated", "#adff2f");

        this.destroy();
    }

    update() {
        if (this.destroyed) return;

        const currentSpeed = this.speed;

        if (this.damageFlash > 0) this.damageFlash--;

        // Player overrides Auto Combat when manually moving
        if (this.target && this.isPlayer) {
            this.combatTarget = null; // Clear combat target when moving manually
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                const nx = dx / dist; const ny = dy / dist;
                this.x += nx * currentSpeed;
                this.y += ny * currentSpeed;
            } else {
                this.target = null; // Reached destination
            }
        }
        else {
            // Auto Combat Logic (Proximity)
            if (!this.combatTarget || this.combatTarget.destroyed) {
                let closestDist = 200; // Agro range
                let closestTarget = null;
                const enemies = this.isPlayer ? GameState.units.filter(u => !u.isPlayer) : GameState.units.filter(u => u.isPlayer);

                for (const t of enemies) {
                    const dx = t.x - this.x; const dy = t.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestTarget = t;
                    }
                }
                this.combatTarget = closestTarget;
            }

            if (this.combatTarget && !this.combatTarget.destroyed) {
                const dx = this.combatTarget.x - this.x;
                const dy = this.combatTarget.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const attackRange = 50;
                if (dist < attackRange) {
                    // Attacking
                    if (Math.random() < 0.03) {
                        let dmg = this.atk;
                        this.combatTarget.takeDamage(dmg);

                        // Pushback effect
                        const kbX = dx / dist * 5;
                        const kbY = dy / dist * 5;
                        this.combatTarget.x += kbX;
                        this.combatTarget.y += kbY;

                        createLaser(this.x, this.y, this.combatTarget.x, this.combatTarget.y, this.isPlayer);
                    }
                } else {
                    // Move towards combat target
                    const nx = dx / dist; const ny = dy / dist;
                    this.x += nx * currentSpeed;
                    this.y += ny * currentSpeed;
                }
            } else if (!this.isPlayer) {
                // Enemy proactive mechanics: Hunt player OR gather resources
                let targetLoc = null;
                let targetObj = null;
                let minDistToPlayer = Infinity;
                let minDistToRes = Infinity;

                for (const p of GameState.units) {
                    if (p.isPlayer) {
                        const d = Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2);
                        if (d < minDistToPlayer) { minDistToPlayer = d; targetLoc = p; targetObj = null; }
                    }
                }

                for (const r of GameState.resourcesNodes) {
                    if (!r.destroyed) {
                        const d = Math.pow(r.x - this.x, 2) + Math.pow(r.y - this.y, 2);
                        // Weigh resources as twice as attractive to prioritize gathering loosely
                        if (d * 0.5 < minDistToPlayer && d < minDistToRes) {
                            minDistToRes = d; targetLoc = r; targetObj = r;
                        }
                    }
                }

                if (targetObj) {
                    const dx = targetObj.x - this.x; const dy = targetObj.y - this.y;
                    if (Math.sqrt(dx * dx + dy * dy) < targetObj.radius + this.radius + 15) {
                        if (Math.random() < 0.05) {
                            targetObj.amount--;
                            if (targetObj.type === 'bio') {
                                this.enemyBio++;
                                GameState.enemyResources.biomass++;
                            } else {
                                this.enemyGen++;
                                GameState.enemyResources.genetic++;
                            }
                            createLaser(targetObj.x, targetObj.y, this.x, this.y, false, 'laser-gather-bio');

                            // Enemy Evolution mechanic
                            let targetTier = null;
                            if (this.enemyGen >= 10 && this.tier === 'e1') targetTier = 'e2';
                            else if (this.enemyGen >= 20 && this.enemyBio >= 20 && this.tier === 'e2') targetTier = 'e3';
                            else if (this.enemyGen >= 40 && this.enemyBio >= 50 && this.tier === 'e3') targetTier = 'e4';
                            else if (GameState.enemyEra >= 2 && this.tier === 'e4' && this.enemyBio >= 10) targetTier = 'e5';
                            else if (GameState.enemyEra >= 2 && this.tier === 'e5' && this.enemyGen >= 10) targetTier = 'e6';
                            else if (GameState.enemyEra >= 2 && this.tier === 'e6' && this.enemyGen >= 20 && this.enemyBio >= 20) targetTier = 'e7';
                            else if (GameState.enemyEra >= 2 && this.tier === 'e7' && this.enemyGen >= 40 && this.enemyBio >= 50) targetTier = 'e8';

                            if (targetTier) this.evolveEnemy(targetTier);
                        }
                    } else {
                        const angle = Math.atan2(targetObj.y - this.y, targetObj.x - this.x);
                        this.x += Math.cos(angle) * (this.speed);
                        this.y += Math.sin(angle) * (this.speed);
                    }
                } else if (targetLoc) {
                    const angle = Math.atan2(targetLoc.y - this.y, targetLoc.x - this.x);
                    this.x += Math.cos(angle) * (this.speed * 0.8); // Slower when hunting
                    this.y += Math.sin(angle) * (this.speed * 0.8);
                }
            }
        }

        // Bounds limit
        this.x = Math.max(30, Math.min(GameState.mapSize - 30, this.x));
        this.y = Math.max(30, Math.min(GameState.mapSize - 30, this.y));

        // Player auto-collect and gather
        if (this.isPlayer) {
            // Collect drop food
            for (let i = GameState.food.length - 1; i >= 0; i--) {
                const f = GameState.food[i];
                const dx = f.x - this.x; const dy = f.y - this.y;
                if (Math.sqrt(dx * dx + dy * dy) < 40) {
                    if (f.isGenetic) {
                        GameState.resources.genetic += 5;
                        showFloatingText(f.x, f.y, "+5 Gen", 'var(--color-accent)');
                    } else {
                        GameState.resources.biomass += 2;
                        showFloatingText(f.x, f.y, "+2 Bio", 'var(--color-secondary)');
                    }
                    updateUI();
                    f.destroy();
                    GameState.food.splice(i, 1);
                }
            }
            // Gather from static resource nodes if idle
            if (!this.combatTarget && !this.target) {
                for (const r of GameState.resourcesNodes) {
                    if (!r.destroyed) {
                        const dx = r.x - this.x; const dy = r.y - this.y;
                        if (Math.sqrt(dx * dx + dy * dy) < r.radius + this.radius + 15) {
                            // Close enough to gather
                            if (Math.random() < 0.05) { // Slow gather rate
                                if (r.type === 'bio') {
                                    GameState.resources.biomass += 1;
                                    // Make text offset to not clutter center
                                    const offset = (Math.random() - 0.5) * 30;
                                    showFloatingText(r.x + offset, r.y - 40, "✨+1", '#00ffd5');
                                    createLaser(r.x, r.y, this.x, this.y, true, 'laser-gather-bio');
                                } else {
                                    GameState.resources.genetic += 1;
                                    const offset = (Math.random() - 0.5) * 30;
                                    showFloatingText(r.x + offset, r.y - 40, "🧬+1", '#ff007f');
                                    createLaser(r.x, r.y, this.x, this.y, true, 'laser-gather-gen');
                                }
                                r.amount--;
                                updateUI();
                            }
                        }
                    }
                }
            }
        }
    }

    evolveEnemy(newTier) {
        this.tier = newTier;
        this.assetId = `unit ${newTier} is-enemy`;
        this.enemyBio = 0;
        this.enemyGen = 0;
        const stats = TIER_STATS[newTier];
        this.maxHp = stats.hp * 0.6;
        this.hp = this.maxHp;
        this.atk = stats.atk * 0.6;
        this.speed = stats.speed * 0.6;
        this.radius = stats.radius;
    }
}

// --- Visual FX ---
function createLaser(x1, y1, x2, y2, isPlayer, customClass = '') {
    GameState.fx.push({
        type: 'laser',
        x1, y1, x2, y2, isPlayer,
        color: customClass === 'laser-gather-bio' ? 'rgba(0, 255, 213, 0.6)' :
            customClass === 'laser-gather-gen' ? 'rgba(255, 0, 127, 0.6)' :
                isPlayer ? '#00ffd5' : '#ff0000',
        life: 15, maxLife: 15
    });
}

function showFloatingText(x, y, text, color) {
    GameState.fx.push({
        type: 'text', text, x, y, color, life: 60, maxLife: 60
    });
}

function showNotification(msg) {
    const n = document.createElement('div');
    n.className = 'notif';
    n.textContent = msg;
    document.getElementById('notification-area').appendChild(n);
    setTimeout(() => n.remove(), 3000);
}

// Remove apex mutation logic as it is now integrated into tier evolution

// --- UI Logic ---
function selectUnits(units) {
    GameState.selectedUnits = units;

    if (units.length === 1) {
        const unit = units[0];
        let typeName = TIER_STATS[unit.tier] ? TIER_STATS[unit.tier].name : '防衛塔';

        document.getElementById('selection-info').innerHTML = `
            <h3>${typeName}</h3>
            <p class="stats">HP: ${Math.ceil(unit.hp)}/${unit.maxHp} | ATK: ${Math.ceil(unit.atk)}</p>
        `;
    } else if (units.length > 1) {
        document.getElementById('selection-info').innerHTML = `
            <h3>複数選択: ${units.length} ユニット</h3>
            <p class="stats">右クリック(ドラッグ)で移動/攻撃</p>
        `;
    } else {
        document.getElementById('selection-info').innerHTML = `
            <h3>選択中: なし</h3>
            <p class="stats">ユニットをクリック/ドラッグで選択</p>
        `;
    }
    updateUI();
}

function updateUI() {
    document.getElementById('res-biomass').textContent = GameState.resources.biomass;
    document.getElementById('res-genetic').textContent = GameState.resources.genetic;

    // Production Unlocks & Costs
    // Production Unlocks & Costs
    const currentTier = GameState.globalTier;
    const stats = TIER_STATS[currentTier];
    const spawnBtn = document.getElementById('btn-spawn-current');
    if (spawnBtn) {
        document.getElementById('spawn-cost').textContent = `${stats.costBio} Bio`;
        let displayName = stats.name.split(' ')[0]; // Use short name
        if (currentTier === 5) displayName = '両生類';
        document.getElementById('spawn-name').textContent = `【生産】${displayName}`;
        spawnBtn.disabled = GameState.resources.biomass < stats.costBio;
    }

    // Evolution Costs
    // Check missing upgrades for evolutions
    document.getElementById('btn-evolve-t2').disabled = !GameState.upgrades.spines || GameState.resources.genetic < 10 || GameState.unlocks.t2;
    document.getElementById('btn-evolve-t2b').disabled = !GameState.upgrades.fins || GameState.resources.genetic < 10 || GameState.unlocks.t2b;
    document.getElementById('btn-evolve-t3').disabled = !GameState.upgrades.swimbladder || (GameState.resources.genetic < 20 || GameState.resources.biomass < 20) || GameState.unlocks.t3;
    document.getElementById('btn-evolve-t3b').disabled = !GameState.upgrades.jaw || (GameState.resources.genetic < 20 || GameState.resources.biomass < 20) || GameState.unlocks.t3b;
    document.getElementById('btn-evolve-t4').disabled = !GameState.upgrades.lungs || (GameState.resources.genetic < 40 || GameState.resources.biomass < 50) || GameState.unlocks.t4;

    document.getElementById('btn-evolve-t6').disabled = !GameState.upgrades.scales || GameState.resources.genetic < 10 || GameState.unlocks.t6;
    document.getElementById('btn-evolve-t6b').disabled = !GameState.upgrades.muscles || GameState.resources.genetic < 10 || GameState.unlocks.t6b;
    document.getElementById('btn-evolve-t7').disabled = !GameState.upgrades.scales || (GameState.resources.genetic < 20 || GameState.resources.biomass < 20) || GameState.unlocks.t7;
    document.getElementById('btn-evolve-t7b').disabled = !GameState.upgrades.muscles || (GameState.resources.genetic < 20 || GameState.resources.biomass < 20) || GameState.unlocks.t7b;
    document.getElementById('btn-evolve-t8').disabled = !GameState.upgrades.apex || (GameState.resources.genetic < 40 || GameState.resources.biomass < 50) || GameState.unlocks.t8;
    document.getElementById('btn-evolve-era').disabled = !GameState.upgrades.legs || (GameState.resources.biomass < 100 || GameState.resources.genetic < 100) || GameState.era === 2;

    // Update Tech Tree Buttons
    const techKeys = ['spines', 'fins', 'swimbladder', 'jaw', 'lungs', 'legs', 'scales', 'muscles', 'apex'];
    const techCosts = [10, 10, 20, 30, 50, 80, 100, 100, 200];
    for (let i = 0; i < techKeys.length; i++) {
        const btn = document.getElementById(`tech-${techKeys[i]}`);
        if (btn) {
            btn.disabled = GameState.upgrades[techKeys[i]] || GameState.resources.genetic < techCosts[i];
            btn.style.opacity = GameState.upgrades[techKeys[i]] ? '0.3' : '1';
        }
    }
}

// Custom function to handle direct production
function spawnTier(tier) {
    const cost = TIER_STATS[tier].costBio;
    if (GameState.resources.biomass >= cost && GameState.unlocks[`t${tier}`]) {
        GameState.resources.biomass -= cost;
        // Spawn inside the player's bottom-left base area
        const playerBaseX = 500;
        const playerBaseY = GameState.mapSize - 500;
        const cx = playerBaseX + (Math.random() - 0.5) * 400;
        const cy = playerBaseY + (Math.random() - 0.5) * 400;
        GameState.units.push(new Unit(cx, cy, true, tier));
        showNotification(`${TIER_STATS[tier].name} を生産しました`);
        updateUI();
    }
}

document.getElementById('btn-spawn-current').addEventListener('click', () => spawnTier(GameState.globalTier));

// --- Global Evolution logic ---
function evolveGlobalTier(toTier, costGen, costBio) {
    if (GameState.resources.genetic >= costGen && GameState.resources.biomass >= costBio && !GameState.unlocks[`t${toTier}`]) {
        GameState.resources.genetic -= costGen;
        GameState.resources.biomass -= costBio;

        GameState.globalTier = toTier;
        GameState.unlocks[`t${toTier}`] = true;

        // Upgrade all existing player units instantly
        GameState.units.forEach(u => {
            if (u.isPlayer) {
                u.tier = toTier;
                const stats = TIER_STATS[toTier];
                u.maxHp = stats.hp; u.hp = stats.hp; // Restore to full new HP
                u.atk = stats.atk; u.speed = stats.speed; u.radius = stats.radius;
                showFloatingText(u.x, u.y, `★Tier ${toTier}進化★`, "#fff");
            }
        });

        const stats = TIER_STATS[toTier];
        showNotification(`種族全体が【${stats.name}】へ進化しました！`);

        const pUnits = GameState.units.filter(u => u.isPlayer);
        if (pUnits.length > 0) selectUnits([pUnits[0]]);

        updateUI();
    }
}

document.getElementById('btn-evolve-t2').addEventListener('click', () => evolveGlobalTier(2, 10, 0));
document.getElementById('btn-evolve-t2b').addEventListener('click', () => evolveGlobalTier('2b', 10, 0));
document.getElementById('btn-evolve-t3').addEventListener('click', () => evolveGlobalTier(3, 20, 20));
document.getElementById('btn-evolve-t3b').addEventListener('click', () => evolveGlobalTier('3b', 20, 20));
document.getElementById('btn-evolve-t4').addEventListener('click', () => evolveGlobalTier(4, 40, 50));

document.getElementById('btn-evolve-t6').addEventListener('click', () => evolveGlobalTier(6, 10, 0));
document.getElementById('btn-evolve-t6b').addEventListener('click', () => evolveGlobalTier('6b', 10, 0));
document.getElementById('btn-evolve-t7').addEventListener('click', () => evolveGlobalTier(7, 20, 20));
document.getElementById('btn-evolve-t7b').addEventListener('click', () => evolveGlobalTier('7b', 20, 20));
document.getElementById('btn-evolve-t8').addEventListener('click', () => evolveGlobalTier(8, 40, 50));

// --- Tech Tree Window Logic ---
document.getElementById('btn-open-tech-tree').addEventListener('click', () => {
    document.getElementById('tech-tree-panel').classList.add('open');
});
document.getElementById('btn-close-tech-tree').addEventListener('click', () => {
    document.getElementById('tech-tree-panel').classList.remove('open');
});

// Tech upgrades purchase logic
const techData = {
    'spines': { cost: 10, name: '棘' },
    'fins': { cost: 10, name: 'ヒレ' },
    'swimbladder': { cost: 20, name: '浮袋' },
    'jaw': { cost: 30, name: '顎' },
    'lungs': { cost: 50, name: '肺' },
    'legs': { cost: 80, name: '四肢' },
    'scales': { cost: 100, name: '硬鱗' },
    'muscles': { cost: 100, name: '強靭な筋肉' },
    'apex': { cost: 200, name: '覇者の骨格' }
};

for (const [key, data] of Object.entries(techData)) {
    document.getElementById(`tech-${key}`).addEventListener('click', () => {
        if (GameState.resources.genetic >= data.cost && !GameState.upgrades[key]) {
            GameState.resources.genetic -= data.cost;
            GameState.upgrades[key] = true;
            showNotification(`【${data.name}】を獲得！新たな進化が解放されました`);
            updateUI();
        }
    });
}

// --- Era mechanics ---
document.getElementById('btn-evolve-era').addEventListener('click', () => {
    if (GameState.resources.biomass >= 100 && GameState.resources.genetic >= 100 && GameState.era === 1) {
        GameState.resources.biomass -= 100;
        GameState.resources.genetic -= 100;

        // Era Shift trigger
        GameState.era = 2;
        GameState.globalTier = 5;
        GameState.unlocks.t5 = true; // Unlock spawning tier 5

        document.getElementById('current-era').innerHTML = '【古生代】デボン紀の泥濘';
        document.getElementById('current-era').style.color = 'var(--color-secondary)';

        // Transform all player units
        GameState.units.forEach(u => {
            if (u.isPlayer) {
                u.tier = 5;
                const stats = TIER_STATS[5];
                u.maxHp = stats.hp; u.hp = stats.hp;
                u.atk = stats.atk; u.speed = stats.speed; u.radius = stats.radius;
                showFloatingText(u.x, u.y, "★大進化: 陸上適応★", "#adff2f");
            }
        });

        // Show a temporary screen notification but don't end the game
        const endTitle = document.getElementById('end-title');
        endTitle.textContent = "ERA SHIFT: DEVONIAN";
        endTitle.style.color = "var(--color-secondary)";
        document.getElementById('end-desc').textContent = "あなたの系統は両生類へと進化し、ついに陸に上がりました。";
        const endScr = document.getElementById('end-screen');
        document.getElementById('btn-restart').style.display = 'none';
        document.getElementById('btn-back-teaser').style.display = 'none';

        endScr.classList.remove('hidden');
        setTimeout(() => {
            endScr.classList.add('hidden');
            // Restore buttons for actual game over later
            document.getElementById('btn-restart').style.display = 'inline-block';
            document.getElementById('btn-back-teaser').style.display = 'inline-block';
        }, 4000);

        updateUI();
    }
});

document.getElementById('btn-restart').addEventListener('click', () => location.reload());
document.getElementById('btn-back-teaser').addEventListener('click', () => window.location.href = '../index.html');

// --- Main Game Loop ---
let lastTime = 0;
let enemySpawnTimer = 0;
let foodSpawnTimer = 0;

function gameLoop(time) {
    if (!GameState.isPlaying) return;
    requestAnimationFrame(gameLoop);

    const delta = time - lastTime;
    if (delta < 16) return; // Cap at ~60fps
    lastTime = time;

    // Camera WASD Pan Logic
    let dCamX = 0;
    let dCamY = 0;
    const camSpeed = 10;
    if (keys.w) { dCamX -= camSpeed; dCamY -= camSpeed; }
    if (keys.s) { dCamX += camSpeed; dCamY += camSpeed; }
    if (keys.a) { dCamX -= camSpeed; dCamY += camSpeed; }
    if (keys.d) { dCamX += camSpeed; dCamY -= camSpeed; }
    camX += dCamX;
    camY += dCamY;

    clampCamera();

    // Clean up destroyed entities from arrays
    GameState.units = GameState.units.filter(u => !u.destroyed);
    GameState.food = GameState.food.filter(f => !f.destroyed);
    GameState.resourcesNodes = GameState.resourcesNodes.filter(r => !r.destroyed);

    // Update all entities
    GameState.units.forEach(u => u.update());
    GameState.resourcesNodes.forEach(r => r.update());

    GameState.fx = GameState.fx.filter(f => {
        f.life--;
        return f.life > 0;
    });

    // Unveil Map dynamically (Updates FOW texture)
    updateFow();

    // Prepare rendering list
    const angleX = 60 * Math.PI / 180;
    const aZ = 45 * Math.PI / 180;

    function updateScreenPos(ent) {
        const mx = ent.x - camX;
        const my = ent.y - camY;
        // Inverse of the screenToWorld rotation (-45deg inside screenToWorld means +45deg here)
        let dx = mx * Math.cos(aZ) - my * Math.sin(aZ);
        let dy = mx * Math.sin(aZ) + my * Math.cos(aZ);
        dy *= Math.cos(angleX);
        ent.screenX = canvas.width / 2 + dx * CAMERA_ZOOM;
        ent.screenY = canvas.height / 2 + dy * CAMERA_ZOOM;
    }

    const renderables = [...GameState.resourcesNodes, ...GameState.food, ...GameState.units];
    renderables.forEach(updateScreenPos);
    renderables.sort((a, b) => a.screenY - b.screenY);

    // ======== RENDER PASS ========
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(CAMERA_ZOOM, Math.cos(angleX) * CAMERA_ZOOM);
    ctx.rotate(aZ);
    ctx.translate(-camX, -camY);

    // Map BG
    let bgImg = GameState.era >= 2 ? ASSETS.bg_devonian : ASSETS.bg_main;
    if (bgImg && bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, GameState.mapSize, GameState.mapSize);
    } else {
        ctx.fillStyle = '#02050A';
        ctx.fillRect(0, 0, GameState.mapSize, GameState.mapSize);
    }

    // FOW
    ctx.drawImage(fowCanvas, 0, 0, fowCanvas.width, fowCanvas.height, 0, 0, GameState.mapSize, GameState.mapSize);

    // Selection Box
    if (isSelecting) {
        ctx.strokeStyle = 'rgba(0, 255, 213, 0.8)';
        ctx.lineWidth = 2 / CAMERA_ZOOM;
        ctx.fillStyle = 'rgba(0, 255, 213, 0.1)';
        const sw = currentSelect.x - startSelect.x;
        const sh = currentSelect.y - startSelect.y;
        ctx.strokeRect(startSelect.x, startSelect.y, sw, sh);
        ctx.fillRect(startSelect.x, startSelect.y, sw, sh);
    }
    ctx.restore();

    // Draw Entities as Billboards
    renderables.forEach(ent => {
        if (!ent.visible) return;
        ctx.save();
        ctx.translate(ent.screenX, ent.screenY);
        ctx.scale(CAMERA_ZOOM, CAMERA_ZOOM);
        drawEntity(ctx, ent);
        ctx.restore();
    });

    // Draw FX
    GameState.fx.forEach(f => {
        ctx.save();
        if (f.type === 'text') {
            const tempObj = { x: f.x, y: f.y - (f.maxLife - f.life) * 0.5 };
            updateScreenPos(tempObj);
            ctx.translate(tempObj.screenX, tempObj.screenY);
            ctx.font = `bold ${24 * CAMERA_ZOOM}px Cinzel, Noto Sans JP`;
            ctx.fillStyle = f.color;
            ctx.textAlign = 'center';
            // Removed shadowBlur as it causes significant performance drops
            ctx.fillText(f.text, 0, 0);
        } else if (f.type === 'laser' || f.type === 'marker') {
            // Drawn in pseudo 3D space
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(CAMERA_ZOOM, Math.cos(angleX) * CAMERA_ZOOM);
            ctx.rotate(aZ);
            ctx.translate(-camX, -camY);

            if (f.type === 'laser') {
                ctx.beginPath();
                ctx.moveTo(f.x1, f.y1);
                ctx.lineTo(f.x2, f.y2);
                ctx.strokeStyle = f.color;
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                // Removed shadowBlur to fix massive lag spike when swarms harvest resources
                ctx.stroke();
            } else if (f.type === 'marker') {
                ctx.beginPath();
                ctx.arc(f.x, f.y, 20 + (30 - f.life), 0, Math.PI * 2);
                ctx.strokeStyle = f.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = f.life / f.maxLife;
                ctx.stroke();
            }
        }
        ctx.restore();
    });

    // Enemy AI Base Logic
    enemySpawnTimer += delta;
    if (enemySpawnTimer > 3000) { // Check every 3 seconds
        enemySpawnTimer = 0;

        const enemyCount = GameState.units.filter(u => !u.isPlayer).length;
        const playerCount = GameState.units.filter(u => u.isPlayer).length;

        // --- Balance & Comeback Mechanic ---
        // Passive income so the game never completely stalls
        GameState.enemyResources.biomass += (GameState.enemyEra * 3);
        GameState.enemyResources.genetic += (GameState.enemyEra * 1);
        GameState.resources.biomass += (GameState.era * 2); // Player passive

        // If enemy is completely wiped out or heavily outnumbered, give them a burst
        if (enemyCount === 0 || (enemyCount < 3 && playerCount > 10)) {
            GameState.enemyResources.biomass += 50;
            GameState.enemyResources.genetic += 20;
        }

        // Check for Enemy Era Shift
        if (GameState.enemyEra === 1 && GameState.enemyResources.biomass >= 100 && GameState.enemyResources.genetic >= 100) {
            GameState.enemyResources.biomass -= 100;
            GameState.enemyResources.genetic -= 100;
            GameState.enemyEra = 2;

            // Mass upgrade existing units
            GameState.units.filter(u => !u.isPlayer && u.tier === 'e4').forEach(u => u.evolveEnemy('e5'));
        }

        const spawnTier = GameState.enemyEra === 1 ? 'e1' : 'e5';
        const cost = TIER_STATS[spawnTier].costBio;

        if (GameState.enemyResources.biomass >= cost && enemyCount < 40) {
            GameState.enemyResources.biomass -= cost;

            // Spawn from top right enemy base area
            const enemyBaseX = GameState.mapSize - 500;
            const enemyBaseY = 500;
            const cx = enemyBaseX + (Math.random() - 0.5) * 400;
            const cy = enemyBaseY + (Math.random() - 0.5) * 400;

            const enemy = new Unit(cx, cy, false, spawnTier);
            GameState.units.push(enemy);
        }
    }

    // Spawn Food occasionally
    foodSpawnTimer += delta;
    if (foodSpawnTimer > 1500 && GameState.food.length < 50) {
        foodSpawnTimer = 0;

        // Repopulate base nodes for player to prevent total starvation 
        const pBaseX = 500;
        const pBaseY = GameState.mapSize - 500;
        let hasPlayerBio = false;
        let hasPlayerGen = false;

        for (const r of GameState.resourcesNodes) {
            if (r.destroyed) continue;
            if (r.type === 'bio' && Math.abs(r.x - (pBaseX + 300)) < 100 && Math.abs(r.y - pBaseY) < 100) hasPlayerBio = true;
            if (r.type === 'gen' && Math.abs(r.x - pBaseX) < 100 && Math.abs(r.y - (pBaseY - 300)) < 100) hasPlayerGen = true;
        }

        if (!hasPlayerBio) GameState.resourcesNodes.push(new ResourceNode(pBaseX + 300, pBaseY, 'bio', 500));
        if (!hasPlayerGen) GameState.resourcesNodes.push(new ResourceNode(pBaseX, pBaseY - 300, 'gen', 200));

        const rx = Math.random() * GameState.mapSize;
        const ry = Math.random() * GameState.mapSize;
        GameState.food.push(new Food(rx, ry, false));
    }

    // Update selection UI real-time
    if (GameState.selectedUnits.length === 1 && !GameState.selectedUnits[0].destroyed && Math.random() < 0.1) {
        selectUnits(GameState.selectedUnits);
    }
    // Win/Loss Condition Checks
    const players = GameState.units.filter(u => u.isPlayer);
    if (players.length === 0 && GameState.units.length > 0) {
        GameState.isPlaying = false;
        document.getElementById('end-screen').classList.remove('hidden');
    }
}

// --- Removed getTransparentImage to fix CORS security errors on 'file:///' ---

function drawEntity(ctx, ent) {
    if (ent instanceof Unit) {
        let imgKey = ent.tier;
        if (ent.isPlayer) imgKey = 't' + imgKey;
        else if (!imgKey.toString().startsWith('e')) imgKey = 'e' + imgKey;
        let img = ASSETS[`unit_${imgKey}`];

        // Draw pathing/selection UI under character
        if (GameState.selectedUnits.includes(ent)) {
            ctx.save();
            ctx.scale(1, 0.5); // Squash circle to look isometric
            ctx.beginPath();
            ctx.arc(0, 0, ent.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ffd5';
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 5]);
            ctx.stroke();
            ctx.restore();
        }

        if (img && img.complete && img.naturalWidth > 0) {
            // Use a constant visual size so icons don't become gigantic upon evolution
            let size = ent.isPlayer ? 110 : 65;

            // Draw normally with standard transparency (source-over) since backgrounds were processed

            // Offset drawing slightly up so center represents their feet
            let yOffset = ent.isPlayer ? -15 : -10;
            ctx.drawImage(img, -size / 2, -size / 2 + yOffset, size, size);

            if (ent.damageFlash > 0) {
                ctx.globalCompositeOperation = 'lighten';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(0, -ent.radius * 0.5 - 10, ent.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Restore normal composition and draw HP bar over it
            ctx.globalCompositeOperation = 'source-over';
        } else {
            // Fallback ball
            ctx.beginPath(); ctx.arc(0, -ent.radius / 2, ent.radius, 0, Math.PI * 2);
            ctx.fillStyle = ent.isPlayer ? '#00ffd5' : '#ff0044';
            ctx.fill();
        }

        // HP bar
        if (ent.hp < ent.maxHp) {
            const barW = 40;
            const barH = 6;
            ctx.fillStyle = '#222';
            ctx.fillRect(-barW / 2, ent.radius * 0.2, barW, barH);
            ctx.fillStyle = ent.isPlayer ? '#00ffd5' : '#ff0044';
            ctx.fillRect(-barW / 2, ent.radius * 0.2, barW * (Math.max(0, ent.hp / ent.maxHp)), barH);
        }

    } else if (ent instanceof ResourceNode) {
        let img = ent.type === 'bio' ? ASSETS.res_bio : ASSETS.res_gen;
        if (img && img.complete && img.naturalWidth > 0) {
            // Visual size decoupled from hit radius for center nodes
            let size = (ent.type === 'bio' ? 90 : 80) * (ent.scale || 1);

            // Use normal transparency (source-over)
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
            ctx.beginPath(); ctx.arc(0, -ent.radius / 2, ent.radius, 0, Math.PI * 2);
            ctx.fillStyle = ent.type === 'bio' ? '#adff2f' : '#ff007f';
            ctx.fill();
        }
    } else if (ent instanceof Food) {
        if (ent.isGenetic) {
            ctx.fillStyle = '#ff007f';
            ctx.fillRect(-8, -8, 16, 16);
        } else {
            ctx.fillStyle = '#adff2f';
            ctx.beginPath(); ctx.arc(0, -4, 8, 0, Math.PI * 2); ctx.fill();
        }
    }
}

// Initial Spawn (MOBA style layout)
function initGame() {
    // Player starts bottom left
    const playerBaseX = 500;
    const playerBaseY = GameState.mapSize - 500;

    // Enemy starts top right
    const enemyBaseX = GameState.mapSize - 500;
    const enemyBaseY = 500;

    // Set camera center to player base
    camX = playerBaseX;
    camY = playerBaseY;
    clampCamera();

    // Start Player Units
    for (let i = 0; i < 3; i++) {
        GameState.units.push(new Unit(playerBaseX + (i - 1) * 100, playerBaseY, true));
    }

    // Start Enemy Units
    for (let i = 0; i < 3; i++) {
        GameState.units.push(new Unit(enemyBaseX - (i - 1) * 100, enemyBaseY, false, 'e1'));
    }

    // Spawn Small Food scattered everywhere
    for (let i = 0; i < 60; i++) {
        GameState.food.push(new Food(Math.random() * GameState.mapSize, Math.random() * GameState.mapSize, false));
    }

    // Fixed Resource Spawns
    // Player side small nodes (low amount)
    GameState.resourcesNodes.push(new ResourceNode(playerBaseX + 300, playerBaseY, 'bio', 20));
    GameState.resourcesNodes.push(new ResourceNode(playerBaseX, playerBaseY - 300, 'gen', 20));

    // Enemy side small nodes (low amount)
    GameState.resourcesNodes.push(new ResourceNode(enemyBaseX - 300, enemyBaseY, 'bio', 20));
    GameState.resourcesNodes.push(new ResourceNode(enemyBaseX, enemyBaseY + 300, 'gen', 20));

    // Center Big Nodes (high amount)
    const cx = GameState.mapSize / 2;
    const cy = GameState.mapSize / 2;
    GameState.resourcesNodes.push(new ResourceNode(cx - 200, cy - 200, 'bio', 2000, 3)); // Huge Bio
    GameState.resourcesNodes.push(new ResourceNode(cx + 200, cy + 200, 'bio', 2000, 3)); // Huge Bio
    GameState.resourcesNodes.push(new ResourceNode(cx + 200, cy - 200, 'gen', 2000, 3)); // Huge Gen
    GameState.resourcesNodes.push(new ResourceNode(cx - 200, cy + 200, 'gen', 2000, 3)); // Huge Gen

    showNotification("探索を開始せよ。周辺の熱水噴出孔や資源からバイオマスを集めよ。");

    // Reveal starting area
    updateFow();

    requestAnimationFrame(gameLoop);
}

initGame();
