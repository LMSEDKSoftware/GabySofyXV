import { Auth } from '../utils/auth.js';

/**
 * Login Modal Component - PREMIUM REDESIGN
 * Una experiencia de acceso inmersiva y elegante.
 */
export class LoginModal {
    constructor(onSuccess) {
        this.onSuccess = onSuccess;
        this.element = null;
    }

    render() {
        const overlay = document.createElement('div');
        overlay.id = 'login-modal-overlay';
        // Overlay más oscuro y con blur intenso para aislar la experiencia
        overlay.className = 'fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in';
        
        overlay.innerHTML = `
            <div class="relative w-full max-w-[380px] group">
                <!-- Decoración Brillante detrás del modal -->
                <div class="absolute -top-10 -left-10 w-40 h-40 bg-primary/30 blur-[60px] rounded-full group-hover:bg-primary/40 transition-all duration-700"></div>
                <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-vibe-purple/20 blur-[60px] rounded-full"></div>

                <!-- Cuerpo del Modal (Glassmorphism) -->
                <div class="relative bg-white/20 backdrop-blur-2xl border border-white/40 p-10 rounded-[48px] shadow-[0_25px_80px_rgba(0,0,0,0.5)] overflow-hidden animate-scale-up">
                    
                    <!-- Botón Cerrar Minimal -->
                    <button id="close-modal" class="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all active:scale-90">
                        <span class="material-symbols-outlined text-white text-lg">close</span>
                    </button>

                    <!-- Header -->
                    <div class="text-center mb-10">
                        <div class="w-16 h-16 bg-white/10 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl border border-white/20">
                            <span class="material-symbols-outlined text-3xl text-white">magic_button</span>
                        </div>
                        <h2 class="font-display font-black text-3xl text-white leading-none uppercase tracking-tighter italic">Acceso<br>Privado</h2>
                        <div class="w-10 h-1 bg-primary/60 mx-auto mt-4 rounded-full"></div>
                    </div>
                    
                    <!-- Inputs de Cristal -->
                    <div class="space-y-6">
                        <div class="relative">
                            <label class="block text-[8px] font-black text-white/40 uppercase mb-2 tracking-[0.3em] ml-2">Tu Teléfono (MODO PRUEBA)</label>
                            <div class="relative">
                                <input type="tel" id="modal_phone" value="9999999999" maxlength="10" 
                                    class="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-6 text-white text-sm font-bold placeholder:text-white/20 focus:bg-white/20 focus:border-white/40 outline-none transition-all shadow-inner">
                                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-lg">phone_iphone</span>
                            </div>
                        </div>
                        
                        <div class="relative">
                            <label class="block text-[8px] font-black text-white/40 uppercase mb-2 tracking-[0.3em] ml-2">Código de Acceso (MODO PRUEBA)</label>
                            <div class="relative">
                                <input type="text" id="modal_code" value="GABY15" 
                                    class="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-6 text-white text-sm font-bold uppercase placeholder:text-white/20 focus:bg-white/20 focus:border-white/40 outline-none transition-all shadow-inner">
                                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-lg">lock_open</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botón de Acción con Gradiente -->
                    <button id="modal_submit" class="w-full mt-10 p-1 flex items-center justify-between rounded-3xl group active:scale-95 transition-all shadow-2xl overflow-hidden relative" style="background: linear-gradient(135deg, #FF3366 0%, #B829E3 100%);">
                        <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span class="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-8 z-10">DESBLOQUEAR</span>
                        <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl z-10 transition-transform group-hover:rotate-6">
                            <span class="material-symbols-outlined font-black">login</span>
                        </div>
                    </button>
                    
                    <p class="text-center mt-10 text-[9px] font-black text-white/30 uppercase tracking-[0.4em] leading-none">
                        STIFT · GABRIELLA SOFÍA
                    </p>
                </div>
            </div>
        `;

        this.element = overlay;
        this.attachEvents();
        return overlay;
    }

    attachEvents() {
        const btn = this.element.querySelector('#modal_submit');
        const closeBtn = this.element.querySelector('#close-modal');
        const phoneInput = this.element.querySelector('#modal_phone');
        const codeInput = this.element.querySelector('#modal_code');

        closeBtn.addEventListener('click', () => this.close());
        
        btn.addEventListener('click', () => {
            const phone = phoneInput.value;
            const code = codeInput.value;
            
            if (Auth.login(phone, code)) {
                // Éxito
                const card = this.element.querySelector('.animate-scale-up');
                card.style.transform = 'scale(1.05)';
                card.style.opacity = '0';
                card.style.transition = 'all 0.5s ease-in';

                setTimeout(() => {
                    this.close();
                    if (this.onSuccess) this.onSuccess();
                    window.dispatchEvent(new CustomEvent('auth-changed'));
                }, 400);
            } else {
                // Error (Shake animation)
                const card = this.element.querySelector('.animate-scale-up');
                card.classList.add('animate-shake');
                setTimeout(() => card.classList.remove('animate-shake'), 400);
            }
        });

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.close();
        });
    }

    close() {
        this.element.classList.add('animate-fade-out');
        setTimeout(() => {
            if(this.element.parentNode) this.element.remove();
        }, 300);
    }
}
