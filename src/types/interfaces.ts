export type status = number;

export interface NotificationsInterface {
  isOn: boolean;
  mailAddress: string;
}

export type uid = string; // user ID
export type sid = string; // section ID
export type aid = string; // argument ID

export interface MiniUserInterface {
  displayName: string;
  uid: string;
  id: string;
  documents: string[];
  notifications: NotificationsInterface;
}
export interface SectionInterface {
  cons: uid[];
  content: string;
  contentHtml: string;
  createdAt: Date;
  deadline: Date;
  acceptedAt?: Date;
  documentId: string;
  owner: string;
  pros: uid[];
  tag: string;
  timer: number;
  threshold: number;
  id?: string;
  status: status;
  rejectedAt?: Date;
  parentSectionId: string;
  edited?: sid[];
  acceptedByEditor: string;
}

export interface ParentSectionInterface {
  cons: uid[];
  content: string;
  contentHtml: string;
  createdAt: Date;
  deadline: Date;
  acceptedAt?: Date;
  documentId: string;
  owner: string;
  pros: uid[];
  tag: string;
  timer: number;
  threshold: number;
  id?: string;
  status: status;
  edited: sid[];
  deleted: sid[];
  toDelete: sid[];
  toEdit: sid[];
  parentSectionId: sid;
}

export interface ArgumentInterface {// Schema of new arguments
  content: string;
  contentHtml: string;
  createdAt: Date;
  owner: MiniUserInterface;
  sectionId: sid;
  documentId: string;
  type?: boolean;
  isOpenArgument?: boolean;
  convinced: string[];
  id?: string
}

export interface CommentInterface {
  content: string;
  contentHtml: string;
  createdAt: Date;
  owner: MiniUserInterface;
  sectionId: sid;
  documentId: string;
  argumentId: string;
  id?: string

}

export interface DocumentInterface {
  id: string;
  title: string;
  timer: number;
  threshold: number;
  createdAt: Date;
  consensuses: number[];
  consensus_meter: number;
  about: string;
  sendNotifications: boolean;
  documentTopics?: string[];
  divisionOfTopics: boolean;
  editors: uid[];
  conditionalSupport?: boolean;
  pros: uid[];
  cons: uid[];
  prosConditional?: string[];
  voteOnDocument: boolean;
}

export interface MailTitleInterface {
  vote: {
    voters: string;
    owner: string;
  };
  argument: {
    voters: {
      ['inTheVote']: string;
      ['toDelete']: string;
      ['toEdit']: string;
    };
    owner: {
      ['inTheVote']: string;
      ['toDelete']: string;
      ['toEdit']: string;
    };
  };
  section: {
    participants?: {
      ['toEdit']: string;
      ['inTheVote']: string;
    };
  };
  comment: {
    owner: {
      ['inTheVote']: string;
      ['toDelete']: string;
      ['toEdit']: string;
    };
    responders: {
      ['inTheVote']: string;
      ['toDelete']: string;
      ['toEdit']: string;
    };
  };
}

export interface MailBodyInterface {
  text: string;
  url: string;
}

export interface MailNotificationInterface {
  recipientsArray: MiniUserInterface[];
  title: string;
  body: MailBodyInterface;
}

export interface VotesInterface {
  pros: uid[];
  cons: uid[];
}

export interface feedTypeInterface {
  inTheVote: number;
  approved: number;
  toDelete: number;
  deleted: number;
  toEdit: number;
  edited: number;
  rejected: number;
  history: number;
  sectionApproved: number;
  sectionEdited: number;
}
