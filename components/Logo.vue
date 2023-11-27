<template>
    <div id="root" :style="`font-size: ${fontSize}`" @click="goHome" class="cursor-pointer w-full h-full">
        <div v-if="isMini">
            <span>S</span>
            <span class="text-accent">E</span>
        </div>
        <div v-else-if="isWide" class="max-w-min">
            <div class="max-w-min" :style="`line-height: ${fontSize};`">SCH<span class="text-accent">EDU</span>LE</div>
            <div class="max-w-min text-accent" :style="`line-height: ${fontSize}; margin-top: -10px`">&nbsp;&nbsp;&nbsp;CATION</div>
        </div>
        <div class="h-full w-full" v-else-if="isCalendar">
            <img class="h-full w-full" src="@/assets/logo/logo-calendar.png">
        </div>
        <div v-else>
            <span>SCH</span>
            <span class="text-accent">EDU</span>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    mini: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: "inherit"
    },
    wide: {
        type: Boolean,
        default: false
    },
    calendar: {
        type: Boolean,
        default: false
    },
})

const isMini = ref(props.mini);
const isWide = ref(props.wide);
const isCalendar = ref(props.calendar);
const fontSize = ref(props.size);

const goHome = () => {
    useRouter().push('/dashboard');
}

</script>

<style lang="scss" scoped>
#root {
    font-family: 'JetBrains Mono';
    font-weight: 600;
}
</style>