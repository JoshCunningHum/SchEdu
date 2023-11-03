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
            
            <UInput icon="i-mdi-search" color="gray"/>

            <!-- Teacher List -->
            <div class="flex gap-1 flex-grow w-full overflow-y-auto flex-col overflow-x-hidden">
                <UButton v-for="(t, index) in teachers" 
                truncate 
                @click="select(t, index)"
                class="w-[200px]" 
                :color="`${selected?.name === t.name ? 'primary' : 'gray'}`" 
                :label="t.name || `[No Name]`"/>
            </div>

            <div class="flex gap-1">    
                <div>
                    <UButtonGroup block orientation="horizontal" class="w-full">
                        <UButton icon="i-mdi-plus" @click="isCreating = true"/>
                        <UButton label="Import" />
                    </UButtonGroup>
                </div>        
                <div class="flex-grow">
                    <UButton block label="Export" />
                </div>
            </div>
        </div>
        <div class="flex-grow">   
            <template v-if="selected !== undefined">
                <div>
                    <div class="flex gap-2 items-start">
                        <UFormGroup :error="teacherLastIndex(selected.name) !== selectedIndex && 'Teacher name already in the list'">
                            <UInput icon="i-mdi-edit" placeholder="Name" v-model="selected.name"/>
                        </UFormGroup>
                        <UButton label="Delete" color="red" />
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="w-full h-full text-secondary-em flex justify-center items-center roboto">
                    <span>No Teacher Selected</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>

const teacherStore = useTeacherStore();

const teachers = computed(() => teacherStore.teachers || [])

const selected = ref(undefined);
const selectedIndex = ref(-1);

const select = (teacher, index) => {
    selected.value = teacher;
    selectedIndex.value = index;

    // Update other UIs
}

// Create a teacher
const isCreating = ref(false);
const name = ref('');
const teacherLastIndex = name => teachers.value.findLastIndex(t => t.name == name);
const isExisting = name => teachers.value.findIndex(t => t.name === name) !== -1;
defineShortcuts({
    enter: {
        usingInput: true,
        handler: () => isCreating.value && addTeacher()
    }
})
const addTeacher = () => {
    if(name.value === '') return;
    teacherStore.addTeacher(name.value);
    name.value = '';
    isCreating.value = false;
}

</script>

<style lang="scss" scoped>

</style>