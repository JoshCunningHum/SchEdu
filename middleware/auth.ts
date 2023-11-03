import { useSessionStatus } from "~/composables/useSessionStatus";

// Handles the checking of authentication status
export default defineNuxtRouteMiddleware((to, from) => {
    const session = useSessionStatus();
    const isLoggedIn = session.isLoggedIn();

    console.log(isLoggedIn);

    if(isLoggedIn) return;
        
    // Redirect to the login page
    return navigateTo("/login");
})