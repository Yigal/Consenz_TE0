import { FEED_TYPE } from './enums';

export const DYNAMIC_PAGES: number[] = [FEED_TYPE.inTheVote, FEED_TYPE.toDelete, FEED_TYPE.toEdit];
export const STATIC_PAGES: number[] = [FEED_TYPE.deleted, FEED_TYPE.sectionApproved, FEED_TYPE.sectionEdited];

export const VOTING_OPTIONS = Object.freeze({
  pros: 'PROS',
  cons: 'CONS',
});
