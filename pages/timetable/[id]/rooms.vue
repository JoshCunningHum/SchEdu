<template>
    <div class="p-2 flex gap-2 h-full">
        <!-- Creation Modal -->
        <UModal v-model="isCreating" :ui="{ base: 'overflow-visible', rounded: 'overflow-visible' }">
            <UCard :ui="{ base: 'overflow-visible' }">
                <template #header>
                    <div>Add a room</div>
                </template>

                <UFormGroup label="Name" :error="isExisting(name) && 'Room name already in the list'"
                :help="!name ? 'Enter a room name' : !roomType ? 'Select a room type' : ''">
                    <div class="flex gap-1">

                        <UInput v-model="name" class="w-full" />
                        <div class="w-[200px]">

                            <USelectMenu searchable :search-attributes="['name']" :options="roomTypes" v-model="roomType">


                                <template #label>
                                    <span :style="`background: ${roomType?.color};`"
                                        class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
                                    <span class="min-h-[1rem]">{{ roomType?.name || `Select` }}</span>
                                </template>

                                <template #option="{ option: type }">
                                    <span :style="`background: ${type.color};`"
                                        class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
                                    <span class="truncate">{{ type.name }}</span>
                                </template>

                                <template #option-empty="{ query }">
                                    Not Found
                                </template>

                            </USelectMenu>

                        </div>

                    </div>
                </UFormGroup>
                <!-- 
                <SectionAlert class="mt-2">
                    Please put an alert here
                </SectionAlert> -->

                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <UButton @click="addRoom"  :disabled="name === '' || roomType === undefined || isExisting(name)">Add</UButton>
                    </div>
                </template>
            </UCard>
        </UModal>

        <!-- List -->
        <div class="flex flex-col gap-2 max-w-[200px] h-full">

            <!-- Search Rooms -->
            <UInput class="w-full" icon="i-mdi-search" v-model="search" />

            <!-- Room List -->
            <div v-if="rooms && rooms.length > 0" 
                class="flex-grow min-h-0 overflow-y-auto flex flex-col gap-1 scroll-stable">
                <template v-for="(r, i) in rooms">
                    <UChip inset v-if="search === '' || r.name.includes(search)" :show="!roomTypes.has(r.type)" :ui="{ 
                        base: 'absolute rounded-none ring-0', 
                        background: 'bg-transparent dark:bg-transparent',
                        translate: {
                            'top-right': '-translate-y-1/2 translate-x-16 transform'
                        }
                    }">

                        <template #content>
                            <UTooltip
                                class=" cursor-help"
                                :text="!roomTypes.has(r.type) ? 'Assigned to a non-existent room type' : ''">
                                
                            <UAvatar icon="i-mdi-alert"  size="sm" 
                                :ui="{ 
                                    wrapper: 'justify-end justify-items-end pt-1.5',
                                    rounded: 'rounded-full',
                                    icon: {
                                        base: 'text-red-500 dark:text-red-500',
                                    },
                                    background: 'bg-transparent dark:bg-transparent'
                                }" />

                            </UTooltip>
                        </template>

                        <UButton  :class="`w-full`"
                        truncate
                        :color="chosenIndex === i ? 'primary' : 'white'" :variant="chosenIndex == i ? 'solid' : 'outline'"
                        @click="select(i)">
                                <span :style="`background: ${r.type.color};`"
                                    class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
                            <span class="truncate">{{ r.name || "[No Name]" }}</span>
                        </UButton>
                    </UChip>
                </template>
            </div>
            <EmptyDisplay v-else>
                No Rooms Created
            </EmptyDisplay>

            <!-- Room Add -->
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

        <!-- Parameters -->
        <div class="flex flex-col gap-2 flex-grow border-l pl-2 border-secondary-em">

            <div v-if="chosen !== undefined" class="flex flex-col gap-2">
                
                <UFormGroup
                    :error="!roomTypes.has(chosen.type) ? 'Assigned to a non-existent room type' : undefined">
                    <div class="flex gap-1">
                    <UInput class="w-[200px]" placeholder="Name Here" icon="i-mdi-edit" :model-value="chosen.name" @update:model-value="rename" />
                    <div class="w-[125px]">
                        
                        <USelectMenu 
                        searchable 
                        :search-attributes="['name']" 
                        :options="roomTypes" 
                        v-model="chosenType">

                            <template #label>
                                <span :style="`background: ${chosenType?.color};`"
                                    class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
                                <span class="min-h-[1rem]">{{ chosenType?.name || `Select` }}</span>
                            </template>

                            <template #option="{ option: type }">
                                <span :style="`background: ${type.color};`"
                                    class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
                                <span class="truncate">{{ type.name }}</span>
                            </template>

                            <template #option-empty="{ query }">
                                Not Found
                            </template>

                        </USelectMenu>

                    </div>
                    <UButton label="Delete" @click="removeRoom" color="red" />
                </div>
                </UFormGroup>
                
                <SectionAlert class="border-secondary-em">
                    TODO: Put all the associated courses and teachers here
                </SectionAlert>
                
            </div>
            <EmptyDisplay v-else>
                No Room Selected
            </EmptyDisplay>

        </div>

    </div>
</template>

<script setup lang="ts">
import { RoomTypeArray, type RoomType } from '~/types/Room';


const roomStore = useRoomStore();
const settingsStore = useTimetableSettingsStore();

const rooms = computed(() => roomStore.rooms);
const roomTypes = computed<RoomTypeArray>(() => settingsStore.roomTypes || new RoomTypeArray());

// Modal
const isCreating = ref(false);
const _name = ref('');
const name = computed({
    get: () => _name.value,
    set: (s: string) => _name.value = s.trim()
});
const roomType = ref<RoomType | undefined>(roomTypes.value && roomTypes.value.length > 0 ? roomTypes.value[0] : undefined);

const isExisting = (name: string) => rooms.value?.has((r => r?.name === name));

defineShortcuts({
    enter: {
        usingInput: true,
        handler: () => isCreating.value && addRoom()
    },
    " ": {
        handler: () => isCreating.value = true
    }
})

const addRoom = () => {
    if (!name.value || !roomType.value) return;
    roomStore.addRoom(roomType.value, name.value);
    isCreating.value = false;
    name.value = '';
}

// Chosen Room
const chosenIndex = ref(-1);
const chosen = computed(() => chosenIndex.value >= 0 && chosenIndex.value < (rooms.value?.length || 0) && rooms.value ? rooms.value[chosenIndex.value] : undefined);


const search = ref('');

// Room operations
const chosenType = ref<RoomType | undefined>(roomTypes.value && roomTypes.value.length > 0 ? roomTypes.value[0] : undefined);

watch(chosenType, v => {
    if(chosen.value && v) chosen.value.type = v;
})

const select = (i: number) => {
    chosenIndex.value = i;
    if(chosen.value) chosenType.value = chosen.value.type;
}
const rename = (s: string) => {
    if(!!chosen.value) chosen.value.name = s.trim();
}


const removeRoom = () => {
    if(!rooms.value || !chosen.value) return;
    roomStore.removeRoom(chosen.value.id);
    chosenIndex.value = -1;
}

// On Mount Events
onMounted(() => {
    // Open Modal when there are no courses
    isCreating.value = !rooms.value?.length;
})

</script>

<style lang="scss" scoped></style>