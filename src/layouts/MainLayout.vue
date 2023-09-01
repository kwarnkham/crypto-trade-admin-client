<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          v-if="userStore.getUser"
        />

        <q-btn
          flat
          dense
          round
          icon="keyboard_arrow_left"
          aria-label="Back"
          @click="$router.go(-1)"
          v-if="!['index', 'login'].includes($route.name)"
        />

        <q-toolbar-title> Crypto Trade Admin </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered v-if="userStore.getUser">
      <q-list>
        <q-item-label header>
          Welcome : {{ userStore.getUser?.name }}
        </q-item-label>

        <EssentialLink
          v-for="link in links"
          :key="link.title"
          v-bind="link"
          :class="{ 'text-primary': link.name == $route.name }"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useUserStore } from "src/stores/user-store";
import { LocalStorage, useQuasar } from "quasar";
import { api, axiosInstance } from "src/boot/axios";
import { useRouter } from "vue-router";

const { dialog } = useQuasar();
const logout = () => {
  dialog({
    title: "Confirm",
    message: "Do you want to logout?",
    noBackdropDismiss: true,
    cancel: true,
  }).onOk(() => {
    api({
      method: "POST",
      url: "/admin/logout",
    });
    LocalStorage.remove("token");
    LocalStorage.remove("user");
    userStore.setUser(null);
    axiosInstance.defaults.headers.common["Authorization"] = undefined;
    router.replace({ name: "login" });
  });
};

const router = useRouter();

const leftDrawerOpen = ref(false);

const userStore = useUserStore();

const links = [
  {
    title: "Home",
    icon: "home",
    name: "index",
    action: () => {
      router.push({ name: "index" });
    },
  },
  {
    title: "Agents",
    icon: "group",
    name: "agents",
    action: () => {
      router.push({ name: "agents" });
    },
  },
  {
    title: "Wallets",
    icon: "home",
    name: "wallets",
    action: () => {
      router.push({ name: "wallets" });
    },
  },
  {
    title: "Change Password",
    icon: "lock",
    name: "change-password",
    action: () => {
      router.push({ name: "change-password" });
    },
  },
  {
    title: "Logout",
    icon: "logout",
    action: logout,
  },
];
</script>
