export const useSignIn = async (email: string, password: string) => {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    // TODO: Implement multiple async login validation
    if(error?.message === 'Invalid login credentials'){
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
    }

    return error ? error : true;
}