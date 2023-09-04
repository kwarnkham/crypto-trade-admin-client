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
            <th class="text-left">ID</th>
            <th class="text-right">Amount</th>
            <th class="text-right">Fee</th>
            <th class="text-right">Energy</th>
            <th class="text-right">Bandwidth</th>
            <th class="text-left">From</th>
            <th class="text-left">To</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tx, key) in pagination.data" :key="tx.id">
            <td class="text-left">{{ key + 1 }}</td>
            <td class="text-left">
              {{ tx.transaction_id }}
            </td>
            <td class="text-right">
              {{ tx.value }}
            </td>
            <td class="text-right">
              {{ tx.fee ?? 0 }}
            </td>
            <td class="text-right">
              {{ tx.receipt?.energy_usage_total }}
              <span v-if="tx.receipt?.energy_fee">
                (<q-icon name="local_fire_department" />
                {{ tx.receipt?.energy_fee / 10 ** 6 }})
              </span>
            </td>
            <td class="text-right">
              <span v-if="tx.receipt?.net_usage">
                {{ tx.receipt?.net_usage }}</span
              >
              <span v-if="tx.receipt?.net_fee">
                (<q-icon name="local_fire_department" />
                {{ tx.receipt?.net_fee / 10 ** 6 }})
              </span>
            </td>
            <td class="text-left">{{ tx.from }}</td>
            <td class="text-left">
              {{ tx.to }}
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
    <div v-else class="text-center">No Transactions yet</div>
  </q-page>
</template>

<script setup>
import usePagination from "src/composables/pagination";

const { pagination, max, current } = usePagination("transactions");
</script>
