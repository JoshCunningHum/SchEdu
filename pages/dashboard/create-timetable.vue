<template>
    <UModal v-model="alwaysOpen" :prevent-close="isLoading">
        <div ref="modal">
            <UCard>
                <template #header>
                    <div class="text-2xl">Create Timetable</div>
                </template>

                <UFormGroup label="Timetable Name" v-slot="{ error }" :error="nameLength > MAX_CHARACTERS && `Maximum of ${MAX_CHARACTERS} characters`">
                    <UInput v-model="name" :loading="isLoading" />
                </UFormGroup>

                <template #footer>
                    <div class="flex justify-between items-center gap-2">
                        <div v-if="errors" class="text-rose-500 text-sm">
                            Something went wrong, please try again later
                        </div>

                        <div class="flex flex-grow justify-end gap-2">
                            <UButton @click="returnToDashboard()" color="red">Cancel</UButton>
                            <UButton @click="submit" :disabled="name === '' || nameLength > MAX_CHARACTERS" >Create</UButton>
                        </div>

                    </div>
                </template>
            </UCard>
        </div>
    </UModal>
</template>

<script setup>

import { useTimetableStore } from '~/stores/timetableStore';

const MAX_CHARACTERS = 30;
const router = useRouter();
const timetableStore = useTimetableStore();

const alwaysOpen = ref(true);

const modal = ref(null);

const returnToDashboard = () => {
    router.push('/dashboard');
}

onClickOutside(modal, () => {
    // Return to dashboard
    returnToDashboard();
})

// Form

const name = ref('');
const errors = ref(false);
const isLoading = ref(false);
const nameLength = computed(() => name.value.length);

watch(name, () => {
    errors.value = false;
});

defineShortcuts({
    enter: {
        usingInput: true,
        handler: () => submit()
    }
})

const submit = async () => {
    if(name.value === '' && isLoading.value) return;

    isLoading.value = true;

    timetableStore.create(name.value)
        .then(() => {
            returnToDashboard();
        }).catch(err => {
            console.log(err);
            errors.value = true;
        }).finally(() => {
            isLoading.value = false;
        })
}

</script>

<style scoped>

</style>