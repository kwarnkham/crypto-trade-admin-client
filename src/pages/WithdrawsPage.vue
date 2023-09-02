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
            <th class="text-left">Amount</th>
            <th class="text-right">Agent</th>
            <th class="text-right">User ( Balance )</th>
            <th class="text-right">From</th>
            <th class="text-right">To</th>
            <th class="text-right">Fee</th>
            <th class="text-right">Status</th>
            <th class="text-right">Attempts</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(withdraw, key) in pagination.data" :key="withdraw.id">
            <td class="text-left">{{ key + 1 }}</td>
            <td class="text-left">
              {{ withdraw.amount.toLocaleString() }}
            </td>
            <td class="text-right">{{ withdraw.user.agent.name }}</td>
            <td class="text-right">
              {{ withdraw.user.name }} (
              {{ withdraw.user.balance.toLocaleString() }} )
            </td>

            <td class="text-right">
              {{ withdraw.wallet?.base58_check }}
            </td>
            <td class="text-right">
              {{ withdraw.to }}
            </td>
            <td class="text-right">
              {{ withdraw.fee }}
            </td>

            <td
              class="text-right"
              :class="{
                'text-positive': withdraw.status == 3,
                'text-primary': withdraw.status == 2,
                'text-negative': withdraw.status == 4,
              }"
            >
              {{ getWithdrawStatusText(withdraw.status) }}
            </td>
            <td class="text-right">
              {{ withdraw.attempts }}
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
    <div v-else class="text-center">No Withdraws yet</div>
  </q-page>
</template>

<script setup>
import usePagination from "src/composables/pagination";

const { pagination, max, current } = usePagination("withdraws");

const getWithdrawStatusText = (status) => {
  switch (status) {
    case 1:
      return "Pending";
    case 2:
      return "Confirmed";
    case 3:
      return "Completed";
    case 4:
      return "Canceled";
    default:
      return "Unknown";
  }
};
</script>
