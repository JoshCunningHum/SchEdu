<script setup lang="ts">
import type { Course } from '~/types/Course';
import { RoomTypeArray } from '~/types/Room';


const courseStore = useCourseStore();
const settingsStore = useTimetableSettingsStore();
const roomStore = useRoomStore();
const courses = computed(() => courseStore.courses);

const rooms = computed(() => roomStore.rooms);
const roomTypes = computed(() => settingsStore.roomTypes);
const interval = computed(() => settingsStore.settings?.interval || 1);
const include_sat = computed(() => settingsStore.settings?.include_sat);

// Modal

const isCreating = ref(false);
const name = ref('');
const meetings = ref(2);
const minutes = ref(interval.value * 4 || 60);

watch(interval, v => minutes.value = v);

const addCourse = () => {
    if (!name.value) return;
    courseStore.addCourse(name.value, meetings.value, 0, minutes.value * meetings.value);
    name.value = '';
    isCreating.value = false;
}

defineShortcuts({
    enter: {
        usingInput: true,
        handler: () => isCreating.value && addCourse()
    },
    " ": {
        handler: () => isCreating.value = true
    }
})

// Course Parameters

const search = ref('');

const chosenIndex = ref(-1);
const chosen = computed<Course | undefined>(() => courses.value && courses.value.length > 0 && chosenIndex.value >= 0 && chosenIndex.value < courses.value.length ? courses.value[chosenIndex.value] : undefined);

const chosenRoomTypes = computed({
    get: () => chosen.value?.compatible_rooms || new RoomTypeArray(),
    set: v => {
        if (!chosen.value) return;
        chosen.value.compatible_rooms.splice(0);
        chosen.value.compatible_rooms.push(...v);
    }
});

const select = (i: number) => {
    chosenIndex.value = i;
}

const removeCourse = () => {
    if (!chosen.value) return;
    courseStore.removeCourse(chosen.value);
}

// On Mount Events
onMounted(() => {
    // Open Modal when there are no courses
    isCreating.value = !courses.value?.length;
})

</script>

