import {bunyan} from "bunyan";
import {LoggingBunyan} from '@google-cloud/logging-bunyan';


const loggingBunyan = new LoggingBunyan();

export default bunyan.createLogger({
  name: 'functions-service',  
  streams: [
    {stream: process.stdout, level: 'info'},
    loggingBunyan.stream('info'),
  ],
});