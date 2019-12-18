import * as Firebase from 'firebase/app';

export let FirebaseDependency;
if (process.env.NODE_ENV !== "development") {
    const config = require('@/config')
    const firebaseKey = process.env.NODE_ENV!;
    const firebaseConfig = config.firebaseConfig[firebaseKey];
    console.log('Firebase.initializeApp ' + JSON.stringify(firebaseConfig));
    Firebase.initializeApp(firebaseConfig);
    FirebaseDependency = Firebase;
}
