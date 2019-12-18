import Vue from "vue";
import Vuex from "vuex";
import { vuexEasyFirestore } from "vuex-easy-firestore";
import { argumentsModule } from "./modules/argumentsModule";
import { commentsModule } from "./modules/commentsModule";
import { displayModule } from "./modules/displayModule";
import { documentsModule } from "./modules/documentsModule";
import { mainModule } from "./modules/mainModule";
import { notificationsModule } from "./modules/notificationsModule";
import { routerModule } from "./modules/routerModule";
import { sectionsModule } from "./modules/sectionsModule";
import { usersModule } from "./modules/usersModule";
import { votingModule } from "./modules/votingModule";

Vue.use(Vuex);

export const mockDbName = "consenz-test-environment-0";
export let fetchByEnv = "fetchToMockData";
export let petchByEnv = "petchToMockData";
export let insertByEnv = "insertToMockData";

let easyFirestore;
let modules = {
  routerModule,
  displayModule,
  notificationsModule,
  votingModule
};

if (process.env.NODE_ENV !== "development") {
  const FirebaseDependency = require("@/firebase");
  easyFirestore = vuexEasyFirestore(
    [
      sectionsModule,
      argumentsModule,
      mainModule,
      usersModule,
      commentsModule,
      documentsModule
    ],
    {
      logging: process.env.NODE_ENV !== "production",
      FirebaseDependency
    }
  );
  fetchByEnv = "fetch";
  fetchByEnv = "petch";
} else {
  modules = {
    ...modules,
    sectionsModule,
    argumentsModule,
    mainModule,
    usersModule,
    commentsModule,
    documentsModule
  };
}

export const store = new Vuex.Store({
  state: {
    version: "1.0.0"
  },
  modules,
  plugins: process.env.NODE_ENV !== "development" ? [easyFirestore] : []
});
