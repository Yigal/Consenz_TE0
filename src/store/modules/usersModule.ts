import Vue from 'vue';
import * as enums from '@/types/enums';
import { MiniUserInterface } from '@/types/interfaces';
import { mockDbName } from '..';
export const usersModule = {
  moduleName: 'usersModule',
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
    firebaseUser: {},
    currentUser: {} as MiniUserInterface,
    isNewUser: false,
  },
  getters: {
    firebaseUser: (state) => state.firebaseUser,
    participants: (state) => state.data,
    participantsSize: (state) => Object.keys(state.data).length,
    participantDisplayNameById: (state) => (id) => {
      if (typeof id !== 'string') { id = id.uid; }
      if (id === undefined) { return null; }
      return state.data[id] !== undefined ? state.data[id].displayName : '';
    },
    getById: (state) => (id) => state.data[id],
    user: (state) => {
      if ('currentUser' in state) { return state.currentUser; }
    },
    displayName: (state) => (state.currentUser ? state.currentUser.displayName : ''),
    isNewUser: (state) => state.isNewUser,
    userUid: (state) => (state.currentUser ? state.currentUser.uid : null),
    isSignedIn: (state) => Object.keys(state.currentUser).length > 0,
    participantPhotoUrlById: (state) => (id) => {
      if (state.data[id] !== undefined && state.data[id].photoURL) {
        return state.data[id].photoURL
      } else {
        // TODO Remove hardcoded url that contains consenz link democXrasee-5f202.appspot.com
        return 'https://firebasestorage.googleapis.com/v0/b/democXrasee-5f202.appspot.com/o/face.svg?alt=media&token=c022ce57-bdfd-4048-acc7-760c89123f93'
      }
    },
    isUserEditor: (state) => state.currentUser.role === enums.ROLE.editor,
  },
  mutations: {
    loadMockData: (state, payload) => {
      let mockData = require(`../../../database/${mockDbName}/collections/users.json`)
      const dataObject = {}
      mockData = mockData.filter(user => user.documents.includes(payload))
      .forEach(d => Object.assign(dataObject, { [d.id]: d }))
      Vue.set(state, "data", dataObject);
    },
    setUid: (state, uid) => {
      Vue.set(state.currentUser, 'uid', uid);
    },
    logOut: async (state) => {
      Vue.set(state, 'currentUser', {});
    },
    setIsNewUser: (state, commit) => {
      const isNew = !(localStorage.getItem('isNewUser') ? true : false);
      if (isNew) {
        Vue.set(state, 'isNewUser', true);
        localStorage.setItem('isNewUser', 'true');
      }
    },
    mapParticipants: (state) => {
      state.data.forEach((participant, index) => {
        Vue.set(state.data, index, participant.id);
      });
    },
    addParticipant: (state, { participant }) => {
      Vue.set(state.data, participant.uid, participant);
    },
    setFirebaseUser: (state, payload) => {
      Vue.set(state, 'firebaseUser', payload);
    },
    setCurrentUser: (state, payload) => {
      Vue.set(state, 'currentUser', payload);
    },
  },
  actions: {
    onAuthStateChanged: async ({ state, commit, dispatch, rootGetters, getters }, { user, username, isNewUser }) => {
      if (isNewUser) {
        const newUser = {
          id: user.uid,
          uid: user.uid,
          displayName: user.displayName !== null ? user.displayName : username,
          documents: new Array(rootGetters['documentsModule/documentId']),
          notifications: {
            isOn: true,
            mailAddress: user.email,
          },
        };
        await dispatch('addUser', newUser);
      }
      commit('setFirebaseUser', user);
      let miniUser = state.data[state.firebaseUser.uid];
      if (!state.data[state.firebaseUser.uid]) {
        miniUser = await dispatch('fetchById', user.uid);
      }
      commit('setCurrentUser', miniUser);
      await dispatch('checkUserProperties');
    },
    fetchParticipants: async ({ getters, rootGetters, dispatch, state }) => {
      const where = [['documents', 'array-contains', rootGetters['documentsModule/documentId']]];
      await dispatch('openDBChannel', {
        where,
      });
    },

    // TODO: add types
    getBatchUsersNotificationProp: async ({ state }, { users }) => {
      if (typeof users[0] === 'object') { users = Object.keys(users[0]); }
      return users
        .map((id) => state.data[id].notifications)
        .filter((notification) => notification.isOn)
        .map((notification) => notification.mailAddress);
    },
    addUser: async ({ state, dispatch, commit }, newUser) => {
      console.log('Dispatch insert newUser ' + JSON.stringify(newUser));
      await dispatch('insert', newUser);
    },
    /**
     * navigation to sign-in page
     */
    signIn: async ({ dispatch }) => {
      return dispatch(
        'routerModule/pushWithParams',
        {
          name: enums.ROUTE_NAME.login,
        },
        { root: true },
      );
    },
    /**
     * updates the current user
     */
    updateCurrentUser: async ({ state, dispatch }, { updateObject }) => {
      await dispatch('patch', { id: state.currentUser.uid, ...updateObject });
    },
    checkUserProperties: async ({ getters, dispatch }) => {
      if (getters['isSignedIn']) {// Chech user is signed in
        await dispatch('addDocumentToUser'); // Check that the user belongs to the document
        await dispatch('addNotificationsToUser'); // Assert that user notification property is set
        await dispatch('addUidToUser'); // Assert user has UUID
        await dispatch('addProfilePictureToUser');
      }
    },
    addUidToUser: async ({ state, getters, dispatch }) => {
      if (!('uid' in state.currentUser)) {
        await dispatch('updateCurrentUser', {
          updateObject: {
            uid: getters.userUid,
          },
        });
      }
    },
    addDocumentToUser: async ({ state, rootGetters, dispatch, commit }) => {
      const documentId = rootGetters['mainModule/prettyLink'];
      if (state.currentUser.documents !== undefined && !state.currentUser.documents.includes(documentId)) {
        await dispatch('updateCurrentUser', {
          updateObject: {
            documents: [...state.currentUser.documents, documentId],
          },
        });
      }
    },
    /**
     * adds notification property to current user (versions issues)
     */
    addNotificationsToUser: async ({ rootGetters, dispatch, getters }) => {
      if (!('notifications' in getters['user']) && getters['mainModule/firebaseUser'] !== undefined) {
        await dispatch('updateCurrentUser', {
          updateObject: {
            notifications: {
              isOn: true,
              mailAddress: getters['mainModule/firebaseUser'].email,
            },
          },
        });
      }
    },
    addProfilePictureToUser: async ({ state, rootGetters, dispatch, getters }) => {
      if (!('photoURL' in getters['user']) && getters['firebaseUser'] !== undefined) {
        await dispatch('updateCurrentUser', {
          updateObject: {
            photoURL: getters['firebaseUser'].photoURL,
          },
        });
      }
    },
  },
};
