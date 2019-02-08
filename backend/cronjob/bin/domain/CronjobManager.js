'use strict';

const Rx = require('rxjs');
const CronjobDA = require('../data/CronjobDA');
const Event = require('@nebulae/event-store').Event;
const eventSourcing = require('../tools/EventSourcing')();
const schedule = require('node-schedule');
const uuidv4 = require('uuid/v4');
const parser = require('cron-parser');
const { CustomError } = require('../tools/customError');

let instance = null;

class CronjobManager {
  constructor() {
    this.cronjobDA = new CronjobDA();
    this.jobVsScheduleJobList = [];
  }

  start$() {
    return this.getAndStartAllCronjobs$();
  }

  getAndStartAllCronjobs$() {
    return this.cronjobDA
      .getAllCronjobs$()
      .mergeMap(cronjob => {
        return this.buildJobVsScheduleJobElement$(cronjob);
      })
      .toArray()
      .map(jobVsScheduleJobList => {
        this.jobVsScheduleJobList = jobVsScheduleJobList;
        return 'jobs start has been completed!!';
      });
  }

  buildJobVsScheduleJobElement$(cronjob) {
    return Rx.Observable.of(cronjob)
      .map(jobValue => {
        if (jobValue.active) {
          return schedule.scheduleJob(jobValue.cronjobFormat, function() {
            const body = jobValue.body ? JSON.parse(jobValue.body) : undefined;
            eventSourcing.eventStore
              .emitEvent$(
                new Event({
                  eventType: jobValue.eventType,
                  eventTypeVersion: 1,
                  aggregateType: 'Cronjob',
                  aggregateId: cronjob.id,
                  data: body,
                  //TODO: aca se debe colocar el usuario que periste el evento, si es el sistema el que ejecuta el cronjob 
                  // se debe colocar como SYSTEM.Cronjob.cronjob
                  user: 'SYSTEM.Cronjob.cronjob'
                })
              )
              .subscribe(result => {});
          });
        }
      })
      .map(scheduleJob => {
        return {
          scheduleJob: scheduleJob,
          cronjob: cronjob
        };
      });
  }

  executeCronjob$(cronjobId) {
    const jobVsScheduleJob = this.jobVsScheduleJobList.filter(
      job => job.cronjob.id == cronjobId
    )[0];
    return Rx.Observable.of(jobVsScheduleJob)
      .map(job => (job.cronjob.body ? JSON.parse(job.cronjob.body) : undefined))
      .mergeMap(body => {
        return eventSourcing.eventStore.emitEvent$(
          new Event({
            eventType: jobVsScheduleJob.cronjob.eventType,
            eventTypeVersion: 1,
            aggregateType: 'Cronjob',
            aggregateId: jobVsScheduleJob.cronjob.id,
            data: body,
            //TODO: aca se debe colocar el usuario que periste el evento, si el sistema de debe colocar como
            // SYSTEM.Cronjob.cronjob
            user: 'SYSTEM.Cronjob.cronjob'
          })
        );
      })
      .map(result => {
        return {
          code: 200,
          message: `Cronjob with id: ${cronjobId} has been executed`
        };
      });
  }

  removeCronjob$(cronjobId) {
    return Rx.Observable.of(cronjobId)
      .map(jobId => {
        return this.jobVsScheduleJobList.filter(
          job => job.cronjob.id == cronjobId
        )[0];
      })
      .do(job => {
        if (job && job.scheduleJob) {
          job.scheduleJob.cancel();
        }
      })
      .do(job => {
        if (job) {
          this.jobVsScheduleJobList = this.jobVsScheduleJobList.filter(e => e != job)
        }
      })
      .mergeMap(job => {
        return eventSourcing.eventStore.emitEvent$(
          new Event({
            eventType: 'CronjobRemoved',
            eventTypeVersion: 1,
            aggregateType: 'Cronjob',
            aggregateId: job.cronjob.id,
            data: job.cronjob.id,
            //TODO: aca se debe colocar el usuario que elimina el cronjob
            user: 'SYSTEM.Cronjob.cronjob'
          })
        );
      })
      .map(result => {
        return {
          code: 200,
          message: `Cronjob with id: ${cronjobId} has been removed`
        };
      });
  }

