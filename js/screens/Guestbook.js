import { Auth } from '../utils/auth.js';

/**
 * Guestbook Screen Component
 * Aplicando la arquitectura Definitiva (Flexbox + Aislamiento de Scroll)
 */
export class GuestbookScreen {
    constructor() {
        this.messages = [
            { id: 1, name: 'Tía María', text: '¡Te ves radiante hoy, Gabriella! Que este año sea tan hermoso como tú. Estamos muy orgullosos de la joven en la que te has convertido.', time: 'Hace 2 horas', likes: 24, approved: true },
            { id: 2, name: 'Familia Rodríguez', text: '¡Por una noche mágica! Disfruta cada segundo de tu día especial. ¡Te queremos mucho! 🦋', time: 'Hace 5 horas', likes: 12, approved: true },
            { id: 3, name: 'Tío Carlos y Sofía', text: 'Verte crecer ha sido una alegría. Feliz Quinceañera a nuestra sobrina favorita. ¡Sueña en grande, el mundo es tuyo!', time: 'Ayer', likes: 8, approved: true },
            { id: 4, name: 'Daniela & Juan', text: '¡A darle con todo al baile! Estamos listos para celebrar contigo. ¡Felicidades Gaby!', time: 'Ayer', likes: 5, approved: true },
            { id: 5, name: 'Abuelitos Pérez', text: 'Nuestra niña hermosa, que Dios te bendiga siempre en esta nueva etapa. Te amamos con todo el corazón.', time: 'Ayer', likes: 45, approved: true },
            { id: 6, name: 'Primos de Mty', text: '¡La mejor fiesta del año! No podemos esperar para verte brillar en la pista. ✨', time: 'Hace 2 días', likes: 15, approved: true },
            { id: 7, name: 'Sofía Valenzuela', text: 'Amiga, mil felicidades. Gracias por dejarme ser parte de este momento tan especial. ¡Estás guapísima!', time: 'Hace 2 días', likes: 21, approved: true },
            { id: 8, name: 'Familia Mendoza', text: 'Deseándote lo mejor en tus XV años. Que la alegría de hoy te acompañe siempre.', time: 'Hace 3 días', likes: 9, approved: true },
            { id: 9, name: 'Coach Ricardo', text: '¡Muchas felicidades Gabriella! A seguir alcanzando todas tus metas con esa misma energía.', time: 'Hace 1 semana', likes: 3, approved: true },
            { id: 10, name: 'Mis Amigas del Cole', text: '¡XV Gaby Vibe! Hoy se rompe la pista. Te queremos mil, disfruta tu noche mágica. 💖🔥', time: 'Hace 1 semana', likes: 67, approved: true }
        ];
    }

    async render() {
        const container = document.createElement('div');
        // ARQUITECTURA: El contenedor bloquea el scroll global y usa Flexbox para control absoluto
        container.className = 'screen guestbook-screen yolo-bg h-screen flex flex-col overflow-hidden relative';
        
        container.innerHTML = `
            <!-- ZONA DE SCROLL AISLADA -->
            <!-- Contiene el Header (que se mueve) y los Mensajes -->
            <div class="flex-1 overflow-y-auto px-6 pt-16 pb-[300px]" id="messages_feed">
                
                <!-- Top Header - DENTRO DEL SCROLL PARA QUE SE MUEVA -->
                <div class="mb-10 animate-fade-in px-2">
                    <h1 class="font-display font-black text-4xl text-black tracking-tighter uppercase leading-none">Dedicatorias</h1>
                    <div class="flex items-center gap-2 mt-4 bg-white/40 px-4 py-2 rounded-full w-fit border border-white/60">
                        <span class="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                        <p class="font-black text-[10px] text-primary uppercase tracking-[0.2em] leading-none">${this.messages.length} Mensajes para Gaby</p>
                    </div>
                </div>

                <!-- Lista de Mensajes -->
                <div class="space-y-6">
                    ${this.renderMessages()}
                </div>
                
                <!-- Spacer Visual al final -->
                <div class="h-20"></div>
            </div>

            <!-- BARRA DE MENSAJE FIJA (FUERA DEL FLUJO DE SCROLL) -->
            <!-- Anclada justo a 90px (2px de separación con el BottomNav) -->
            <div class="fixed bottom-[90px] left-0 right-0 max-w-[430px] mx-auto px-5 z-[999] pointer-events-none">
                <div class="bg-white/95 backdrop-blur-3xl border-2 border-white/60 rounded-[35px] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex items-center gap-3 pointer-events-auto">
                    <div class="flex-1 relative">
                        <input type="text" id="guest_msg_input" placeholder="ESCRIBE TU DEDICATORIA..." 
                            class="w-full bg-black/5 border-none rounded-2xl py-3.5 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all shadow-inner">
                    </div>
                    <button id="send_msg_btn" class="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 shrink-0 active:scale-90 transition-all">
                        <span class="material-symbols-outlined text-xl">send</span>
                    </button>
                </div>
            </div>
        `;

        return container;
    }

    renderMessages() {
        return this.messages.filter(m => m.approved).map(msg => `
            <div class="glass p-7 rounded-[40px] border border-white/80 shadow-xl animate-fade-in relative transition-all duration-500">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="font-black text-sm text-black uppercase tracking-tighter leading-none">${msg.name}</p>
                        <p class="text-[8px] font-bold text-black/40 uppercase tracking-widest mt-2">${msg.time}</p>
                    </div>
                </div>
                <p class="text-[14px] font-medium text-black/80 leading-relaxed italic pr-2">
                    "${msg.text}"
                </p>
                <div class="mt-6 flex justify-between items-center">
                   <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 bg-primary/30 rounded-full"></div>
                        <span class="text-[8px] font-black text-black/20 uppercase tracking-[0.25em]">Deseo de Gala</span>
                   </div>
                   <div class="flex items-center gap-2 group/like cursor-pointer active:scale-90 transition-all heart-btn" data-id="${msg.id}">
                        <div class="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center border border-white shadow-sm transition-colors group-hover/like:bg-primary/20">
                            <span class="material-symbols-outlined text-lg ${msg.likes > 0 ? 'fill-1 text-primary' : 'text-black/10'}">favorite</span>
                        </div>
                        <span class="text-[11px] font-black italic text-black/40">${msg.likes || 0}</span>
                   </div>
                </div>
            </div>
        `).join('');
    }

    afterRender() {
        const sendBtn = document.getElementById('send_msg_btn');
        const input = document.getElementById('guest_msg_input');

        if (sendBtn) {
            sendBtn.onclick = () => {
                const text = input.value.trim();
                if (!text) return;
                const user = Auth.getUser();
                if (!user) { alert('Sesión requerida.'); return; }
                input.value = '';
                // Toast de confirmación
                const notice = document.createElement('div');
                notice.className = 'fixed top-40 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest z-[2000] shadow-2xl animate-scale-up text-center border border-white/20';
                notice.innerHTML = `✨ ¡Gracias ${user.name}!<br><span class="opacity-50 mt-1 block text-[8px]">En proceso de revisión</span>`;
                document.body.appendChild(notice);
                setTimeout(() => notice.remove(), 4000);
            };
        }

        document.querySelectorAll('.heart-btn').forEach(btn => {
            btn.onclick = () => {
                const icon = btn.querySelector('.material-symbols-outlined');
                const count = btn.querySelector('span:last-child');
                if (!icon.classList.contains('fill-1')) {
                    icon.classList.add('fill-1', 'text-primary', 'animate-bounce');
                    count.innerText = parseInt(count.innerText) + 1;
                    count.classList.add('text-primary');
                }
            };
        });
    }
}
