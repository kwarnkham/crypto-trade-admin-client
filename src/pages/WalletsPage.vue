<template>
  <q-page padding>
    <div class="row q-mb-sm">
      <div class="col">
        <q-select
          filled
          v-model="agent"
          :options="agents"
          label="Choose Agents"
          emit-value
          map-options
        />
      </div>
      <div class="col-3"></div>
      <div class="col-7">
        <div class="text-h5 row items-center">
          Wallets <q-btn icon="add" flat color="primary" @click="addWallet" />
        </div>
      </div>
    </div>
    <template v-if="pagination?.data?.length">
      <q-markup-table separator="horizontal" flat bordered>
        <thead>
          <tr>
            <th class="text-left">#</th>
            <th class="text-left">Address</th>
            <th class="text-right">TRX</th>
            <th class="text-right">USDT</th>
            <th class="text-right">Resource</th>
            <th class="text-right">Actions</th>
            <th class="text-right">
              <div>Staked</div>
              (Energy / Bandwidth)
            </th>
            <th class="text-right">
              <div>Unstaked</div>
              (Energy / Bandwidth)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(wallet, key) in pagination.data" :key="wallet.id">
            <td class="text-left">{{ key + 1 }}</td>
            <td
              class="text-left"
              :class="{ 'text-warning': !wallet.activated_at }"
            >
              {{ wallet.base58_check }}
              <q-btn
                dense
                icon="content_copy"
                flat
                @click="copyAddress(wallet.base58_check)"
              />
            </td>
            <td class="text-right">{{ wallet.trx?.toLocaleString() }}</td>

            <td class="text-right">{{ wallet.balance?.toLocaleString() }}</td>
            <td class="text-right">
              <div>
                <q-btn
                  dense
                  flat
                  label="Bandwidth"
                  no-caps
                  @click="stake(wallet, 'BANDWIDTH')"
                  :disable="wallet.trx < 2"
                />
                :
                {{ wallet.bandwidth }}
              </div>
              <div>
                <q-btn
                  dense
                  flat
                  label="Energy"
                  no-caps
                  @click="stake(wallet, 'ENERGY')"
                  :disable="wallet.trx < 2"
                />
                :
                {{ wallet.energy }}
              </div>
            </td>
            <td class="text-right">
              <q-btn
                label="Activate"
                no-caps
                dense
                flat
                @click="activateWallet(wallet.id)"
                v-if="!wallet.activated_at"
              />
              <template v-else>
                <q-btn
                  no-caps
                  dense
                  flat
                  icon="autorenew"
                  @click="refreshBalance(wallet.id)"
                />
                <q-btn
                  no-caps
                  dense
                  flat
                  icon="cancel_schedule_send"
                  @click="cancelUnstake(wallet.id)"
                  :disable="!wallet.unstakes?.length"
                />
              </template>
            </td>
            <td class="text-right">
              <q-btn
                flat
                :label="wallet.staked_for_energy?.toLocaleString()"
                @click="unstake(wallet, 'ENERGY')"
                :disable="wallet.staked_for_energy < 1"
              />
              /
              <q-btn
                flat
                :label="wallet.staked_for_bandwidth?.toLocaleString()"
                @click="unstake(wallet, 'BANDWIDTH')"
                :disable="wallet.staked_for_bandwidth < 1"
              />
            </td>
            <td class="text-right">
              <q-btn
                flat
                :label="
                  (getUnstakedAmount(wallet, 'ENERGY') ?? 0).toLocaleString()
                "
                :color="getWithdrawableUnstake(wallet) ? 'positive' : ''"
                :disable="!getWithdrawableUnstake(wallet)"
                @click="withdrawUnstakedAmount(wallet.id)"
              />
              /
              <q-btn
                flat
                :label="
                  (getUnstakedAmount(wallet, 'BANDWIDTH') ?? 0).toLocaleString()
                "
                :color="getWithdrawableUnstake(wallet) ? 'positive' : ''"
                :disable="!getWithdrawableUnstake(wallet)"
                @click="withdrawUnstakedAmount(wallet.id)"
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
import { echo } from "src/boot/init";
import usePagination from "src/composables/pagination";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const { notify, dialog, loading } = useQuasar();

const agents = ref([]);
const agent = ref(1);

const { pagination, current, max, updateQueryAndFetch } = usePagination(
  "/wallets",
  {
    agent_id: agent.value,
  }
);

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

const updateWallet = (wallet) => {
  const index = pagination.value.data.findIndex((e) => e.id == wallet.id);
  pagination.value.data.splice(index, 1, wallet);
};

const cancelUnstake = (walletId) => {
  dialog({
    title: "Confirm",
    message: `Do you want to cancel all the unstake?`,
    cancel: true,
    noBackdropDismiss: true,
  }).onOk(() => {
    loading.show();
    api({
      method: "POST",
      url: `/wallets/${walletId}/cancel-unstake`,
    })
      .then(({ data }) => {
        updateWallet(data.wallet);
      })
      .catch((error) => {
        notify({
          message: error?.response?.data?.message ?? error.message,
          type: "negative",
        });
      })
      .finally(loading.hide);
  });
};