  updateCronjob$(cronjob) {
    if (cronjob.body && !this.validateCronjobBody(cronjob.body)) {
      return Rx.Observable.throw(
          new CustomError("CronjobManager", "updateCronjob$()", "14010",  {body: "Invalid body format"})
        );
    }
    if (
      cronjob.cronjobFormat &&
      (!cronjob.cronjobFormat.trim() ||
        !this.validateCronjobFormat(cronjob.cronjobFormat))
    ) {
      return Rx.Observable.throw(
        new CustomError("CronjobManager", "updateCronjob$()", "14011",  {body: "Invalid cronjob format"})
      );
    } else {
      const oldJobVsScheduleJob = this.jobVsScheduleJobList.filter(
        job => job.cronjob.id == cronjob.id
      )[0];
      return Rx.Observable.of(cronjob)
        .map(job => {
          return oldJobVsScheduleJob
            ? Object.assign(oldJobVsScheduleJob.cronjob, job)
            : job;
        })
        .mergeMap(job => {
          return Rx.Observable.defer(() => {
            if (oldJobVsScheduleJob.scheduleJob) {
              oldJobVsScheduleJob.scheduleJob.cancel();
            }
            var index = this.jobVsScheduleJobList.indexOf(oldJobVsScheduleJob);
            if (index > -1) {
              this.jobVsScheduleJobList.splice(index,1);
            }
            return this.buildJobVsScheduleJobElement$(job);
          });
        })
        .mergeMap(newJobVsScheduleJob => {
          this.jobVsScheduleJobList.push(newJobVsScheduleJob);
          return eventSourcing.eventStore.emitEvent$(
            new Event({
              eventType: 'CronjobUpdated',
              eventTypeVersion: 1,
              aggregateType: 'Cronjob',
              aggregateId: newJobVsScheduleJob.cronjob.id,
              data: newJobVsScheduleJob.cronjob,
              //TODO: aca se debe colocar el usuario que periste el cronjob
              user: 'SYSTEM.Cronjob.cronjob'
            })
          );
        })
        .map(result => {
          return {
            code: 200,
            message: `Cronjob with id: ${cronjob.id} has been updated`
          };
        });
    }
  }

  createCronjob$(cronjob) {
    if (cronjob.body && !this.validateCronjobBody(cronjob.body)) {
      return Rx.Observable.throw(
        new CustomError("CronjobManager", "updateCronjob$()", "14010",  {body: "Invalid body format"})
      );
    }
    if (
      !cronjob.cronjobFormat.trim() ||
      !this.validateCronjobFormat(cronjob.cronjobFormat)
    ) {
      return Rx.Observable.throw(
        new CustomError("CronjobManager", "updateCronjob$()", "14011",  {body: "Invalid cronjob format"})
      );
    }
    {
      cronjob.id = uuidv4();
      cronjob.version = 1;
      return Rx.Observable.of(cronjob)
        .mergeMap(job => this.buildJobVsScheduleJobElement$(job))
        .do(jobVsScheduleJobElement =>
          this.jobVsScheduleJobList.push(jobVsScheduleJobElement)
        )
        .mergeMap(jobVsScheduleJobElement => {
          return eventSourcing.eventStore.emitEvent$(
            new Event({
              eventType: 'CronjobCreated',
              eventTypeVersion: 1,
              aggregateType: 'Cronjob',
              aggregateId: jobVsScheduleJobElement.cronjob.id,
              data: jobVsScheduleJobElement.cronjob,
              //TODO: aca se debe colocar el usuario que periste el cronjob
              user: 'SYSTEM.Cronjob.cronjob'
            })
          );
        })
        .map(result => {
          return {
            code: 200,
            message: `Cronjob with id: ${cronjob.id} has been created`
          };
        });
    }
  }

  validateCronjobBody(body) {
    try {
      JSON.parse(body);
    } catch (e) {
      return false;
    }
    return true;
  }

  validateCronjobFormat(cronjob) {
    try {
      var validation = parser.parseString(cronjob);
      if (!Object.keys(validation.errors).length) {
        return true;
      }
      throw 'Invalid CronjobFormat';
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}

module.exports = () => {
  if (!instance) {
    instance = new CronjobManager();
    console.log(`CronjobManager instance created`);
  }
  return instance;
};

