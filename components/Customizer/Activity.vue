<script lang="ts" setup>
import { Course, CourseArray } from '~/types/Course';
import { Instructor, InstructorArray } from '~/types/Instructor';
import { Room, RoomArray } from '~/types/Room';
import { Section, SectionArray } from '~/types/Section';
import { TimetableSettings } from '~/types/Timetable';
import { Day } from '~/types/DaySched';


const customizerStore = useCustomizerStore();
const act = computed(() => customizerStore.selectedAct);

const timetableStore = useTimetableStore();
const data = computed(() => timetableStore.selected?.data?.sched);
const settings = computed(() => data.value?.settings);
const _default = new TimetableSettings();

// Parameters
const rooms = computed(() => data.value?.rooms || new RoomArray());
const instructors = computed(() => data.value?.instructors || new InstructorArray());
const sections = computed(() => data.value?.sections || new SectionArray());
const courses = computed(() => data.value?.courses || new CourseArray());

//#region Reactivity

const _course = computed(() => act.value?.courseID);
const course = ref<Course | undefined>();

const _room = computed(() => act.value?.roomID);
const room = ref<Room | undefined>();

const _instructor = computed(() => act.value?.instructorID);
const instructor = ref<Instructor | undefined>();

const _section = computed(() => act.value?.sectionID);
const section = ref<Section | undefined>();

const _start = computed(() => act.value?.start_time);
const _duration = computed(() => act.value?.duration);
const _day = computed(() => act.value?.sched);

//

watchImmediate(_course, v => {
  if ((!!course.value && course.value.id === v)) return;
  course.value = courses.value.find(c => c.id === v);
})

watch(course, v => {
  if (!v || (!!_course.value && _course.value === v.id) || !act.value) return;

  // Perform Transfer
  if (!!v) customizerStore.transfer(act.value, v);
})

watchImmediate(_room, v => {
  if ((!!room.value && room.value.id === v)) return;
  room.value = rooms.value.find(c => c.id === v);
})

watch(room, v => {
  if (!v || (!!_room.value && _room.value === v.id) || !act.value) return;

  // Perform Transfer
  if (!!v) customizerStore.transfer(act.value, v);
})

watchImmediate(_instructor, v => {
  if ((!!instructor.value && instructor.value.id === v)) return;
  instructor.value = instructors.value.find(c => c.id === v);
})

watch(instructor, v => {
  if (!v || (!!_instructor.value && _instructor.value === v.id) || !act.value) return;

  // Perform Transfer
  if (!!v) customizerStore.transfer(act.value, v);
})

watchImmediate(_section, v => {
  if ((!!section.value && section.value.id === v)) return;
  section.value = sections.value.find(c => c.id === v);
})

watch(section, v => {
  if (!v || (!!_section.value && _section.value === v.id) || !act.value) return;

  // Perform Transfer
  if (!!v) customizerStore.transfer(act.value, v);
})

//#endregion

// Transfer Checks
const checkSched = customizerStore.checkSched;
const checkClasses = customizerStore.checkClasses;

const courseMeeting = computed(() => !!course.value ? course.value.weekly_meetings : 0);

const compat_teachers = computed(() => instructors.value.filter(i => !!course.value && i.compatible_courses.has(course.value)))
const compat_courses = computed(() => instructor.value?.compatible_courses || []);

// Operations
const remove = () => {
  if (!!act.value) customizerStore.remove(act.value);
  customizerStore.selectedAct = undefined;
}

</script>

