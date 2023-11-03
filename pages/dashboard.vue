<template>
    <UContainer
        class="flex flex-col gap-5 py-5 h-full w-full min-h-0">
        <PreLoader v-if="isOpeningTimeTable" message="Opening Timetable" />
        <div
            class="h-24 flex gap-5">
            <!-- <div
                class="w-52">
                <Logo calendar/>
            </div> -->
            <div
                class="flex flex-grow gap-2">
                <div class="flex-grow flex justify-center items-end">
                    <div class="text-2xl jetbrainsmono">
                        Timetables
                    </div>
                </div>
                <div
                    class="flex flex-col justify-between items-end gap-2">
                    <div class="flex flex-col justify-end items-end gap-2">
                        <div>
                            <!-- Here lies the settings -->
                            <!-- Legend says that this component's seal should only be broken when the prophesized settings feature has already been fulfilled -->
                            <!-- <UButton icon="i-mdi-gear" padded :ui="{rounded: 'rounded-full'}" /> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="flex flex-grow flex-col rounded-md p-4 min-h-0 gap-2">
            <div class="flex justify-between">
                <div class="flex gap-2">
                    <UButton v-if="selectionMode" color="white" @click="selectAll">
                        Select All
                    </UButton>
                    <UInput icon="i-mdi-search" v-model="searchFilter"/>
                </div>
                <div class="flex gap-2">
                    <template v-if="selectionMode">
                        <UButton color="white" @click="selected.splice(0)">
                            Clear selection
                        </UButton>
                        <UButton color="red" @click="bulkRemove()">
                            Delete {{ selectedFiltered.length }} Item{{ selectedFiltered.length > 1 ? 's' : '' }}
                        </UButton>
                    </template>

                    <UButton>
                        Import 
                    </UButton>
                    <UButton icon="i-mdi-plus" square to="/dashboard/create-timetable"/>
                </div>
            </div>
            <div
                class="flex flex-grow flex-col gap-2 overflow-y-auto min-h-0" id="timetable-cont">
                <!-- Timetables Here -->
                <UContainer v-if="!isAcquired">
                    <USkeleton class="h-6 w-[250px]" />
                    <div class="flex-grow flex justify-end gap-2">
                        <USkeleton class="h-6 w-[250px]" />
                        <USkeleton class="h-6 w-[100px]" />
                    </div>
                </UContainer>
                <UContainer v-else-if="isEmpty" style="border-width: 0 !important;"
                    class="flex justify-center items-center h-full text-grayl">
                    <div>No timetables to show...</div>
                </UContainer>
                <template v-else>
                    <div v-for="(t, index) in timeTablesFiltered" class="roboto cursor-pointer">
                        <UContainer class="flex-grow flex justify-between gap-2 py-2" style="padding-left: 10px !important;" @click="select(t.id)">
                            
                            <div class="flex gap-3 items-center">
                                <UCheckbox v-if="selectionMode" :model-value="isSelected(t.id)" style="cursor: pointer !important;" />
                                <div v-else class="p-2"></div>
                                <div> {{ t.name }} </div>
                            </div>
                            <div class="italic text-secondary-em">
                                Last updated {{ formatter(t.created) }}
                            </div>

                        </UContainer>
                        <div>
                            <UPopover :popper="{ offsetDistance: 0 }">
                                <UButton icon="i-mdi-dots-vertical" variant="link" padded square/>

                                <template #panel>
                                    <div class="flex flex-col p-1">
                                        <UButton @click="isOpeningTimeTable = true" icon="i-mdi-file-edit" variant="link" :to="`/timetable/${t.id}`">Edit</UButton>
                                        <UButton icon="i-mdi-content-duplicate" :loading="isDuplicating" @click="duplicate(t.id)" variant="link" color="black">Duplicate</UButton>
                                        <UButton icon="i-mdi-file-delimited" variant="link" padded color="black">Export to CSV</UButton>
                                        <UButton icon="i-mdi-image-area" padded color="black" variant="link">Export to PNG</UButton>
                                        <UButton icon="i-mdi-trash" padded color="red" variant="soft" :to="`/dashboard/remove-${t.id}`">Delete</UButton>
                                    </div>
                                </template>
                            </UPopover>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Create Timetable Modal -->
        <div v-if="openChild">
            <NuxtPage />
        </div>
    </UContainer>
</template>

<script setup>

definePageMeta({
    middleware: 'auth'
})

const router = useRouter();
const timetableStore = useTimetableStore();

// Acquire timetables from database
const isAcquired = ref(false);
timetableStore.sync().then(() => isAcquired.value = true);
const timeTables = computed(() => timetableStore.data);

const timeTablesFiltered = computed(() => {
    return timeTables.value.filter(t => t.name.toLowerCase().includes(searchFilter.value.toLowerCase()));
})
const isEmpty = computed(() => timeTablesFiltered.value.length === 0);
const searchFilter = ref('');

const formatter = date => useUseSTDTimeFormat(date);

// Handle routes (e.g. creating timetable nested route)
const route = useRoute();
const openChild = computed(() => route.path !== '/dashboard')


// Handles selection
const selected = ref([]); // id
const selectedFiltered = computed(() => timeTablesFiltered.value.filter(t => isSelected(t.id)).map(t => t.id));

const isSelected = id => selected.value.includes(id);

watch(openChild, () => {
    // Reset select status when opening/closing modals
    selected.value.splice(0);
})

const select = id => {
    // check if id is already in the selected
    const isAlreadySelected = isSelected(id);

    if(isAlreadySelected){
        // Remove in the selected list
        const index = selected.value.indexOf(id);
        selected.value.splice(index, 1);
    }else{
        // Add in the selected array
        selected.value.push(id);
    }
}

const selectAll = () => {
    // Clear all selected
    selected.value.splice(0);

    // Add all ids inside the filtered results
    selected.value.push(...timeTablesFiltered.value.map(t => t.id));
}

const bulkRemove = () => {
    router.push({path: '/dashboard/remove-multiple', query: { ids: JSON.stringify(selectedFiltered.value) }});
}

// Duplication

const isDuplicating = ref(false);

const duplicate = async id => {
    isDuplicating.value = true;

    await timetableStore.duplicate(id);

    isDuplicating.value = false;
}

// Some UI Handling
const selectionMode = computed(() => selected.value.length > 0);
const isOpeningTimeTable = ref(false);


</script>

<style lang="scss" scoped>

@import '@/assets/colors.scss';

#timetable-cont > div{
    @apply w-full flex items-center rounded-md border border-secondary pr-2 ;

    &.roboto:hover {
        @apply bg-grayl;
    }
}
</style>