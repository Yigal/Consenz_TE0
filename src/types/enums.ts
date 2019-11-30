import { feedTypeInterface } from './interfaces';
export const FEED_TYPE: feedTypeInterface = Object.freeze({
  inTheVote: 0,
  approved: 1,
  toDelete: 2,
  deleted: 3,
  toEdit: 4,
  edited: 5,
  rejected: 6,
  history: 7,
  sectionApproved: 8,
  sectionEdited: 9,
});

export enum FEED_TYPE_STATIC {
  deleted = 3,
  approved = 8,
  edited = 9,
  rejected = 6,
}

export enum DYNAMIC_STATUS {
  inTheVote = 0,
  toDelete = 2,
  toEdit = 4,
}

export enum STATIC_STATUS {
  approved = 1,
  deleted = 3,
  edited = 5,
  sectionApproved = 8,
  sectionEdited = 9,
  rejected = 6,
}

export const SECTION_STATUS = Object.freeze({
  inTheVote: 0,
  approved: 1,
  toDelete: 2,
  deleted: 3,
  toEdit: 4,
  edited: 5,
  rejected: 6,
});

export enum ROUTE_NAME {
  login = 'login',
  home = 'home',
  aboutConsenz = 'aboutConsenz',
  aboutDocument = 'aboutDocument',
  contactUs = 'contactUs',
  draft = 'draft',
  section = 'section',
  addNew = 'addNew',
}

export enum SECTION_BY {
  sectionById = 'sectionById',
  sectionsByStatus = 'sectionsByStatus',
}

export enum NOTIFICATION_TYPE {
  vote = 'vote',
  argument = 'argument',
  section = 'section',
  comment = 'comment',
}

export enum MAIL_RECIPIENT {
  voters = 'voters',
  owner = 'owner',
  participants = 'participants',
  responders = 'responders',
}

export enum VOTING_OPTIONS {
  pros = 'pros',
  cons = 'cons',
}

export enum ROLE {
  editor = 'editor',
}
