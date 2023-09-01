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
            <th class="text-right">IP</th>
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

            <td class="text-right">
              {{ agent.status == 1 ? "Normal" : "Restricted" }}
            </td>

            <td class="text-right">
              {{ agent.remark }}
            </td>
            <td class="text-right">
              <q-btn dense flat icon="block" no-caps />
              <q-btn dense flat icon="key" no-caps />
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
import usePagination from "src/composables/pagination";

const { pagination, current, max } = usePagination("agents");
</script>
