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
        // Maintain aspect ratio or fill container
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
        // Hide/Show DOM overlays based on state
        const overlays = ['menu-overlay', 'dialogue-overlay', 'result-overlay'];
        overlays.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        if (this.state === 'MENU') {
            document.getElementById('menu-overlay').style.display = 'flex';
        } else if (this.state === 'DEBATE') {
            document.getElementById('dialogue-overlay').style.display = 'flex';
        } else if (this.state === 'PHALANX') {
            // Dialogue hidden automatically
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
                if (this.agogeGame) this.agogeGame.update(deltaTime);
                if (this.agogeGame) this.agogeGame.draw(this.ctx);
                break;
            case 'PHALANX':
                if (this.phalanxGame) this.phalanxGame.update(deltaTime);
                if (this.phalanxGame) this.phalanxGame.draw(this.ctx);
                break;
            default:
                // Background or Menu drawing if needed
                this.drawBackground();
                break;
        }

        this.requestAnimationFrame();
    }

    drawBackground() {
        // Simple themed background for the canvas
        const ctx = this.ctx;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Decorative border
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

class PhalanxGame {
    constructor(game) {
        this.game = game;
        this.integrity = 100;
        this.targets = [];
        this.spawnTimer = 0;
        this.duration = 15000;
        this.elapsed = 0;

        // Rhythm points
        this.perfectZone = 50; // pixels from bottom
    }

    update(dt) {
        this.elapsed += dt;
        if (this.elapsed >= this.duration) {
            this.end();
            return;
        }

        this.spawnTimer += dt;
        if (this.spawnTimer > 1000) {
            this.targets.push({
                y: 0,
                speed: 4
            });
            this.spawnTimer = 0;
        }

        this.targets.forEach((t, i) => {
            t.y += t.speed;
            if (t.y > this.game.canvas.height) {
                this.integrity -= 10;
                this.targets.splice(i, 1);
            }
        });

        if (this.integrity <= 0) {
            this.game.resultText = "The phalanx has broken. A Spartan never retreats, but today the line did not hold.";
            this.game.setState('RESULT');
        }
    }

    handleInput() {
        // Find target in perfect zone
        const hitIndex = this.targets.findIndex(t =>
            t.y > this.game.canvas.height - 100 && t.y < this.game.canvas.height - 20
        );

        if (hitIndex !== -1) {
            this.targets.splice(hitIndex, 1);
            this.integrity = Math.min(100, this.integrity + 5);
        } else {
            this.integrity -= 5;
        }
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
        // Draw Phalanx Wall
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(0, ctx.canvas.height - 60, ctx.canvas.width, 60);

        // Draw Shields
        ctx.fillStyle = '#CD7F32';
        for (let x = 20; x < ctx.canvas.width; x += 60) {
            ctx.beginPath();
            ctx.arc(x, ctx.canvas.height - 40, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFD700';
            ctx.stroke();
        }

        // Draw Targets (Persian arrows or Athenian spears)
        ctx.fillStyle = '#F5F5DC';
        this.targets.forEach(t => {
            ctx.fillRect(ctx.canvas.width / 2 - 2, t.y, 4, 30);
        });

        // Draw UI
        ctx.fillStyle = '#F5F5DC';
        ctx.font = '20px Georgia';
        ctx.fillText(`PHALANX INTEGRITY: ${this.integrity}%`, 20, 40);
        ctx.fillText("SPACE TO HOLD THE LINE", ctx.canvas.width / 2 - 100, ctx.canvas.height - 80);
    }
}

class DebateGame {
    constructor(game) {
        this.game = game;
        this.influence = 50; // Start at 50%
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
        if (!scenario) {
            this.end();
            return;
        }

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

    updateMeter() {
        document.getElementById('influence-bar').style.width = `${this.influence}%`;
    }

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
        // Draw Debate Scene Background
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // Athenian vs Spartan Silhouettes
        ctx.fillStyle = '#444'; // Athenian
        ctx.fillRect(100, 200, 100, 300);
        ctx.fillStyle = '#8B0000'; // Spartan
        ctx.fillRect(this.game.canvas.width - 200, 200, 100, 300);
    }
}

class AgogeGame {
    constructor(game) {
        this.game = game;
        this.player = {
            x: game.canvas.width / 2,
            y: game.canvas.height - 100,
            width: 40,
            height: 60,
            speed: 5
        };
        this.items = [];
        this.spawnTimer = 0;
        this.score = 0;
        this.duration = 15000; // 15 seconds of training
        this.elapsed = 0;
        this.keys = {};

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    update(dt) {
        this.elapsed += dt;
        if (this.elapsed >= this.duration) {
            this.game.setState('DEBATE');
            return;
        }

        // Move Player
        if (this.keys['ArrowLeft'] && this.player.x > 0) this.player.x -= this.player.speed;
        if (this.keys['ArrowRight'] && this.player.x < this.game.canvas.width - this.player.width) this.player.x += this.player.speed;

        // Spawn Items
        this.spawnTimer += dt;
        if (this.spawnTimer > 800) {
            this.spawnItem();
            this.spawnTimer = 0;
        }

        // Update Items
        this.items.forEach((item, index) => {
            item.y += item.speed;

            // Collision detection
            if (this.checkCollision(this.player, item)) {
                this.handleCollision(item);
                this.items.splice(index, 1);
            } else if (item.y > this.game.canvas.height) {
                this.items.splice(index, 1);
            }
        });
    }

    spawnItem() {
        const types = [
            { name: 'shield', color: '#CD7F32', value: 5, type: 'good' },
            { name: 'broth', color: '#1a1a1a', value: 3, type: 'good' },
            { name: 'cake', color: '#FFD700', value: -5, type: 'bad' },
            { name: 'silk', color: '#DA70D6', value: -3, type: 'bad' }
        ];
        const config = types[Math.floor(Math.random() * types.length)];
        this.items.push({
            x: Math.random() * (this.game.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 3 + Math.random() * 2,
            ...config
        });
    }

    checkCollision(p, i) {
        return p.x < i.x + i.width &&
               p.x + p.width > i.x &&
               p.y < i.y + i.height &&
               p.y + p.height > i.y;
    }

    handleCollision(item) {
        if (item.type === 'good') {
            this.game.stats.discipline += item.value;
            this.game.stats.strength += item.value;
        } else {
            this.game.stats.discipline += item.value;
            this.game.stats.spirit -= 2;
        }
        this.game.updateStats();
    }

    draw(ctx) {
        // Draw Ground
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(0, this.game.canvas.height - 40, this.game.canvas.width, 40);

        // Draw Player (Placeholder for now)
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        // Helmet plume
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(this.player.x + 10, this.player.y - 10, 20, 10);

        // Draw Items
        this.items.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.beginPath();
            if (item.name === 'shield') {
                ctx.arc(item.x + 15, item.y + 15, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FFD700';
                ctx.stroke();
            } else {
                ctx.fillRect(item.x, item.y, item.width, item.height);
            }
        });

        // Draw Timer
        ctx.fillStyle = '#F5F5DC';
        ctx.font = '20px Georgia';
        ctx.fillText(`AGOGE TRAINING: ${Math.ceil((this.duration - this.elapsed) / 1000)}s`, 20, 40);
    }
}

// Initialize on load
window.onload = () => {
    window.game = new Game();

    // Global Key Listener for Phalanx
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && window.game.state === 'PHALANX' && window.game.phalanxGame) {
            window.game.phalanxGame.handleInput();
        }
    });
};
