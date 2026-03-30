import { Auth } from './auth.js';

/**
 * Interactions Utility
 * Maneja likes y otras interacciones sociales.
 */
export const Interactions = {
    /**
     * Da like a una fotografía.
     * @param {string} photoId 
     */
    likePhoto(photoId) {
        if (!Auth.isAuthenticated()) {
            return { success: false, error: 'NEED_AUTH' };
        }

        const user = Auth.getUser();
        const likes = this.getLikes();
        
        // Evitar duplicados (un like por usuario por foto)
        const key = `${user.phone}_${photoId}`;
        if (likes[key]) {
            return { success: false, error: 'ALREADY_LIKED' };
        }

        const likeData = {
            userId: user.phone,
            photoId: photoId,
            timestamp: new Date().toISOString(),
            vibe: 'positive'
        };

        // Guardar localmente
        likes[key] = likeData;
        localStorage.setItem('gaby_sofia_likes', JSON.stringify(likes));

        console.log('✨ Like registrado:', likeData);
        
        // TODO: Enviar a API/DB real (Panel Admin)
        // fetch('/api/likes.php', { method: 'POST', body: JSON.stringify(likeData) });

        return { success: true, data: likeData };
    },

    /**
     * Obtiene todos los likes locales.
     */
    getLikes() {
        const stored = localStorage.getItem('gaby_sofia_likes');
        return stored ? JSON.parse(stored) : {};
    },

    /**
     * Verifica si el usuario actual ya dio like a una foto.
     */
    hasLiked(photoId) {
        if (!Auth.isAuthenticated()) return false;
        const user = Auth.getUser();
        const likes = this.getLikes();
        return !!likes[`${user.phone}_${photoId}`];
    }
};
