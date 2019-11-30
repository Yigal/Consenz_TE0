import { Module } from 'vuex';

declare module 'vuex/types/index' {
  export interface Module<S, R> {
    firestorePath: string;
    firestoreRefType: string;
    moduleName: string;
    statePropName: string;
    sync: object;
    serverChange: object;
    fetch: {
      docLimit: number;
    };
  }
}
