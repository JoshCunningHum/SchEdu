<template>
    <UContainer :ui="{ padding: 'p-0' }">
        <UForm 
            ref="form"
            class="py-5 flex flex-col gap-4">
            <div class="text-3xl pb-2">
                Registration
            </div>

            <UFormGroup
                label="Institution Name"
                name="username">
                <UInput/>
            </UFormGroup>

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
                        </UButton>
                    </template>

                </UInput>
            </UFormGroup>

            <UFormGroup
                label="Confirm Password"
                name="confirmpassword">
                <UInput>

                    <template #trailing>
                        <UButton 
                        :padded="false"
                        variant="link"
                        size="xl">
                        </UButton>
                    </template>

                </UInput>
            </UFormGroup>

            <UButton type="submit" block class="text-center">
                Register
            </UButton>

        </UForm>
        <hr class="border-grayl">
        <div class="py-5">
            
            Already have an account?
            <UButton block color="white" to="/login">
                Sign in here
            </UButton>

        </div>
    </UContainer>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>