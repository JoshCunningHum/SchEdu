<template>
    <UContainer class="flex flex-col flex-grow pb-6 gap-4 w-full h-full min-h-0">
        <!-- Timetable Setting Modal -->
        <TimetableSettingsModal v-model="isOpenSettings" />
        <!-- Customizer -->
        <Customizer v-model="isCustomizing" />

        <!---->
        <div class="h-32 flex gap-6" style="min-height: 8rem;">
            <div class="w-32 text-6xl flex items-center">
                <Logo calendar/>
            </div>
            <div class="flex-grow flex justify-between items-center">
                <div class="flex flex-col justify-end h-full">
                    <div class="roboto text-end text-sm">Last Update: {{ formatter(timeTable?.created) }}</div>
                    <UChip :show="timeTableStore.hasChanges" color="red">
                        <UButton class="w-60 flex justify-center" @click="updateData()" :loading="isUpdatingData">{{ isUpdatingData ? 'Updating' : 'Update' }}</UButton>
                    </UChip>
                </div>

                <div class="h-full flex items-end">
                    <div class="pb-3 jetbrainsmono">
                        {{ timeTable?.name }}
                    </div>
                </div>

                <div class="flex items-end justify-end h-full flex-col roboto">
                    
                    <!-- <div>{{ id }}</div> -->
                    <UButton icon="i-mdi-gear" class="mt-2" :ui="{ rounded: 'rounded-full' }" @click="isOpenSettings = true" />
                </div>
            </div>
        </div>
        <!-- -->
        <div class="flex-grow flex gap-6 min-h-0">
            <!-- Parameters -->
            <div class="h-full">
                <UVerticalNavigation
                    class="border-s border-secondary pl-0"
                    :links="paramlinks"
                    :ui="{
                        wrapper: 'rounded-0',
                        base: 'group -m-px border-s border-transparent',
                        padding: '',
                        rounded: 'rounded-none',
                        font: '',
                        ring: '',
                        active: '',
                        inactive: 'initial'
                    }"
                >
                    <template #default="{ link, isActive }">
                        <span :class="`${isActive ? 'active' : ''} param-link`">{{ link.label }}</span>
                    </template>
                </UVerticalNavigation>
            </div>
            <!-- Table/Parameter Values -->
            <div class="flex-grow bg-secondary rounded-md ">
                <!-- <div class="bg-accent text-em jetbrainsmono font-bold">TEST</div> -->
                <!-- Paremeters-->
                <div v-if="isOpeningParam" class="w-full h-full"> 
                    <NuxtPage class="h-full relative"/>
                </div>
                <!-- Timetable Viewer -->
                <div v-else class="w-full h-full flex flex-col gap-1 p-2"> 
                    <div :class="`flex justify-end`">
                        <UButtonGroup>
                            <UButton @click="isCustomizing = true" color="white" >Customize</UButton>
                            <UButton @click="timeTableStore.generate()">Generate</UButton>
                        </UButtonGroup>
                    </div>
                    <ScheduleViewer class="flex-grow" />
                </div>
            </div>
        </div>
    </UContainer>
</template>

<script setup>

definePageMeta({
    middleware: [
        'prevent-access-on-unowned-timetables', // 
    ]
})

const route = useRoute();
const id = parseInt(route.params.id);

// Parameter Navigation
const paramlinks = [
    {
        label: 'Timetable',
        to: { name: 'timetable-id', params: { id: id }},
        shortcuts: ['T']
    },
    {
        label: 'Rooms',
        to: { name: 'timetable-id-rooms', params: { id: id }},
        shortcuts: ['C']
    },
    {
        label: 'Courses',
        to: { name: 'timetable-id-courses', params: { id: id }},
        shortcuts: ['X']
    },
    {
        label: 'Teachers',
        to: { name: 'timetable-id-teachers', params: { id: id }},
        shortcuts: ['Z']
    },
    {
        label: 'Offerings',
        to: { name: 'timetable-id-sections', params: { id: id }},
        shortcuts: ['B']
    },
]

const isOpeningParam = computed(() => route.name !== 'timetable-id');

// Update helper stores 
const timeTableStore = useTimetableStore();
await timeTableStore.sync();

onMounted(async () => {
    timeTableStore.select(id)
});

onUnmounted(() => timeTableStore.select(null));

// Handle UI
const timeTable = computed(() => timeTableStore.selected);
const formatter = date => useUseSTDTimeFormat(date);

// Handle Timetable settings
const isOpenSettings = ref(false);
const isUpdatingData = ref(false);
const isCustomizing = ref(false);

// Update Timetable
const updateData = async () => {
    isUpdatingData.value = true;
    const result = await timeTableStore.setData();
    if(!result) alert(`Something wen't wrong when updating... Please try again later.`)
    isUpdatingData.value = false;
}

</script>

<style lang="scss" scoped>

@import '@/assets/colors.scss';
@import '@/assets/main.scss';

.param-link {
    @apply my-1 p-2 px-3 jetbrainsmono rounded-none;

    &.active {
        @apply text-accent border-s border-accent;
    }

    &:hover {
        @apply bg-accent;
    }
}

</style>