const withdrawUnstakedAmount = (walletId) => {
  dialog({
    title: "Confirm",
    message: `Do you want to withdraw all the available unstake amount?`,
    cancel: true,
    noBackdropDismiss: true,
  }).onOk(() => {
    loading.show();
    api({
      method: "POST",
      url: `/wallets/${walletId}/withdraw-unstake`,
    })
      .then(({ data }) => {
        updateWallet(data.wallet);
      })
      .catch((error) => {
        notify({
          message: error?.response?.data?.message ?? error.message,
          type: "negative",
        });
      })
      .finally(loading.hide);
  });
};

const stake = (wallet, type) => {
  dialog({
    title: "Amount",
    message: "Enter the amount of TRX you want to stake",
    noBackdropDismiss: true,
    cancel: true,
    prompt: {
      model: "",
      autofocus: true,
      type: "number",
      inputmode: "numeric",
      pattern: "[0-9]*",
      isValid: (val) => val != "" && val > 0 && val < wallet.trx - 1,
    },
  }).onOk((amount) => {
    loading.show();
    api({
      method: "POST",
      url: `/wallets/${wallet.id}/stake`,
      data: {
        amount,
        type,
      },
    })
      .then(({ data }) => {
        updateWallet(data.wallet);
      })
      .catch((error) => {
        notify({
          message: error?.response?.data?.message ?? error.message,
          type: "negative",
        });
      })
      .finally(loading.hide);
  });
};

const getUnstakedAmount = (wallet, type) => {
  return wallet.unstakes?.reduce(
    (carry, unstake) => (unstake.type == type ? unstake.amount : 0) + carry,
    0
  );
};

const getWithdrawableUnstake = (wallet) => {
  return wallet.unstakes?.find(
    (e) => Date.now() > Date.parse(e.withdrawable_at)
  );
};

const unstake = (wallet, type) => {
  dialog({
    title: "Unstake " + type,
    message: "Enter the amount of TRX you want to unstake",
    noBackdropDismiss: true,
    cancel: true,
    prompt: {
      model: "",
      autofocus: true,
      type: "number",
      inputmode: "numeric",
      pattern: "[0-9]*",
      isValid: (val) =>
        val != "" &&
        val > 0 &&
        val <=
          (type == "ENERGY"
            ? wallet.staked_for_energy
            : wallet.staked_for_bandwidth),
    },
  }).onOk((amount) => {
    loading.show();
    api({
      method: "POST",
      url: `/wallets/${wallet.id}/unstake`,
      data: {
        amount,
        type,
      },
    })
      .then(({ data }) => {
        updateWallet(data.wallet);
      })
      .catch((error) => {
        notify({
          message: error?.response?.data?.message ?? error.message,
          type: "negative",
        });
      })
      .finally(loading.hide);
  });
};

const refreshBalance = (walletId) => {
  loading.show();
  api({
    method: "GET",
    url: `/wallets/${walletId}`,
  })
    .then(({ data }) => {
      updateWallet(data.wallet);
    })
    .catch((error) => {
      notify({
        message: error?.response?.data?.message ?? error.message,
        type: "negative",
      });
    })
    .finally(loading.hide);
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
        updateWallet(data.wallet);
      })
      .catch((error) => {
        notify({
          message: error?.response?.data?.message ?? error.message,
          type: "negative",
        });
      });
  });
};

const addWallet = () => {
  if (!agent.value) {
    notify({
      message: "Please choose an agent.",
      type: "negative",
    });
    return false;
  }
  dialog({
    title: "Confirm",
    message: "Do you want to add a new system wallet?",
    noBackdropDismiss: true,
    cancel: true,
  }).onOk(() => {
    api({
      method: "POST",
      url: "/wallets",
      data: {
        agent_id: agent.value,
      },
    })
      .then(({ data }) => {
        pagination.value.data.push(data.wallet);
      })
      .catch((error) => {
        notify({
          type: "negative",
          message: error?.response?.data?.message ?? error.message,
        });
      });
  });
};

const getAgents = () => {
  api({
    method: "GET",
    url: `/agents`,
  })
    .then(({ data }) => {
      agents.value = data.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      agent.value = agents.value[0].value;
    })
    .catch((error) => {
      notify({
        message: error?.response?.data?.message ?? error.message,
        type: "negative",
      });
    });
};

watch(agent, () => {
  updateQueryAndFetch({ agent_id: agent.value });
});

onMounted(() => {
  getAgents();
  echo.private(`wallets`).listen("WalletUpdated", ({ wallet }) => {
    updateWallet(wallet);
  });
});

onBeforeUnmount(() => {
  echo.leave("wallets");
});
</script>
