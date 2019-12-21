import { CommentInterface } from '@/types/interfaces';
import Vue from 'vue';
/*import * as enums from '@/types/enums';*/
import { mockDbName, insertByEnv, petchByEnv } from '../index';
import uniqid from 'uniqid';

export const commentsModule = {
  moduleName: 'commentsModule',
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
    convertTimestamps: {
      createdAt: '%convertTimestamp%',
    }, // HOOKS for changes on SERVER:
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
    argumentsSize: undefined,
    isDbChannelIsOpen: false,
  },
  getters: {
    commentsSize: (state) => Object.keys(state.data).length,
    comments: (state) => state.data,
    commentsByArgumentId: (state) => (argumentId) =>
      Object.keys(state.data)
        .filter((key) => state.data[key].argumentId === argumentId)
        .map((id) => state.data[id])
        .sort((commentA: CommentInterface, commentB: CommentInterface) => commentA.createdAt.getTime() - commentB.createdAt.getTime()),
    commentById: (state) => (id) => state.data[id],
    commentsBySectionId: (state) => (sectionId) =>
      Object.keys(state.data)
        .filter((key) => state.data[key].sectionId === sectionId)
        .map((id) => state.data[id])
        .sort((commentA: CommentInterface, commentB: CommentInterface) => commentA.createdAt.getTime() - commentB.createdAt.getTime()),
  },
  mutations: {
    loadMockData: (state, payload) => {
      let mockData = require(`../../../database/${mockDbName}/collections/comments.json`)
      const dataObject = {}
      mockData = mockData
        .filter(d => d.documentId === payload)
        .map(d =>
          Object.assign(
            { ...d },
            {
              createdAt: new Date(d.createdAt)
            }
          )
        )
        .forEach(d => Object.assign(dataObject, { [d.id]: d }))
      Vue.set(state, "data", dataObject);
    },
    setCommentsSize: (state, size) => {
      Vue.set(state, 'argumentsSize', size);
    },
    setIsDbChannelIsOpen: (state) => {
      Vue.set(state, 'isDbChannelIsOpen', true);
    },
  },
  actions: {
    /**
     * adding comment
     * @param content
     * @param sectionId
     * @param argumentId
     */
    addComment: async ({ state, rootGetters, dispatch, commit }, { content, contentHtml, sectionId, argumentId }: { content: string; contentHtml: string; sectionId: string; argumentId: string }) => {
      let newComment: CommentInterface = {
        content,
        contentHtml,
        documentId: rootGetters['documentsModule/documentId'],
        createdAt: new Date(),
        owner: rootGetters['usersModule/userUid'],
        sectionId,
        argumentId,
      };
      return await dispatch(insertByEnv, newComment);
    },
    insertToMockData: ({state}, newComment) => {
        let commentId = uniqid();
        newComment = {...newComment, id: commentId}
        Vue.set(state.data, commentId, newComment);
        return commentId;
    },
  },
};