<template>
    <div class="p-2 flex gap-2 h-full">
        <!--Creation Modal -->
        <UModal v-model="isCreating" :ui="{ width: 'min-w-[500px] max-w-[500px]'}">
            <UCard :ui="{ base: 'overflow-visible min-w-[500px] w-full' }" class="min-w-[500px]">
                <template #header>
                    <div>Add a course</div>
                </template>

                <div>
                    <UFormGroup :help="!name ? 'Room needs a name' : undefined">
                        <div class="flex flex-col gap-2">

                            <div>
                                <UFormGroup label="Course name">
                                    <UInput placeholder="Enter course name" v-model="name" :tabindex="1"/>
                                </UFormGroup>
                            </div>
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-1 w-1/2 text-xs">

                                    <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Meetings per week:
                                    </label>
                                    <div class="flex-grow text-right pr-5">{{ meetings }}</div>
                                </div>
                                <div class="w-1/2">
                                    <URange size="xs" :min="1" :max="include_sat ? 6 : 5" v-model="meetings" />
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-1 w-1/2 text-xs">

                                    <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Minutes per session:
                                    </label>
                                    <div class="flex-grow text-right pr-5">{{ minutes }} <span class="text-xs">({{ minutes / 60 }} hrs)</span></div>
                                </div>
                                <div class="w-1/2">
                                    <IntervalSelector :pages="5" v-model="minutes" />
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-1 w-1/2 text-xs">
                                    <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Minutes per Week:
                                    </label>
                                    <div class="flex-grow text-right pr-5">{{ minutes * meetings }}</div>
                                </div>
                            </div>

                        </div>
                    </UFormGroup>
                </div>

                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <UButton :disabled="!name" @click="addCourse">Add</UButton>
                    </div>
                </template>
            </UCard>
        </UModal>

        <!-- Course List Displayer -->
        <div class="flex flex-col gap-2 max-w-[200px] h-full">

            <!-- Search Courses -->
            <UInput class="w-full" icon="i-mdi-search" v-model="search" />

            <!-- Courses List -->
            <div v-if="courses && courses.length > 0" class="flex-grow min-h-0 overflow-y-auto flex flex-col gap-1 scroll-stable">
                <template v-for="(c, i) in courses">
                    <UButton v-if="search === '' || c.name.includes(search)" :class="`w-full`" truncate
                        :color="chosenIndex === i ? 'primary' : 'white'" :variant="chosenIndex == i ? 'solid' : 'outline'"
                        @click="select(i)">
                        <span class="truncate">{{ c.name || "[No Name]" }}</span>
                    </UButton>
                </template>
            </div>
            <EmptyDisplay v-else>
                No Courses Created
            </EmptyDisplay>

            <!-- Courses Add -->
            <div class="w-full flex gap-1">
                <div>
                    <UButtonGroup block orientation="horizontal" class="w-full">
                        <UTooltip :shortcuts="['SPACE']" :popper="{ placement: 'top'}" text="Add">
                            <UButton icon="i-mdi-plus" @click="isCreating = true"/>
                        </UTooltip>
                        <UButton label="Import" />
                    </UButtonGroup>
                </div>
                <div class="flex-grow">
                    <UButton block label="Export" color="gray" />
                </div>
            </div>

        </div>

        <!-- Course Params -->
        <div class="flex flex-col gap-2 flex-grow border-l pl-2 border-secondary-em">
            <template v-if="chosen !== undefined">

                <div class="flex gap-1">
                    <div class="w-[350px]">
                        <UInput icon="i-mdi-edit" v-model="chosen.name" />
                    </div>
                    <div>
                        <UButton label="Delete" color="red" @click="removeCourse()" />
                    </div>
                </div>

                <div class="flex flex-grow gap-2 flex-wrap h-full">

                    <!-- On Create Params -->
                    <UFormGroup class="w-1/2 flex flex-col gap-1 min-w-[400px]" :error="!chosen.classes_offered && chosen.classes_offered !== 0 ? 'Input the number of classes offered' :
                        chosen.classes_offered < 1 ? 'Classes offered must be greater than 0' :
                            !chosen.name ? 'Assign a course name' : undefined">

                        <div class="flex justify-between items-center">
                            <div class="flex gap-1 text-sm w-1/2">

                                <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Meetings per week:
                                </label>
                                <div class="flex-grow text-right px-5">{{ chosen.weekly_meetings }}</div>
                            </div>
                            <div class="w-1/2">
                                <URange size="xs" :min="1" :max="include_sat ? 6 : 5" v-model="chosen.weekly_meetings" />
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="flex gap-1 text-sm w-1/2">

                                <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Minutes per session:
                                </label>
                                <div class="flex-grow text-right px-5">{{ chosen.minutesPersession }}</div>
                            </div>
                            <div class="w-1/2">
                                <IntervalSelector :pages="5" v-model="chosen.minutesPersession" />
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="flex gap-1 text-sm w-1/2">
                                <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Minutes per Week:
                                </label>
                                <div class="flex-grow text-right px-5">{{ chosen.minutes }}</div>
                            </div>
                        </div>

                    </UFormGroup>

                    <!-- Room Type Params -->
                    <div class="flex-grow w-[400px] h-full">
                        <UFormGroup label="Compatible room types"
                            :hint="`${rooms ? `${rooms.reduce((t, r) => t += chosenRoomTypes.has(r.type) ? 1 : 0, 0) > 1 ? rooms.reduce((t, r) => t += chosenRoomTypes.has(r.type) ? 1 : 0, 0) + ' Rooms' : 'One Room'}` : 'No rooms available'}`"
                            class="h-full" :ui="{
                                container: 'h-full'
                            }">
                            <div class="flex flex-col h-full gap-1">
                                <USelectMenu :options="roomTypes" v-model="chosenRoomTypes" multiple :ui="{
                                    option: {
                                        selected: 'bg-primary'
                                    }
                                }">

                                    <template #label>
                                        <span v-if="chosenRoomTypes.length" class="flex items-center -space-x-1">

                                            <span v-for="types in chosenRoomTypes" :key="types.id"
                                                :style="`background: ${types.color};`"
                                                class="flex-shrink-0 w-2 h-2 mt-px rounded-full"></span>

                                            <span class="pl-3">
                                                {{ chosenRoomTypes.length }} Selected
                                            </span>
                                        </span>
                                        <span v-else class="text-secondary-em">
                                            Select room types
                                        </span>
                                    </template>

                                    <template #option="{ option: type, selected }">
                                        <span :style="`background: ${type.color};`"
                                            class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
                                        <span class="truncate">{{ type.name }}</span>
                                    </template>

                                    <template #option-empty="{ query }">
                                        Not Found
                                    </template>

                                </USelectMenu>
                                <SectionAlert class="border-secondary-em text-xs">
                                    Priority at the topleft-most type down to bottom-rightmost
                                </SectionAlert>
                                <TimetableSettingsModalRoomTypesList :list="chosenRoomTypes" />
                            </div>
                        </UFormGroup>
                    </div>


                </div>

            </template>
            <EmptyDisplay v-else>
                No Course Selected
            </EmptyDisplay>

        </div>

    </div>
</template>


<style lang="scss" scoped></style>