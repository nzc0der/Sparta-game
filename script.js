/**
 * The Agoge: Spartan Training Simulator
 * Main Game Controller and State Machine
 */

class Game {
    constructor() {
        this.state = 'MENU';
        this.stats = {
            discipline: 10,
            strength: 10,
            spirit: 10
        };
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;

        // Mini-game instances
        this.agogeGame = null;
        this.debateGame = null;
        this.phalanxGame = null;

        this.init();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.requestAnimationFrame();
    }

    resize() {
        const container = document.getElementById('canvas-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setState(newState) {
        console.log(`Transitioning from ${this.state} to ${newState}`);
        this.state = newState;
        this.updateUI();

        if (newState === 'AGOGE') {
            this.agogeGame = new AgogeGame(this);
        } else if (newState === 'DEBATE') {
            this.debateGame = new DebateGame(this);
        } else if (newState === 'PHALANX') {
            this.phalanxGame = new PhalanxGame(this);
        }
    }

    updateUI() {
        const overlays = ['menu-overlay', 'dialogue-overlay', 'result-overlay'];
        overlays.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        if (this.state === 'MENU') {
            document.getElementById('menu-overlay').style.display = 'flex';
        } else if (this.state === 'DEBATE') {
            document.getElementById('dialogue-overlay').style.display = 'flex';
        } else if (this.state === 'RESULT') {
            document.getElementById('result-overlay').style.display = 'flex';
            document.getElementById('result-text').innerText = this.resultText || "Your journey in the Agoge has concluded.";
        }
    }

    requestAnimationFrame() {
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.state) {
            case 'AGOGE':
                if (this.agogeGame) {
                    this.agogeGame.update(deltaTime);
                    this.agogeGame.draw(this.ctx);
                }
                break;
            case 'PHALANX':
                if (this.phalanxGame) {
                    this.phalanxGame.update(deltaTime);
                    this.phalanxGame.draw(this.ctx);
                }
                break;
            case 'DEBATE':
                if (this.debateGame) {
                    this.debateGame.draw(this.ctx);
                }
                break;
            default:
                this.drawBackground();
                break;
        }

        this.requestAnimationFrame();
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = '#CD7F32';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, this.canvas.width - 10, this.canvas.height - 10);
    }

    updateStats() {
        document.getElementById('stat-discipline').innerText = this.stats.discipline;
        document.getElementById('stat-strength').innerText = this.stats.strength;
        document.getElementById('stat-spirit').innerText = this.stats.spirit;
    }
}

class AgogeGame {
    constructor(game) {
        this.game = game;

        this.GRAVITY = 0.6;
        this.FRICTION = 0.8;
        this.JUMP_FORCE = -14;
        this.MAX_SPEED = 6;
        this.TILE_SIZE = 40;

        this.player = {
            x: 100,
            y: 300,
            vx: 0,
            vy: 0,
            width: 32,
            height: 48,
            grounded: false,
            facing: 'right'
        };

        this.elapsed = 0;
        this.duration = 30000;
        this.keys = {};
        this.particles = [];

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        this.level = this.generateLevel();
    }

    generateLevel() {
        return [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,1,1,1,0,0,1,1,0,0,0,3,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
            [0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0],
            [1,1,1,1,1,0,0,1,1,0,0,1,1,1,0,0,0,0,1,1,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
    }

    update(dt) {
        this.elapsed += dt;
        this.updateParticles();
        if (this.elapsed >= this.duration) {
            this.game.setState('DEBATE');
            return;
        }

        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            if (this.player.vx > -this.MAX_SPEED) this.player.vx--;
            this.player.facing = 'left';
        } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            if (this.player.vx < this.MAX_SPEED) this.player.vx++;
            this.player.facing = 'right';
        } else {
            this.player.vx *= this.FRICTION;
        }

        if ((this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space']) && this.player.grounded) {
            this.player.vy = this.JUMP_FORCE;
            this.player.grounded = false;
            this.createDust(this.player.x + 16, this.player.y + 48);
        }

        this.player.vy += this.GRAVITY;
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;

        this.checkCollisions();
    }

    checkCollisions() {
        this.player.grounded = false;
        for (let r = 0; r < this.level.length; r++) {
            for (let c = 0; c < this.level[r].length; c++) {
                const tile = this.level[r][c];
                if (tile === 0) continue;
                const tx = c * this.TILE_SIZE;
                const ty = r * this.TILE_SIZE;

                if (tile === 1) {
                    this.resolveCollision(this.player, { x: tx, y: ty, width: this.TILE_SIZE, height: this.TILE_SIZE });
                } else if (tile === 3 || tile === 4) {
                    if (this.rectIntersect(this.player, { x: tx, y: ty, width: this.TILE_SIZE, height: this.TILE_SIZE })) {
                        this.handleCollection(tile, r, c);
                    }
                }
            }
        }

        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > (this.level[0].length * this.TILE_SIZE) - this.player.width) {
            this.player.x = (this.level[0].length * this.TILE_SIZE) - this.player.width;
        }
        if (this.player.y > this.game.canvas.height) {
            this.player.x = 100; this.player.y = 300; this.player.vy = 0;
        }
    }

