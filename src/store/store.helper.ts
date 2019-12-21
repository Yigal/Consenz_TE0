import {Action, Getter, Mutation, namespace} from 'vuex-class';

console.log('Store Helper');
export const DocumentsModule = {
  DocumentsGetter: namespace('documentsModule', Getter),
  DocumentsMutation: namespace('documentsModule', Mutation),
  DocumentsAction: namespace('documentsModule', Action),
};

export const RouterModule = {
  RouterGetter: namespace('routerModule', Getter),
  RouterAction: namespace('routerModule', Action),
  RouterMutation: namespace('routerModule', Mutation),
};
export const DisplayModule = {
  DisplayGetter: namespace('displayModule', Getter),
  DisplayMutation: namespace('displayModule', Mutation),
};
export const SectionsModule = {
  SectionsGetter: namespace('sectionsModule', Getter),
  SectionsMutation: namespace('sectionsModule', Mutation),
  SectionsAction: namespace('sectionsModule', Action),
};
export const MainModule = {
  MainGetter: namespace('mainModule', Getter),
  MainMutation: namespace('mainModule', Mutation),
  MainAction: namespace('mainModule', Action),
};
export const UsersModule = {
  UsersGetter: namespace('usersModule', Getter),
  UsersMutation: namespace('usersModule', Mutation),
  UsersAction: namespace('usersModule', Action),
};
export const ArgumentsModule = {
  ArgumentsGetter: namespace('argumentsModule', Getter),
  ArgumentsMutation: namespace('argumentsModule', Mutation),
  ArgumentsAction: namespace('argumentsModule', Action),
};
export const CommentsModule = {
  CommentsGetter: namespace('commentsModule', Getter),
  CommentsMutation: namespace('commentsModule', Mutation),
  CommentsAction: namespace('commentsModule', Action),
};
export const VotingModule = {
  VotingGetter: namespace('votingModule', Getter),
  VotingMutation: namespace('votingModule', Mutation),
  VotingAction: namespace('votingModule', Action),
};
