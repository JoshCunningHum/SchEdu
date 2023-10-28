// Handles the checking of authentication status
export default defineNuxtRouteMiddleware((to, from) => {
    const isLoggedIn = true;
    // Check if logged or not in the register page

    if(isLoggedIn){
        // Redirect to the page we are going to
        return navigateTo(to.fullPath);
    }

    // Redirect to the login page
    return navigateTo("/login");
})