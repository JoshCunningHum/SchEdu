<script setup lang="ts">
import { CourseArray } from '~/types/Course';
import { Instructor, InstructorArray } from '~/types/Instructor';
import { Room, RoomArray } from '~/types/Room';
import { Section, SectionArray } from '~/types/Section';
import { TimetableBuilder, TimetableSettings, type TimetableParams } from '~/types/Timetable';
import { Day } from '~/types/DaySched';

const timetableStore = useTimetableStore();

// Sched Data

const sched = computed(() => timetableStore.selected?.data?.sched);
const params = computed<TimetableParams>(() => timetableStore.selected?.data?.params || TimetableBuilder());
const settings = computed(() => params.value.settings || new TimetableSettings());

const start = computed(() => settings.value.start);
const end = computed(() => settings.value.end);
const duration = computed(() => end.value - start.value);
const interval = computed(() => settings.value.interval);

const periods = computed(() => Array(duration.value / interval.value + 1).fill(0).map((v, i) => {
    const std = useMinutesToTime(i * interval.value + start.value);

    return {
        label: std.str,
        mins: std.mins,
        isPM: std.isPM,
        hrs: std.hrs,
        rhrs: std.rhrs,
        og: std.og
    }
}));

// Specifying the Schedule
const categoryList = ['Rooms', 'Teachers', 'Sections'];
const category = ref(categoryList[0]);

const rooms = computed(() => sched.value?.rooms || new RoomArray());
const instructors = computed(() => sched.value?.instructors || new InstructorArray());
const sections = computed(() => sched.value?.sections || new SectionArray());
const courses = computed(() => sched.value?.courses || new CourseArray());
const categoryValues = computed(() => {
    return [
        rooms.value, 
        instructors.value, 
        sections.value][category.value === 'Rooms' ? 0 : category.value === 'Teachers' ? 1 : 2]
    .map(v => v);
})
const value = ref<Room | Instructor | Section | undefined>(undefined);

watch(categoryValues, v => {
    if(v.length) value.value = v[0];
    else value.value = undefined;
});

// Zooming
const zoomRaw = ref(100);
const zoomValue = computed(() => 101 - zoomRaw.value);

const table = ref<InstanceType<typeof HTMLDivElement>>();

const minHeightPerHour = ref(100);
const maxHeightPerHour = computed(() => 200);
const heightPerHour = computed(() => (maxHeightPerHour.value - minHeightPerHour.value) * (zoomValue.value / 100) + minHeightPerHour.value);
const heightPerPeriod = computed(() => heightPerHour.value * (interval.value / 60));

const getPosition = (minutes: number, isStart: boolean = true) : number => {
    if(isStart) minutes -= start.value;
    const applied_offset = isStart ? heightPerPeriod.value / 2 : 0;
    const periodsCovered = minutes / interval.value;
    return applied_offset + periodsCovered * heightPerPeriod.value;
}

</script>

<template>
    <div class="w-full flex-grow relative flex gap-1 min-h-0">
        <!-- Actual Content -->
        <div class="flex-grow h-full flex flex-col px-3 pb-3">

            <div class="w-full" style="padding-right: 9px;">
                
                <div class="mb-2 flex gap-2">
                    <div class="w-52">
                        <USelectMenu :options="categoryList" v-model="category"/>
                    </div>
                    <div class="w-52">
                        <USelectMenu :options="categoryValues" v-model="value" searchable :search-attributes="[(value instanceof Section) ? 'id' : 'name']"> 
                            
                            <template #label>
                                <span v-if="(value instanceof Room)">
                                    <span :style="`background: ${value.type.color};`" class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
                                </span>
                                {{ category.slice(0, -1) }} - {{ value instanceof Section ? `${value.id} - ${useOrdinalize(value.year_level)} Year` : value instanceof Room || value instanceof Instructor ? value.name : 'None Selected' }}
                            </template>

                            <template #option="{ option: value }">
                                <span v-if="(value instanceof Room)">
                                    <span :style="`background: ${value.type.color};`" class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
                                </span>
                                <span> {{ value instanceof Section ? `${value.id} - ${useOrdinalize(value.year_level)} Year` : value instanceof Room || value instanceof Instructor ? value.name : '' }} </span>
                            </template>

                            <template #option-empty="{ query }">
                                <span class="text-sm text-secondary-em">"{{ query }}" not found</span>
                            </template>

                        </USelectMenu>
                    </div>
                </div>

                <div class="header flex overflow-x-hidden border-t">
                    <div>Time</div>
                    <div>Monday</div>
                    <div>Tuesday</div>
                    <div>Wednesday</div>
                    <div>Thursday</div>
                    <div>Friday</div>
                    <div>Saturday</div>
                </div>

            </div>

            <div class="min-h-0 overflow-y-auto flex-grow scroll-stable">

                <div class="h-full flex container" ref="table">

                    <div>
                        <div v-for="p in periods" :key="p.label" :style="`height: ${heightPerPeriod}px;`"
                            class="flex justify-center items-center content-center">
                            <UDivider :label="p.label" :ui="{ border: { base: 'border-white dark:border-white'}}" />
                        </div>
                    </div>
                    
                    <div v-for="i in 6" :key="i" class="relative">
                        <div v-for="p in periods" :key="p.label" :style="`height: ${heightPerPeriod}px`" class="flex justify-center items-center content-center">
                            <UDivider :ui="{ border: { base: 'border-white dark:border-white'}}" />
                        </div>
                        <template v-if="!!value && value.scheds && value.scheds.length > i - 1 && value.scheds[i - 1]">
                            
                            <div v-for="a in value.scheds[i-1].activities" 
                                class="absolute bg-accent top-0 flex items-center justify-center border text-xs jetbrainsmono text-center flex flex-col" 
                                :style="`width: 96%; left: 2%; top: ${getPosition(a.start_time) - 1}px; height: ${getPosition(a.duration, false) + 1}px;`">

                                <!-- <span>
                                    {{ Day[a.sched] }}
                                </span> -->
                                <span>{{ a.course(courses)?.name }}
                                    <span v-if="!(value instanceof Section)">
                                        - {{ a.section(sections)?.id || '[No Section]'}}
                                    </span>
                                </span>
                                <span v-if="!(value instanceof Instructor)">
                                    {{ a.instructor(instructors)?.name || `[No Instructor]`}}
                                </span>
                                <span v-if="!(value instanceof Room)">
                                    {{ a.room(rooms)?.name || `Online`}}
                                </span>
                                <!-- <span>
                                    {{ a.id }}
                                </span> -->
                                <!-- {{ a.duration || 'No Name' }} -->
                            </div>

                        </template>
                    </div>

                </div>
            </div>


        </div>
        <!-- Slider for scaling -->
        <div class="h-full w-4 py-2">
            <!-- <input type="range" min="1" max="100" v-model="zoomRaw" class="vertical-slider h-full w-4 rounded-full" /> -->
            <VerticalSlider v-model="zoomRaw" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container>div {
    @apply flex-grow -mt-px -ml-px w-full h-full; 

    &:first-child{
        margin-left: 0;
    }
}

.header > div {
    @apply flex-grow h-full w-full text-center -ml-px;

    &:first-child{
        margin-left: 0;
    } 

    font-family: "Jetbrains Mono";
}
</style>