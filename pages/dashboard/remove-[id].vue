<template>
    <UModal v-model="alwaysOpen" :prevent-close="isLoading">
        <div ref="modal">
            <UCard>
                <template #header>
                    <div class="text-2xl">Delete Timetable{{ id==='multiple' ? 's' : ''}}?</div>
                </template>

                Are you sure you want to delete {{ id === 'multiple' ? 'selected' : '' }} timetable{{ id==='multiple' ? 's' : ''}}?
                <div class="jetbrainsmono text-sm">
                    <div v-for="t in targets" class="px-2 py-0.5 bg-gray max-w-min whitespace-nowrap">
                        {{ t.name }}
                    </div>
                </div>

                <template #footer>
                    <div class="flex justify-between items-center gap-2">
                        <div v-if="errors" class="text-rose-500 text-sm">
                            Something went wrong, please try again later
                        </div>

                        <div class="flex flex-grow justify-end gap-2">
                            <UButton @click="returnToDashboard()" color="black" variant="outline">Cancel</UButton>
                            <UButton @click="submit" color='red' :disabled="name === ''" :loading="isLoading" >Delete</UButton>
                        </div>
                    </div>
                </template>
            </UCard>
        </div>
    </UModal>
</template>

<script setup>

const router = useRouter();
const route = useRoute();
const timeTableStore = useTimetableStore();

const id = route.params.id === 'multiple' ? 'multiple' : parseInt(route.params.id);

const alwaysOpen = ref(true);

const errors = ref(false);
const isLoading = ref(false);

const modal = ref(null);

const returnToDashboard = () => router.push('/dashboard');
onClickOutside(modal, () => returnToDashboard());

const targets = ref([]);

/**@type {Number[]} */
const ids = id === 'multiple' ? JSON.parse(route.query.ids) : [id];

// If time table is not existing in this current context, do not delete
timeTableStore.sync().then(() => {
    // Do not redirect if trying to delete multiple ids
    if(id === 'multiple'){
        targets.value.push(...timeTableStore.data.filter(t => ids.includes(t.id)));
        return;
    }
    if(!timeTableStore.has(id)) returnToDashboard();
    targets.value.push(timeTableStore.data.find(t => t.id === id));
})

const submit = async () => {
    isLoading.value = true;

    timeTableStore.remove(...ids).then(() => {
        returnToDashboard();
    }).catch(err => {
        console.log(err);
        errors.value = true;
    }).finally(() => {
        isLoading.value = false;
    })
}

</script>

<style lang="scss" scoped>

</style>