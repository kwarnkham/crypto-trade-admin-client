<template>
  <q-page padding>
    <div class="text-right q-mb-sm">
      <q-btn icon="add" @click="addAgent" />
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
            <th class="text-left">Name</th>
            <th class="text-right">Allowed IP</th>
            <th class="text-right">Status</th>
            <th class="text-right">Deposit Callback URL</th>
            <th class="text-right">Withdraw Callback URL</th>
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
              {{ agent.deposit_callback }}
            </td>

            <td class="text-right">
              {{ agent.withdraw_callback }}
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
              <q-btn dense flat icon="edit" no-caps @click="edit(agent)" />
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

const addAgent = () => {
  dialog({
    title: "Add a new agent",
    noBackdropDismiss: true,
    prompt: {
      model: "",
      isValid: (value) => value != "",
    },
    cancel: true,
  }).onOk((value) => {
    api({
      method: "POST",
      url: `/agents`,
      data: {
        name: value,
      },
    })
      .then(({ data }) => {
        pagination.value.data.push(data.agent);
        showKey(data.key);
      })
      .catch((error) => {
        notify({
          message: error?.response?.data?.message ?? error.message,
          type: "negative",
        });
      });
  });
};

const showKey = (key) => {
  dialog({
    title: "The current key is",
    message: `<div class='text-overline bg-grey text-grey-4 text-center rounded-borders' style='font-size:7px;'>${key}</div>`,
    html: true,
    noBackdropDismiss: true,
    on: {
      icon: "content_copy",
      color: "info",
    },
  }).onOk(() => {
    copyToClipboard(key)
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
};

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

const edit = (agent) => {
  dialog({
    title: "Edit",
    noBackdropDismiss: true,
    options: {
      type: "radio",
      model: "name",
      items: [
        { label: "Name", value: "name" },
        { label: "IP", value: "ip" },
        { label: "AES key", value: "aes_key" },
        { label: "Remark", value: "remark" },
      ],
    },
    cancel: true,
  }).onOk((field) => {
    dialog({
      title: "Edit " + field,
      noBackdropDismiss: true,
      prompt: {
        model: agent[field],
        isValid: (value) => value != "" || field == "remark",
      },
      cancel: true,
    }).onOk((value) => {
      api({
        method: "PUT",
        url: `/agents/${agent.id}`,
        data: {
          name: field == "name" ? value : agent.name,
          ip: field == "ip" ? value : agent.ip,
          remark: field == "remark" ? value : agent.remark,
          aes_key: field == "aes_key" ? value : undefined,
        },
      })
        .then(({ data }) => {
          const index = pagination.value.data.findIndex(
            (e) => e.id == data.agent.id
          );
          pagination.value.data.splice(index, 1, data.agent);
        })
        .catch((error) => {
          notify({
            message: error?.response?.data?.message ?? error.message,
            type: "negative",
          });
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
        showKey(data.key);
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
