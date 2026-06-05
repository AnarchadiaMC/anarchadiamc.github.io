const GITHUB_USERNAME = 'AnarchadiaMC';
const PROJECTS_CONTAINER = document.getElementById('projects-container');

// Topics or repo names to prioritize or highlight if found
const HIGHLIGHT_TOPICS = ['anarchy', 'minecraft', 'plugin', 'mod', 'server'];

// Function to fetch repositories
async function fetchRepositories() {
    try {
        // Fetch public repositories, sort by updated
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error(`GitHub API returned status ${response.status}`);
        }

        const repos = await response.json();
        
        // Filter out forks if you only want original projects, 
        // but for now let's just sort and pick the best ones.
        // We'll prioritize repos with stars, descriptions, or specific topics.
        const sortedRepos = repos.sort((a, b) => {
            // Give weight to stars
            let weightA = a.stargazers_count * 10;
            let weightB = b.stargazers_count * 10;
            
            // Give weight if it has a description
            if (a.description) weightA += 5;
            if (b.description) weightB += 5;

            // Prioritize recently updated
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();
            
            if (dateA > dateB) weightA += 2;
            else if (dateB > dateA) weightB += 2;

            return weightB - weightA;
        });

        // Take top 9 to display in a nice grid
        const topRepos = sortedRepos.slice(0, 9);
        
        renderProjects(topRepos);

    } catch (error) {
        console.error('Error fetching repositories:', error);
        PROJECTS_CONTAINER.innerHTML = `
            <div class="error-state" style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: #f85149; margin-bottom: 1rem; display: block;"></i>
                <p>Failed to load projects from GitHub.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">${error.message}</p>
                <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" class="server-link" style="font-size: 1rem; margin-top: 1rem;">View on GitHub directly</a>
            </div>
        `;
    }
}

// Function to get color for programming languages
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Java': '#b07219',
        'Python': '#3572A5',
        'C++': '#f34b7d',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Shell': '#89e051',
        'Vue': '#41b883',
        'Kotlin': '#A97BFF'
    };
    return colors[language] || '#8b949e';
}

// Function to render the project cards
function renderProjects(repos) {
    PROJECTS_CONTAINER.innerHTML = ''; // Clear loading state

    if (repos.length === 0) {
        PROJECTS_CONTAINER.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No public repositories found.</p>';
        return;
    }

    repos.forEach(repo => {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'project-card';

        const description = repo.description || 'No description provided for this repository.';
        const language = repo.language || 'Unknown';
        const languageColor = getLanguageColor(language);
        
        // Format date
        const updatedDate = new Date(repo.updated_at);
        const dateString = updatedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        card.innerHTML = `
            <div class="project-header">
                <div class="project-title">
                    <i class="fa-regular fa-folder"></i>
                    <h3>${repo.name}</h3>
                </div>
                <div class="project-links">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </div>
            </div>
            <p class="project-desc">${description}</p>
            <div class="project-footer">
                <div class="project-lang">
                    <span class="lang-color" style="background-color: ${languageColor}"></span>
                    <span>${language}</span>
                </div>
                <div class="project-stats">
                    ${repo.stargazers_count > 0 ? `<span class="stat"><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span>` : ''}
                    ${repo.forks_count > 0 ? `<span class="stat"><i class="fa-solid fa-code-branch"></i> ${repo.forks_count}</span>` : ''}
                    <span class="stat update-date">Updated ${dateString}</span>
                </div>
            </div>
        `;

        PROJECTS_CONTAINER.appendChild(card);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchRepositories();

    // Initialize tsParticles
    tsParticles.load("particles-js", {
        background: {
            color: { value: "transparent" }
        },
        fpsLimit: 60,
        interactivity: {
            events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: true, mode: "repulse" },
                resize: true
            },
            modes: {
                push: { quantity: 4 },
                repulse: { distance: 100, duration: 0.4 }
            }
        },
        particles: {
            color: { value: "#58a6ff" },
            links: {
                color: "#58a6ff",
                distance: 150,
                enable: true,
                opacity: 0.3,
                width: 1
            },
            collisions: { enable: true },
            move: {
                direction: "none",
                enable: true,
                outMode: "bounce",
                random: false,
                speed: 1,
                straight: false
            },
            number: {
                density: { enable: true, value_area: 800 },
                value: 80
            },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { random: true, value: 3 }
        },
        detectRetina: true
    });
});

