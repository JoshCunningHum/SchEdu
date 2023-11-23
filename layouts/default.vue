<template>
    <div class="DefaultLayout flex flex-col h-screen w-full min-h-0">
        <!-- Header Type Navigation in the future -->
        
        <UContainer
            class="flex flex-col justify-end items-end py-5 w-full">
            <div class="roboto pr-2 max-w-min whitespace-nowrap">
                {{ username }}
            </div>
            <div class="flex justify-end">
                <UButton variant="link" @click="logout">Logout</UButton>
            </div>
        </UContainer>
        <slot class="w-full h-full flex-grow min-h-0"/>
    </div>
</template>

<script setup>
import { AuthControl } from '~/controllers/AuthControl';

const sessionAuth = useSessionStatus();
const username = sessionAuth.username;

const logout = async() => {
    await AuthControl.logout();
}

</script>

<style lang="scss">

</style>~/controllers/useAuthControl~/controllers/AuthControl