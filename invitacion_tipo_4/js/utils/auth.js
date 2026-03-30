/**
 * Auth Utility
 * Maneja la sesión del invitado y la validación de acceso.
 * [MODO DE PRUEBAS ACTIVADO]: Acceso sin validación de datos.
 */

export const Auth = {
    /**
     * Valida las credenciales del invitado.
     * En MODO PRUEBAS, cualquier entrada (o ninguna) permite el acceso.
     */
    login(phone = "TEST", code = "GABY15") {
        // En modo pruebas, omitimos validaciones de base de datos
        sessionStorage.setItem("gaby_sofia_auth", JSON.stringify({
            phone: phone || "1234567890",
            name: "Invitado Demo",
            timestamp: Date.now()
        }));
        return true;
    },

    /**
     * Verifica si hay una sesión activa.
     */
    isAuthenticated() {
        return sessionStorage.getItem("gaby_sofia_auth") !== null;
    },

    /**
     * Obtiene los datos de la sesión actual.
     */
    getUser() {
        const session = sessionStorage.getItem("gaby_sofia_auth");
        return session ? JSON.parse(session) : null;
    },

    /**
     * Cierra la sesión.
     */
    logout() {
        sessionStorage.removeItem("gaby_sofia_auth");
        window.location.reload();
    }
};
