import { DocumentInterface } from './../../types/interfaces';
import { ArgumentInterface } from '@/types/interfaces';
import Vue from 'vue';
import * as enums from '@/types/enums';
import { arrayUnion, arrayRemove } from 'vuex-easy-firestore';

export const documentsModule = {
  firestorePath: 'documents',
  // The path to a "collection" or single "document" in firestore.
  // You can use `{userId}` which will be replaced with the user Id.
  firestoreRefType: 'collection',
  // `'collection'` or `'doc'`. Depending on your `firestorePath`.
  moduleName: 'documentsModule',
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
    prettyLink: undefined,
  },
  getters: {
    state: (state) => state,
    document: (state) => (state.data[state.prettyLink] !== undefined ? state.data[state.prettyLink] : null),
    documentId: (state) => (state.data[state.prettyLink] !== undefined ? state.data[state.prettyLink].id : null),
    documentTitle: (state) => (state.data[state.prettyLink] !== undefined ? state.data[state.prettyLink].title : null),
    documentThreshold: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.threshold;
    },
    documentConsensuses: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.consensuses;
    },
    documentAbout: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.about;
    },
    documentSendNotifications: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.sendNotifications;
    },
    documentTimer: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.timer;
    },
    documentTopics: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.documentTopics;
    },
    documentDivisionOfTopics: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.divisionOfTopics;
    },
    documentConditionalSupport: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.conditionalSupport;
    },
    documentPros: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.pros;
    },
    documentCons: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.cons;
    },
    documentProsConditional: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.prosConditional;
    },
    documentEditors: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.editors;
    },
    voteOnDocument: (state) => {
      const prettyLink = state.prettyLink;
      const data = state.data;
      const datum = data[prettyLink];
      if (datum == null) {
        return datum;
      }
      return datum.voteOnDocument;
    },
  },
  mutations: {
    setPrettyLink: (state, payload) => {
      console.log('Set PrettyLink ' + JSON.stringify(payload));
      Vue.set(state, 'prettyLink', payload);
    },
  },
  actions: {
    addDocument: async ({ context, rootGetters, dispatch, commit }, { title, id }) => {
      const newDocument: DocumentInterface = {
        title,
        consensus_meter: 1,
        consensuses: [],
        createdAt: new Date(),
        divisionOfTopics: true,
        id,
        about: '',
        documentTopics: ['מבוא', 'סיכום'],
        sendNotifications: true,
        threshold: 2,
        timer: 24,
        editors: [],
        conditionalSupport: false,
        pros: [],
        cons: [],
        // prosConditional?: string[];
        voteOnDocument: false,
      };
      console.log('Dispatch insert newDocument ' + JSON.stringify(newDocument));
      await dispatch('insert', newDocument);
    },
    updateDocument: async (context, { updateObject }) => {
      await context.dispatch('patch', { id: context.getters.documentId, ...updateObject });
    },
    addTopic: async (context, topic) => {
      await context.dispatch('patch', { id: context.state.documentId, documentTopics: arrayUnion(topic) });
    },
  },
};
