<script lang="ts" setup>
import { number } from 'yup';


const props = defineProps({
  modelValue: {
    type: Number
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: number) : void
}>();

const value = computed({
  get: () => props.modelValue || 0,
  set: (v: number) => emit('update:modelValue', v)
});

const range = computed(() => props.max - props.min);

const thumb = ref<InstanceType<typeof HTMLDivElement>>(),
  progress = ref<InstanceType<typeof HTMLDivElement>>(),
  track = ref(null);

const { pressed } = useMousePressed({ target: thumb });
const { elementY: top, elementHeight: height } = useMouseInElement(track);

whenever(top, () => {
  if(!thumb.value || !pressed.value || !progress.value) return;

  const rawTop = top.value < 0 ? 0 : top.value > height.value ? height.value : top.value;
  const steps = range.value / props.step;
  const perc = rawTop / height.value;
  const rounded = Math.ceil(perc * steps);
  const ny = (rounded / steps) * height.value;

  thumb.value.style.top = `${ny}px`;
  progress.value.style.height = `${ny}px`;
  value.value = props.min + (ny / height.value) * range.value;
})

</script>

<template>
  <div class="h-full w-4 flex justify-center relative pb-1 select-none">
      <div class="rounded-full bg-primary h-full cursor-pointer" style="width: 2px;" ref="track">
      </div>
      <div class="absolute rounded-full bg-accent" style="width: 2px;" ref="progress"></div>
      <div class="cursor-pointer w-2 h-2 rounded-full bg-primary absolute border border-accent mx-auto" ref="thumb"></div>
  </div>
</template>

<style lang="scss" scoped>

</style>