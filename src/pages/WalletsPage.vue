<template>
  <q-page padding class="column" :style-fn="vhPage">
    <div class="text-h5 row items-center justify-center">
      Wallets <q-btn icon="add" flat color="primary" @click="addWallet" />
    </div>
    <template v-if="pagination?.data?.length">
      <q-markup-table
        separator="horizontal"
        flat
        bordered
        class="col overflow-auto"
      >
        <thead>
          <tr>
            <th class="text-left">#</th>
            <th class="text-right">Address</th>
            <th class="text-right">TRX</th>
            <th class="text-right">USDT</th>
            <th class="text-right">Resource</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="wallet in pagination.data" :key="wallet.id">
            <td class="text-left">{{ wallet.id }}</td>
            <td
              class="text-right"
              :class="{ 'text-warning': !wallet.activated_at }"
            >
              {{ wallet.base58_check
              }}<q-btn
                dense
                icon="content_copy"
                flat
                @click="copyAddress(wallet.base58_check)"
              />
            </td>
            <td class="text-right">{{ wallet.trx.toLocaleString() }}</td>
            <td class="text-right">{{ wallet.balance.toLocaleString() }}</td>
            <td class="text-right">{{ wallet.resource }}</td>
            <td class="text-right">
              <q-btn
                label="Activate"
                no-caps
                dense
                flat
                @click="activateWallet(wallet.id)"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
      <div
        class="row justify-center full-width"
        :class="{
          hidden:
            pagination?.current_page == 1 && pagination?.next_page_url == null,
        }"
      >
        <q-pagination v-model="current" :max="max" input />
      </div>
    </template>
    <div v-else class="text-center">No wallets yet</div>
  </q-page>
</template>

<script setup>
import { copyToClipboard, useQuasar } from "quasar";
import { api } from "src/boot/axios";
import usePagination from "src/composables/pagination";

const { pagination, current, max } = usePagination("wallets");

const { notify, dialog } = useQuasar();

const copyAddress = (address) => {
  copyToClipboard(address)
    .then((_) => {
      notify({
        type: "positive",
        message: "Address has been copied",
      });
    })
    .catch((error) => {
      notify({
        type: "negative",
        message: error.message,
      });
    });
};

const activateWallet = (walletId) => {
  dialog({
    title: "Confirm",
    message: "Only activate the wallet after you deposit TRX to the wallet",
    noBackdropDismiss: true,
    cancel: true,
  }).onOk(() => {
    api({
      method: "POST",
      url: `/wallets/${walletId}/activate`,
    })
      .then(({ data }) => {
        const index = wallets.value.findIndex((e) => e.id == data.wallet.id);
        wallets.value.splice(index, data.wallet);
      })
      .catch((error) => {
        notify({
          message: error.message,
          type: "negative",
        });
      });
  });
};

const addWallet = () => {
  dialog({
    title: "Confirm",
    message: "Do you want to add a new system wallet?",
    noBackdropDismiss: true,
    cancel: true,
  }).onOk(() => {
    api({
      method: "POST",
      url: "/wallets",
    })
      .then(({ data }) => {
        pagination.value.data.push(data.wallet);
      })
      .catch((error) => {
        notify({
          type: "negative",
          message: error.message,
        });
      });
  });
};

const vhPage = (offset, height) => ({
  height: height - offset + "px",
});
</script>
