<template>
  <q-page padding>
    <q-form @submit.prevent="submit" class="q-pa-sm q-gutter-y-sm">
      <div class="text-center text-h5">Login</div>
      <q-input label="Name" v-model="name" required autocomplete="username" />
      <q-input
        label="Password"
        v-model="password"
        required
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
      />
      <div class="text-right">
        <q-checkbox label="Show Password" v-model="showPassword" />
      </div>
      <div class="text-right">
        <q-btn type="submit" label="Login" no-caps />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { api, axiosInstance } from "src/boot/axios";
import { ref } from "vue";
import { useUserStore } from "src/stores/user-store";
import { useRouter } from "vue-router";

const name = ref("");
const password = ref("");
const showPassword = ref(false);
const { localStorage, notify } = useQuasar();
const { setUser } = useUserStore();
const router = useRouter();

const submit = () => {
  api({
    method: "POST",
    url: "/admin/login",
    data: {
      name: name.value,
      password: password.value,
    },
  })
    .then(({ data }) => {
      localStorage.set("token", data.token);
      localStorage.set("user", data.admin);
      axiosInstance.defaults.headers.common["Authorization"] =
        "Bearer " + data.token;
      setUser(data.admin);
      router.replace({
        name: "index",
      });
    })
    .catch((e) => {
      notify({
        type: "negative",
        message: e?.response?.data?.message ?? e.message,
      });
    });
};
</script>
