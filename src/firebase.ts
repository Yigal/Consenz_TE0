import { config } from '@/config';
import * as Firebase from 'firebase/app';

const firebaseKey = process.env.NODE_ENV!;
const firebaseConfig = config.firebaseConfig[firebaseKey];
console.log('Firebase.initializeApp ' + JSON.stringify(firebaseConfig));
Firebase.initializeApp(firebaseConfig);
export const FirebaseDependency = Firebase;
