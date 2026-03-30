/**
 * Bottom Navigation Component
 */
export class BottomNav {
    constructor(activeRoute) {
        this.activeRoute = activeRoute;
    }

    render() {
        const nav = document.createElement('nav');
        nav.className = 'bottom-nav bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]';
        
        const items = [
            { id: 'home', icon: 'home', label: 'Inicio' },
            { id: 'agenda', icon: 'calendar_month', label: 'Agenda' },
            { id: 'rsvp', icon: 'location_on', label: 'Lugar' },
            { id: 'gallery', icon: 'photo_library', label: 'Fotos' },
            { id: 'guestbook', icon: 'forum', label: 'Mensajes' }
        ];

        nav.innerHTML = items.map(item => `
            <div class="nav-item ${this.activeRoute === item.id ? 'active' : ''}" 
                 onclick="window.navigate('${item.id}')">
                <span class="material-symbols-outlined">${item.icon}</span>
                <span>${item.label}</span>
            </div>
        `).join('');

        return nav;
    }
}
