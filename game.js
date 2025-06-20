class PongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusElement = document.getElementById('status');
        this.leftScoreElement = document.querySelector('.left-score');
        this.rightScoreElement = document.querySelector('.right-score');
        
        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Canvas dimensions
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        
        // Paddle properties
        this.paddleWidth = 10;
        this.paddleHeight = 60;
        this.paddleSpeed = 5;
        
        // Ball properties
        this.ballSize = 8;
        this.ballSpeed = 4;
        
        // CPU difficulty (0 = easy, 1 = hard)
        this.cpuDifficulty = 0.8;
        
        // Initialize game objects
        this.initializeGame();
        
        // Input handling
        this.keys = {};
        this.setupInputHandling();
        
        // Start game loop
        this.gameLoop();
    }
    
    initializeGame() {
        // Left paddle (player 1)
        this.leftPaddle = {
            x: 20,
            y: this.canvasHeight / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: this.paddleSpeed,
            score: 0
        };
        
        // Right paddle (CPU)
        this.rightPaddle = {
            x: this.canvasWidth - 20 - this.paddleWidth,
            y: this.canvasHeight / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: this.paddleSpeed,
            score: 0
        };
        
        // Ball
        this.ball = {
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2,
            size: this.ballSize,
            speedX: this.ballSpeed,
            speedY: this.ballSpeed
        };
        
        this.resetBall();
    }
    
    setupInputHandling() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Start/pause game with spacebar
            if (e.key === ' ') {
                e.preventDefault();
                this.toggleGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    toggleGame() {
        if (!this.gameRunning) {
            this.startGame();
        } else {
            this.pauseGame();
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.statusElement.textContent = 'Game Running';
        this.statusElement.style.color = '#00ff00';
    }
    
    pauseGame() {
        this.gamePaused = !this.gamePaused;
        this.statusElement.textContent = this.gamePaused ? 'Game Paused' : 'Game Running';
        this.statusElement.style.color = this.gamePaused ? '#ffaa00' : '#00ff00';
    }
    
    resetBall() {
        this.ball.x = this.canvasWidth / 2;
        this.ball.y = this.canvasHeight / 2;
        
        // Random direction
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        this.ball.speedX = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.speedY = this.ballSpeed * Math.sin(angle) * (Math.random() > 0.5 ? 1 : -1);
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.updatePaddles();
        this.updateBall();
        this.checkCollisions();
        this.checkScoring();
    }
    
    updatePaddles() {
        // Left paddle movement (W/S keys) - Human player
        if (this.keys['w'] && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= this.leftPaddle.speed;
        }
        if (this.keys['s'] && this.leftPaddle.y < this.canvasHeight - this.leftPaddle.height) {
            this.leftPaddle.y += this.leftPaddle.speed;
        }
        
        // Right paddle movement - CPU controlled
        this.updateCPU();
    }
    
    updateCPU() {
        // Only move CPU paddle if ball is moving towards it
        if (this.ball.speedX > 0) {
            const paddleCenter = this.rightPaddle.y + this.rightPaddle.height / 2;
            const ballCenter = this.ball.y + this.ball.size / 2;
            
            // Add some prediction based on ball's Y speed
            const prediction = this.ball.speedY * 10;
            const targetY = ballCenter + prediction;
            
            // Add some randomness based on difficulty
            const randomOffset = (Math.random() - 0.5) * (1 - this.cpuDifficulty) * 50;
            const finalTarget = targetY + randomOffset;
            
            // Move towards target
            if (finalTarget > paddleCenter + 5) {
                if (this.rightPaddle.y < this.canvasHeight - this.rightPaddle.height) {
                    this.rightPaddle.y += this.rightPaddle.speed * this.cpuDifficulty;
                }
            } else if (finalTarget < paddleCenter - 5) {
                if (this.rightPaddle.y > 0) {
                    this.rightPaddle.y -= this.rightPaddle.speed * this.cpuDifficulty;
                }
            }
        }
    }
    
    updateBall() {
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Ball bounces off top and bottom walls
        if (this.ball.y <= 0 || this.ball.y >= this.canvasHeight - this.ball.size) {
            this.ball.speedY = -this.ball.speedY;
        }
    }
    
    checkCollisions() {
        // Ball collision with left paddle
        if (this.ball.x <= this.leftPaddle.x + this.leftPaddle.width &&
            this.ball.x + this.ball.size >= this.leftPaddle.x &&
            this.ball.y <= this.leftPaddle.y + this.leftPaddle.height &&
            this.ball.y + this.ball.size >= this.leftPaddle.y) {
            
            this.ball.speedX = Math.abs(this.ball.speedX);
            this.adjustBallAngle(this.leftPaddle);
        }
        
        // Ball collision with right paddle
        if (this.ball.x <= this.rightPaddle.x + this.rightPaddle.width &&
            this.ball.x + this.ball.size >= this.rightPaddle.x &&
            this.ball.y <= this.rightPaddle.y + this.rightPaddle.height &&
            this.ball.y + this.ball.size >= this.rightPaddle.y) {
            
            this.ball.speedX = -Math.abs(this.ball.speedX);
            this.adjustBallAngle(this.rightPaddle);
        }
    }
    
    adjustBallAngle(paddle) {
        // Calculate where the ball hit the paddle (0 = top, 1 = bottom)
        const hitPosition = (this.ball.y - paddle.y) / paddle.height;
        
        // Adjust the ball's Y speed based on where it hit the paddle
        const angle = (hitPosition - 0.5) * Math.PI / 3; // Max 30 degree angle
        this.ball.speedY = this.ballSpeed * Math.sin(angle);
        
        // Ensure minimum speed
        if (Math.abs(this.ball.speedY) < 1) {
            this.ball.speedY = this.ball.speedY > 0 ? 1 : -1;
        }
    }
    
    checkScoring() {
        // Ball goes past left paddle (CPU scores)
        if (this.ball.x <= 0) {
            this.rightPaddle.score++;
            this.rightScoreElement.textContent = this.rightPaddle.score;
            this.resetBall();
        }
        
        // Ball goes past right paddle (player scores)
        if (this.ball.x >= this.canvasWidth) {
            this.leftPaddle.score++;
            this.leftScoreElement.textContent = this.leftPaddle.score;
            this.resetBall();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw center line
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasWidth / 2, 0);
        this.ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.leftPaddle.width, this.leftPaddle.height);
        
        // Draw CPU paddle with different color
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.rightPaddle.width, this.rightPaddle.height);
        
        // Draw ball
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x + this.ball.size / 2, this.ball.y + this.ball.size / 2, this.ball.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pause overlay
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvasWidth / 2, this.canvasHeight / 2);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new PongGame();
}); 