'use strict';

const Rx = require('rxjs');
let mongoDB = require('./MongoDB')();
//const cronjobManager = require('../domain/CronjobManager')();
const broker = require('../tools/broker/BrokerFactory')();

const MATERIALIZED_VIEW_TOPIC = 'emi-gateway-materialized-view-updates';

class CronjobDA {
  /**
   * gets Cronjob detail by id
   * @param {String} id
   */
  static getCronjobDetail$(id) {
    const collection = mongoDB.db.collection('Cronjobs');
    return Rx.Observable.fromPromise(collection.findOne({ id: id }));
  }

  /**
   * gets Cronjob
   *
   */
  static getCronjobs$(page, count, filter, sortColumn, order) {
    let filterObject = {};
    const orderObject = {};
    if (filter && filter != '') {
      filterObject = {
        $or: [
          { name: { $regex: `${filter}.*`, $options: 'i' } },
          { eventType: { $regex: `${filter}.*`, $options: 'i' } }
        ]
      };
    }
    if (sortColumn && order) {
      let column;
      switch (sortColumn) {
        case 'name':
          column = 'name';
          break;
        case 'eventType':
          column = 'eventType';
          break;
      }
      orderObject[column] = order == 'asc' ? 1 : -1;
    }
    const collection = mongoDB.db.collection('Cronjobs');
    return Rx.Observable.fromPromise(
      collection
        .find(filterObject)
        .sort(orderObject)
        .skip(count * page)
        .limit(count)
        .toArray()
    );
  }
  /**
   * Get all cronjobs from the database using a iterator
   */
  getAllCronjobs$() {
    return Rx.Observable.create(async observer => {
      const collection = mongoDB.db.collection('Cronjobs');
      const cursor = collection.find({});
      let obj = await this.extractNextFromMongoCursor(cursor);
      while (obj) {
        observer.next(obj);
        obj = await this.extractNextFromMongoCursor(cursor);
      }

      observer.complete();
    });
  }

  /**
   * Extracts the next value from a mongo cursos if available, returns undefined otherwise
   * @param {*} cursor
   */
  async extractNextFromMongoCursor(cursor) {
    const hasNext = await cursor.hasNext();
    if (hasNext) {
      const obj = await cursor.next();
      return obj;
    }
    return undefined;
  }

  /**
   * Get the size of table Cronjob
   *
   */
  static getCronjobTableSize$() {
    const collection = mongoDB.db.collection('Cronjobs');
    return Rx.Observable.fromPromise(collection.count());
  }

  /**
   * Create the Cronjob info on the materialized view
   * @param {*} croniob
   */
  static persistCronjob$(cronjob) {
    const collection = mongoDB.db.collection('Cronjobs');
    return Rx.Observable.of(cronjob).mergeMap(result => {
      return Rx.Observable.fromPromise(collection.insertOne(cronjob)).mergeMap(
        result =>
          broker.send$(MATERIALIZED_VIEW_TOPIC, `CronjobRegistersUpdated`, true)
      );
    });
  }

  static updateCronjob$(cronjob) {
    const cronjobCopy = {
      id: cronjob.id,
      name: cronjob.name,
      eventType: cronjob.eventType,
      cronjobFormat: cronjob.cronjobFormat,
      body: cronjob.body,
      active: cronjob.active
    };
    //delete cronjob.version;
    const collection = mongoDB.db.collection('Cronjobs');
    return Rx.Observable.of(cronjobCopy)
    .mergeMap(result => {
        return collection.updateOne({ id: cronjobCopy.id }, { $set: cronjobCopy, $inc: { version: 1 }})
    })
    .mergeMap(result => {
      return broker.send$(MATERIALIZED_VIEW_TOPIC, `CronjobRegistersUpdated`, true);
    })
  }

  static removeCronjob$(cronjobId) {
    const collection = mongoDB.db.collection('Cronjobs');
    return Rx.Observable.fromPromise(
      collection.deleteOne({ id: cronjobId })
    ).mergeMap(
      result =>
        broker.send$(MATERIALIZED_VIEW_TOPIC, `CronjobRegistersUpdated`, true)
    );
  }
}

module.exports = CronjobDA;
