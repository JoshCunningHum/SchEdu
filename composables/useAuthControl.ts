import { AuthError } from "@supabase/supabase-js";

export class AuthControl {
  static async signIn(email: string, password: string) : Promise<Boolean | AuthError> {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    // TODO: Implement multiple async login validation
    // if (error?.message === 'Invalid login credentials') {
    //   const { data: { users }, error } = await supabase.auth.admin.listUsers();
    // }

    return error ? error : true;
  }

  static async logout() {
    const sessionAuth = useSessionStatus();
    // Remove session
    sessionAuth.clear();
    await useSupabaseClient().auth.signOut();
    // Re route to login
    const router = useRouter();
    router.push('/login');
  }

  static async signUp(email: string, password: string, username: string) : Promise<Boolean | AuthError> {
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
      if (error) throw new Error();
    } catch {
      return new AuthError("System error detected.");
    }

    return true;
  }
}
