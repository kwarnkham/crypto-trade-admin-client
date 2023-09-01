<template>
  <q-page padding>
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
            <th class="text-left">Name</th>
            <th class="text-right">Allowed IP</th>
            <th class="text-right">Status</th>
            <th class="text-right">Remark</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(agent, key) in pagination.data" :key="agent.id">
            <td class="text-left">{{ key + 1 }}</td>
            <td
              class="text-left"
              :class="{ 'text-negative': agent.status == 2 }"
            >
              {{ agent.name }}
            </td>
            <td class="text-right">{{ agent.ip }}</td>

            <td
              class="text-right"
              :class="[agent.status == 1 ? 'text-positive' : 'text-negative']"
            >
              {{ agent.status == 1 ? "Normal" : "Restricted" }}
            </td>

            <td class="text-right">
              {{ agent.remark }}
            </td>
            <td class="text-right">
              <q-btn
                dense
                flat
                :icon="agent.status == 1 ? 'block' : 'done'"
                no-caps
                @click="toggleStatus(agent)"
              />
              <q-btn dense flat icon="key" no-caps @click="resetKey(agent)" />
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
    <div v-else class="text-center">No agents yet</div>
  </q-page>
</template>

<script setup>
import { copyToClipboard, useQuasar } from "quasar";
import { api } from "src/boot/axios";
import usePagination from "src/composables/pagination";

const { pagination, current, max } = usePagination("agents");
const { dialog, notify } = useQuasar();

const toggleStatus = ({ id, status, name }) => {
  dialog({
    title: "Confirm",
    message: `Do you want to ${
      status == 1 ? "restrict" : "unrestrict"
    } the agent, ${name}?`,
    noBackdropDismiss: true,
    cancel: true,
  }).onOk(() => {
    api({
      method: "POST",
      url: `/agents/${id}/toggle-status`,
    })
      .then(({ data }) => {
        const index = pagination.value.data.findIndex((e) => e.id == id);
        pagination.value.data.splice(index, 1, data.agent);
      })
      .catch((error) => {
        notify({
          message: error?.response?.data?.message ?? error.message,
          type: "negative",
        });
      });
  });
};

const resetKey = ({ id, name }) => {
  dialog({
    title: "Confirm",
    message: `Do you want to reset the key of agent, ${name}`,
    noBackdropDismiss: true,
    cancel: true,
  }).onOk(() => {
    api({
      method: "POST",
      url: `/agents/${id}/reset-key`,
    })
      .then(({ data }) => {
        dialog({
          title: "The current key is",
          message: `<div class='text-overline bg-grey text-grey-4 text-center rounded-borders' style='font-size:7px;'>${data.key}</div>`,
          html: true,
          noBackdropDismiss: true,
          on: {
            icon: "content_copy",
            color: "info",
          },
        }).onOk(() => {
          copyToClipboard(data.key)
            .then(() => {
              notify({
                message: "Key is copied to clipboard",
                type: "info",
              });
            })
            .catch((error) => {
              notify({
                message: error?.response?.data?.message ?? error.message,
                type: "negative",
              });
            });
        });
      })
      .catch((error) => {
        notify({
          message: error?.response?.data?.message ?? error.message,
          type: "negative",
        });
      });
  });
};
</script>
