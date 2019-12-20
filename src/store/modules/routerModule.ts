import { SectionInterface } from './../../types/interfaces';
import * as enums from '@/types/enums';
import Vue from 'vue';
import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { router, routes } from '../../router';
import { RootState, RouterModuleState } from '../types';

type routerModuleGetter = GetterTree<RouterModuleState, RootState>;

const state: RouterModuleState = {
  routesNames: {},
  // The current page-based route.
  // A route includes a page name, and any URL parameters that are
  // defined as part of the path.
  currentRoute: {},
  // The previous route. Stored to help with transitions.
  lastRoute: {},
  // Transition data set while transitions are in progress.
  transition: false,
  // A map of pages and their last scroll position.
  // The scroll position is saved and restored as pages are hidden
  // and shown.
  scrollTops: {},
  transitionName: '',
};

const getters: routerModuleGetter = {
  getPath: (state, getters) => ({ name, params }): string => {
    let path = '';
    if (Object.keys(params).length > 0) {
      path = '?';
      Object.keys(params).forEach((key) => {
        let param = params[key] ? params[key].toString() : '';
        path += `${key}=${param}`;
        if (Object.keys(params).indexOf(key) !== Object.keys(params).length - 1) {
          path += '&';
        }
      });
    }
    return getters['pathByName'](name) + path;
  },
  pathByName: (state, getters, dispatch, rootGetters) => (name) => {
    const documentId = rootGetters['mainModule/prettyLink'];
    return `/document/${documentId}/${name}`;
  },
  currentRoute: (state) => state.currentRoute,
  lastRoute: (state) => state.lastRoute,
  transitionName: (state) => state.transitionName,
};

const mutations: MutationTree<RouterModuleState> = {
  setToState: (state, payload) => {
    const payloadKey = Object.keys(payload)[0];
    const payloadElement = payload[payloadKey];
    const display = objectToDisplay(payloadElement);
    console.log('routerModule.setToState() Set State ' + payloadKey + ' to ' + JSON.stringify(display));
    Vue.set(state, payloadKey, payloadElement);
  },
  setTransitionName: (state, payload) => Vue.set(state, 'transitionName', payload),
};

function objectToDisplay(obj) {
  let result = {}, key;
  for (key in obj) {
    const value = obj[key];
    if (typeof value === 'string' || value instanceof String) {
      result[key] = value;
    }
  }
  return result;
}

const actions: ActionTree<RouterModuleState, RootState> = {
  init: ({ commit }) => {
    const routesNames = routes.map((route: any) => {
      if ('name' in route) {
        return { [route.name!]: route.name };
      } else {
        return route.children.map((childRoute) => {
          return { [childRoute.name!]: childRoute.name };
        });
      }
    });
    commit('setToState', Object.freeze(routesNames));
  },
  /**
   * route to success section page when done voting
   * @param {SectionInterface} section
   * @param {string} parentSectionId
   * @param {number} sectionIndex
   */
  routeToSuccessPage: ({ getters, rootGetters, dispatch }, { section, parentSectionId, sectionIndex }) => {
    const isStaticStatus = rootGetters['sectionsModule/isStaticFeed'](section.status); // It means that this is a discussion page
    const path = getters.getPath({
      name: enums.ROUTE_NAME.section,
      params: {
        [enums.SECTION_BY.sectionById]: isStaticStatus
          ? section.status === enums.SECTION_STATUS['edited'] // if edited - we need the parent ID who's now the approved section with the edited content
            ? parentSectionId
            : section.id
          : parentSectionId,
        index: sectionIndex,
        status: isStaticStatus
          ? enums.FEED_TYPE_STATIC[Object.keys(enums.SECTION_STATUS)[section.status]] // page status by section status
          : section.status,
      },
    });
    dispatch('push', { path });
  },
  /**
   * push path to router
   * @param {string} path
   */
  push: ({ commit, state }, { path }) => {
    console.log('Push ' + path);
    const lastRoutePayload = { lastRoute: router.currentRoute };
    console.log('Commit setToState ' + lastRoutePayload);
    commit('setToState', lastRoutePayload);
    console.log('Router Push ' + path);
    router.push({ path });
    const currentRoutePayload = { currentRoute: router.currentRoute };
    console.log('Commit setToState ' + currentRoutePayload);
    commit('setToState', currentRoutePayload);
  },
  /**
   * push path to router with params
   * @param {string} name the name of the component
   * @param {object} params
   *
   */
  pushWithParams: ({ commit }, { name, params }) => {
    commit('setToState', { lastRoute: router.currentRoute });
    router.push({
      name,
      params,
    });
    commit('setToState', { currentRoute: router.currentRoute });
  },
  /**
   * navigate backwards
   */
  goBack: ({ commit, state, dispatch, getters }) => {
    if (Object.keys(state.lastRoute).length === 0) {
      dispatch('push', { path: getters['getPath']({ name: enums.ROUTE_NAME.draft, params: {} }) });
    } else {
      router.go(-1);
    }
    commit('setToState', { currentRoute: router.currentRoute });
  },
};

export const routerModule = {
  state,
  namespaced: true,
  getters,
  mutations,
  actions,
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