<template>
  <div class="w-full h-full p-2 poppins flex flex-col gap-2" v-if="!!act">

    <div class="w-full flex-grow flex-col flex gap-2">
      <div class="text-xs text-secondary-em flex justify-between" v-if="!!_start && !!_day && !!_duration">
        <span>{{ useMinutesToTime(_start).str }} - {{ useMinutesToTime(_start + _duration).str }}</span>
        <span>{{ Day[_day] }}</span>
      </div>
      <div>
        <!-- Course Select -->
        <USelectMenu :options="courses" option-attribute="" :popper="{ placement: 'left-start' }" v-model="course">

          <!-- Label -->
          <template #label>
            <div class="flex justify-between items-center w-full gap-2" v-if="!!course">
              <span class="truncate">{{ course.name }}</span>  
              <div class="flex gap-2">

                <UPopover mode="hover" v-if="!!instructor">
                  <span class="w-3 h-full flex items-center">

                    <span v-if="!compat_courses.find(t => !!course && t.id === course.id)"
                      class="warning flex items-center">
                      <UIcon name="i-mdi-alert" class="pulsating" />
                    </span>

                  </span>

                  <template #panel>
                    <div class="p-2 warning">{{ instructor.name }} does not do {{ course.name }}</div>
                  </template>
                </UPopover>
                <UPopover mode="hover" v-if="!!section">
                  <span class="w-3 h-full flex items-center">

                    <span v-if="checkClasses(course, section) <= (act.courseID === course.id ? -1 : 0)"
                      :class="`${checkClasses(course, section) < 0 ? 'error' : 'warning'} flex items-center`">
                      <UIcon name="i-mdi-alert" class="pulsating" />
                    </span>

                  </span>

                  <template #panel>
                    <div :class="`${checkClasses(course, section) < 0 ? 'error' : 'warning full'} p-2`">{{ course?.name }}-{{ section.id }} : {{
                      course.weekly_meetings - checkClasses(course, section) }} / {{ course.weekly_meetings }}</div>
                  </template>
                </UPopover>

                <UPopover mode="hover" v-if="!!room">
                  <span class="w-3 h-full flex items-center">

                    <span v-if="course.compatible_rooms.every(rt => !!room && !rt.equals(room.type))"
                      class="warning flex items-center">
                      <UIcon name="i-mdi-alert" class="pulsating" />
                    </span>

                  </span>

                  <template #panel>
                    <div class="p-2 warning">{{ course.name }} in a {{ room.type.name }} Room</div>
                  </template>
                </UPopover>

              </div>

            </div>
            <div v-else class="danger">[ No Course ]</div>
          </template>

          <!-- Option -->
          <template #option="{ option }: { option: Course }">
            <div class="flex justify-between items-center w-full gap-2">
              <span>{{ option.name }}</span>
              <UPopover mode="hover" v-if="!!instructor">
                <span class="w-3 h-full flex items-center">

                  <span v-if="!compat_courses.find(t => t.id === option.id)" class="warning flex items-center">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div class="p-2 warning">{{ instructor.name }} does not do {{ option.name }}</div>
                </template>
              </UPopover>

              <UPopover mode="hover" v-if="!!section">
                <span class="w-3 h-full flex items-center">

                  <span v-if="checkClasses(option, section) <= (act.courseID === option.id ? -1 : 0)"
                    :class="`${checkClasses(option, section) < 0 ? 'error' : 'warning'} flex items-center`">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div :class="`${checkClasses(option, section) < 0 ? 'error' : 'warning full'} p-2`">{{ option?.name }}-{{ section.id }} : {{
                    option.weekly_meetings - checkClasses(option, section) }} / {{ option.weekly_meetings }}</div>
                </template>
              </UPopover>

              <UPopover mode="hover" v-if="!!room">
                <span class="w-3 h-full flex items-center">

                  <span v-if="option.compatible_rooms.every(rt => !!room && !rt.equals(room.type))"
                    class="warning flex items-center">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div class="p-2 warning">{{ option.name }} in a {{ room.type.name }} Room</div>
                </template>
              </UPopover>

            </div>
          </template>

        </USelectMenu>
      </div>
      <div>
        <!-- Room Select -->
        <USelectMenu :options="rooms" option-attribute="" :popper="{ placement: 'left-start' }" v-model="room"
          :ui="{ option: { container: 'w-full', base: 'w-full' } }">

          <!-- Label -->
          <template #label>
            <div class="flex justify-between items-center w-full gap-2" v-if="!!room">

              <span class="truncate">{{ room.name }}</span>

              <div class="flex gap-2">

                <UPopover mode="hover">
                  <span class="w-3 h-full flex items-center">

                    <span v-if="checkSched(act, room)" class="error flex items-center">
                      <UIcon name="i-mdi-alert" class="pulsating" />
                    </span>

                  </span>

                  <template #panel>
                    <div class="p-2 error">Schedule Conflict</div>
                  </template>
                </UPopover>

                <UPopover mode="hover" v-if="!!course">
                  <span class="w-3 h-full flex items-center">

                    <span v-if="course.compatible_rooms.every(rt => !!room && !rt.equals(room.type))"
                      class="warning flex items-center">
                      <UIcon name="i-mdi-alert" class="pulsating" />
                    </span>

                  </span>

                  <template #panel>
                    <div class="p-2 warning">{{ course.name }} in a {{ room.type.name }} Room</div>
                  </template>
                </UPopover>

              </div>

            </div>
            <div v-else class="error">[No Room]</div>
          </template>

          <template #option="{ option }: { option: Room }">
            <div class="flex justify-between items-center w-full gap-2">

              <span>{{ option.name }}</span>

              <UPopover mode="hover">
                <span class="w-3 h-full flex items-center">

                  <span v-if="checkSched(act, option)" class="error flex items-center">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div class="p-2 error">Schedule Conflict</div>
                </template>
              </UPopover>

              <UPopover mode="hover" v-if="!!course">
                <span class="w-3 h-full flex items-center">

                  <span v-if="course.compatible_rooms.every(rt => !rt.equals(option.type))"
                    class="warning flex items-center">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div class="p-2 warning">{{ course.name }} in a {{ option.type.name }} Room</div>
                </template>
              </UPopover>

            </div>
          </template>

        </USelectMenu>
      </div>
      <div>
        <!-- Instructor Select -->
        <USelectMenu :options="instructors" option-attribute="" :popper="{ placement: 'left-start' }"
          v-model="instructor">

          <template #label>
            <div class="flex justify-between items-center w-full gap-2" v-if="instructor">

              <span class="truncate">{{ instructor.name }}</span>

              <div class="flex gap-2">
                <UPopover mode="hover">
                  <span class="w-3 h-full flex items-center">

                    <span v-if="checkSched(act, instructor)" class="error flex items-center">
                      <UIcon name="i-mdi-alert" class="pulsating" />
                    </span>

                  </span>

                  <template #panel>
                    <div class="p-2 error">Schedule Conflict</div>
                  </template>
                </UPopover>

                <UPopover mode="hover" v-if="!!course">
                  <span class="w-3 h-full flex items-center">

                    <span v-if="!compat_teachers.find(t => !!instructor && t.id === instructor.id)"
                      class="warning flex items-center">
                      <UIcon name="i-mdi-alert" class="pulsating" />
                    </span>

                  </span>

                  <template #panel>
                    <div class="p-2 warning">{{ instructor.name }} does not do {{ course.name }}</div>
                  </template>
                </UPopover>

              </div>

            </div>
            <div v-else class="error">[ No Instructor ]</div>
          </template>

          <!-- Option -->
          <template #option="{ option }: { option: Instructor }">
            <div class="flex justify-between items-center w-full gap-2">

              <span>{{ option.name }}</span>

              <UPopover mode="hover">
                <span class="w-3 h-full flex items-center">

                  <span v-if="checkSched(act, option)" class="error flex items-center">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div class="p-2 error">Schedule Conflict</div>
                </template>
              </UPopover>

              <UPopover mode="hover" v-if="!!course">
                <span class="w-3 h-full flex items-center">

                  <span v-if="!compat_teachers.find(t => t.id === option.id)" class="warning flex items-center">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div class="p-2 warning">{{ option.name }} does not do {{ course.name }}</div>
                </template>
              </UPopover>

            </div>
          </template>

        </USelectMenu>
      </div>
      <div>
        <!-- Section Select -->
        <USelectMenu :options="sections" option-attribute="" :popper="{ placement: 'left-start' }" v-model="section">

          <template #label>
            <div class="flex justify-between items-center w-full gap-2" v-if="!!section">

              <span class="truncate">{{ section.id }}</span>

              <div class="flex gap-2">
                <UPopover mode="hover">
                  <span class="w-3 h-full flex items-center">

                    <span v-if="checkSched(act, section)" class="error flex items-center">
                      <UIcon name="i-mdi-alert" class="pulsating" />
                    </span>

                  </span>

                  <template #panel>
                    <div class="p-2 error">Schedule Conflict</div>
                  </template>
                </UPopover>

                <UPopover mode="hover">
                  <span class="w-3 h-full flex items-center">

                    <span v-if="checkClasses(act, section) <= (act.sectionID === section.id ? -1 : 0)"
                      :class="`${checkClasses(act, section) < 0 ? 'error' : 'warning'} flex items-center`">
                      <UIcon name="i-mdi-alert" class="pulsating" />
                    </span>

                  </span>

                  <template #panel>
                    <div :class="`p-2 ${checkClasses(act, section) < 0 ? 'error' : 'warning'}`">{{ course?.name }}: {{
                      courseMeeting - checkClasses(act, section) }} / {{ courseMeeting }}</div>
                  </template>
                </UPopover>
              </div>

            </div>
            <div v-else class="error">[ No Section ]</div>
          </template>

          <!-- Section -->
          <template #option="{ option }: { option: Section, selected: boolean }">
            <div class="flex justify-between items-center w-full gap-2">

              <span>{{ option.id }}</span>

              <UPopover mode="hover">
                <span class="w-3 h-full flex items-center">

                  <span v-if="checkSched(act, option)" class="error flex items-center">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div class="p-2 error">Schedule Conflict</div>
                </template>
              </UPopover>

              <UPopover mode="hover">
                <span class="w-3 h-full flex items-center">

                  <span v-if="checkClasses(act, option) <= (act.sectionID === option.id ? -1 : 0)"
                    :class="`${checkClasses(act, option) < 0 ? 'error' : 'warning'} flex items-center`">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div :class="`p-2 ${checkClasses(act, option) < 0 ? 'error' : 'warning full'}`">{{ course?.name }}: {{
                    courseMeeting - checkClasses(act, option) }} / {{ courseMeeting }}</div>
                </template>
              </UPopover>

              <UPopover mode="hover" v-if="!!course">
                <span class="w-3 h-full flex items-center">

                  <span v-if="!option.section_courses.has(course)" class="warning flex items-center">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div class="p-2 warning">{{ option.id }} does not offer {{ course.name }}</div>
                </template>
              </UPopover>


            </div>
          </template>

        </USelectMenu>
      </div>
      <div>
        <UButton color="red" @click="remove" block>Delete</UButton>
      </div>

    </div>

    <!-- <SectionAlert class="text-red-500 mb-0" v-if="!act.sectionID">
      No Section
    </SectionAlert>
    <SectionAlert class="text-red-500 mb-0" v-if="!act.roomID">
      No Room
    </SectionAlert>
    <SectionAlert class="text-red-500 mb-0" v-if="!act.instructorID">
      No Instructor
    </SectionAlert> -->
    <div class="text-xs text-secondary-em flex justify-between justify-self-end">
      <span>{{ act.id }}</span>
      <span>{{ act.instance }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pulsating{
	box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
	transform: scale(1);
	animation: pulse 2s infinite ease-in-out;
}


@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
	}

	70% {
		transform: scale(1.1);
		box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
	}

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
	}
}
.error {
  @apply text-red-500;
}

.warning {
  @apply text-amber-500;

  &.full::after {
    content: ' (Full)';
  }
}

.comafy+.comafy::before {
  content: ', ';
}

.dashify+.dashify::before {
  content: ' - ';
}
</style>