    resolveCollision(p, t) {
        const dx = (p.x + p.width / 2) - (t.x + t.width / 2);
        const dy = (p.y + p.height / 2) - (t.y + t.height / 2);
        const width = (p.width + t.width) / 2;
        const height = (p.height + t.height) / 2;
        const crossWidth = width * dy;
        const crossHeight = height * dx;

        if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
            if (crossWidth > crossHeight) {
                if (crossWidth > (-crossHeight)) { p.y = t.y + t.height; p.vy = 0; }
                else { p.x = t.x - p.width; p.vx = 0; }
            } else {
                if (crossWidth > (-crossHeight)) { p.x = t.x + t.width; p.vx = 0; }
                else { p.y = t.y - p.height; p.vy = 0; p.grounded = true; }
            }
        }
    }

    rectIntersect(r1, r2) {
        return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
    }

    handleCollection(tile, r, c) {
        this.level[r][c] = 0;
        if (tile === 3) { this.game.stats.strength += 10; this.game.stats.discipline += 5; }
        else { this.game.stats.discipline -= 10; }
        this.game.updateStats();
    }

    createDust(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1.0
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx; p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw(ctx) {
        // Parallax Background
        const scrollX = this.player.x * 0.2;
        ctx.fillStyle = '#1a0d00';
        ctx.beginPath();
        ctx.moveTo(-scrollX, this.game.canvas.height);
        ctx.lineTo(200 - scrollX, this.game.canvas.height - 300);
        ctx.lineTo(400 - scrollX, this.game.canvas.height);
        ctx.lineTo(600 - scrollX, this.game.canvas.height - 250);
        ctx.lineTo(800 - scrollX, this.game.canvas.height);
        ctx.fill();

        for (let r = 0; r < this.level.length; r++) {
            for (let c = 0; c < this.level[r].length; c++) {
                const tile = this.level[r][c];
                const tx = c * this.TILE_SIZE;
                const ty = r * this.TILE_SIZE;
                if (tile === 1) {
                    ctx.fillStyle = '#F5F5DC';
                    ctx.fillRect(tx, ty, this.TILE_SIZE, this.TILE_SIZE);
                    ctx.strokeStyle = '#CD7F32';
                    ctx.strokeRect(tx + 2, ty + 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4);
                } else if (tile === 3) { this.drawShield(ctx, tx + 20, ty + 20); }
                else if (tile === 4) { this.drawCake(ctx, tx + 20, ty + 20); }
            }
        }
        this.drawPlayer(ctx);

        // Draw Particles
        ctx.fillStyle = 'rgba(245, 245, 220, 0.5)';
        this.particles.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2); ctx.fill();
        });

        ctx.fillStyle = '#F5F5DC';
        ctx.font = 'bold 20px Georgia';
        ctx.fillText(`AGOGE: ${Math.ceil((this.duration - this.elapsed) / 1000)}s`, 20, 40);
    }

    drawPlayer(ctx) {
        const p = this.player;
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.facing === 'left') { ctx.scale(-1, 1); ctx.translate(-p.width, 0); }
        ctx.fillStyle = '#CD7F32'; ctx.fillRect(5, 10, 22, 38);
        ctx.fillStyle = '#CD7F32'; ctx.fillRect(5, 0, 22, 15);
        ctx.fillStyle = '#8B0000'; ctx.beginPath(); ctx.moveTo(5, 0); ctx.quadraticCurveTo(16, -15, 27, 0); ctx.fill();
        ctx.fillStyle = '#8B0000'; ctx.fillRect(0, 10, 5, 30);
        ctx.restore();
    }

    drawShield(ctx, x, y) {
        ctx.fillStyle = '#CD7F32'; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 5, y + 5); ctx.lineTo(x, y - 5); ctx.lineTo(x + 5, y + 5); ctx.stroke();
    }

    drawCake(ctx, x, y) {
        ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.moveTo(x - 10, y + 10); ctx.lineTo(x + 10, y + 10); ctx.lineTo(x, y - 10); ctx.closePath(); ctx.fill();
    }
}

