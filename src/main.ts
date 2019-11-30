import firebase from 'firebase/app';
import 'font-awesome/css/font-awesome.min.css';
import VSwitch from 'v-switch-case';
import VeeValidate from 'vee-validate';
import Vue from 'vue';
import VueScrollTo from 'vue-scrollto';
import VueTruncate from 'vue-truncate-filter';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import App from './App.vue';
import './plugins/vuetify';
import './registerServiceWorker';
import { router } from './router';
import { store } from './store';
import * as Sentry from '@sentry/browser';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import VueAnalytics from 'vue-analytics';

console.log('main.ts');

firebase.auth().onAuthStateChanged(async (user) => {
  store.commit('usersModule/setIsNewUser');
  if (user) {
    store.dispatch('usersModule/onAuthStateChanged', { user, isNewUser: false });
  }
});

export const eventBus = new Vue();

Vue.use(VueAnalytics, {
  id: 'UA-142514148-1',
  checkDuplicatedScript: true,
  router,
  // debug: {
  //   enabled: true, // default value
  //   trace: true, // default value
  //   sendHitTask: true, // default value
  // },
  trackEvent: true,
});
Vue.config.productionTip = process.env.NODE_ENV === 'production';
Vue.use(VueTruncate);
Vue.use(VeeValidate);
Vue.use(VSwitch);
Vue.use(VueScrollTo);
Vue.use(Vuetify, {
  rtl: true,
  iconfont: 'fa4',
  theme: {
    yellow: '#ecd138',
    purple: '#69378e',
    purpleTransparent: '#8860a6',
    blue: '#b3d4fc',
  },
});

new Vue({
  store,
  mixins: [],
  props: ['title'],
  router,
  render: (h) => h(App),
}).$mount('#app');

Sentry.init({
  dsn: 'https://6f4b5aeea36746beae0ac69f5b3d7296@sentry.io/1435517',
});

window.onerror = function(message, source, lineno, colno, error) {
  console.log(message, source, lineno, colno, error);
  if (process.env.NODE_ENV !== 'production') { return; }
  Sentry.captureException(error);
};
