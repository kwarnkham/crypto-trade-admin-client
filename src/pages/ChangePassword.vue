<template>
  <q-page padding>
    <q-form @submit.prevent="submit" class="q-pa-sm q-gutter-y-sm">
      <div class="text-center text-h5">Change Password</div>
      <input
        :value="userStore.getUser.name"
        class="hidden"
        autocomplete="username"
      />
      <q-input
        v-model="password"
        autocomplete="current-password"
        label="Password"
        required
        :type="showPassword ? 'text' : 'password'"
      />
      <q-input
        v-model="newPassword"
        autocomplete="new-password"
        label="New Password"
        required
        :type="showPassword ? 'text' : 'password'"
      />
      <q-input
        v-model="newPasswordAgain"
        autocomplete="new-password"
        label="New Password Again"
        required
        :type="showPassword ? 'text' : 'password'"
        lazy-rules
        :rules="[
          (val) => val == newPassword || 'New passwords are not the same',
        ]"
      />
      <div class="text-right">
        <q-checkbox label="Show Password" v-model="showPassword" />
      </div>
      <div class="text-right">
        <q-btn label="Update" type="submit" no-caps />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { api } from "src/boot/axios";
import { useUserStore } from "src/stores/user-store";
import { ref } from "vue";

const password = ref("");
const newPassword = ref("");
const newPasswordAgain = ref("");
const showPassword = ref(false);
const userStore = useUserStore();
const { notify } = useQuasar();
const submit = () => {
  api({
    method: "POST",
    url: "admin/change-password",
    data: {
      password: password.value,
      new_password: newPassword.value,
      new_password_confirmation: newPasswordAgain.value,
    },
  })
    .then((_) => {
      password.value = "";
      newPassword.value = "";
      newPasswordAgain.value = "";
      notify({
        message: "Updated",
        type: "positive",
      });
    })
    .catch((error) => {
      notify({
        message: error?.response?.data?.message ?? error.message,
        type: "negative",
      });
    });
};
</script>
