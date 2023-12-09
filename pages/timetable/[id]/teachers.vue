<template>
    <div class="p-2 flex gap-2 h-full">
        <!-- Creation Modal -->
        <UModal v-model="isCreating">
            <UCard>
                <template #header>
                    <div>Add a teacher</div>
                </template>

                <UFormGroup label="Name" :error="isExisting(name) && 'Teacher name already in the list'">
                    <UInput v-model="name" name="name"/>
                </UFormGroup>

                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <UButton @click="addTeacher" :disabled="name === ''">Add</UButton>
                    </div>
                </template>
            </UCard>
        </UModal>

        <div class="flex flex-col gap-2 h-full max-w-[200px]">
            
            <UInput icon="i-mdi-search" v-model="searchValue" />

            <!-- Teacher List -->
            <!-- TODO: Add a warning chip if there's a problem with the teacher -->
            <div class="w-[200px] flex gap-1 flex-grow overflow-y-auto flex-col overflow-x-hidden scroll-stable">
                <template v-for="(t, index) in teachers">
                    <UButton v-if="t.name.toLowerCase().includes(searchValue.toLowerCase())" 
                    :variant="`${selected?.id === t.id ? 'solid' : 'outline'}`"
                    :key="t.id"
                    truncate 
                    @click="select(index)"
                    class="w-full" 
                    :color="`${selected?.id === t.id ? 'primary' : 'white'}`" 
                    :label="t.name || `[No Name]`"/>
                </template>
                <EmptyDisplay v-if="filteredTeacher.length === 0">
                    No Teacher Created
                </EmptyDisplay>
            </div>

            <div class="flex gap-1">    
                <div>
                    <UButtonGroup block orientation="horizontal" class="w-full">
                        <UTooltip :shortcuts="['SPACE']" :popper="{ placement: 'top'}" text="Add">
                            <UButton icon="i-mdi-plus" @click="isCreating = true"/>
                        </UTooltip>
                        <UButton label="Import" />
                    </UButtonGroup>
                </div>        
                <div class="flex-grow">
                    <UButton block label="Export" color="gray"  />
                </div>
            </div>
        </div>

        <div class="h-full w-full border-secondary-em border-l pl-2 flex flex-col gap-2">   
        <!-- Teacher Parameters -->
            <template v-if="selected !== undefined">

                <div>
                    <div class="flex gap-2 items-start">
                        <UFormGroup :error="teacherLastIndex(selected.name) !== selectedIndex && 'Teacher name already in the list'">
                            <UInput icon="i-mdi-edit" placeholder="Name" :model-value="selected.name" @update:model-value="rename"/>
                        </UFormGroup>
                        <UButton label="Delete" color="red" @click="deleteTeacher"/>
                    </div>
                </div>
                <div class="flex roboto">
                    <div class="flex-grow flex flex-col gap-2">
                        <UFormGroup label="Schedule Customize">
                            <DaySchedInput :scheds="selected.scheds" />
                        </UFormGroup>
                        <SectionAlert class="border-secondary-em">
                            Timetable period setting still preceeds, teachers can't start before the period start even if what is in here is before it.
                        </SectionAlert>
                        <UFormGroup label="Course Selection">
                        </UFormGroup>
                    </div>
                </div>
                <CourseSelection v-model="selected.compatible_courses" :copies="teacherCourses"/>

            </template>
            <EmptyDisplay v-else>
                No Teacher Selected
            </EmptyDisplay>
        </div>
    </div>
</template>

<script setup>

const teacherStore = useTeacherStore();

const searchValue = ref('');
const teachers = computed(() => teacherStore.teachers || [])
const filteredTeacher = computed(() => searchValue.value === '' ? teachers.value : teachers.value.filter(t => t.name.includes(searchValue.value)));

const selectedIndex = ref(-1);
const selected = computed(() => teachers.value[selectedIndex.value]);

const select = (index) => {
    selectedIndex.value = index;
}


const teacherCourses = computed(() => teachers.value.filter(t => !t.equals(selected.value)).map(t => {
    return {
        label: t.name,
        courses: t.compatible_courses
    }
}));

// Create a teacher
const isCreating = ref(false);
const _name = ref('');
const name = computed({
    get: () => _name.value,
    set: s => _name.value = s.trim()
});
const teacherLastIndex = name => teachers.value.findLastIndex(t => t.name == name);
const isExisting = name => teachers.value.findIndex(t => t.name === name) !== -1;
defineShortcuts({
    enter: {
        usingInput: true,
        handler: () => isCreating.value && addTeacher()
    },
    " ": {
        handler: () => isCreating.value = true
    }
})
const rename = (s) => {
    if(!!selected.value) selected.value.name = s.trim();
}
const addTeacher = () => {
    if(name.value === '') return;
    teacherStore.addTeacher(name.value);
    name.value = '';
    isCreating.value = false;
}
const deleteTeacher = () => {
    teacherStore.removeTeacher(selected.value.id);
}

// On Mount Events 
onMounted(() => {
    // Open Modal when there are no courses
    isCreating.value = !teachers.value?.length;
})

</script>

<style lang="scss" scoped>

</style>