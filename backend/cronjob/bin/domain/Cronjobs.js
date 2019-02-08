'use strict';

const Rx = require('rxjs');
const CronjobDA = require('../data/CronjobDA');
const cronjobManager = require('../domain/CronjobManager')();
const { CustomError, DefaultError } = require('../tools/customError');

let instance;

class Cronjobs {
  constructor() {}
  getCronjobDetail({ root, args, jwt }, authToken) {
    return CronjobDA.getCronjobDetail$(args.id)
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  getCronjobs({ root, args, jwt }, authToken) {
    return CronjobDA.getCronjobs$(
      args.page,
      args.count,
      args.filter,
      args.sortColumn,
      args.sortOrder
    )
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  getCronjobTableSize({ root, args, jwt }, authToken) {
    return CronjobDA.getCronjobTableSize$()
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }
  persistCronjob({ root, args, jwt }, authToken) {
    return cronjobManager
      .createCronjob$(args.input)
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }
  updateCronjob({ root, args, jwt }, authToken) {
    return cronjobManager
      .updateCronjob$(args.input)
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }
  removeCronjob({ root, args, jwt }, authToken) {
    return cronjobManager
      .removeCronjob$(args.cronjobId)
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }
  executeCronjob({ root, args, jwt }, authToken) {
    return cronjobManager
      .executeCronjob$(args.cronjobId)
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  buildSuccessResponse$(rawRespponse) {
    return Rx.Observable.of(rawRespponse).map(resp => {
      return {
        data: resp,
        result: {
          code: 200
        }
      };
    });
  }

  errorHandler$(err) {
    return Rx.Observable.of(err).map(err => {
      const exception = { data: null, result: {} };
      if (err instanceof CustomError) {
        exception.result = {
          code: err.code,
          error: err.getContent()
        };
      } else {
        exception.result = {
          code: new DefaultError(err.message).code,
          error: {
            name: 'Error',
            msg: err.toString()
          }
        };
      }
      return exception;
    });
  }
}

module.exports = () => {
  if (!instance) {
    instance = new Cronjobs();
    console.log("Cronjobs Singleton created");
  }
  return instance;
};

