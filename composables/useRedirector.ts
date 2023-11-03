// Because I am so tired of using middlewares that can't access storage because I mean how would they

export const useRedirector = () => {
    const sessionAuth = useSessionStatus();
    const router = useRouter();

    if(sessionAuth.isLoggedIn()) return;

    // If not logged in, go back to login
    router.push('/login');
}