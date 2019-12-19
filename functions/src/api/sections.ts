/*import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { firestore } from "../init";*/

/*const Ajv = require("ajv");
const ajv = new Ajv({ $data: true });*/

  export const sectionsApi = <any>{};

  sectionsApi.getSectionById = async (sectionId: string) => {
    console.log("in getSectionById", sectionId);
    /*try {
      const documentSnapshot = await firestore
        .collection("sections")
        .doc(sectionId)
        .get();
      if (documentSnapshot.exists) {
        const obj: { [k: string]: any } = {};
        obj.id = sectionId;
        Object.assign(obj, documentSnapshot.data());
        return [obj];
      } else {
        throw new Error("Nothing");
      }
    } catch (error) {
      throw new Error(error);
    }*/
    throw new Error("getSectionById Not Implemented");
  };

  // sectionsApi.getSectionWithParams = async params => {
  //   console.log(params);
  //   let query = store.collection("sections");
  //   Object.keys(params).forEach(key => {
  //     query = query.where(key, "==", params[key]);
  //   });
  //   const querySnapshot = await query.get();
  //   if (!querySnapshot.empty) {
  //     const objs = [];
  //     querySnapshot.forEach(doc => {
  //       const obj: { [k: string]: any } = {};
  //       Object.assign(obj, doc.data());
  //       obj.id = doc.id;
  //       objs.push(obj);
  //     });
  //     return objs;
  //   } else return [];
  // };

  sectionsApi.getSectionByStatus = async (documentId, status) => {
    /*const querySnapshot = await firestore.collection("sections")
    .where('documentId', "==", documentId)
    .where('status', "==", status)
    .get();
    if (!querySnapshot.empty) {
      const objs = [];
      querySnapshot.forEach(doc => {
        const obj: { [k: string]: any } = {};
        Object.assign(obj, doc.data());
        obj.id = doc.id;
        objs.push(obj);
      });
      return objs;
    } else return [];*/
    return [];
  };

  sectionsApi.getSectionByDocumentId = async params => {
    console.log(params);
    /*const query = firestore
      .collection("sections")
      .where("documentId", "==", params)
      .orderBy("createdAt", "asc");
    const querySnapshot = await query.get();
    if (!querySnapshot.empty) {
      const objs = [];
      querySnapshot.forEach(doc => {
        const obj: { [k: string]: any } = {};
        Object.assign(obj, doc.data());
        obj.id = doc.id;
        objs.push(obj);
      });
      return objs;
    } else return [];*/
    return [];
  };

  sectionsApi.updateSection = async (sectionId, updateObject) => {
    /*try {
      return await firestore
        .collection("sections")
        .doc(sectionId)
        .update(updateObject)
        // .then(() => "success!");
    } catch (error) {
      throw new Error(error);
    }*/
    throw new Error("updateSection Not Implemented");
  };

  sectionsApi.addSection = async data => {
    try {
      console.log("data: ", data);
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + data.timer);
      data.deadline = deadline;
      /*const docRef = await firestore.collection("sections").add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(docRef.id);
      return docRef.id;*/
      throw new Error("addSection Not Implemented");
    } catch (error) {
      throw new Error(error);
    }
  };

  sectionsApi.checkStatus = async () => {
    try {
      /*const sectionsSnapshot = await firestore
        .collection("sections")
        .orderBy("status")
        .startAt(2)
        .endAt(3)
        .get();
      if (!sectionsSnapshot.empty) {
        return sectionsSnapshot.forEach(async doc => {
          const section = doc.data();
          const startTime = Date.now();
          if ("deadline" in section) {
            const end = section.deadline._seconds * 1000;
            console.log("end - startTime", startTime, end, end - startTime);
            if (end - startTime < 0) {
              const updateObj = { status: 4 };
              console.log("updateObj: ", updateObj);
              await sectionsApi.updateSection(doc.id, updateObj);
              // return "All Good!";
            }
          }
          return "All Good!";
        });
      } else return "No Sections with status 2/3";*/
      return "No Sections with status 2/3";
    } catch (error) {
      throw new Error(error);
    }
  };

  sectionsApi.sectionChanged = data => {
    /*return functions.firestore
      .document("sections/{sectionId}")
      .onWrite((change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();
        console.log("newValue:", newValue);
        console.log("previousValue:", previousValue);
        if (newValue.documentId === data) return newValue;
        else return false;
      });*/
    throw new Error("sectionChanged Not Implemented");
  };
