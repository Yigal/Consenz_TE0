import * as admin from "firebase-admin";
import {  firestore } from "../init";

export const userApi = <any>{};

userApi.getUser = async id => {
  try {
    const documentSnapshot = await firestore
      .collection("users")
      .doc(id)
      .get();
    if (documentSnapshot.exists) {
      return { ...documentSnapshot.data(), uid: documentSnapshot.id };
    } else throw new Error("document is not exist!");
  } catch (error) {
    return error;
  }
};

userApi.getUsers = async id => {
  try {
    const documentSnapshot = await firestore
      .collection("users")
      .get();
    if (!documentSnapshot.empty) {
      const objs = [];
      documentSnapshot.forEach(doc => {
        const obj: { [k: string]: any } = {};
        Object.assign(obj, doc.data());
        obj.id = doc.id;
        objs.push(obj);
      });
      return objs;
      // return { ...documentSnapshot.data(), uid: documentSnapshot.id };
    } else throw new Error("document is not exist!");
  } catch (error) {
    return error;
  }
};

userApi.updateUserDocuments = async (id, documentId) => {
  try {
    console.log("id:", id)
    return firestore
      .collection("users")
      .doc(id)
      .update({
        documents: admin.firestore.FieldValue.arrayUnion(documentId)
      });
  } catch (error) {
    return error;
  }
};

userApi.updateUserNotifications = async (id, notifications) => {
  try {
    return firestore
      .collection("users")
      .doc(id)
      .update({
        notifications
      });
  } catch (error) {
    return error;
  }
};

userApi.notificationsOff = async id => {
  console.log('notifications off: ', id)
  try {
    return firestore
      .collection("users")
      .doc(id)
      .update({
        ["notifications.isOn"]: false
      });
  } catch (error) {
    console.log(error)
    return error;
  }
};

userApi.addUser = async (data) => {
  try {
    await firestore
      .collection("users")
      .add({...data, createdAt: admin.firestore.FieldValue.serverTimestamp()});
  } catch (error) {
    throw new Error(error);
  }
};

userApi.deleteUser = async(id) => {
  firestore.collection("users").doc(id).delete().then(function() {
  }).catch(function(error) {
    console.error("Error removing document: ", error);
  });

} 

