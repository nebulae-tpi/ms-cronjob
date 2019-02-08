'use strict'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const graphQlService = require('./services/emi-gateway/GraphQlService')();
const mongoDB = require('./data/MongoDB')();
const cronjobManager = require('./domain/CronjobManager')();
const eventSourcing = require('./tools/EventSourcing')();
const eventStoreService = require('./services/event-store/EventStoreService')();
const Rx = require('rxjs');

const start = () => { 
    Rx.Observable.concat(
        eventSourcing.eventStore.start$(),
        eventStoreService.start$(),
        mongoDB.start$(),
        graphQlService.start$(),        
        cronjobManager.start$(),
    ).subscribe(
        (evt) => console.log(evt),
        (error) => {
            console.error('Failed to start',error);
            process.exit(1);
        },
        () => console.log('cronjob started')
    );
}
start();



