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
            <th class="text-left">From</th>
            <th class="text-left">To</th>
            <th class="text-right">Amount</th>
            <th class="text-right">Fee</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transfer, key) in pagination.data" :key="transfer.id">
            <td class="text-left">{{ key + 1 }}</td>
            <td class="text-left">
              {{ transfer.user.name }}
            </td>
            <td class="text-left">{{ transfer.recipient.name }}</td>

            <td class="text-right">
              {{ transfer.amount }}
            </td>
            <td class="text-right">
              {{ transfer.fee }}
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
    <div v-else class="text-center">No Transfers yet</div>
  </q-page>
</template>

<script setup>
import usePagination from "src/composables/pagination";

const { pagination, max, current } = usePagination("transfers");
</script>
