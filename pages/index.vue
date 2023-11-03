<template>
    <UContainer class="flex items-center h-full flex-wrap justify-center" >
        <UContainer class="flex flex-col flex-grow">
            <div id="logo">
                <Logo wide class="flex"/>
            </div>
            <div class="text-sm lg:text-lg text-center lg:text-start">
                Where scheduling needs no education... what?
                <div class="lg:pl-16">
                    Lorem ipsum dolor sit, You can't schedule? you better quit
                </div>
            </div>
        </UContainer>
        <div v-if="route.path !== '/'" class="w-96 flex flex-col p-5 lg:p-0 py-3 border border-accent rounded-md" style="min-height: 400px;">
            <NuxtPage class="flex-grow m-0"/>
            <UContainer class="w-full">
                <hr class="border-grayl">
                <div class="py-5 flex gap-1.5 flex-col">
                    <UButton block color="black"
                        icon="i-mdi-github" @click="signinWithProvider('github')">
                        Sign in with Github
                    </UButton>
                    <UButton block color="black"
                        icon="i-mdi-google" @click="signinWithProvider('google')">
                        Sign in with Google
                    </UButton>
                </div>
            </UContainer>
        </div>
        <div v-else class="flex items-center justify-center w-96 gap-2 flex-col">
            <UButton size="xl" label="Sign Up Now!" to="/register"/>
            <UButton size="xl" variant="link" label="Sign In if you already have an account" to="/login"/>
        </div>
    </UContainer>
</template>

<script setup>
// if currently logged in, then redirect to dashboard
definePageMeta({    
    layout: 'anonymous',
})

const client = useSupabaseClient();
const user = useSupabaseUser();
const session = useSessionStatus();

const route = useRoute();
const router = useRouter();

const signinWithProvider = async provider => {
    client.auth.signInWithOAuth({ provider: provider });
};

// When user is registered
watch(user, v => {
    if (user.value) {
        // Set session data here
        session.set('idToken', v.id);
        session.set('username', v.user_metadata.user_name);

        // Reroute to dashboard
        router.push('/dashboard');
        // console.log(session.idToken.value, session.username.value);
    }
}, { immediate: true, deep: true });

</script>

<style lang="scss" scoped>

div {
    font-family: 'Roboto';
}

#logo {
    @apply text-5xl flex justify-center;

    @screen lg {
        @apply text-7xl justify-normal;
    }
}

</style> 