import axios from 'axios';

let databaseURL = '';
if (process.env.NODE_ENV !== "development") {
  const config = require('@/config')
  databaseURL = config.firebaseConfig[process.env.NODE_ENV!].cloudFuctions;
  
}
  
export default {
  async getUser(uid) {
    try {
      const response = await axios.get(`${databaseURL}/getUser?id=${uid}.json`);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },

  async updateVoters(data) {
    try {
      const response = await axios.put(`${databaseURL}/updateVoters`, data);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },

  async addUser(data) {
    return await axios.put(`${databaseURL}/addUser`, { ...data });
  },

  async updateSection(data) {
    return await axios.put(`${databaseURL}/updateSection`, { ...data });
  },
  async updateDocument(data) {
    return await axios.put(`${databaseURL}/updateDocument`, { ...data });
  },
  async addSection(newSection) {
    return await axios.post(`${databaseURL}/addSection`, { ...newSection });
  },
  async addArgument(newArgument) {
    return await axios.post(`${databaseURL}/addArgument`, { ...newArgument });
  },
  async updateUserDocuments(data) {
    return await axios.put(`${databaseURL}/updateUserDocuments`, { ...data });
  },
  async updateUserNotifications(data) {
    return await axios.put(`${databaseURL}/updateUserNotifications`, { ...data });
  },
  async updateConsensus(data) {
    return await axios.put(`${databaseURL}/updateConsensus`, { ...data });
  },
  async sendNotifications(data) {
    return await axios.put(`${databaseURL}/sendNotifications`, { ...data });
  },
};
