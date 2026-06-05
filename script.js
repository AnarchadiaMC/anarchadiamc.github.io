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
});

// --- Snake Game Logic ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const overlay = document.getElementById('game-overlay');
const messageElement = document.getElementById('game-message');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('anarchySnakeHighScore') || 0;
let gameLoop;
let isPlaying = false;
let isGameOver = false;

highScoreElement.textContent = `High Score: ${highScore}`;

function resetGame() {
    snake = [
        { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }
    ];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    placeFood();
    isGameOver = false;
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Ensure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
            break;
        }
    }
}

function updateGame() {
    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check game over
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || checkCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = `High Score: ${highScore}`;
            localStorage.setItem('anarchySnakeHighScore', highScore);
        }
        placeFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function checkCollision(head) {
    // Start from 1 so head doesn't collide with itself initially
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (optional, for "wasteland" feel)
    ctx.strokeStyle = '#222';
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw food (Golden Apple vibe)
    ctx.fillStyle = '#FFD700'; 
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
        // Head is a different color
        if (index === 0) {
            ctx.fillStyle = '#39d353'; // Neon green head
        } else {
            // Body fades slightly
            const alpha = Math.max(0.3, 1 - (index / snake.length));
            ctx.fillStyle = `rgba(57, 211, 83, ${alpha})`;
        }
        
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
}

function startGame() {
    if (isPlaying) return;
    
    if (isGameOver) {
        resetGame();
    } else if (snake.length === 0) {
        resetGame();
    }
    
    isPlaying = true;
    overlay.classList.add('hidden');
    
    // Initial movement so snake starts going immediately if pressing a direction, or defaults to right
    if(dx === 0 && dy === 0) dx = 1; 

    gameLoop = setInterval(updateGame, 100); // Speed
}

function gameOver() {
    isPlaying = false;
    isGameOver = true;
    clearInterval(gameLoop);
    messageElement.textContent = 'Game Over. Space to Restart';
    overlay.classList.remove('hidden');
    drawGame(); // Ensure last frame is drawn
    
    // Draw red overlay
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Input handling
window.addEventListener('keydown', e => {
    // Prevent default scrolling for arrow keys and space when game is in view
    const rect = canvas.getBoundingClientRect();
    const inView = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

    if (inView && [32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }

    if (e.code === 'Space') {
        startGame();
        return;
    }

    if (!isPlaying) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

// Click overlay to start
overlay.addEventListener('click', startGame);

// Initial draw
resetGame();
drawGame();

