import * as functions from "firebase-functions";

import {log} from '../init'

export const handleError = (error, res) => {
  log.error({ error }, "oops! error");
  res.status(500).send(error);
};

export const handleMethod = (method, res) => {
  if (method !== `POST`) {
    res.status(500).json({
      message: "Not allowed!"
    });
    return false;
  } else return true;
}

export const handleSuccess = (res) => {
  res.status(200).json({
    message: "It worked!"
  });
}