import { router } from '@/router';
import Vue from 'vue';
import firebase from 'firebase/app';
import {mockDbName} from '../index'

export const mainModule = {
  firestorePath: 'consenz/{version}',
  // The path to a "collection" or single "document" in firestore.
  // You can use `{userId}` which will be replaced with the user Id.
  firestoreRefType: 'doc',
  // `'collection'` or `'doc'`. Depending on your `firestorePath`.
  moduleName: 'mainModule',
  // The module name. eg. `'userItems'`
  // Can also be a nested module, eg. `'userModule/items'`
  statePropName: 'data',
  // The name of the property where the docs or doc will be synced to.
  // always best to set to `'data'` imo!
  // If left blank it will be synced on the state of the module.

  namespaced: true,
  // this is automatically added! See more info at: https://vuex.vuejs.org/guide/modules.html#namespacing

  // EVERYTHING BELOW IS OPTIONAL (only include what you use)
  // Related to the 2-way sync:
  sync: {
    preventInitialDocInsertion: true,
    where: [],
    orderBy: [],
    fillables: [],
    guard: [],
    defaultValues: {},
    debounceTimerMs: 1000,
    // HOOKS for local changes:
    insertHook(updateStore, doc, store) {
      return updateStore(doc);
    },
    patchHook(updateStore, doc, store) {
      return updateStore(doc);
    },
    deleteHook(updateStore, id, store) {
      return updateStore(id);
    },
    // for batches
    insertBatchHook(updateStore, docs, store) {
      return updateStore(docs);
    },
    patchBatchHook(updateStore, doc, ids, store) {
      return updateStore(doc, ids);
    },
    deleteBatchHook(updateStore, ids, store) {
      return updateStore(ids);
    },
  },

  // When docs on the server side are changed:
  serverChange: {
    convertTimestamps: {},
    // HOOKS for changes on SERVER:
    addedHook(updateStore, doc, id, store) {
      return updateStore(doc);
    },
    modifiedHook(updateStore, doc, id, store) {
      return updateStore(doc);
    },
    removedHook(updateStore, doc, id, store) {
      return updateStore(doc);
    },
  },

  // When docs are fetched through `dispatch('module/fetch', filters)`.
  fetch: {
    // The max amount of documents to be fetched. Defaults to 50.
    docLimit: 50,
  },

  // You can also add custom state/getters/mutations/actions. These will be added to your module.
  state: {
    prettyLink: undefined,
    showInfoVideo: true,
  },
  getters: {
    consenz: (state) => state.data,
    aboutConsenz: (state) => state.data.about,
    isLoading: (state) => state.data.loading,
    prettyLink: (state) => {
      console.log('mainModule.ts state.prettyLink : ' + state.prettyLink);
      return state.prettyLink
    },
    infoVideo: (state) => state.data.infoVideo,
    showInfoVideo: (state) => state.showInfoVideo,
  },
  mutations: {
    loadMockData: (state, payload) => {
      let mockData = require(`../../../database/${mockDbName}/collections/consenz.json`)
      mockData = mockData.filter(d => d.id === payload)[0]
      Vue.set(state, 'data', mockData);
    },
    setPrettyLink: (state, payload) => {
      console.log('mainModule.ts Set prettyLink: ' + JSON.stringify(payload));
      Vue.set(state, 'prettyLink', payload);
    },
    setLoading: (state, payload) => {
      console.log('mainModule.ts Set Loading: ' + JSON.stringify(payload));
      state.data.loading = payload;
    },
    setShowInfoVideo: (state) => Vue.set(state, 'showInfoVideo', false),
  },
  actions: {
    /**
     * opens the DB channels of all the modules
     */
    initStore: async ({ state, dispatch, commit, rootGetters }) => {

      // check this: in democXrasee project, this code block does not exist
      // const firestore = firebase.firestore();

      if (process.env.NODE_ENV === 'development') {
        console.log('developing')
        dispatch('initStoreWithMochData');



      } else {
        try {
          console.log('mainModule.ts Dispatch openDBChannel');
          await dispatch('openDBChannel', { version: 'v1' }).catch((error) => {
            if (error === 'preventInitialDocInsertion') {
              console.log('mainModule.ts ERROR IN openDBChannel OF CONSENZ:', error);
              return;
            }
          });
          await dispatch('documentsModule/fetchById', state.prettyLink, { root: true });
          console.log('mainModule.ts Dispatch sectionsModule/openDBChannel');
          await dispatch('sectionsModule/openDBChannel', { where: [['documentId', '==', state.prettyLink]] }, { root: true });
          console.log('mainModule.ts Dispatch argumentsModule/openDBChannel');
          await dispatch('argumentsModule/openDBChannel', { where: [['documentId', '==', state.prettyLink]] }, { root: true });
          await dispatch('commentsModule/openDBChannel', { where: [['documentId', '==', state.prettyLink]] }, { root: true });
          await dispatch(
            'usersModule/openDBChannel',
            {
              where: [['documents', 'array-contains', state.prettyLink]],
            },
            { root: true },
          );
  
        } catch (error) {
          console.error(error);
        } finally {
          commit('setLoading', false);
          commit('documentsModule/setPrettyLink', state.prettyLink, { root: true });
          const payload = { currentRoute: router.currentRoute };
          console.log('mainModule.ts Commit setToState ' + payload);
          commit('routerModule/setToState', payload, { root: true });
        }
      }

    },
    initStoreWithMochData: ({state, commit}) => {      
      commit('documentsModule/setPrettyLink', state.prettyLink, { root: true });

      commit('loadMockData', 'v1' )
      commit('documentsModule/loadMockData', state.prettyLink, { root: true } )
      commit('sectionsModule/loadMockData', state.prettyLink, { root: true } )
      commit('argumentsModule/loadMockData', state.prettyLink, { root: true } )
      commit('commentsModule/loadMockData', state.prettyLink, { root: true } )
      commit('usersModule/loadMockData', state.prettyLink, { root: true } )


      commit('setLoading', false);
      const payload = { currentRoute: router.currentRoute };
      console.log('mainModule.ts Commit setToState ' + payload);
      commit('routerModule/setToState', payload, { root: true });

      // await commit('documentsModule/fetchById', state.prettyLink, { root: true });
      // console.log('mainModule.ts Dispatch sectionsModule/openDBChannel');
      // await commit('sectionsModule/openDBChannel', { where: [['documentId', '==', state.prettyLink]] }, { root: true });
      // console.log('mainModule.ts Dispatch argumentsModule/openDBChannel');
      // await commit('argumentsModule/openDBChannel', { where: [['documentId', '==', state.prettyLink]] }, { root: true });
      // await commit('commentsModule/openDBChannel', { where: [['documentId', '==', state.prettyLink]] }, { root: true });
      // await commit(
      //   'usersModule/openDBChannel',
      //   {
      //     where: [['documents', 'array-contains', state.prettyLink]],
      //   },
      //   { root: true },
      // );
    }
  },
};
