<template>
  <UModal v-model="AlwaysOpen" :ui="{ width: 'lg:w-52 md:w-52 sm:w-52' }" prevent-close>
    <div
      class="h-52 w-52 flex justify-center items-center gap-2 flex-col">
        <UIcon class="text-8xl loading" name="i-mdi-autorenew"/>
        <div cass="text-xl">{{ message }}</div>
    </div>
  </UModal>
</template>

<script lang="ts" setup>
const AlwaysOpen : Ref<boolean | undefined> = ref(true);

const props = defineProps({
  message: {
    type: String,
    default: "Loading"
  }
})

const message : string = props.message;

</script>

<style scoped lang="scss">

.loading {
  animation: loading 1s linear infinite;
}

@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to{
    transform: rotate(360deg);
  }
}
</style>

