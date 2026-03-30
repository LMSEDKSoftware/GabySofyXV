import { BottomNav } from '../components/BottomNav.js';

/**
 * Agenda Screen Component
 */
export class AgendaScreen {
    async render() {
        const container = document.createElement('div');
        container.className = 'screen agenda-screen pb-24 bg-[#FCF8FF] min-h-screen';
        
        container.innerHTML = `
            <!-- Top Header -->
            <div class="px-8 pt-12 pb-8 bg-white/40 backdrop-blur-xl border-b border-white/20">
                <h1 class="font-display font-black text-3xl text-black tracking-tighter uppercase">Itinerario</h1>
                <p class="font-accent text-xl text-primary mt-1">Viernes, 08 de Mayo de 2026</p>
            </div>

            <!-- Timeline -->
            <div class="px-8 mt-10 space-y-12 relative">
                <!-- Vertical Line -->
                <div class="absolute left-12 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-vibe-purple to-secondary opacity-20"></div>

                <div class="flex items-start gap-6 relative z-10">
                    <div class="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-xl shrink-0 border border-gray-100">⛪</div>
                    <div>
                        <div class="flex items-baseline gap-2">
                            <h3 class="font-bold text-lg text-black">Solemne Misa</h3>
                            <span class="text-[11px] font-black text-primary uppercase">17:30</span>
                        </div>
                        <p class="text-[13px] text-black/60 font-black leading-relaxed mt-1 uppercase">
                            Catedral de Monterrey
                        </p>
                        <p class="text-[11px] text-black/40 font-medium leading-relaxed mt-1">
                            Centro, Monterrey, N.L.
                        </p>
                    </div>
                </div>

                <div class="flex items-start gap-6 relative z-10">
                    <div class="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-xl shrink-0 border border-gray-100">🍸</div>
                    <div>
                        <div class="flex items-baseline gap-2">
                            <h3 class="font-bold text-lg text-black">Cocktail</h3>
                            <span class="text-[11px] font-black text-primary uppercase">18:30</span>
                        </div>
                        <p class="text-[13px] text-black/60 font-black leading-relaxed mt-1 uppercase">
                            Bienvenida a Invitados
                        </p>
                    </div>
                </div>

                <div class="flex items-start gap-6 relative z-10">
                    <div class="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-xl shrink-0 border border-gray-100">✨</div>
                    <div>
                        <div class="flex items-baseline gap-2">
                            <h3 class="font-bold text-lg text-black">Recepción</h3>
                            <span class="text-[11px] font-black text-primary uppercase">19:30</span>
                        </div>
                        <p class="text-[13px] text-black/60 font-black leading-relaxed mt-1 uppercase">
                            Las Lomas Eventos y Convenciones
                        </p>
                        <p class="text-[11px] text-black/40 font-medium leading-relaxed mt-1">
                            Salón Imperial
                        </p>
                    </div>
                </div>

                <div class="flex items-start gap-6 relative z-10">
                    <div class="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-xl shrink-0 border border-gray-100">🔥</div>
                    <div>
                        <div class="flex items-baseline gap-2">
                            <h3 class="font-bold text-lg text-black">After Party</h3>
                            <span class="text-[11px] font-black text-primary uppercase">00:00</span>
                        </div>
                        <p class="text-[13px] text-black/60 font-black leading-relaxed mt-1 uppercase">
                            Hasta que el cuerpo aguante
                        </p>
                    </div>
                </div>
            </div>

            <!-- Dress Code Card -->
            <div class="px-6 mt-16 mb-8">
                <div class="bg-black text-white p-6 rounded-[32px] shadow-2xl relative overflow-hidden">
                    <div class="absolute -right-4 -bottom-4 text-8xl opacity-10">👔</div>
                    <h3 class="font-display font-black text-xl uppercase tracking-tighter mb-2">Dress Code</h3>
                    <p class="text-sm font-medium text-white/70 leading-relaxed uppercase tracking-widest leading-loose">
                        FORMAL RIGUROSO (VESTIDO DE NOCHE / TRAJE)
                    </p>
                    <div class="mt-4 flex gap-2">
                        <div class="w-4 h-4 rounded-full bg-black border border-white/20"></div>
                        <div class="w-4 h-4 rounded-full bg-white/10"></div>
                        <p class="text-[10px] font-bold opacity-40 uppercase ml-2">Colores Sugeridos</p>
                    </div>
                </div>
            </div>
        `;

        // Render Navigation
        const footerNav = new BottomNav('agenda').render();
        container.appendChild(footerNav);

        return container;
    }
}
