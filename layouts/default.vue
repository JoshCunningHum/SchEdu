<template>
    <div class="DefaultLayout flex flex-col h-screen w-full min-h-0">
        <!-- Header Type Navigation in the future -->
        
        <UContainer
            class="flex flex-col justify-end items-end py-5 w-full">
            <div class="roboto pr-2 w-full flex justify-between whitespace-nowrap">
                <div>
                    <UButton v-if="is_in_timetable" label="Back" variant="link" icon="i-mdi-chevron-left" 
                    :to="`/dashboard`"/>
                </div>
                <div class="max-w-min">
                    
                {{ username }}
                </div>
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
const route = useRoute();

const logout = async() => {
    await AuthControl.logout();
}

const is_in_timetable = computed(() => route.path.includes('timetable'));

</script>

<style lang="scss">

</style>0