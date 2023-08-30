import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { LocalStorage } from 'quasar';
import { useUserStore } from 'src/stores/user-store';

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

const axiosInstance = axios.create({ baseURL: process.env.API_URL + '/api' })
const token = LocalStorage.getItem('token')
if (token)
  axiosInstance.defaults.headers.common["Authorization"] =
    "Bearer " + token;
const api = (options) => {
  return new Promise((resolve, reject) => {
    axiosInstance(options).then(response => {
      resolve(response)
    }).catch(error => {
      if ([401, 403].includes(error?.response?.status)) LocalStorage.remove('token')
      axiosInstance.defaults.headers.common["Authorization"] =
        undefined
      reject(error)
    })
  })
}

export default boot(({ app, store }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  const user = LocalStorage.getItem('user')
  const userStore = useUserStore(store)
  if (user)
    userStore.setUser(user)


  app.config.globalProperties.$axios = axiosInstance
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api, axiosInstance }
