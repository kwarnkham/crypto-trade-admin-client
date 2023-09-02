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
            <th class="text-right">User(Balance)</th>
            <th class="text-right">Wallet</th>
            <th class="text-right">Status</th>
            <th class="text-right">Attempts</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(deposit, key) in pagination.data" :key="deposit.id">
            <td class="text-left">{{ key + 1 }}</td>
            <td class="text-left">
              {{ deposit.amount.toLocaleString() }}
            </td>
            <td class="text-right">{{ deposit.user.agent.name }}</td>
            <td class="text-right">
              {{ deposit.user.name }} (
              {{ deposit.user.balance.toLocaleString() }} )
            </td>

            <td class="text-right">
              {{ deposit.wallet.base58_check }}
            </td>

            <td
              class="text-right"
              :class="{
                'text-positive': deposit.status == 3,
                'text-primary': deposit.status == 2,
                'text-negative': deposit.status == 4,
                'text-warning': deposit.status == 5,
              }"
            >
              {{ getDepositStatusText(deposit.status) }}
            </td>
            <td class="text-right">
              {{ deposit.attempts }}
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
    <div v-else class="text-center">No Deposits yet</div>
  </q-page>
</template>

<script setup>
import usePagination from "src/composables/pagination";

const { pagination, max, current } = usePagination("deposits");
// const { dialog, notify } = useQuasar();

const getDepositStatusText = (status) => {
  switch (status) {
    case 1:
      return "Pending";
    case 2:
      return "Confirmed";
    case 3:
      return "Completed";
    case 4:
      return "Canceled";
    case 5:
      return "Expired";
    default:
      return "Unknown";
  }
};

// const cancel = ({ id }) => {
//   dialog({
//     title: "Cancel the deposit?",
//     noBackdropDismiss: true,
//     cancel: true,
//   }).onOk(() => {
//     api({
//       method: "POST",
//       url: `/deposits/${id}/cancel`,
//     })
//       .then(({ data }) => {
//         const index = pagination.value.data.findIndex(
//           (e) => e.id == data.deposit.id
//         );
//         pagination.value.data.splice(index, 1, data.deposit);
//       })
//       .catch((error) => {
//         notify({
//           message: error?.response?.data?.message ?? error.message,
//           type: "negative",
//         });
//       });
//   });
// };
</script>
