import { BottomNav } from '../components/BottomNav.js';

/**
 * RSVP Screen Component
 */
export class RSVPScreen {
    async render() {
        const container = document.createElement('div');
        container.className = 'screen rsvp-screen pb-24 bg-[#F8F7FF] min-h-screen';
        
        container.innerHTML = `
            <!-- Map Card -->
            <div class="px-6 pt-10">
                <div class="bg-white rounded-[40px] overflow-hidden shadow-2xl relative mb-10 border border-white/50">
                    <div class="h-64 bg-[#E5E9FF] flex items-center justify-center relative cursor-pointer group" 
                         onclick="window.open('https://maps.app.goo.gl/xwHmCSVZ1tNnt1GE8','_blank')">
                        <!-- Abstract Map Visual -->
                        <div class="absolute inset-0 opacity-20">
                            <svg class="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                                <rect width="400" height="300" fill="#e5e9ff"/>
                                <path d="M0,150 Q200,50 400,150" stroke="#a0b0ff" stroke-width="20" fill="none"/>
                                <path d="M200,0 L200,300" stroke="#a0b0ff" stroke-width="15" fill="none"/>
                            </svg>
                        </div>
                        <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,51,102,0.4)] animate-bounce relative z-10">
                            <span class="material-symbols-outlined text-white text-4xl">location_on</span>
                        </div>
                        <div class="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Ver en Google Maps</div>
                    </div>
                    <div class="p-8">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sede del Evento</span>
                        </div>
                        <h2 class="font-display font-black text-2xl uppercase tracking-tighter leading-tight">Las Lomas Eventos y Convenciones</h2>
                        <p class="text-[12px] font-semibold text-black/40 uppercase tracking-widest mt-2 leading-relaxed">
                            Av. Ignacio Morones Prieto 2808,<br/>Monterrey, N.L.
                        </p>
                        <button class="mt-6 w-full py-5 bg-black text-white font-black text-sm uppercase tracking-[0.2em] rounded-[24px] 
                            active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                            onclick="window.open('https://maps.app.goo.gl/xwHmCSVZ1tNnt1GE8','_blank')">
                            <span class="material-symbols-outlined text-lg">map</span>
                            ¿CÓMO LLEGO?
                        </button>
                    </div>
                </div>

                <!-- RSVP Form -->
                <div class="space-y-10">
                    <div class="bg-white/60 backdrop-blur-xl p-8 rounded-[40px] border border-white shadow-xl">
                        <h3 class="font-display font-black text-2xl uppercase tracking-tighter mb-6">¿Nos acompañas?</h3>
                        <div class="flex gap-4">
                            <button class="flex-1 py-4 px-6 rounded-[24px] bg-primary text-white font-black text-sm uppercase tracking-tighter 
                                border-2 border-primary flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all" id="rsvp_yes">
                                <span class="material-symbols-outlined text-lg">done_all</span>
                                ¡SÍ!
                            </button>
                            <button class="flex-1 py-4 px-6 rounded-[24px] bg-white text-black/30 font-black text-sm uppercase tracking-tighter 
                                border-2 border-gray-100 flex items-center justify-center gap-2 active:scale-95 transition-all" id="rsvp_no">
                                <span class="material-symbols-outlined text-lg">close</span>
                                NO PUEDO
                            </button>
                        </div>
                    </div>

                    <div id="rsvp_form_details" class="animate-fade-in">
                        <div class="flex items-center justify-between mb-4 px-4">
                            <h3 class="font-display font-black text-sm uppercase tracking-[0.3em] text-black/30">Reservación</h3>
                            <span class="material-symbols-outlined text-black/20 text-lg">airline_seat_recline_extra</span>
                        </div>
                        <div class="grid grid-cols-4 gap-3 mb-10">
                            <button class="seat-picker py-5 rounded-[20px] bg-white border-2 border-gray-100 font-bold text-lg active:scale-95 transition-all data-seat='1'">1</button>
                            <button class="seat-picker py-5 rounded-[20px] bg-black text-white border-2 border-black font-bold text-lg active:scale-95 transition-all data-seat='2'">2</button>
                            <button class="seat-picker py-5 rounded-[20px] bg-white border-2 border-gray-100 font-bold text-lg active:scale-95 transition-all data-seat='3'">3</button>
                            <button class="seat-picker py-5 rounded-[20px] bg-white border-2 border-gray-100 font-bold text-lg active:scale-95 transition-all data-seat='4+'">4+</button>
                        </div>

                        <div class="flex items-center justify-between mb-4 px-4">
                            <h3 class="font-display font-black text-sm uppercase tracking-[0.3em] text-black/30">Preferencias</h3>
                        </div>
                        <div class="bg-white rounded-[32px] p-2 border border-white shadow-2xl">
                            <div class="flex items-center gap-4 p-5">
                                <span class="material-symbols-outlined text-primary">flatware</span>
                                <input type="text" placeholder="Alergias o dieta (ej. Vegano)" 
                                    class="w-full bg-transparent border-none outline-none font-bold text-xs text-black/80 placeholder:text-black/20 uppercase tracking-widest">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-14 pb-12">
                    <button class="w-full bg-primary text-white rounded-full p-5 flex items-center justify-between group active:scale-95 transition-all shadow-2xl" 
                        onclick="this.innerText='✨ ASISTENCIA CONFIRMADA'; setTimeout(()=>window.navigate('home'), 1500)">
                        <span class="text-xl font-display font-black tracking-tighter uppercase ml-6">GUARDAR RSVP</span>
                        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary">
                            <span class="material-symbols-outlined font-black">favorite</span>
                        </div>
                    </button>
                    <p class="text-center mt-8 text-[10px] font-bold text-black/20 uppercase tracking-[0.4em] mb-12">
                        FECHA LÍMITE: 20 DE ABRIL
                    </p>
                </div>
            </div>
        `;

        // Render Navigation
        const footerNav = new BottomNav('rsvp').render();
        container.appendChild(footerNav);

        return container;
    }

    afterRender() {
        const seats = document.querySelectorAll('.seat-picker');
        seats.forEach(seat => {
            seat.addEventListener('click', () => {
                seats.forEach(s => {
                    s.classList.remove('bg-black', 'text-white', 'border-black');
                    s.classList.add('bg-white', 'text-black', 'border-gray-100');
                });
                seat.classList.add('bg-black', 'text-white', 'border-black');
            });
        });
    }
}