let activeGame = 'snake';

document.getElementById('gameTabs').addEventListener('shown.bs.tab', function (event) {
    if (event.target.id === 'snake-tab') {
        activeGame = 'snake';
    } else if (event.target.id === 'tetris-tab') {
        activeGame = 'tetris';
    }
});

// --- Snake Game Logic Refactored ---
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('snake-score');
        this.highScoreElement = document.getElementById('snake-high-score');
        this.overlay = document.getElementById('snake-game-overlay');
        this.messageElement = document.getElementById('snake-game-message');

        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('anarchySnakeHighScore') || 0;
        this.gameLoop = null;
        this.isPlaying = false;
        this.isGameOver = false;

        this.highScoreElement.textContent = `High Score: ${this.highScore}`;

        this.overlay.addEventListener('click', () => this.startGame());

        this.resetGame();
        this.drawGame();
    }

    resetGame() {
        this.snake = [
            { x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2) }
        ];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.placeFood();
        this.isGameOver = false;
    }

    placeFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.placeFood();
                break;
            }
        }
    }

    updateGame() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount || this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = `Score: ${this.score}`;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.highScoreElement.textContent = `High Score: ${this.highScore}`;
                localStorage.setItem('anarchySnakeHighScore', this.highScore);
            }
            this.placeFood();
        } else {
            this.snake.pop();
        }

        this.drawGame();
    }

    checkCollision(head) {
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        return false;
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawGame() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#222';
        for (let i = 0; i < this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Draw food with a glowing effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#FFD700';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(this.food.x * this.gridSize + this.gridSize/2, this.food.y * this.gridSize + this.gridSize/2, this.gridSize/2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset shadow

        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#39d353';
            } else {
                const alpha = Math.max(0.3, 1 - (index / this.snake.length));
                this.ctx.fillStyle = `rgba(57, 211, 83, ${alpha})`;
            }

            // Draw rounded segments
            this.drawRoundedRect(segment.x * this.gridSize + 1, segment.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2, 4);

            // Draw eyes on the head
            if (index === 0) {
                this.ctx.fillStyle = '#000';
                let eyeOffsetX = 5;
                let eyeOffsetY = 5;
                let eyeSize = 3;

                // Adjust eyes based on direction
                if (this.dx === 1) { // Right
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffsetX - eyeSize, segment.y * this.gridSize + eyeOffsetY, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffsetX - eyeSize, segment.y * this.gridSize + this.gridSize - eyeOffsetY - eyeSize, eyeSize, eyeSize);
                } else if (this.dx === -1) { // Left
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffsetX, segment.y * this.gridSize + eyeOffsetY, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffsetX, segment.y * this.gridSize + this.gridSize - eyeOffsetY - eyeSize, eyeSize, eyeSize);
                } else if (this.dy === 1) { // Down
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffsetY, segment.y * this.gridSize + this.gridSize - eyeOffsetX - eyeSize, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffsetY - eyeSize, segment.y * this.gridSize + this.gridSize - eyeOffsetX - eyeSize, eyeSize, eyeSize);
                } else { // Up or stopped
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffsetY, segment.y * this.gridSize + eyeOffsetX, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffsetY - eyeSize, segment.y * this.gridSize + eyeOffsetX, eyeSize, eyeSize);
                }
            }
        });
    }

    startGame() {
        if (this.isPlaying) return;

        if (this.isGameOver) {
            this.resetGame();
        } else if (this.snake.length === 0) {
            this.resetGame();
        }

        this.isPlaying = true;
        this.overlay.classList.add('hidden');

        if(this.dx === 0 && this.dy === 0) this.dx = 1;

        this.gameLoop = setInterval(() => this.updateGame(), 100);
    }

    gameOver() {
        this.isPlaying = false;
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.messageElement.textContent = 'Game Over. Space to Restart';
        this.overlay.classList.remove('hidden');
        this.drawGame();

        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handleInput(e) {
        if (e.code === 'Space') {
            this.startGame();
            return;
        }

        if (!this.isPlaying) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                if (this.dy !== 1) { this.dx = 0; this.dy = -1; }
                break;
            case 'ArrowDown':
            case 's':
                if (this.dy !== -1) { this.dx = 0; this.dy = 1; }
                break;
            case 'ArrowLeft':
            case 'a':
                if (this.dx !== 1) { this.dx = -1; this.dy = 0; }
                break;
            case 'ArrowRight':
            case 'd':
                if (this.dx !== -1) { this.dx = 1; this.dy = 0; }
                break;
        }
    }
}

