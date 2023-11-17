<template>
    <UContainer>
        <UForm 
            ref="form"
            class="py-5 flex flex-col gap-4"
            :schema="schema"
            :state="values"
            @submit="submit">
            <div class="text-3xl pb-2">
                Login
            </div>

            <UFormGroup
                label="Email"
                name="email">
                <UInput v-model="values.email" />
            </UFormGroup>

            <UFormGroup
                label="Password"
                name="password">
                <UInput
                    v-model="values.password"
                    :type="`${isShowingPassword ? 'text' : 'password'}`"
                    :ui="{ icon: { trailing: { pointer: '' } } }">

                    <template #trailing>
                        <UButton 
                        :padded="false"
                        variant="link"
                        size="xl"
                        @click="isShowingPassword = !isShowingPassword">
                            <template #leading>
                                <UIcon v-if="isShowingPassword" name="i-mdi-eye" />
                                <UIcon v-else name="i-mdi-eye-off"/>
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

import { object, string} from 'yup';
import { AuthControl } from '~/composables/useAuthControl';

const isShowingPassword = ref(false);

const form = ref(null);
const values = ref({
    email: undefined,
    password: undefined
})

const schema = object({
    email: string()
        .email('Invalid email')
        .required('This item is required')
        .max(50, 'Max character limit')
        .test('logincred', 'Invalid Login Credentials', () => {
            return new Promise((resolve, reject) => resolve(!isCredentialsValid.value));
        }),
    password: string()
        .min(8, 'Must be at least 8 characters')
        .max(50, 'Max character limit')
        .required('Required').test('logincred', 'Invalid Login Credentials', () => {
        return new Promise((resolve, reject) => resolve(!isCredentialsValid.value));
    }),
});

const submit = async(event) => {
    const { email, password } = values.value;
    const response = await AuthControl.signIn(email, password);
    if(response !== true) {
        isCredentialsValid.value = true;
        form.value.validate();
    }
}

// TODO: Implement multipla async login validation 
const isCredentialsValid = ref(false);

watch(values, () => {
    isCredentialsValid.value = false;
}, { immediate: true, deep: true })

</script>

<style lang="scss" scoped>

</style>