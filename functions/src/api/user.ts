/*import * as admin from "fire$$base-admin";
import {  fire$$store } from "../init";*/

export const userApi = <any>{};

userApi.getUser = async id => {
  /*try {
    const documentSnapshot = await fire$$store
      .collection("users")
      .doc(id)
      .get();
    if (documentSnapshot.exists) {
      return { ...documentSnapshot.data(), uid: documentSnapshot.id };
    } else throw new Error("document is not exist!");
  } catch (error) {
    return error;
  }*/
  throw new Error("getUser Not Implemented");
};

userApi.getUsers = async id => {
  try {
    const documentSnapshot = await fire$$store
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
  /*try {
    console.log("id:", id)
    return fire$$store
      .collection("users")
      .doc(id)
      .update({
        documents: admin.fire$$store.FieldValue.arrayUnion(documentId)
      });
  } catch (error) {
    return error;
  }*/
  throw new Error("updateUserDocuments Not Implemented");
};

userApi.updateUserNotifications = async (id, notifications) => {
  /*try {
    return fire$$store
      .collection("users")
      .doc(id)
      .update({
        notifications
      });
  } catch (error) {
    return error;
  }*/
  throw new Error("updateUserNotifications Not Implemented");
};

userApi.notificationsOff = async id => {
  console.log('notifications off: ', id)
  /*try {
    return fire$$store
      .collection("users")
      .doc(id)
      .update({
        ["notifications.isOn"]: false
      });
  } catch (error) {
    console.log(error)
    return error;
  }*/
  throw new Error("notificationsOff Not Implemented");
};

userApi.addUser = async (data) => {
  /*try {
    await fire$$store
      .collection("users")
      .add({...data, createdAt: admin.fire$$store.FieldValue.serverTimestamp()});
  } catch (error) {
    throw new Error(error);
  }*/
  throw new Error("addUser Not Implemented");
};

userApi.deleteUser = async(id) => {
  /*fire$$store.collection("users").doc(id).delete().then(function() {
  }).catch(function(error) {
    console.error("Error removing document: ", error);
  });*/
  throw new Error("deleteUser Not Implemented");
};

