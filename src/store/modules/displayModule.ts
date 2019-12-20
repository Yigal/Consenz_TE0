import { NAVBAR_SIDE_ICON } from '@/store/types';
import * as enums from '@/types/enums';
import Vue from 'vue';
import { store } from '../index';
import moment from 'moment';

export const displayModule = {
  namespaced: true,
  state: {
    navBar: {
      title: '',
      icon: NAVBAR_SIDE_ICON.menu,
      color: '',
      path: null,
    },
    scrollingOptions: {
      container: 'body',
      duration: 1500,
      easing: 'ease',
      offset: 0,
      force: true,
      cancelable: true,
      onStart: false,
      onDone: false,
      onCancel: false,
      x: false,
      y: true,
    },
    colors: {
      [enums.FEED_TYPE.sectionApproved]: '#0fc3ac',
      [enums.FEED_TYPE.sectionEdited]: '#0fc3ac',
      [enums.SECTION_STATUS.approved]: '#0fc3ac',
      [enums.FEED_TYPE.edited]: '#0fc3ac',
      pros: '#0fc3ac',
      true: '#0fc3ac',
      [enums.SECTION_STATUS.inTheVote]: '#69378e',
      undefined: '#000000de',
      comment: '#69378e',
      add: '#69378e',
      addComment: '#69378e',
      [enums.SECTION_STATUS.toEdit]: '#ecd138',
      [enums.FEED_TYPE.deleted]: '#ecd138',
      cons: '#ff5252',
      false: '#ff5252',
      [enums.FEED_TYPE.rejected]: '#ff5252',
      [enums.SECTION_STATUS.toDelete]: '#ff5252',
    },
    snackbar: {
      snackbar: false,
      y: 'top',
      x: null,
      mode: 'multi-line',
      timeout: 100000000000,
    },
  },
  getters: {
    navBar: (state) => state.navBar,
    scrollingOptions: (state) => state.scrollingOptions,
    getColor: (state) => (status) => state.colors[status],
    getBorderTopColor: (state) => (status) => (status === undefined ? '#69378e' : state.colors[status]),
    snackbar: (state) => state.snackbar,
    /**
     * formatting from timestamp to date
     * @param {number} timestamp
     *
     */
    dateFormatted: (state) => (timestamp) => {
      if (timestamp && 'seconds' in timestamp) {
        timestamp = moment.unix(timestamp.seconds);
      }
      return Object.assign({}, { date: moment(timestamp).format('DD.MM.YYYY'), time: moment(timestamp).format('HH:mm') });
    },
  },
  mutations: {
    setSnackbar: (state) => {
      Vue.set(state.snackbar, 'snackbar', true);
    },
    closeSnackbar: (state) => {
      Vue.set(state.snackbar, 'snackbar', false);
    },
    showSnackbar: (state, id) => {
      if (store.getters['routerModule/currentRoute'].query[enums.SECTION_BY.sectionById] === id) {
        Vue.set(state.snackbar, 'snackbar', true);
      }
    },
    /**
     * setting the Mav Bar properties
     * @param context
     * @param context
     * @param {object} payload object with keys: title / sideIcon / navBarColor/ action
     */
    setNavBar: (context, payload) => {
      Object.keys(payload).forEach((key) => {
        const navBar = context.navBar;
        const payloadElement = payload[key];
        Object.assign((navBar[key] = payloadElement));
      });
    },
  },
  actions: {},
  /** for vuex-easy-module */
  firestorePath: '',
  firestoreRefType: '',
  moduleName: '',
  statePropName: '',
  sync: {},
  serverChange: {},
  fetch: {
    docLimit: 0,
  },
};
