const Rx = require('rxjs');
const CronjobDA = require('../data/CronjobDA');

let instance;

class CronjobEventConsumer {

    constructor() {
    }

    handleCronjobCreated$(event) {  
        const cronjob = event.data;
        delete cronjob._id;
        return CronjobDA.persistCronjob$(cronjob);
    }

    handleCronjobUpdated$(event) {  
        const cronjob = event.data;
        delete cronjob._id;
        return CronjobDA.updateCronjob$(cronjob);
    }
    handleCronjobRemoved$(event) {  
        return CronjobDA.removeCronjob$(event.data);
    }

}

module.exports = () => {
    if (!instance) {
        instance = new CronjobEventConsumer();
        console.log('CronjobEventConsumer Singleton created');
    }
    return instance;
};