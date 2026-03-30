/**
 * Security & Privacy Protector Utility
 */
export class Security {
    static init() {
        this.disableContextMenu();
        this.disableKeyboardShortcuts();
        this.enableBlurOnFocusLoss();
        this.disablePrint();
    }

    /**
     * Bloquea el menú de click derecho para evitar guardado de imágenes
     */
    static disableContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        }, false);
    }

    /**
     * Bloquea atajos comunes como Ctrl+S, Ctrl+P, Ctrl+C y Ctrl+I (Inspeccionar)
     */
    static disableKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check for Ctrl/Cmd (⌘) keys
            const cmd = e.metaKey || e.ctrlKey;
            
            // S (Save), P (Print), C (Copy), I (Inspect), U (View Source), J (Console)
            if (cmd && ['s', 'p', 'c', 'i', 'u', 'j'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                return false;
            }

            // F12 (DevTools)
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * Aplica un desenfoque si la pestaña pierde el foco (ej: al abrir herramienta de recorte)
     */
    static enableBlurOnFocusLoss() {
        const blurStyle = document.createElement('style');
        blurStyle.innerHTML = `
            .blur-protector { 
                filter: blur(40px) !important;
                pointer-events: none !important;
                transition: filter 0.3s ease;
            }
        `;
        document.head.appendChild(blurStyle);

        window.addEventListener('blur', () => {
            document.getElementById('app').classList.add('blur-protector');
        });

        window.addEventListener('focus', () => {
             document.getElementById('app').classList.remove('blur-protector');
        });
    }

    /**
     * Bloquea la impresión de la página o genera una hoja en blanco
     */
    static disablePrint() {
        const printStyle = document.createElement('style');
        printStyle.innerHTML = `
            @media print {
                body { display: none !important; }
            }
        `;
        document.head.appendChild(printStyle);
    }
}
