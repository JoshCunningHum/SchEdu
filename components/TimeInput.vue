<script lang="ts" setup>

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  } 
});

const emit = defineEmits(['update:modelValue']);

const value = ref(props.modelValue);

const isPmOptions : {name: string, value: number}[] = [{
  name: 'AM',
  value: 0,
},{
  name: 'PM',
  value: 1
}];

const hr = ref<number>(0);
const min = ref<number>(0);

const minStr = computed({
  get: () => min.value.toString().padStart(2, '0'),
  set: v => min.value = parseInt(v)
})

const isPM = ref<{name: string, value: number}>(isPmOptions[0]);


const fromValueToComponent = () => {
  const { hrs, mins, isPM: _isPM} = useMinutesToTime(value.value);
  hr.value = hrs;
  min.value = mins;
  isPM.value = isPmOptions[_isPM ? 1 : 0];
}

onMounted(() => {
  fromValueToComponent();
})

onUpdated(() => {
  value.value = props.modelValue;
  fromValueToComponent();
})

const fromComponentToValue = () => {
  value.value = hr.value * 60 + min.value + isPM.value.value * 720;
  emit('update:modelValue', value.value);
}
watch(hr, v => {
  if(v < 0) hr.value = 0;
  if(v > 12) hr.value = 12;
  fromComponentToValue();
})

watch(min, v => {
  if(v < 0) min.value = 0;
  if(v > 59) min.value = 59;
  fromComponentToValue();
})

</script>

<template>
  <div class="flex gap-0.5 items-center">
    <UInput class="w-[60px]" type="number" v-model="hr" />:
    <UInput class="w-[60px]" type="number" v-model="minStr" />
    <USelectMenu v-model="isPM" :options="isPmOptions" option-attribute="name"/>
  </div>
</template>

<style lang="scss" scoped>

</style>