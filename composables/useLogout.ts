export const useLogout = async () => {
    const sessionAuth = useSessionStatus();
    // Remove session
    sessionAuth.clear();
    const { error } = await useSupabaseClient().auth.signOut();
    // Re route to login
    const router = useRouter();
    router.push('/login');
}