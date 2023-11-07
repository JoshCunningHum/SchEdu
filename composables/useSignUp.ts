export const useSignUp = async (email: string, password: string, username: string) => {
    const supabase = useSupabaseClient();

    // The only error in signup is when an existing email address is used
    // People can have the same username for some reason

    // This is for the sake of exporting, since two accounts can have the same school name
    // Or idk

    // Fetch data from the server if user email is already existing
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    user_name: username
                }
            }
        });

        // because sometimes it throws an error but somtimes it does not
        if(error) throw new Error();
    }catch{
        return new Error();
    }

    return true;
}