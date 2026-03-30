import { Auth } from './utils/auth.js';
import { HomeScreen } from './screens/Home.js';
import { AgendaScreen } from './screens/Agenda.js';
import { RSVPScreen } from './screens/RSVP.js';
import { GalleryScreen } from './screens/Gallery.js';
import { GameScreen } from './screens/Game.js';
import { GuestbookScreen } from './screens/Guestbook.js';
import { LoginModal } from './components/LoginModal.js';
import { BottomNav } from './components/BottomNav.js';
import { Security } from './utils/Security.js';

/**
 * App Controller / Router
 */

const routes = {
    home: HomeScreen,
    agenda: AgendaScreen,
    rsvp: RSVPScreen,
    gallery: GalleryScreen,
    game: GameScreen,
    guestbook: GuestbookScreen
};

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.navElement = document.getElementById('nav_container');
        if(!this.navElement) {
            this.navElement = document.createElement('div');
            this.navElement.id = 'nav_container';
            document.body.appendChild(this.navElement);
        }
        this.currentScreen = null;
        this.init();
    }

    async init() {
        // Al iniciar, cargamos Home por defecto para que sea pública
        this.navigate('home');

        // Manejar botones de navegación global
        window.addEventListener('navigate', (e) => {
            this.handleNavigation(e.detail.route);
        });
    }

    /**
     * Valida si el usuario puede acceder a una ruta
     * @param {string} routeId 
     */
    handleNavigation(routeId) {
        // Rutas que todos pueden ver sin login
        const publicRoutes = ['home', 'agenda', 'gallery', 'game', 'guestbook'];
        
        if (publicRoutes.includes(routeId) || Auth.isAuthenticated()) {
            this.navigate(routeId);
        } else {
            // Solo RSVP pide login ahora
            const modal = new LoginModal(() => {
                this.navigate(routeId);
            });
            document.body.appendChild(modal.render());
        }
    }

    /**
     * Navega a una pantalla específica
     * @param {string} routeId 
     */
    async navigate(routeId) {
        // Reseteo inmediato de scroll al empezar la navegación
        this.appElement.scrollTop = 0;
        window.scrollTo(0, 0);

        // Rastro de navegación para evitar que pantallas se encimen en procesos asíncronos
        this.lastRequestedRoute = routeId;
        
        const ScreenClass = routes[routeId] || HomeScreen;
        const screen = new ScreenClass();
        
        // Renderizamos primero (esto es asíncrono)
        const content = await screen.render();
        
        // Si mientras renderizábamos se solicitó otra ruta, cancelamos este render para no encimar pantallas
        if (this.lastRequestedRoute !== routeId) return;

        // Limpiamos e inyectamos (síncrono)
        this.appElement.innerHTML = '';
        content.classList.add('screen-animate');
        this.appElement.appendChild(content);
        
        // Renderizamos Menú Inferior de forma global
        this.renderGlobalNav(routeId);

        // Ejecutamos lógica post-render si existe
        if (screen.afterRender) {
            screen.afterRender();
        }
        
        this.appElement.scrollTop = 0;
        window.scrollTo(0, 0);
        this.currentScreen = routeId;
    }

    renderGlobalNav(routeId) {
        this.navElement.innerHTML = '';
        const nav = new BottomNav(routeId).render();
        this.navElement.appendChild(nav);
    }
}

// Inicializar la aplicación
window.addEventListener('DOMContentLoaded', () => {
    new App();
});

// Función de navegación global para onclick simple
window.navigate = (route) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { route } }));
};
