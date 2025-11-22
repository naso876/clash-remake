// Global variables
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let gameMode = '';
let gameRunning = false;

const towers = [];
const units = [];
const cards = [];
let elixir = 10;

// Load sounds
const sounds = {
    attack: new Audio('assets/sounds/attack.wav'),
    deploy: new Audio('assets/sounds/deploy.wav'),
    victory: new Audio('assets/sounds/victory.wav')
};

// Load sprites
const sprites = {};
['tower1', 'tower2', 'unit_knight', 'unit_archer'].forEach(name => {
    const img = new Image();
    img.src = `assets/sprites/${name}.png`;
    sprites[name] = img;
});

// Game start
function startGame(mode) {
    gameMode = mode;
    document.getElementById('menu').style.display = 'none';
    canvas.style.display = 'block';
    gameRunning = true;
    initGame();
    requestAnimationFrame(gameLoop);
}

// Initialize game objects
function initGame() {
    towers.length = 0;
    units.length = 0;

    towers.push({x:100, y:250, width:50, height:100, health:1000, owner:'player1'});
    towers.push({x:650, y:250, width:50, height:100, health:1000, owner:'player2'});

    // Example card deck
    cards.push({name:'Knight', cost:3, sprite:'unit_knight'});
    cards.push({name:'Archer', cost:2, sprite:'unit_archer'});
}

// Game loop
function gameLoop() {
    if(!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Move units
    units.forEach(unit => {
        if(unit.owner === 'player1') unit.x += unit.speed;
        else unit.x -= unit.speed;

        // Check collision with towers
        towers.forEach(tower => {
            if(unit.owner !== tower.owner &&
               unit.x + unit.width > tower.x &&
               unit.x < tower.x + tower.width &&
               unit.y + unit.height > tower.y &&
               unit.y < tower.y + tower.height) {
                tower.health -= unit.damage;
                unit.health = 0;
                sounds.attack.play();
            }
        });
    });

    // Remove dead units
    for(let i=units.length-1; i>=0; i--) {
        if(units[i].health <=0) units.splice(i,1);
    }

    // Simple AI (if AI mode)
    if(gameMode === 'ai') {
        if(Math.random() < 0.01) deployUnit('ai');
    }

    // Check victory
    towers.forEach(tower => {
        if(tower.health <=0) {
            alert(`${tower.owner === 'player1' ? 'Player 2' : 'Player 1'} Wins!`);
            sounds.victory.play();
            gameRunning = false;
        }
    });
}

// Draw game
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw towers
    towers.forEach(tower => {
        ctx.drawImage(sprites[tower.owner === 'player1' ? 'tower1' : 'tower2'], tower.x, tower.y, tower.width, tower.height);
        ctx.fillStyle='red';
        ctx.fillRect(tower.x, tower.y-10, tower.health/2,5);
    });

    // Draw units
    units.forEach(unit => {
        ctx.drawImage(sprites[unit.sprite], unit.x, unit.y, unit.width, unit.height);
    });
}

// Deploy a unit
function deployUnit(player) {
    if(elixir < 2) return;
    elixir -= 2;
    units.push({
        x: player === 'player1' ? 150 : 600,
        y: 300,
        width: 32,
        height: 32,
        health: 100,
        damage: 20,
        speed: player === 'player1' ? 1 : -1,
        owner: player,
        sprite: 'unit_knight'
    });
    sounds.deploy.play();
}

// Example keyboard controls
document.addEventListener('keydown', e => {
    if(gameMode === 'local') {
        if(e.key === 'q') deployUnit('player1');
        if(e.key === 'p') deployUnit('player2');
    } else if(gameMode === 'ai') {
        if(e.key === 'q') deployUnit('player1');
    }
});
