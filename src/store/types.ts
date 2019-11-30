import { DocumentInterface, MiniUserInterface } from '@/types/interfaces';

export interface UserState {
  user: MiniUserInterface;
  isNewUser: boolean;
}

export interface DocumentState {
  data: DocumentInterface;
}

export interface RouterModuleState {
  routesNames: object;
  currentRoute: object;
  lastRoute: object;
  transition: boolean;
  scrollTops: object;
  transitionName: string;
}

export interface VotingModuleState {}

export interface DisplayModuleState {}

export interface NavBarInterface {
  title: string;
  icon: NAVBAR_SIDE_ICON;
  color: string;
  path?: string;
}

export interface RootState {
  version: string;
}

export interface NavBarInterface {
  title: string;
  icon: NAVBAR_SIDE_ICON;
  color: string;
  path?: string;
}

export enum NAVBAR_SIDE_ICON {
  menu = 'menu',
  'arrow_forward' = 'arrow_forward',
  close = 'close',
  path = 'path',
}

export enum NAVBAR_COLOR {
  blue = '#0fc3ac',
  purple = '#69378e',
  yellow = '#ecd138',
}

export interface NavBarInterface {
  title: string;
  icon: NAVBAR_SIDE_ICON;
  color: string;
  path?: string;
}
