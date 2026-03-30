import { Auth } from '../utils/auth.js';
import { Interactions } from '../utils/interactions.js';

/**
 * Home Screen Component
 */
export class HomeScreen {
    async render() {
        const container = document.createElement('div');
        container.className = 'screen home-screen pb-24 yolo-bg min-h-screen';
        
        const isAuthenticated = Auth.isAuthenticated();
        const hasLiked = Interactions.hasLiked('home_main');
        
        container.innerHTML = `
            <!-- Conditional User Banner -->
            ${isAuthenticated ? `
            <div id="user-banner" class="px-6 pt-10 flex justify-between items-center bg-white/20 backdrop-blur-xl animate-fade-in">
                <div class="flex items-center gap-2">
                    <div class="w-10 h-10 rounded-full border-2 border-primary p-0.5">
                        <div class="w-full h-full rounded-full bg-cover bg-center" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC2A0FZoYwHivoZh3DXxHiGAQ3Ht8aEoAxiId4GkiMwaLvL1GL37RRAXRj2uX-vUnXYpf1dZr35EgInZpav_scVAETQ35G6dq1F8qDr60-M5M-SWajIk_PBd3APj9cVBCWhbxNfBd-tvETrXTmgNpC4irGAQxaJP2z56D40pi9ZkOVwaYtcpm47GItzBuQzpZBy1BlnX5e4lF5Rb6CanrL-8NAMYztcc_uEUVwP8bJbyeyh7NDmFxlAIVLxaVQIk2J6AcrXdxL7yP1E");'></div>
                    </div>
                    <div>
                        <p class="text-[12px] font-extrabold leading-none">Gaby_sofia.xv</p>
                        <p class="text-[10px] font-semibold opacity-60 uppercase tracking-tighter">Verified Main Character</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <span class="material-symbols-outlined text-2xl">favorite</span>
                    <span class="material-symbols-outlined text-2xl">send</span>
                </div>
            </div>
            ` : '<div class="pt-8"></div>'}

            <div class="px-6 pt-6">
                <!-- Main Post Card -->
                <div class="bg-white rounded-[32px] p-3 shadow-2xl tilt-left border-2 border-white/50 relative overflow-hidden mb-8">
                    <div class="aspect-[4/5] rounded-[24px] overflow-hidden relative group">
                        <div class="absolute inset-0 bg-center bg-cover" 
                             style='background-image: url("assets/img/img1.jpg");'></div>
                        
                        <!-- Real Liker -->
                        <div id="main_like_btn" class="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/20 cursor-pointer active:scale-90 transition-all">
                            <span class="material-symbols-outlined text-sm ${hasLiked ? 'fill-1 text-primary' : ''}" id="main_heart">favorite</span>
                            <span class="text-xs font-bold" id="main_like_count">${hasLiked ? '4.2k' : '4,204'} likes</span>
                        </div>
                    </div>
                    <div class="mt-5 px-2">
                        <p class="font-accent text-5xl leading-none text-primary italic">Gabriella Sofía</p>
                        <p class="mt-3 text-[14px] font-semibold text-black/60 leading-relaxed uppercase tracking-tighter">
                            Acompáñame a celebrar mis XV años en la ciudad de Monterrey. ¡Será una noche épica! 🦋✨
                        </p>
                    </div>
                </div>

                <!-- Action Grid (Solo Party info) -->
                <div class="mb-8 flex justify-center">
                    <div class="bg-secondary/40 backdrop-blur-md p-1 rounded-[32px] tilt-more shadow-xl h-36 w-full relative overflow-hidden group">
                        <!-- Hashtag Tag -->
                        <div class="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-lg border border-primary/10 flex items-center gap-1.5 z-10 animate-bounce-slow">
                            <span class="text-[9px] font-black italic text-primary tracking-tight">#GABY15</span>
                            <span class="material-symbols-outlined text-[10px] text-primary fill-1">auto_awesome</span>
                        </div>
                        
                        <div class="bg-white/40 h-full w-full rounded-[24px] flex flex-col items-center justify-center border-2 border-dashed border-white/60 p-4">
                            <span class="material-symbols-outlined text-3xl text-black mb-1">celebration</span>
                            <h2 class="text-[14px] font-black text-black uppercase tracking-[0.3em] leading-none mb-1">Save the Date</h2>
                            <p class="text-[20px] font-display font-black text-black leading-none mb-1">08.05.26</p>
                            <p class="text-[9px] font-bold text-black/50 uppercase tracking-[0.1em]">Party Night</p>
                        </div>
                    </div>
                </div>

                <!-- Countdown -->
                <div class="bg-black text-white p-7 rounded-[32px] flex items-center justify-between overflow-hidden relative shadow-2xl mb-10">
                    <div class="z-10 flex flex-col w-full">
                        <span class="text-[11px] font-black uppercase tracking-[0.2em] text-secondary/80 text-center">Loading Vibe...</span>
                        <div class="flex justify-between mt-3 pr-4">
                            <div class="flex flex-col items-center">
                                <span id="cd-days" class="text-3xl font-display font-black leading-none">00</span>
                                <span class="text-[8px] uppercase font-bold opacity-40 mt-1">Días</span>
                            </div>
                            <span class="text-2xl font-display font-black opacity-20">:</span>
                            <div class="flex flex-col items-center">
                                <span id="cd-hours" class="text-3xl font-display font-black leading-none">00</span>
                                <span class="text-[8px] uppercase font-bold opacity-40 mt-1">Hrs</span>
                            </div>
                            <span class="text-2xl font-display font-black opacity-20">:</span>
                            <div class="flex flex-col items-center">
                                <span id="cd-mins" class="text-3xl font-display font-black leading-none">00</span>
                                <span class="text-[8px] uppercase font-bold opacity-40 mt-1">Min</span>
                            </div>
                            <span class="text-2xl font-display font-black opacity-20">:</span>
                            <div class="flex flex-col items-center">
                                <span id="cd-secs" class="text-3xl font-display font-black leading-none text-primary">00</span>
                                <span class="text-[8px] uppercase font-bold opacity-40 mt-1">Seg</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Section - PUBLIC -->
            <div class="px-6 pb-20 pt-10 bg-white/40 backdrop-blur-3xl rounded-t-[48px] border-t-2 border-white shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
                <div class="flex flex-col items-center gap-3 mb-10 animate-fade-in text-center">
                    <h3 class="font-display font-black text-xs uppercase tracking-[0.4em] text-black/30 mb-2">Ubicación y Fecha</h3>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-xl">location_on</span>
                        <p class="font-display font-black text-[14px] tracking-tight uppercase">Las Lomas Eventos, Monterrey</p>
                    </div>
                    <p class="text-[12px] font-bold text-black/60 uppercase tracking-[0.2em] mb-2 leading-none">08 de mayo de 2026 · 19:30 HRS</p>
                </div>
                
                <button class="w-full bg-vibe-purple text-white rounded-full p-4 flex items-center justify-between group active:scale-95 transition-all shadow-2xl" onclick="window.navigate('rsvp')">
                    <span class="text-lg font-display font-black tracking-tighter uppercase ml-6">CONFIRMAR AQUÍ</span>
                    <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-vibe-purple group-hover:rotate-45 transition-transform">
                        <span class="material-symbols-outlined font-black">arrow_forward</span>
                    </div>
                </button>
                <p class="text-center mt-8 font-accent text-3xl text-vibe-purple tracking-wide">You're invited to the main character energy ✨</p>
            </div>
        `;

        // Render Navigation (ELIMINADO - Ahora es global de App.js)
        
        return container;
    }

    afterRender() {
        // Like Logical
        const likeBtn = document.getElementById('main_like_btn');
        const heartIcon = document.getElementById('main_heart');
        
        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                const res = Interactions.likePhoto('home_main');
                if (res.success) {
                    heartIcon.classList.add('fill-1', 'text-primary', 'animate-bounce');
                    document.getElementById('main_like_count').innerText = '4,205 likes';
                } else if (res.error === 'NEED_AUTH') {
                    window.navigate('rsvp'); // Trigger modal
                }
            });
        }

        // Countdown Logic
        const updateCountdown = () => {
            const now = new Date();
            const eventDate = new Date('2026-05-08T17:30:00');
            const diff = eventDate - now;
            
            if (diff > 0) {
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                
                if(document.getElementById('cd-days')) {
                    document.getElementById('cd-days').innerText = d.toString().padStart(2, '0');
                    document.getElementById('cd-hours').innerText = h.toString().padStart(2, '0');
                    document.getElementById('cd-mins').innerText = m.toString().padStart(2, '0');
                    document.getElementById('cd-secs').innerText = s.toString().padStart(2, '0');
                }
            }
        };

        const cdTimer = setInterval(updateCountdown, 1000);
        updateCountdown();
    }
}
