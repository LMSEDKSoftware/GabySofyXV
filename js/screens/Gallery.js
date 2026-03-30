import { BottomNav } from '../components/BottomNav.js';
import { Interactions } from '../utils/interactions.js';
import { Auth } from '../utils/auth.js';

/**
 * Gallery Screen Component
 */
export class GalleryScreen {
    constructor() {
        this.currentOffset = 0;
        this.batchSize = 4;
        this.currentType = 'official';
        this.officialPhotos = Array.from({ length: 16 }, (_, i) => `galeria-${String(i + 1).padStart(2, '0')}.jpg`);
    }

    async render() {
        const container = document.createElement('div');
        container.className = 'screen gallery-screen bg-white min-h-screen';
        container.innerHTML = `
            <div class="px-8 pt-12 pb-6 bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-100">
                <h1 class="font-display font-black text-3xl text-black uppercase tracking-tighter">Galería</h1>
                <div class="flex gap-6 mt-4">
                    <button class="gal-tab active text-sm font-bold uppercase tracking-widest border-b-2 border-primary pb-1" id="tab_official">Oficial</button>
                    <button class="gal-tab text-sm font-bold uppercase tracking-widest text-black/30 pb-1" id="tab_guests">Invitados</button>
                </div>
            </div>
            <div class="px-4 mt-6 grid grid-cols-2 gap-4" id="gallery_grid"></div>
            <div id="sentinel" class="h-20 flex items-center justify-center p-10">
                <div class="flex gap-2 animate-pulse" id="gallery_loader">
                    <div class="w-2 h-2 bg-primary rounded-full"></div>
                    <div class="w-2 h-2 bg-primary rounded-full" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-primary rounded-full" style="animation-delay: 0.4s"></div>
                </div>
            </div>
            <div id="fab_upload" class="hidden">
                <button class="fixed bottom-28 right-8 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30 group" id="btn_trigger_upload">
                    <span class="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">add_a_photo</span>
                </button>
            </div>
        `;
        return container;
    }

    loadMore() {
        const grid = document.getElementById('gallery_grid');
        if (!grid) return;
        const nextBatch = this.officialPhotos.slice(this.currentOffset, this.currentOffset + this.batchSize);
        if (nextBatch.length === 0) {
            if (document.getElementById('gallery_loader')) document.getElementById('gallery_loader').style.display = 'none';
            return;
        }

        nextBatch.forEach((photo, i) => {
            const index = this.currentOffset + i;
            const item = document.createElement('div');
            item.className = 'aspect-[3/4] rounded-[24px] overflow-hidden shadow-xl bg-gray-100 relative cursor-pointer';
            item.style.marginTop = index % 2 === 1 ? '24px' : '0';
            item.style.transform = 'translateZ(0)';
            const fullPath = `assets/img/oficial_gallery/final/${encodeURIComponent(photo)}`;
            item.onclick = () => window.showPhotoModal(fullPath);
            
            const skeleton = document.createElement('div');
            skeleton.className = 'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10';
            skeleton.innerHTML = `<span class="material-symbols-outlined text-gray-300">image</span>`;
            
            const img = document.createElement('img');
            img.src = fullPath;
            img.className = 'w-full h-full object-cover opacity-0 transition-opacity duration-500';
            img.onload = () => { img.classList.remove('opacity-0'); skeleton.remove(); };
            img.onerror = () => { skeleton.innerHTML = `<span class="material-symbols-outlined text-red-300">broken_image</span>`; };

            item.appendChild(skeleton);
            item.appendChild(img);
            grid.appendChild(item);
        });
        this.currentOffset += this.batchSize;
    }

    afterRender() {
        const tabs = document.querySelectorAll('.gal-tab');
        const grid = document.getElementById('gallery_grid');
        const fab = document.getElementById('fab_upload');
        const loader = document.getElementById('gallery_loader');
        const triggerBtn = document.getElementById('btn_trigger_upload');

        if (triggerBtn) {
            triggerBtn.onclick = () => {
                if (!Auth.isAuthenticated()) {
                    // Si no está logueado, redirigimos a RSVP para mostrar el modal de acceso
                    window.navigate('rsvp');
                } else {
                    // Simulación de carga con notificación de moderación
                    const notice = document.createElement('div');
                    notice.className = 'fixed top-32 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest z-[3000] shadow-2xl animate-scale-up text-center border border-white/20 px-6';
                    notice.innerHTML = `✨ ¡Gracias!<br><span class="opacity-50 mt-1 block">Tu foto será autorizada por el administrador</span>`;
                    document.body.appendChild(notice);
                    setTimeout(() => notice.remove(), 4000);
                }
            };
        }

        window.showPhotoModal = (imgSrc) => {
            const hasLiked = Interactions.hasLiked(imgSrc);
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in p-4';
            modal.innerHTML = `
                <div class="relative max-w-full max-h-full">
                    <button class="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]" 
                            onclick="this.parentElement.parentElement.remove()">
                        CERRAR <span class="material-symbols-outlined">close</span>
                    </button>
                    <div class="relative">
                        <img src="${imgSrc}" class="max-w-full max-h-[75vh] rounded-2xl shadow-2xl border border-white/10">
                        <div id="modal_like_btn" class="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40 cursor-pointer active:scale-90 transition-all">
                            <span class="material-symbols-outlined ${hasLiked ? 'fill-1 text-primary' : ''}" id="modal_heart">favorite</span>
                        </div>
                    </div>
                    <p class="mt-6 text-center text-white font-accent text-3xl italic">Gabriella Sofía</p>
                </div>
            `;
            const mBtn = modal.querySelector('#modal_like_btn');
            const mHeart = modal.querySelector('#modal_heart');
            mBtn.onclick = () => {
                const res = Interactions.likePhoto(imgSrc);
                if (res.success) mHeart.classList.add('fill-1', 'text-primary', 'animate-bounce');
                else if (res.error === 'NEED_AUTH') { modal.remove(); window.navigate('rsvp'); }
            };
            modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
            document.body.appendChild(modal);
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && this.currentType === 'official') this.loadMore();
        }, { rootMargin: '200px' });
        if (document.getElementById('sentinel')) observer.observe(document.getElementById('sentinel'));

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => { t.classList.remove('active', 'border-primary'); t.classList.add('text-black/30'); });
                tab.classList.add('active', 'border-primary');
                this.currentType = tab.id === 'tab_official' ? 'official' : 'guests';
                fab.classList.toggle('hidden', this.currentType !== 'guests');
                grid.innerHTML = '';
                this.currentOffset = 0;
                if (loader) loader.style.display = this.currentType === 'official' ? 'flex' : 'none';
                if (this.currentType === 'official') this.loadMore();
                else grid.innerHTML = '<p class="col-span-2 text-center py-24 font-black opacity-30 uppercase tracking-[0.2em] px-10 leading-relaxed text-[11px]">Carga tus fotos el día del evento.</p>';
            });
        });
        this.loadMore();
    }
}
