import { boot } from 'quasar/wrappers'
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { api } from 'src/boot/axios';


window.Pusher = Pusher;

let echo = new Echo({
  broadcaster: 'pusher',
  key: process.env.PUSHER_APP_KEY,
  wsHost: process.env.PUSHER_HOST || undefined,
  wsPort: process.env.PROD ? 443 : 6001,
  wssPort: process.env.PROD ? 443 : 6001,
  forceTLS: process.env.PROD,
  encrypted: true,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  cluster: 'mt1',
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        api({
          method: "POST",
          url: "/broadcasting/auth",
          data: {
            socket_id: socketId,
            channel_name: channel.name
          }
        }).then(response => {
          callback(null, response.data);
        })
          .catch(error => {
            callback(error);
          });
      }
    };
  },
});

export default boot(async ({ app }) => {
  app.config.globalProperties.$echo = echo
})

export { echo }
