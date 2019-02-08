'use strict';

const Rx = require('rxjs');
const MongoClient = require('mongodb').MongoClient;

let instance = null;

class MongoDB {
  /**
   * initialize and configure Mongo DB
   * @param { { url, dbName } } ops
   */
  constructor({ url, dbName }) {
    this.url = url;
    this.dbName = dbName;
  }

  /**
   * Starts DB connections
   * Returns an Obserable that resolve to the DB client
   */
  start$() {
    return Rx.Observable.bindNodeCallback(MongoClient.connect)(this.url).map(
      client => {
        this.client = client;
        this.db = this.client.db(this.dbName);
        return `MongoDB connected to dbName= ${this.dbName}`;
      }
    );
  }

  /**
   * Stops DB connections
   * Returns an Obserable that resolve to a string log
   */
  stop$() {
    return Rx.Observable.create((observer) => {
      this.client.close();
      observer.next('Mongo DB Client closed');
      observer.complete();
    });
  }


  /**
    * Ensure Index creation
    * Returns an Obserable that resolve to a string log
    */
  createIndexes$() {
    return Rx.Observable.create(async (observer) => {

      observer.next('Creating index for Cronjob.Cronjobs => ({ name: 1 })  ');
      await this.db.collection('Cronjobs').createIndex({ "name": 1 });

      observer.next('Creating index for Cronjob.Cronjobs => ({ id: 1 })  ');
      await this.db.collection('Cronjobs').createIndex({ "id": 1 });
      
      observer.next('All indexes created');
      observer.complete();
    });
  }
}

module.exports = () => {
  if (!instance) {
    instance = new MongoDB({
      url: process.env.MONGODB_URL,
      dbName: process.env.MONGODB_DB_NAME
    });
    console.log(`MongoDB instance created: ${process.env.MONGODB_DB_NAME}`);
  }
  return instance;
};
