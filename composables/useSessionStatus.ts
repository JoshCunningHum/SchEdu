export const useSessionStatus = () => {
    const sessionAuth = useSessionStorage('SchEduAuth', {
        idToken: '',
        username: ''
    });

    const idToken = computed(() => sessionAuth.value.idToken);
    const username = computed(() => sessionAuth.value.username);

    const set = (key: string, value: any) => {
        switch(key){
            case 'idToken':
                sessionAuth.value.idToken = value;
                break;
            case 'username':
                sessionAuth.value.username = value;
        }
    }

    const clear = () => {
        sessionAuth.value = null;
    }

    const isLoggedIn = () => {
        return sessionAuth.value.idToken !== '';
    }

    return {
        idToken, username, set, clear, isLoggedIn
    }
}