<template>
    <UContainer :ui="{ padding: 'p-0' }">
        <UForm 
            ref="form"
            class="py-5 flex flex-col gap-4"
            :schema="schema"
            :state="values"
            @submit="submit">
            <div class="text-3xl pb-2">
                Registration
            </div>

            <UFormGroup
                label="Institution Name"
                name="username">
                <UInput v-model="values.username" />
            </UFormGroup>

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
                                <UIcon v-if="isShowingPassword" name="i-mdi-eye-off" />
                                <UIcon v-else name="i-mdi-eye"/>
                            </template>
                        </UButton>
                    </template>

                </UInput>
            </UFormGroup>

            <UFormGroup
                label="Confirm Password"
                name="confirmpassword">
                <UInput
                    v-model="values.confirmpassword"
                    :type="`${isShowingPassword ? 'text' : 'password'}`"
                    :ui="{ icon: { trailing: { pointer: '' } } }">

                    <template #trailing>
                        <UButton 
                        :padded="false"
                        variant="link"
                        size="xl"
                        @click="isShowingPassword = !isShowingPassword">
                            <template #leading>
                                <UIcon v-if="isShowingPassword" name="i-mdi-eye-off" />
                                <UIcon v-else name="i-mdi-eye"/>
                            </template>
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
import * as Yup from 'yup';
import { useSignUp } from '~/composables/useSignUp';

const existingEmail = ref('');

const values = ref({
    username: undefined,
    email: undefined,
    password: undefined,
    confirmpassword: undefined
});

const form = ref(null);

const schema = Yup.object({
    username: Yup.string().required('Required').max(50, 'Max character limit'),
    email: Yup.string().email('Invalid Email').required('Required').max(50, 'Max character limit')
        .test('checkDupEmail', 'Email already used!', () => { 
            return new Promise((resolve, reject) => {
                resolve(values.value.email !== existingEmail.value);
            })
         }),
    password: Yup.string().min(8, 'A minimum of 8 characters').max(50, 'Max character limit').required('Required'),
    confirmpassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').max(50, 'Max character limit')
});

const isShowingPassword = ref(false);

const submit = async(event) => {
    const { email, password, username } = values.value;
    const response = await useSignUp(email, password, username);
    if(response instanceof Error){
        existingEmail.value = email;
        form.value.validate();
    }
}

</script>

<style lang="scss" scoped>

</style>