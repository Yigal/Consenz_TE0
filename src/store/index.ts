import Vue from "vue";
import Vuex from "vuex";
import { argumentsModule } from "./modules/argumentsModule";
import { commentsModule } from "./modules/commentsModule";
import { displayModule } from "./modules/displayModule";
import { documentsModule } from "./modules/documentsModule";
import { mainModule } from "./modules/mainModule";
import { routerModule } from "./modules/routerModule";
import { sectionsModule } from "./modules/sectionsModule";
import { usersModule } from "./modules/usersModule";
import { votingModule } from "./modules/votingModule";

Vue.use(Vuex);

export const mockDbName = "consenz-test-environment-0";
export let petchByEnv = "petchToMockData";
export let insertByEnv = "insertToMockData";

let modules: any = {
  routerModule,
  displayModule,
  votingModule
};

modules = {
  ...modules,
  sectionsModule,
  argumentsModule,
  mainModule,
  usersModule,
  commentsModule,
  documentsModule
};

export const store = new Vuex.Store({
  state: {
    version: "1.0.0"
  },
  modules,
  plugins: []
});
