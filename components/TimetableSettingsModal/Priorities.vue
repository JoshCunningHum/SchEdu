<script lang="ts" setup>
import draggable from 'vuedraggable';
import { Day } from '~/types/DaySched';

const timetableStore = useTimetableStore();
const settings = computed(() => timetableStore.selected?.data?.params.settings);

const once = computed<number[]>({
  get: () => settings.value?.once_prio.flat() || [],
  set: (v : number[]) => {
    if(settings.value === undefined) return;
    settings.value.once_prio.splice(0);
    settings.value.once_prio.push(...v.map(n => [n]));
  }
});
const twice = computed<number[]>({
  get: () => settings.value?.twice_prio.flat() || [],
  set: (v: number[]) => {
    if(settings.value === undefined) return;
    settings.value.twice_prio.splice(0);
    settings.value.twice_prio.push(...Array(3).fill(0).map((_, i) => [v[i*2], v[i*2+1]]));
  }
});
const thrice = computed<number[]>({
  get: () => settings.value?.thrice_prio.flat() || [],
  set: (v: number[]) => {
    if(settings.value === undefined) return;
    settings.value.thrice_prio.splice(0);
    settings.value.thrice_prio.push(...Array(2).fill(0).map((_, i) => [v[i*3], v[i*3+1], v[i*3+2]]));
  }
});


const setToDefault = () => {
  once.value = [3, 6, 1, 5, 2, 4];
  twice.value = [2, 4, 1, 5, 3, 6];
  thrice.value = [1, 3, 5, 2, 4, 6];
}

</script>

<template>
  <div>
    <SectionAlert>
      Do not modify if not sure what you are doing
    </SectionAlert>

    <div class="flex gap-5">

      <!-- Once Per Week -->
      <div class="flex justify-center max-w-fit">
        <UFormGroup label="Once per week">
          <draggable v-model="once" class="_v___" :component-data="{
            tag: 'div',
            type: 'transition-group',
            name: 'flip-list'
          }" :="{
  animation: 200,
  group: 'once',
  disabled: false,
  ghostClass: 'ghost'
}" tag="transition-group">
            <template #item="{ element: el }">
              <div class="v_v_item bg-accent" @click="el.fixed = !el.fixed">{{ Day[el] }}</div>
            </template>
          </draggable>

        </UFormGroup>
      </div>

      <!-- Twice Per Week -->
      <div class="flex justify-center max-w-fit">
        <UFormGroup label="Twice per week">
          
          <div class="v_grouper-container">
            <div class="v_twice"></div>
            <div class="v_twice"></div>
            <div class="v_twice"></div>
          </div>

          <draggable v-model="twice" class="_v___" :component-data="{
            tag: 'div',
            type: 'transition-group',
            name: 'flip-list'
          }" :="{
  animation: 200,
  group: 'twice',
  disabled: false,
  ghostClass: 'ghost'
}" tag="transition-group">
            <template #item="{ element: el }">
              <div class="v_v_item bg-accent" @click="el.fixed = !el.fixed">{{ Day[el] }}</div>
            </template>
          </draggable>

        </UFormGroup>
      </div>

      <!-- Thrice Per Week -->
      <div class="flex justify-center max-w-fit">
        <UFormGroup label="Thrice per week" class="relative">
          
          <div class="v_grouper-container">
            <div class="v_thrice"></div>
            <div class="v_thrice"></div>
          </div>

          <draggable v-model="thrice" class="_v___" :component-data="{
            tag: 'div',
            type: 'transition-group',
            name: 'flip-list'
          }" :="{
  animation: 200,
  group: 'thrice',
  disabled: false,
  ghostClass: 'ghost'
}" tag="transition-group">
            <template #item="{ element: el }">
              <div class="v_v_item bg-accent" @click="el.fixed = !el.fixed">{{ Day[el] }}</div>
            </template>
          </draggable>


        </UFormGroup>
      </div>

    </div>

    <div class="mt-2">
      <UButton color=gray @click="setToDefault" >Reset to Default</UButton>
    </div>

  </div>
</template>

<style lang="scss">
.v_v_item {
  @apply w-20 px-2 py-1 text-center rounded-sm;

  font-family: 'JetBrains Mono';
  // font-weight: 500;
  height: 32px;
  cursor: default;

  &:hover {
    cursor: move;
  }

}

.v_grouper-container{
  padding: 16px 0px;
  gap: 36px;
  @apply absolute flex flex-col top-0 left-0 py-4;

  .v_thrice{
    height: 72px;
  }

  .v_twice{
    height: 36px;
  }

  & > div {
    @apply w-5 border-l border-y border-white rounded;
  }
}

._v___ {
  @apply flex flex-col gap-1 items-center relative;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>