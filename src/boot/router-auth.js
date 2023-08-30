import { LocalStorage } from 'quasar'
import { boot } from 'quasar/wrappers'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ router }) => {
  router.beforeEach((to, from, next) => {
    const token = LocalStorage.getItem('token')
    if (to.meta?.requiresAuth && !token) {
      router.replace({ name: 'login' })
    } else if (to.meta?.guest && token) {
      router.replace({ name: 'index' })
    }
    next()
  })
})
