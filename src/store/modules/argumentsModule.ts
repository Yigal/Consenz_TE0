import { ArgumentInterface } from "@/types/interfaces";
import Vue from "vue";
import * as enums from "@/types/enums";
import { arrayUnion, arrayRemove } from "vuex-easy-firestore";
import { mockDbName } from "..";

export const argumentsModule = {
  firestorePath: "arguments",
  // The path to a "collection" or single "document" in firestore.
  // You can use `{userId}` which will be replaced with the user Id.
  firestoreRefType: "collection",
  // `'collection'` or `'doc'`. Depending on your `firestorePath`.
  moduleName: "argumentsModule",
  // The module name. eg. `'userItems'`
  // Can also be a nested module, eg. `'userModule/items'`
  statePropName: "data",
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
      // Check vuex-easy-firestore hooks documentation
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
    }
  },

  // When docs on the server side are changed:
  serverChange: {
    convertTimestamps: {
      createdAt: "%convertTimestamp%"
    }, // HOOKS for changes on SERVER:
    addedHook(updateStore, doc, id, store) {
      return updateStore(doc);
    },
    modifiedHook(updateStore, doc, id, store) {
      return updateStore(doc);
    },
    removedHook(updateStore, doc, id, store) {
      return updateStore(doc);
    }
  },

  // When docs are fetched through `dispatch('module/fetch', filters)`.
  fetch: {
    // The max amount of documents to be fetched. Defaults to 50.
    docLimit: 50
  },

  // You can also add custom state/getters/mutations/actions. These will be added to your module.
  state: {
    argumentsSize: undefined,
    isDbChannelIsOpen: false
  },
  getters: {
    argumentsSize: state => Object.keys(state.data).length,
    arguments: state => state.data,
    argumentBySectionId: state => sectionId =>
      Object.keys(state.data)
        .filter(key => state.data[key].sectionId === sectionId)
        .map(id => state.data[id])
        .sort(
          (argumentA: ArgumentInterface, argumentB: ArgumentInterface) =>
            argumentA.createdAt.getTime() - argumentB.createdAt.getTime()
        ),

    isUserConvinced: (state, getters, dispatch, rootGetters) => (
      argument: ArgumentInterface
    ) => {
      const ownerUid = rootGetters["usersModule/user"].uid;
      return argument.convinced.includes(ownerUid);
    },
    argumentById: state => argumentId => state.data[argumentId]
  },
  mutations: {
    loadMockData: (state, payload) => {
      let mockData = require(`../../../database/${mockDbName}/collections/arguments.json`);
      const dataObject = {};
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
        .forEach(d => Object.assign(dataObject, { [d.id]: d }));
      Vue.set(state, "data", dataObject);
    },
    setIsDbChannelIsOpen: state => {
      Vue.set(state, "isDbChannelIsOpen", true);
    }
  },
  actions: {
    openChannel: async ({ dispatch, rootGetters }, where) => {
      return await dispatch("openDBChannel", { where });
    },
    /**
     * adding argument
     * @param {ArgumentInterface} newObject new argument object to add
     * @param content
     * @param sectionId
     * @param type
     * @param content
     * @param sectionId
     * @param type
     * @param content
     * @param sectionId
     * @param type
     */
    addArgument: async (
      { context, rootGetters, dispatch, commit },
      {
        content,
        contentHtml,
        sectionId,
        type
      }: {
        content: string;
        contentHtml: string;
        sectionId: string;
        type: boolean;
      }
    ) => {
      const newArgument: ArgumentInterface = {
        content,
        contentHtml,
        documentId: rootGetters["documentsModule/documentId"],
        createdAt: new Date(),
        owner: rootGetters["usersModule/userUid"],
        sectionId,
        convinced: []
      };
      if (type !== null) {
        newArgument.type = type;
      }
      console.log("Dispatch insert newArgument " + JSON.stringify(newArgument));
      const argId = await dispatch("insert", newArgument);
      const isSectionReachedToThreshold = await dispatch(
        "voteAfterAddingArgument",
        { sectionId, type }
      );
      return isSectionReachedToThreshold ? false : argId;
    },
    /**
     * update the section
     * @param dispatch
     * @param {string} id the id of the section
     * @param {object} updateObject object with the keys and values to update
     */
    updateArgument: async ({ dispatch }, { id, updateObject }) => {
      dispatch("patch", { id, ...updateObject });
    },

    voteAfterAddingArgument: async (
      { context, rootGetters, dispatch, commit },
      { sectionId, type }
    ) => {
      const section = rootGetters["sectionsModule/sectionById"](sectionId)[0];
      const vote = type ? enums.VOTING_OPTIONS.pros : enums.VOTING_OPTIONS.cons;
      if (!rootGetters["votingModule/isUserVoted"](section, vote)) {
        const updatedVotes = await dispatch(
          "votingModule/addVote",
          { type: "section", object: section, vote },
          { root: true }
        );
        if (
          rootGetters["votingModule/isSectionReachedToThreshold"](
            section,
            updatedVotes
          )
        ) {
          await dispatch(
            "votingModule/updateAll",
            {
              updatedVotes,
              section,
              parentSectionId: section.parentSectionId
            },
            { root: true }
          );

          await dispatch(
            "votingModule/endVoting",
            {
              updatedVotes,
              section,
              parentSectionId: section.parentSectionId,
              sectionIndex: 1
            },
            { root: true }
          );
          return true;
        } else {
          return false;
        }
      }
    },
    /**
     * adds user the convinced array of the argument
     * @param {string} id argument id
     */
    userConvinced: async ({ dispatch, rootGetters }, id) => {
      const ownerUid = rootGetters["usersModule/userUid"];
      return await dispatch("patch", { id, convinced: arrayUnion(ownerUid) });
    },
    /**
     * deleted user the convinced array of the argument
     * @param {string} id argument id
     */
    userUnconvinced: async ({ dispatch, rootGetters }, id) => {
      const ownerUid = rootGetters["usersModule/userUid"];
      return await dispatch("patch", { id, convinced: arrayRemove(ownerUid) });
    },
    /**
     * updating the arguments sectionsId after voting ends
     */
    updateArgumentSectionIds: async ({ state, dispatch }, { oldId, newId }) => {
      const oldIds = Object.keys(state.data)
        .filter(id => state.data[id].sectionId === oldId)
        .map(id => state.data[id]);
      const newIds = Object.keys(state.data)
        .filter(id => state.data[id].sectionId === newId)
        .map(id => state.data[id]);

      oldIds.map(argument => {
        dispatch("updateArgument", {
          id: argument.id,
          updateObject: { sectionId: newId }
        });
      });
      newIds.map(argument => {
        dispatch("updateArgument", {
          id: argument.id,
          updateObject: { sectionId: oldId }
        });
      });
    }
  }
};
