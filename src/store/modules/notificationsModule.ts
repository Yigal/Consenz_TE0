// import { config } from '@/config';
import serviceAPI from '@/services/serviceAPI';
import { MailTitleInterface, MiniUserInterface, SectionInterface } from '@/types/interfaces';
import * as enums from '@/types/enums';
import { Promise } from 'bluebird';

const getDefaultState = () => {
  return {
    toDelete: false,
    sectionId: '',
  };
};

export const notificationsModule = {
  namespaced: true,
  state: {
    toDelete: false,
    sectionId: '',
    emailConfig: {
      recipientsArray: [],
      title: '',
      body: { text: '', url: '' },
    },
    config: process.env.NODE_ENV !== "development" ? require('@/config') : {}
    // domain: process.env.NODE_ENV !== "development" ?
  },
  getters: {
    toDelete: (state) => state.toDelete,
    sectionId: (state) => state.sectionId,
    /**
     * get the owner ID of the argument / section by the notifications typw
     * @param {enums.NOTIFICATION_TYPE} notificationsType
     * @param {string} argumentId
     * @param {string} sectionId
     */
    getOwner: (state, getters, rootState, rootGetters) => {
      return (notificationType, argumentId, sectionId) => {
        const hasComment = notificationType === enums.NOTIFICATION_TYPE.comment;
        let owner;
        if (hasComment) {
          const argumentByIdGetter = rootGetters['argumentsModule/argumentById'];
          const argument = argumentByIdGetter(argumentId);
          owner = argument.owner
        } else {
          const sectionByIdGetter = rootGetters['sectionsModule/sectionById'];
          const section = sectionByIdGetter(sectionId);
          const sectionElement = section[0];
          owner = sectionElement.owner
        }
        console.log('owner: ' + owner);
        return owner;
      }
    },
    /**
     * get the title of the mail
     * @param {string} userDisplayName
     */
    getEmailTitles: (state, getters, rootState, rootGetters) => (userDisplayName: string): MailTitleInterface => {
      const documentTitle = rootGetters['documentsModule/documentTitle'];
      return {
        vote: {
          voters: `הצעה שהצבעת לה במסמך "${documentTitle}" התקבלה!`,
          owner: `הצעה שהעלית למסמך "${documentTitle}" התקבלה!`,
        },
        argument: {
          voters: {
            inTheVote: `${userDisplayName} הוסיף/ה טיעון חדש להצעה שהצבעת לה בדיון "${documentTitle}"`,
            toDelete: `${userDisplayName} הוסיף/ה טיעון חדש למחיקת ההצעה שהצבעת לה בדיון "${documentTitle}"`,
            toEdit: `${userDisplayName} הוסיף/ה טיעון חדש להצעה לשינוי שפירסמת במסמך "${documentTitle}"`,
          },
          owner: {
            inTheVote: `${userDisplayName} הוסיף/ה טיעון חדש להצעה שפירסמת בדיון "${documentTitle}"`,
            toDelete: `${userDisplayName} הוסיף/ה טיעון חדש למחיקת ההצעה שפירסמת בדיון "${documentTitle}"`,
            toEdit: `${userDisplayName} הוסיף/ה טיעון חדש להצעה לשינוי שפירסמת במסמך "${documentTitle}"`,
          },
        },
        section: {
          participants: {
            inTheVote: `${userDisplayName} פרסמ/ה הצעה לסעיף חדש במסמך "${documentTitle}"`,
            toEdit: `${userDisplayName} פרסמ/ה הצעה חדשה לשינוי סעיף במסמך "${documentTitle}"`,
          },
        },
        comment: {
          owner: {
            inTheVote: `${userDisplayName} פרסמ/ה תגובה חדשה לטיעון שפרסמת במסמך "${documentTitle}"`,
            toDelete: `${userDisplayName} פרסמ/ה תגובה חדשה לטיעון שפרסמת במסמך "${documentTitle}"`,
            toEdit: `${userDisplayName} פרסמ/ה תגובה חדשה לטיעון שפרסמת במסמך "${documentTitle}"`,
          },
          responders: {
            inTheVote: `${userDisplayName} פרסמ/ה תגובה חדשה לטיעון במסמך "${documentTitle}"`,
            toDelete: `${userDisplayName} פרסמ/ה תגובה חדשה לטיעון במסמך "${documentTitle}"`,
            toEdit: `${userDisplayName} פרסמ/ה תגובה חדשה לטיעון במסמך "${documentTitle}"`,
          },
        },
      };
    },
    /**
     * get the body of the mail:
     * the content of the new argument / section / comment
     * the link back to the app
     * @param {string} sectionId
     * @param {string} newContent
     *
     */
    getEmailBody: (state, getters, rootState, rootGetters) => (sectionId, newContent, argumentId, commentId) => {
      const documentId = rootGetters['documentsModule/documentId'];
      const domain = process.env.NODE_ENV !== "development" ? state.config.firebaseConfig[process.env.NODE_ENV!].domain : '';
      return {
        vote: {
          content: `נוסח ההצעה שהתקבלה:
          ${newContent}`,
          text: `לצפייה בהצעה שהתקבלה`,
          // tslint:disable-next-line:max-line-length
          url: `${domain}/#/document/${documentId}/section/?sectionsByStatus=${enums.SECTION_STATUS.edited}&index=1&id=${sectionId}`,
        },
        argument: {
          content: `נוסח הטיעון החדש:
          ${newContent}`,
          text: `לחזרה לדיון ולקריאת הטיעון `,
          url:
            // tslint:disable-next-line:max-line-length
            `${domain}/#/document/${documentId}/section?sectionById=${sectionId}&scrollTo=argument&scrollId=${argumentId}&index=1`,
        },
        section: {
          content: `נוסח ההצעה החדשה:
          ${newContent}`,
          text: `לצפייה ולהצבעה להצעה החדשה`,
          // tslint:disable-next-line:max-line-length
          url: `${domain}/#/document/${documentId}/section?sectionById=${sectionId}&scrollTo=section&scrollId=${sectionId}&index=1`,
        },
        comment: {
          content: `נוסח התגובה:
          ${newContent}`,
          text: `לצפייה בתגובה`,
          // tslint:disable-next-line:max-line-length
          url: `${domain}/#/document/${documentId}/section?sectionById=${sectionId}&scrollTo=comment&scrollId=${commentId}&index=1`,
        },
      };
    },
    /**
     * get the recipients of the mail by the recipient type
     * @param {MAIL_RECIPIENT} recipientsType
     * @param {SectionInterface} section
     * @param {string} owner
     * @param {MiniUserInterface} user
     * @param {MiniUserInterface[]} participants
     * @param {string} argumentId
     *
     */
    getRecipients: (state, getters, rootState, rootGetters) => ({ recipientsType, section, owner, user, participants, argumentId }) => {
      let recipients: MiniUserInterface[] | any = [];
      switch (recipientsType) {
        case 'owner':
          recipients.push(owner);
          break;
        case 'voters':
          recipients = [...recipients, ...section!.pros, ...section!.cons];
          recipients = recipients.filter((uid) => uid !== section.owner);
          break;
        case 'participants':
          recipients = recipients.concat(Object.keys(participants));
          break;
        case 'responders':
          const comments = rootGetters['commentsModule/commentsByArgumentId'](argumentId);
          recipients = recipients.concat(comments.map((comment) => comment.owner));
          break;
      }
      return recipients.filter((uid) => uid !== user.uid);
    },
  },
  mutations: {
    resetState(state) {
      Object.assign(state, getDefaultState());
    },
  },
  actions: {
    /**
     * sends parallel notifications to each of the recipients type array
     * @param {string} newContent the content of the new section / argument / comment
     * @param {enums.MAIL_RECIPIENT[]} recipientsTypesArray
     * @param {enums.NOTIFICATION_TYPE} emailType
     * @param {string} sectionId
     * @param {string} parentSectionId
     * @param {enums.STATIC_STATUS} status
     * @param {string} argumentId
     */
    sendParallelNotifications: async ({ dispatch }, { newContent, recipientsTypesArray, emailType, sectionId, parentSectionId, status, argumentId, commentId }) => {
      Promise.map(recipientsTypesArray, async (recipientsType) => {
        const mail = await dispatch('createMail', {
          newContent,
          recipientsType,
          notificationType: emailType,
          sectionId,
          parentSectionId,
          argumentId,
          status,
          commentId,
        });
        console.log('mail', mail);
        await dispatch('sendNotifications', mail);
      });
    },

    /**
     * creating mail object to send ti firebase cloud function
     * @param {string} newContent the content of the new section / argument / comment
     * @param {enums.MAIL_RECIPIENT[]} recipientsTypesArray
     * @param {enums.NOTIFICATION_TYPE} emailType
     * @param {string} sectionId
     * @param {string} parentSectionId
     * @param {enums.STATIC_STATUS} status
     * @param {string} argumentId
     */
    createMail: async (
      { dispatch, getters, rootGetters, state },
      {
        newContent,
        recipientsType,
        notificationType,
        sectionId,
        parentSectionId,
        argumentId,
        status,
        commentId,
      }: {
        newContent: string;
        recipientsType: enums.MAIL_RECIPIENT;
        notificationType: enums.NOTIFICATION_TYPE;
        sectionId: string;
        parentSectionId: string;
        argumentId;
        status: number;
        commentId: string;
      },
    ) => {
      const dsn = rootGetters['documentsModule/documentSendNotifications'];
      if (!dsn) {
        return;
      }
      const mail: any = {};
      const user: MiniUserInterface = rootGetters['usersModule/user'];
      const section: SectionInterface = rootGetters['sectionsModule/sectionById'](sectionId)[0];
      const owner = getters.getOwner(notificationType, argumentId, sectionId); // by NOTIFICATION_TYPE
      const recipients: any = getters['getRecipients']({ recipientsType, section, user, owner, participants: rootGetters['usersModule/participants'], argumentId });
      mail.mailList = await dispatch('getBatchRecipients', recipients);
      let title = getters['getEmailTitles'](user.displayName)[notificationType][recipientsType];
      if (notificationType !== enums.NOTIFICATION_TYPE.vote) { title = title[Object.keys(enums.SECTION_STATUS)[status]]; }
      mail.title = title;
      mail.body = getters['getEmailBody'](status === enums.SECTION_STATUS.edited ? parentSectionId : sectionId, newContent, argumentId, commentId)[notificationType];
      return mail;
    },

    /**
     * sending notifications to users
     * @param {object} emailConfig email configuration to send
     */
    sendNotifications: async ({ commit, rootGetters, state }, emailConfig) => {
      await serviceAPI.sendNotifications({
        ...emailConfig,
        documentId: rootGetters[`mainModule/prettyLink`],
        authDomain: process.env.NODE_ENV !== "development" ? state.config.firebaseConfig[process.env.NODE_ENV!].domain : '',
      });
      commit('resetState');
    },

    getBatchRecipients: async ({ dispatch }, recipients: [string] | string) => {
      return await dispatch('usersModule/getBatchUsersNotificationProp', { users: recipients }, { root: true });
    },
  },

  moduleName: '',
  statePropName: '',
  sync: {},
  serverChange: {},
  fetch: {
    docLimit: 0,
  },
};
