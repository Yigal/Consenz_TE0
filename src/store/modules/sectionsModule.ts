import { SectionInterface, ParentSectionInterface } from '@/types/interfaces';
import * as enums from '@/types/enums';
import * as constants from '@/types/constants';
import { Promise } from 'bluebird';
import Vue from 'vue';
import { keys } from 'ts-transformer-keys';
import { mockDbName } from '../index';

export const sectionsModule = {
  firestorePath: 'sections',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'sectionsModule',
  statePropName: 'data',
  namespaced: true, // automatically added
  // you can also add your own state/getters/mutations/actions
  serverChange: {
    convertTimestamps: {
      createdAt: '%convertTimestamp%',
      acceptedAt: '%convertTimestamp%',
      deadline: '%convertTimestamp%',
    },
    addedHook(updateStore, doc, id, store) {
      return updateStore(doc);
    },
    modifiedHook(updateStore, doc, id, store) {
      if ((doc.acceptedAt && doc.status === enums.SECTION_STATUS.approved) || doc.status === enums.SECTION_STATUS.edited || doc.status === enums.SECTION_STATUS.deleted) {
        store.commit('displayModule/showSnackbar', id);
      }
      return updateStore(doc);
    },
    removedHook(updateStore, doc, id, store) {
      return updateStore(doc);
    },
  },
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
  state: {
    isApprovedSections: false,
    initialParentId: '0',
    size: {},
    isDbChannelIsOpen: false,
    fetchedSize: {},
  },
  getters: {
    data: (state) => state.data,
    allSections: (state) => state.data,
    initialParentId: (state) => state.initialParentId,
    sizeByStatus: (state) => (status) => state.size[status],
    sectionsByStatus: (state, getters) => {
      console.log('Sections By Status');
      return (status, sectionId?) => {
        console.log('Status: ' + status + ', State data: ' + JSON.stringify(state.data));
        status = parseInt(status);
        const sectionsArray = status === enums.SECTION_STATUS.edited ? (getters['sectionById'](sectionId)[0] ? new Array(getters['sectionById'](sectionId)[0]) : []) : [];
        const data = state.data;
        return Object.keys(data)
          .filter((key) => data[key].status === status)
          .filter((key) => (sectionId ? data[key].parentSectionId === sectionId : true))
          .map((id) => data[id])
          .filter((section) => section !== undefined)
          .concat(sectionsArray)
          .sort((sectionA: SectionInterface, sectionB: SectionInterface) => 
          (status === enums.SECTION_STATUS.edited ? new Date (sectionB.acceptedAt!).getTime() - new Date (sectionA.acceptedAt!).getTime() : status === enums.SECTION_STATUS.approved ? new Date (sectionA.createdAt).getTime() - new Date (sectionB.createdAt).getTime() : new Date (sectionB.createdAt).getTime() - new Date(sectionA.createdAt).getTime()));
      }
    },
    sectionById: (state) => (id) => [state.data[id]],
    isSectionsInRevisions: (state) => (status) => Object.values(constants.STATIC_PAGES).includes(status),
    isStaticFeed: (state) => (PageStatus: number) => Object.values(enums.STATIC_STATUS).includes(PageStatus),
    isDynamicFeed: (state) => (PageStatus: number) => Object.values(enums.DYNAMIC_STATUS).includes(PageStatus),
    sectionIndex: (state, getters) => (status, parentSectionId, sectionId) =>
      getters['sectionsByStatus'](status, parentSectionId)
        .map((section) => section.id)
        .indexOf(sectionId) + 1,
    isParentSection: (state, getters) => (sectionId) => sectionId === state.initialParentId || getters['sectionById'](sectionId)[0].status === enums.SECTION_STATUS.approved,
    getDeadline: (state) => (deadline) => {
      let time = deadline;
      if (time.getSeconds()) { time = new Date(time.getSeconds() * 1000); } // Epoch
      const countDownDate = new Date(time).getTime();
      return countDownDate - new Date().getTime();
    },
    sectionRejectedLength: (state) => Object.keys(state.data).filter((key) => state.data[key].status === enums.SECTION_STATUS.rejected).length,
    isReachedDeadline: (state, getters) => (deadline) => getters.getDeadline(deadline) < 0,
  },
  mutations: {
    loadMockData: (state, payload) => {
      let mockData = require(`../../../database/${mockDbName}/collections/sections.json`)
      const dataObject = {}
      mockData = mockData.filter(d => d.documentId === payload)
      .map(d => Object.assign({...d}, {
        createdAt: new Date(d.createdAt),
        acceptedAt: new Date (d.acceptedAt),
        deadline: new Date (d.deadline),
      }))
      .forEach(d => Object.assign(dataObject, {[d.id]: d}))
      Vue.set(state, "data", dataObject);
    
    },
    setToSectionById: (state, { id, payload }) => {
      Object.keys(state.data).forEach((key, index) => {
        if (key === id) {
          Vue.set(state.data[id], index, payload);
        }
      });
    },
    setToSize: (state, { status, size }) => {
      Vue.set(state.size, status, size);
    },
    fetchedSize: (state, { status }) => {
      Vue.set(state.fetchedSize, status, true);
    },
    setIsDbChannelIsOpen: (state) => {
      Vue.set(state, 'isDbChannelIsOpen', true);
    },
  },
  actions: {
    /**
     * getting section by id
     */
    getSectionById: async ({ state, getters, dispatch, rootGetters, commit }, { sectionId, action }: { sectionId: string; action: string }) => {
      if (state.data[sectionId] !== undefined) {
        return getters['sectionById'](sectionId)[0];
      } else {
        const where = [['documentId', '==', rootGetters['mainModule/prettyLink']], ['id', '==', sectionId]];
        await dispatch(action, { where });
        commit('setIsDbChannelIsOpen');

        return getters['sectionById'](sectionId)[0];
      }
    },
    /**
     * gets the size of the sections in a specific status
     * @param {number} status
     */
    getSizeByStatus: async ({ state, rootGetters, dispatch, getters, commit }, status) => {
      if (state.fetchedSize[status]) {
        return getters['sizeByStatus'](status);
      } else {
        const where = [['documentId', '==', rootGetters['mainModule/prettyLink']], ['status', '==', status]];
        const querySnapshot = await dispatch('fetch', {
          where,
        });
        const size = querySnapshot.size !== undefined ? querySnapshot.size : 0;
        commit('setToSize', { status, size });
        commit('fetchedSize', { status });
        return size;
      }
    },
    /**
     * adding section
     * @param payload
     */
    addSection: async ({ rootGetters, dispatch }, payload) => {
      console.log('sectionsModule.addSection() Add Section ' + JSON.stringify(payload));
      const deadline = new Date();
      let timer = rootGetters['documentsModule/documentTimer'];
      if (timer == null){
        timer = 1000;
      }
      const hours = deadline.getHours() + timer;
      deadline.setHours(hours);
      let documentId = rootGetters['documentsModule/documentId'];
      const userUid = rootGetters['usersModule/userUid'];
      const newSection = {
        ...payload,
        cons: [],
        createdAt: new Date(),
        deadline,
        documentId: documentId,
        owner: userUid,
        pros: [userUid],
        timer: timer,
      };
      const documentThreshold = rootGetters['documentsModule/documentThreshold'];
      if (documentThreshold){
        newSection.threshold = documentThreshold;
      }
      console.log('Dispatch insert newSection ' + JSON.stringify(newSection));
      const newSectionId = await dispatch('insert', newSection);
      const update = {id: newSectionId, updateObject: { id: newSectionId }};
      console.log('Dispatch updateSection update ' + JSON.stringify(update));
      await dispatch('updateSection', update);
      console.log('Return newSectionId ' + JSON.stringify(newSectionId));
      return newSectionId;
    },
    /**
     * updates the section
     * @param {string} id the id of the section
     * @param {object} updateObject the keys and values to update
     */
    updateSection: async ({ dispatch }, { id, updateObject }) => {
      dispatch('patch', { id, ...updateObject });
    },
    /**
     * updates the parent section of the section
     * @param {string} parentSectionId the parent section id
     * @param {string} sectionId the section id
     * @param {number} newStatus the new status of the section
     * @param {number} prevStatus the previous status of the section
     *
     */
    updateParentSection: async ({ state, dispatch }, { parentSectionId, sectionId, newStatus, prevStatus, acceptedByEditor }) => {
      const parentSection = state.data[parentSectionId];
      const currentSection = state.data[sectionId];
      const newStatusName = Object.keys(enums.SECTION_STATUS)[newStatus];
      const prevStatusName = Object.keys(enums.SECTION_STATUS)[prevStatus];
      /**
       * filer the sectionId from previous status array and add it to new status array
       */
      let updateObject: any = {};
      if (parentSection[newStatusName]) {
        updateObject = {
          [newStatusName]: [...parentSection[newStatusName], sectionId],
        };
      }

      if (prevStatus && prevStatus !== enums.SECTION_STATUS.approved) {
        updateObject = {
          ...updateObject,
          [prevStatusName]: parentSection[prevStatusName].filter((id) => id !== sectionId),
        };
      }
      if (newStatus === enums.SECTION_STATUS.deleted) {
        updateObject = {
          ...updateObject,
          status: newStatus,
        };
      }
      if (newStatus === enums.SECTION_STATUS.edited) {
        // return await dispatch("convertToParent", { sectionId, parentSectionId, updateObject });

        updateObject = {
          ...updateObject,
          createdAt: currentSection.createdAt,
          acceptedAt: new Date(),
          ...(await dispatch('replaceProperties', { sectionId, parentSectionId })),
        };
      }
      console.log('updating the parent section -> it gets the created and accepted of the EDITED section:', parentSectionId , {...updateObject});
      if (acceptedByEditor !== null) { updateObject = {...updateObject, acceptedByEditor}; }
      await dispatch('updateSection', {
        id: parentSectionId,
        updateObject: { ...updateObject },
      });
    },
    /**
     * updates the threshold of the sections that has one of this statuses: inTheVote, toDelete, toEdit
     * @param {number} threshold
     */
    updateThreshold: ({ state, getters, dispatch }, { threshold }) => {
      const sections = [enums.SECTION_STATUS.inTheVote, enums.SECTION_STATUS.toDelete, enums.SECTION_STATUS.toEdit].map((status) => Object.keys(state.data).filter((key) => state.data[key].status === status));
      return Promise.map(sections.flat(), async (section) => {
        await dispatch('updateSection', {
          id: section,
          updateObject: { threshold },
        });
      });
    },
    /**
     * replace properties between the approved section - the parent section and the edited section.
     * The parent section getting the content of the edited section
     * @param {string} parentSectionId the parent section id
     * @param {string} sectionId the section id
     * */
    replaceProperties: async ({ getters, dispatch }, { sectionId, parentSectionId }) => {
      const keys = ['content', 'contentHtml', 'owner', 'cons', 'pros', 'threshold', 'timer', 'deadline' , 'acceptedByEditor'];
      const newSection = getters['sectionById'](sectionId)[0];
      const parentSection = getters['sectionById'](parentSectionId)[0];
      let updateApprovedSection = {};
      keys.forEach((key) => {
        updateApprovedSection = {
          ...updateApprovedSection,
          [key]: newSection[key] ? newSection[key] : null,
        };
      });
      let updateEditedSection = {};
      keys.forEach((key) => {
        updateEditedSection = {
          ...updateEditedSection,
          [key]: parentSection[key] ? parentSection[key] : null,
        };
      });
      console.log('updating the section:', sectionId, {
          ...updateEditedSection,
          acceptedAt: parentSection.acceptedAt,
          createdAt: parentSection.createdAt,
        });
      await dispatch('updateSection', {
        id: sectionId,
        updateObject: {
          ...updateEditedSection,
          acceptedAt: parentSection.acceptedAt,
          createdAt: parentSection.createdAt,
        },
      });
      dispatch('argumentsModule/updateArgumentSectionIds', { oldId: sectionId, newId: parentSectionId }, { root: true });
      return updateApprovedSection;
    },
    /**
     * updates the status of the section if the deadline of the section is over
     */
    updateStatusByDeadline: async ({ state, getters, dispatch }) => {
      Object.keys(getters.data).forEach(async (sectionId) => {
        const time = getters.data[sectionId].deadline;
        if (Object.values(enums.DYNAMIC_STATUS).includes(getters.data[sectionId].status) && getters.isReachedDeadline(time)) {
          await dispatch('updateSection', {
            id: sectionId,
            updateObject: { status: enums.SECTION_STATUS.rejected },
          });
        }
      });
    },
  },
};
