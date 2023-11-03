<template>
    <div>

    </div>
</template>

<script setup>

// Redirect to dashboard when there is route is only timetables
const route = useRoute();
const router = useRouter();


if(route.path === '/timetable') router.push('/dashboard');

</script>

<style lang="scss" scoped>

</style>