import { FirebaseDependency } from '@/firebase';
import { RootState } from '@/store/types';
import Vue from 'vue';
import Vuex from 'vuex';
import { vuexEasyFirestore } from 'vuex-easy-firestore';
import { argumentsModule } from './modules/argumentsModule';
import { commentsModule } from './modules/commentsModule';
import { displayModule } from './modules/displayModule';
import { documentsModule } from './modules/documentsModule';
import { mainModule } from './modules/mainModule';
import { notificationsModule } from './modules/notificationsModule';
import { routerModule } from './modules/routerModule';
import { sectionsModule } from './modules/sectionsModule';
import { usersModule } from './modules/usersModule';
import { votingModule } from './modules/votingModule';

Vue.use(Vuex);
export const mockDbName = 'consenz-test-environment-0'

const easyFirestore = vuexEasyFirestore([sectionsModule, argumentsModule, mainModule, usersModule, commentsModule, documentsModule], {
  logging: process.env.NODE_ENV !== 'production',
  FirebaseDependency,
});

export const store = new Vuex.Store<RootState>({
  state: {
    version: '1.0.0',
  },
  modules: {
    routerModule,
    displayModule,
    notificationsModule,
    votingModule,
  },
  plugins: [easyFirestore],
});