class DebateGame {
    constructor(game) {
        this.game = game;
        this.influence = 50;
        this.currentScenario = 0;
        this.scenarios = [
            {
                text: "An Athenian sophist mocks our 'Black Broth', saying it's fit only for pigs. How do you defend our ways?",
                choices: [
                    { text: "It breeds men who fear no hunger or hardship, unlike your honey-soaked poets.", influence: 15 },
                    { text: "At least we don't spend our days talking while others fight.", influence: 10 },
                    { text: "I apologize, our food is indeed simple.", influence: -20 }
                ]
            },
            {
                text: "The Athenian claims their women are more 'refined' because they stay indoors. What is the Spartan truth?",
                choices: [
                    { text: "Spartan women are free and strong, for only they can bear true men.", influence: 20 },
                    { text: "Our women own land and run the city while we are at war.", influence: 15 },
                    { text: "Maybe our women should be more like yours.", influence: -25 }
                ]
            },
            {
                text: "He questions why Sparta has no walls. Lycurgus left no stone defenses!",
                choices: [
                    { text: "Our men are our walls. Every Spartan is a brick of bronze.", influence: 20 },
                    { text: "Walls are for the fearful who cannot hold the line.", influence: 10 }
                ]
            }
        ];
        this.init();
    }

    init() {
        document.getElementById('influence-meter-container').style.display = 'block';
        this.showScenario();
    }

    showScenario() {
        const scenario = this.scenarios[this.currentScenario];
        if (!scenario) { this.end(); return; }
        document.getElementById('narrative-text').innerText = scenario.text;
        const container = document.getElementById('choices-container');
        container.innerHTML = '';
        scenario.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = choice.text;
            btn.onclick = () => this.handleChoice(choice);
            container.appendChild(btn);
        });
        this.updateMeter();
    }

    handleChoice(choice) {
        this.influence += choice.influence;
        this.influence = Math.max(0, Math.min(100, this.influence));
        this.currentScenario++;
        this.showScenario();
    }

    updateMeter() { document.getElementById('influence-bar').style.width = `${this.influence}%`; }

    end() {
        document.getElementById('influence-meter-container').style.display = 'none';
        if (this.influence > 60) {
            this.game.stats.spirit += 20;
            this.game.updateStats();
            this.game.setState('PHALANX');
        } else {
            this.game.resultText = "You were out-talked by an Athenian. Your spirit wavers.";
            this.game.setState('RESULT');
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#222'; ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        ctx.fillStyle = '#444'; ctx.fillRect(100, 200, 100, 300);
        ctx.fillStyle = '#8B0000'; ctx.fillRect(this.game.canvas.width - 200, 200, 100, 300);
    }
}

class PhalanxGame {
    constructor(game) {
        this.game = game;
        this.integrity = 100;
        this.targets = [];
        this.spawnTimer = 0;
        this.duration = 15000;
        this.elapsed = 0;
    }

    update(dt) {
        this.elapsed += dt;
        if (this.elapsed >= this.duration) { this.end(); return; }
        this.spawnTimer += dt;
        if (this.spawnTimer > 1000) { this.targets.push({ y: 0, speed: 4 }); this.spawnTimer = 0; }
        this.targets.forEach((t, i) => {
            t.y += t.speed;
            if (t.y > this.game.canvas.height) { this.integrity -= 10; this.targets.splice(i, 1); }
        });
        if (this.integrity <= 0) {
            this.game.resultText = "The phalanx has broken. A Spartan never retreats, but today the line did not hold.";
            this.game.setState('RESULT');
        }
    }

    handleInput() {
        const hitIndex = this.targets.findIndex(t => t.y > this.game.canvas.height - 100 && t.y < this.game.canvas.height - 20);
        if (hitIndex !== -1) { this.targets.splice(hitIndex, 1); this.integrity = Math.min(100, this.integrity + 5); }
        else { this.integrity -= 5; }
    }

    end() {
        if (this.integrity > 50) {
            this.game.resultText = "Victory! The Phalanx held firm. Athens sees our strength and trembles. You are a true Homoios of Sparta.";
        } else {
            this.game.resultText = "The line held, but barely. You must train harder in the Agoge.";
        }
        this.game.setState('RESULT');
    }

    draw(ctx) {
        ctx.fillStyle = '#8B0000'; ctx.fillRect(0, ctx.canvas.height - 60, ctx.canvas.width, 60);
        ctx.fillStyle = '#CD7F32';
        for (let x = 20; x < ctx.canvas.width; x += 60) {
            ctx.beginPath(); ctx.arc(x, ctx.canvas.height - 40, 25, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.stroke();
        }
        ctx.fillStyle = '#F5F5DC'; this.targets.forEach(t => { ctx.fillRect(ctx.canvas.width / 2 - 2, t.y, 4, 30); });
        ctx.fillStyle = '#F5F5DC'; ctx.font = '20px Georgia';
        ctx.fillText(`PHALANX INTEGRITY: ${this.integrity}%`, 20, 40);
        ctx.fillText("SPACE TO HOLD THE LINE", ctx.canvas.width / 2 - 100, ctx.canvas.height - 80);
    }
}

window.onload = () => {
    window.game = new Game();
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && window.game.state === 'PHALANX' && window.game.phalanxGame) {
            window.game.phalanxGame.handleInput();
        }
    });
};
