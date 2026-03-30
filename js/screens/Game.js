import { BottomNav } from '../components/BottomNav.js';

/**
 * Game Screen Component (Gaby Crush)
 * Motor Match-3 simplificado y visualmente impactante.
 */
export class GameScreen {
    constructor() {
        this.boardSize = 7;
        this.colors = ['💖', '💎', '🌸', '🦋', '🍬', '✨'];
        this.board = [];
        this.score = 0;
        this.lives = 5;
    }

    async render() {
        const container = document.createElement('div');
        container.className = 'screen game-screen pb-24 bg-[#0a0614] min-h-screen relative overflow-hidden flex flex-col items-center';
        
        container.innerHTML = `
            <!-- Background effects -->
            <div class="absolute inset-0 bg-gradient-to-b from-[#1a1033] to-[#0a0614]"></div>
            <div class="absolute top-0 w-full h-80 bg-primary/20 blur-[120px] -translate-y-1/2 rounded-full"></div>

            <!-- Stats Bar -->
            <div class="mt-12 px-8 w-full flex justify-between items-end relative z-10 mb-8">
                <div>
                    <h1 class="font-display font-black text-3xl text-white tracking-widest uppercase">Gaby Crush</h1>
                    <div id="score_display" class="font-bold text-secondary text-lg mt-1 tracking-[0.2em]">00000</div>
                </div>
                <div class="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                    <span class="text-xs font-bold text-white/50 uppercase">Vidas</span>
                    <div id="lives_display" class="text-xl font-black text-primary">❤️ x 5</div>
                </div>
            </div>

            <!-- Game Board Container -->
            <div class="relative z-10 px-4 w-full flex justify-center">
                <div id="game_board" class="grid grid-cols-7 gap-1 bg-white/5 p-2 rounded-2xl backdrop-blur-xl border border-white/10 shadow-3xl w-full max-w-[380px] aspect-square">
                    <!-- Board items injected by JS -->
                </div>
            </div>

            <!-- Controls -->
            <div class="mt-10 relative z-10 px-8 w-full">
                <div class="bg-gradient-to-r from-primary/10 via-vibe-purple/10 to-secondary/10 p-4 rounded-3xl border border-white/5 text-center">
                    <p class="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Combina 3 o más elementos iguales ✨</p>
                </div>
            </div>
        `;

        // Render Navigation
        const footerNav = new BottomNav('game').render();
        container.appendChild(footerNav);

        return container;
    }

    afterRender() {
        this.initBoard();
        this.drawBoard();
    }

    initBoard() {
        this.board = [];
        for (let r = 0; r < this.boardSize; r++) {
            const row = [];
            for (let c = 0; c < this.boardSize; c++) {
                row.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
            }
            this.board.push(row);
        }
    }

    drawBoard() {
        const boardEl = document.getElementById('game_board');
        if (!boardEl) return;
        boardEl.innerHTML = '';
        
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'game-tile flex items-center justify-center text-3xl bg-white/5 rounded-lg border border-white/5 cursor-pointer active:scale-95 transition-all';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.dataset.color = this.board[r][c];
                cell.innerHTML = this.board[r][c];
                
                cell.onclick = () => this.onTileClick(r, c);
                boardEl.appendChild(cell);
            }
        }
    }

    onTileClick(r, c) {
        // Lógica simplificada: Eliminar el seleccionado y sus adyacentes del mismo color (Match)
        const targetColor = this.board[r][c];
        const matches = this.findMatches(r, c, targetColor);

        if (matches.length >= 3) {
            this.score += matches.length * 100;
            this.updateScore();
            this.removeMatches(matches);
            this.drawBoard();
        } else {
            // Visual feedback of "no match"
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            cell.classList.add('animate-shake');
            setTimeout(() => cell.classList.remove('animate-shake'), 400);
        }
    }

    findMatches(r, c, color, visited = new Set()) {
        const key = `${r},${c}`;
        if (r < 0 || r >= this.boardSize || c < 0 || c >= this.boardSize || 
            this.board[r][c] !== color || visited.has(key)) return [];
        
        visited.add(key);
        let matches = [key];
        
        matches = matches.concat(this.findMatches(r + 1, c, color, visited));
        matches = matches.concat(this.findMatches(r - 1, c, color, visited));
        matches = matches.concat(this.findMatches(r, c + 1, color, visited));
        matches = matches.concat(this.findMatches(r, c - 1, color, visited));
        
        return matches;
    }

    removeMatches(matches) {
        matches.forEach(m => {
            const [r, c] = m.split(',').map(Number);
            this.board[r][c] = this.colors[Math.floor(Math.random() * this.colors.length)];
        });
    }

    updateScore() {
        const scoreEl = document.getElementById('score_display');
        if (scoreEl) scoreEl.innerText = this.score.toString().padStart(5, '0');
    }
}
