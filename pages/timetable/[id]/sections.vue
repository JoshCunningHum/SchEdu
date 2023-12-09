<script setup lang="ts">

const courseStore = useCourseStore();
const sectionStore = useSectionStore();

const sections = computed(() => sectionStore.sections || []);
const courses = computed(() => courseStore.courses);

// Modal
const isCreating = ref(false);
const _name = ref('');
const name = computed({
    get: () => _name.value,
    set: (s: string) => _name.value = s.trim()
});
const isExisting = (id: string) => !!sections.value && sections.value.findIndex(s => s.id === id) !== -1;

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
const chosen = computed(() => chosenIndex.value >= 0 && chosenIndex.value < (sections.value?.length || 0) && sections.value ? sections.value[chosenIndex.value] : undefined);
const sectionCourses = computed(() => sections.value.filter(t => !chosen.value || !t.equals(chosen.value)).map(s => {
    return {
        label: s.id,
        courses: s.section_courses
    }
}));
const rename = (s: string) => {
    if(!!chosen.value) chosen.value.id = s.trim();
}

const select = (i: number) => {
    chosenIndex.value = i;
}

const removeSection = () => {
    if (!chosen.value) return;
    sectionStore.removeSection(chosen.value.id);
}



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
            <div v-if="sections && sections.length > 0" 
                class="w-[200px] flex-grow min-h-0 overflow-y-auto flex flex-col gap-1 scroll-stable">
                <template v-for="(s, i) in sections">
                    <!-- TODO: Add a Chip Error -->
                    <UChip inset v-if="search === '' || s.id.includes(search)" :show="false" :ui="{
                        base: 'absolute rounded-none ring-0',
                        background: 'bg-transparent dark:bg-transparent',
                        translate: {
                            'top-right': '-translate-y-1/2 translate-x-16 transform'
                        }
                    }">

                        <!-- TODO: Add a Tooltip Error on Chip -->
                        <template #content>
                            <UTooltip class=" cursor-help" :text="false ? 'Assigned to a non-existent room type' : ''">

                                <UAvatar icon="i-mdi-alert" size="sm" :ui="{
                                    wrapper: 'justify-end justify-items-end pt-1.5',
                                    rounded: 'rounded-full',
                                    icon: {
                                        base: 'text-red-500 dark:text-red-500',
                                    },
                                    background: 'bg-transparent dark:bg-transparent'
                                }" />

                            </UTooltip>
                        </template>

                        <UButton :class="`w-full`" truncate :color="chosenIndex === i ? 'primary' : 'white'"
                            :variant="chosenIndex == i ? 'solid' : 'outline'" @click="select(i)">
                            <span class="truncate">{{ s.id || "[No Name]" }}</span>
                        </UButton>
                    </UChip>
                </template>
            </div>
            <EmptyDisplay v-else class="w-[200px]">
                No Sections Created
            </EmptyDisplay>

            <!-- Section Add -->
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

        <!-- Section Params -->
        <div class="gap-2 w-full h-full border-l pl-2 border-secondary-em relative">

            <div v-if="chosen !== undefined" class="flex h-full flex-col gap-2">

                <UFormGroup
                    >
                    <div class="flex gap-1 flex-grow justify-between">
                        <div class="flex flex-grow gap-1">
                            
                            <UInput class="w-[200px]" placeholder="Name Here" icon="i-mdi-edit" :model-value="chosen.id" @update:model-value="rename" />
                            <UButton label="Delete" @click="removeSection" color="red" />

                        </div>
                    </div>
                </UFormGroup>

                <UFormGroup label="Course Selection" />

                <CourseSelection v-model="chosen.section_courses" :copies="sectionCourses"/>

            </div>
            <EmptyDisplay v-else>
                No Section Selected
            </EmptyDisplay>

        </div>

    </div>
</template>


<style lang="scss" scoped></style>