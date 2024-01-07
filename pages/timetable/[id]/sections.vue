<script setup lang="ts">

const courseStore = useCourseStore();
const sectionStore = useSectionStore();

const sections = computed(() => sectionStore.sections || []);
const sectiongroups = computed(() => sectionStore.sectiongroups);
const courses = computed(() => courseStore.courses);

// Modal
const isCreating = ref(false);
const _name = ref('');
const name = computed({
    get: () => _name.value,
    set: (s: string) => _name.value = s.trim()
});
const isExisting = (id: string) => sectiongroups.value.some(s => s === id);

const addSection = () => {
    if (name.value === '' || isExisting(name.value)) return;
    sectionStore.addSection(name.value);
    isCreating.value = false;
    name.value = '';
}

defineShortcuts({
    enter: {
        usingInput: true,
        handler: () => isCreating.value && addSection()
    },
    " ": {
        handler: () => isCreating.value = true
    }
})

// Section Params
const search = ref('');
const chosenIndex = ref(-1);
const chosen = computed(() =>
    chosenIndex.value >= 0 &&
        chosenIndex.value < (sectiongroups.value?.length || 0)
        ? sectiongroups.value[chosenIndex.value]
        : undefined);
const chosenGroup = useArrayFilter(sections, s => s.id === chosen.value);

const sectionCourses = computed(() => sections.value
    .filter(t => !chosen.value || t.id !== chosen.value)
    .map(s => {
        return {
            label: s.id,
            courses: s.section_courses
        }
    }
    ));

const rename = (s: string) => {
    if (typeof chosen.value !== 'string') return;
    sectionStore.renameSection(chosen.value, s.trim());
}

const select = (i: number) => {
    chosenIndex.value = i;
}

const removeSection = () => {
    if (!chosen.value) return;
    sectionStore.removeSection(chosen.value);
}

const chosenYearLevel = ref(-1);
const chosenSection = useArrayFind(chosenGroup, s => s.year_level === chosenYearLevel.value);


// On Mount Events
onMounted(() => {
    // Open Modal when there are no courses
    isCreating.value = !sections.value?.length;
})

</script>

<template>
    <div class="p-2 flex gap-2 h-full min-h-0">

        <!-- Creation Modal -->
        <UModal v-model="isCreating" :ui="{ base: 'overflow-visible', rounded: 'overflow-visible' }">
            <UCard :ui="{ base: 'overflow-visible' }">
                <template #header>
                    <div>Add a Section</div>
                </template>

                <UFormGroup label="Name" :error="isExisting(name) && 'Section name already in the list'"
                    :help="!name ? 'Enter a section name' : ''">
                    <div class="flex gap-1">
                        <UInput v-model="name" class="w-full" />
                    </div>
                </UFormGroup>
                <!-- 
                <SectionAlert class="mt-2">
                    Please put an alert here
                </SectionAlert> -->

                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <UButton @click="addSection" :disabled="name === '' || isExisting(name)">Add</UButton>
                    </div>
                </template>
            </UCard>
        </UModal>

        <!-- Section List -->
        <div class="flex flex-col gap-2 max-w-[200px] h-full">

            <!-- Search Rooms -->
            <UInput class="w-[200px]" icon="i-mdi-search" v-model="search" />

            <!-- Section List -->
            <div v-if="sectiongroups" class="w-[200px] flex-grow min-h-0 overflow-y-auto flex flex-col gap-1 scroll-stable">
                <template v-for="(s, i) in sectiongroups">

                    <UButton :class="`w-full`" truncate :color="chosenIndex === i ? 'primary' : 'white'"
                        :variant="chosenIndex == i ? 'solid' : 'outline'" @click="select(i)">
                        <span class="truncate">{{ s || "[No Name]" }}</span>
                    </UButton>

                </template>
            </div>
            <EmptyDisplay v-else class="w-[200px]">
                No Sections Created
            </EmptyDisplay>

            <!-- Section Add -->
            <div class="w-full flex gap-1">
                <div>
                    <UButtonGroup block orientation="horizontal" class="w-full">
                        <UTooltip :shortcuts="['SPACE']" :popper="{ placement: 'top' }" text="Add">
                            <UButton icon="i-mdi-plus" @click="isCreating = true" />
                        </UTooltip>
                        <UButton label="Import" />
                    </UButtonGroup>
                </div>
                <div class="flex-grow">
                    <UButton block label="Export" color="gray" />
                </div>
            </div>

        </div>

        <!-- Section Params -->
        <div class="gap-2 w-full h-full border-l pl-2 border-secondary-em relative">

            <div v-if="chosen !== undefined" class="flex h-full flex-col gap-2">

                <UFormGroup>
                    <div class="flex gap-1 flex-grow justify-between">
                        <div class="flex flex-grow gap-1">

                            <UInput class="w-[200px]" placeholder="Name Here" icon="i-mdi-edit" :model-value="chosen"
                                @update:model-value="rename" />
                            <UButton label="Delete" @click="removeSection" color="red" />

                        </div>
                    </div>
                </UFormGroup>

                <UFormGroup label="Year Selection" />

                <div class="flex justfiy-between w-full gap-2">

                    <div class="flex gap-2 flex-grow">
                        <UButtonGroup v-for="yr in chosenGroup" :key="yr._id">
                            <UButton 
                            @click="chosenYearLevel = yr.year_level"
                            :color="!!chosenSection && chosenSection.year_level === yr.year_level ? 'green' : 'gray'">
                            {{ useOrdinalize(yr.year_level) }} year
                            </UButton>
                            <UButton 
                                color="gray" 
                                icon="i-mdi-close" 
                                :padded="false" 
                                :ui="{
                                    color: {
                                        gray: {
                                            solid: 'hover:bg-red-100 dark:hover:bg-red-700/50'
                                        }
                                    }
                                }"
                                @click="sectionStore.removeYearLevel(yr._id)"
                                variant="solid" />
                        </UButtonGroup>
                    </div>

                    <UButton
                        :disabled="chosenGroup.length >= 6" 
                        @click="sectionStore.addYearLevel(chosen)">
                        Add Year Level
                    </UButton>
                </div>

                <UFormGroup 
                v-if="!!chosenSection" 
                :label="`Course Selection - ${useOrdinalize(chosenSection.year_level)} year`" />

                <CourseSelection 
                v-if="!!chosenSection"
                v-model="chosenSection.section_courses" 
                :copies="sectionCourses" />

            </div>
            <EmptyDisplay v-else>
                No Section Selected
            </EmptyDisplay>

        </div>

    </div>
</template>


<style lang="scss" scoped></style>