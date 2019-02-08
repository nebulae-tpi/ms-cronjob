const withFilter = require('graphql-subscriptions').withFilter;
const PubSub = require('graphql-subscriptions').PubSub;
const Rx = require('rxjs');
const broker = require('../../broker/BrokerFactory')();

let pubsub = new PubSub();

function getReponseFromBackEnd$(response) {
  return Rx.Observable.of(response).map(resp => {
    if (resp.result.code != 200) {
      const err = new Error();
      err.name = 'Error';
      err.message = resp.result.error;
      // this[Symbol()] = resp.result.error;
      Error.captureStackTrace(err, 'Error');
      throw err;
    }
    return resp.data;
  });
}

module.exports = {
  Query: {
    getCronjobDetail(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          'Cronjob',
          'emigateway.graphql.query.getCronjobDetail',
          { root, args, jwt: context.encodedToken },
          500
        )
        .mergeMap(response => getReponseFromBackEnd$(response))
        .toPromise();
    },
    getCronjobs(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          'Cronjob',
          'emigateway.graphql.query.getCronjobs',
          { root, args, jwt: context.encodedToken },
          500
        )
        .mergeMap(response => getReponseFromBackEnd$(response))
        .toPromise();
    },
    getCronjobTableSize(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          'Cronjob',
          'emigateway.graphql.query.getCronjobTableSize',
          { root, args, jwt: context.encodedToken },
          500
        )
        .mergeMap(response => getReponseFromBackEnd$(response))
        .toPromise();
    }
  },
  Mutation: {
    persistCronjob(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          'Cronjob',
          'emigateway.graphql.mutation.persistCronjob',
          { root, args, jwt: context.encodedToken },
          500
        )
        .mergeMap(response => getReponseFromBackEnd$(response))
        .toPromise();
    },
    updateCronjob(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          'Cronjob',
          'emigateway.graphql.mutation.updateCronjob',
          { root, args, jwt: context.encodedToken },
          500
        )
        .mergeMap(response => getReponseFromBackEnd$(response))
        .toPromise();
    },
    removeCronjob(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          'Cronjob',
          'emigateway.graphql.mutation.removeCronjob',
          { root, args, jwt: context.encodedToken },
          500
        )
        .mergeMap(response => getReponseFromBackEnd$(response))
        .toPromise();
    },
    executeCronjob(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          'Cronjob',
          'emigateway.graphql.mutation.executeCronjob',
          { root, args, jwt: context.encodedToken },
          500
        )
        .mergeMap(response => getReponseFromBackEnd$(response))
        .toPromise();
    }
  },
  Subscription: {
    CronjobRegistersUpdated: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator('CronjobRegistersUpdated');
        },
        (payload, variables, context, info) => {
          return true;
        }
      )
    }
  }
};

broker.getMaterializedViewsUpdates$(['CronjobRegistersUpdated']).subscribe(
  evt => {
    //console.log('Se escucha evento: ', evt);
    pubsub.publish('CronjobRegistersUpdated', {
      CronjobRegistersUpdated: evt.data
    });
  },
  error => console.error('Error listening CronjobRegistersUpdated', error),
  () => console.log('CronjobRegistersUpdated listener STOPPED')
);