const snakeGame = new SnakeGame();

// --- Tetris Game Logic ---
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('tetris-score');
        this.linesElement = document.getElementById('tetris-lines');
        this.overlay = document.getElementById('tetris-game-overlay');
        this.messageElement = document.getElementById('tetris-game-message');

        this.gridSize = 30;
        this.cols = this.canvas.width / this.gridSize; // 10
        this.rows = this.canvas.height / this.gridSize; // 20

        this.colors = [
            null,
            '#00FFFF', // I
            '#0000FF', // J
            '#FFA500', // L
            '#FFFF00', // O
            '#00FF00', // S
            '#800080', // T
            '#FF0000'  // Z
        ];

        this.pieces = [
            [], // 0
            [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
            [[2,0,0], [2,2,2], [0,0,0]], // J
            [[0,0,3], [3,3,3], [0,0,0]], // L
            [[4,4], [4,4]], // O
            [[0,5,5], [5,5,0], [0,0,0]], // S
            [[0,6,0], [6,6,6], [0,0,0]], // T
            [[7,7,0], [0,7,7], [0,0,0]]  // Z
        ];

        this.board = [];
        this.piece = null;
        this.pos = { x: 0, y: 0 };

        this.score = 0;
        this.lines = 0;

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.animationId = null;
        this.isPlaying = false;
        this.isGameOver = false;

        this.overlay.addEventListener('click', () => this.startGame());

        this.resetGame();
        this.drawGame();
    }

    createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    resetGame() {
        this.board = this.createMatrix(this.cols, this.rows);
        this.score = 0;
        this.lines = 0;
        this.dropInterval = 1000;
        this.updateScore();
        this.spawnPiece();
        this.isGameOver = false;
    }

    spawnPiece() {
        const typeId = Math.floor(Math.random() * 7) + 1;
        this.piece = this.pieces[typeId];
        this.pos.y = 0;
        this.pos.x = Math.floor(this.cols / 2) - Math.floor(this.piece[0].length / 2);

        if (this.collide()) {
            this.gameOver();
        }
    }

    collide() {
        const [m, o] = [this.piece, this.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (this.board[y + o.y] && this.board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge() {
        this.piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.board[y + this.pos.y][x + this.pos.x] = value;
                }
            });
        });
    }

    rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    playerRotate(dir) {
        const pos = this.pos.x;
        let offset = 1;
        this.rotate(this.piece, dir);
        while (this.collide()) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.piece[0].length) {
                this.rotate(this.piece, -dir);
                this.pos.x = pos;
                return;
            }
        }
    }

    playerDrop() {
        this.pos.y++;
        if (this.collide()) {
            this.pos.y--;
            this.merge();
            this.spawnPiece();
            this.clearLines();
        }
        this.dropCounter = 0;
    }

    playerMove(dir) {
        this.pos.x += dir;
        if (this.collide()) {
            this.pos.x -= dir;
        }
    }

    clearLines() {
        let rowCount = 1;
        outer: for (let y = this.board.length - 1; y >= 0; --y) {
            for (let x = 0; x < this.board[y].length; ++x) {
                if (this.board[y][x] === 0) {
                    continue outer;
                }
            }
            const row = this.board.splice(y, 1)[0].fill(0);
            this.board.unshift(row);
            ++y;
            this.score += rowCount * 100;
            this.lines++;
            rowCount *= 2;

            // Speed up
            if (this.lines % 5 === 0 && this.dropInterval > 100) {
                this.dropInterval -= 100;
            }
        }
        this.updateScore();
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.linesElement.textContent = `Lines: ${this.lines}`;
    }

    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.ctx.fillStyle = this.colors[value];
                    this.ctx.fillRect((x + offset.x) * this.gridSize, (y + offset.y) * this.gridSize, this.gridSize - 1, this.gridSize - 1);

                    // Add some shine
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect((x + offset.x) * this.gridSize, (y + offset.y) * this.gridSize, this.gridSize - 1, 4);
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    this.ctx.fillRect((x + offset.x) * this.gridSize + this.gridSize - 5, (y + offset.y) * this.gridSize, 4, this.gridSize - 1);
                }
            });
        });
    }

    drawGhost() {
        const tempPos = { x: this.pos.x, y: this.pos.y };
        while (!this.collide()) {
            this.pos.y++;
        }
        this.pos.y--;

        this.ctx.globalAlpha = 0.2;
        this.drawMatrix(this.piece, this.pos);
        this.ctx.globalAlpha = 1.0;

        this.pos.y = tempPos.y; // Restore position
    }

    drawGame() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#222';
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        this.drawMatrix(this.board, { x: 0, y: 0 });

        if (this.piece) {
            this.drawGhost();
            this.drawMatrix(this.piece, this.pos);
        }
    }

    update(time = 0) {
        if (!this.isPlaying) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;

        if (this.dropCounter > this.dropInterval) {
            this.playerDrop();
        }

        this.drawGame();
        this.animationId = requestAnimationFrame(this.update.bind(this));
    }

    startGame() {
        if (this.isPlaying) return;

        if (this.isGameOver) {
            this.resetGame();
        }

        this.isPlaying = true;
        this.overlay.classList.add('hidden');
        this.lastTime = performance.now();
        this.update();
    }

    gameOver() {
        this.isPlaying = false;
        this.isGameOver = true;
        cancelAnimationFrame(this.animationId);
        this.messageElement.textContent = 'Game Over. Space to Restart';
        this.overlay.classList.remove('hidden');
        this.drawGame();

        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handleInput(e) {
        if (e.code === 'Space') {
            if(!this.isPlaying) {
                this.startGame();
            } else {
                // Hard drop
                while (!this.collide()) {
                    this.pos.y++;
                }
                this.pos.y--;
                this.merge();
                this.spawnPiece();
                this.clearLines();
                this.dropCounter = 0;
            }
            return;
        }

        if (!this.isPlaying) return;

        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
                this.playerMove(-1);
                break;
            case 'ArrowRight':
            case 'd':
                this.playerMove(1);
                break;
            case 'ArrowDown':
            case 's':
                this.playerDrop();
                break;
            case 'ArrowUp':
            case 'w':
                this.playerRotate(1);
                break;
        }
    }
}

const tetrisGame = new TetrisGame();

// --- Global Input Handler ---
window.addEventListener('keydown', e => {
    const isGameView = true; // In a full app, check if canvas is in view

    if (isGameView && ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }

    if (activeGame === 'snake') {
        snakeGame.handleInput(e);
    } else if (activeGame === 'tetris') {
        tetrisGame.handleInput(e);
    }
});

