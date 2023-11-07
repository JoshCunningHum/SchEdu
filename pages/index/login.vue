<template>
    <UContainer>
        <UForm 
            ref="form"
            class="py-5 flex flex-col gap-4">
            <div class="text-3xl pb-2">
                Login
            </div>

            <UFormGroup
                label="Email"
                name="email">
                <UInput />
            </UFormGroup>

            <UFormGroup
                label="Password"
                name="password">
                <UInput>

                    <template #trailing>
                        <UButton 
                        :padded="false"
                        variant="link"
                        size="xl">
                            <template #leading>
                                <!-- TODO: Show password icons -->
                            </template>
                        </UButton>
                    </template>

                </UInput>
            </UFormGroup>

            <UButton type="submit" block class="text-center">
                Login
            </UButton>

        </UForm>
        <hr class="border-grayl">
        <div class="py-5">
            
            Are you an education institution?
            <UButton block color="white" to="/register">
                Sign Up
            </UButton>

        </div>
    </UContainer>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>