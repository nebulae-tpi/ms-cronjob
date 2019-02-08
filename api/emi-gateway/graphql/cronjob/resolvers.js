const withFilter = require("graphql-subscriptions").withFilter;
const PubSub = require("graphql-subscriptions").PubSub;
const { of } = require("rxjs");
const { mergeMap, catchError, map } = require("rxjs/operators");
const broker = require("../../broker/BrokerFactory")();

let pubsub = new PubSub();

function getReponseFromBackEnd$(response) {
  return of(response).pipe(
    map(resp => {
      if (resp.result.code != 200) {
        const err = new Error();
        err.name = "Error";
        err.message = resp.result.error;
        // this[Symbol()] = resp.result.error;
        Error.captureStackTrace(err, "Error");
        throw err;
      }
      return resp.data;
    })
  );
}

module.exports = {
  Query: {
    getCronjobDetail(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          "Cronjob",
          "emigateway.graphql.query.getCronjobDetail",
          { root, args, jwt: context.encodedToken },
          500
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    getCronjobs(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          "Cronjob",
          "emigateway.graphql.query.getCronjobs",
          { root, args, jwt: context.encodedToken },
          500
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    getCronjobTableSize(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          "Cronjob",
          "emigateway.graphql.query.getCronjobTableSize",
          { root, args, jwt: context.encodedToken },
          500
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    }
  },
  Mutation: {
    persistCronjob(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          "Cronjob",
          "emigateway.graphql.mutation.persistCronjob",
          { root, args, jwt: context.encodedToken },
          500
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    updateCronjob(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          "Cronjob",
          "emigateway.graphql.mutation.updateCronjob",
          { root, args, jwt: context.encodedToken },
          500
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    removeCronjob(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          "Cronjob",
          "emigateway.graphql.mutation.removeCronjob",
          { root, args, jwt: context.encodedToken },
          500
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    },
    executeCronjob(root, args, context) {
      return context.broker
        .forwardAndGetReply$(
          "Cronjob",
          "emigateway.graphql.mutation.executeCronjob",
          { root, args, jwt: context.encodedToken },
          500
        )
        .pipe(mergeMap(response => getReponseFromBackEnd$(response)))
        .toPromise();
    }
  },
  Subscription: {
    CronjobRegistersUpdated: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator("CronjobRegistersUpdated");
        },
        (payload, variables, context, info) => {
          return true;
        }
      )
    }
  }
};


//// SUBSCRIPTIONS SOURCES ////

const eventDescriptors = [
  {
    backendEventName: "CronjobRegistersUpdated",
    gqlSubscriptionName: "CronjobRegistersUpdated",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  }
];


// broker.getMaterializedViewsUpdates$(['CronjobRegistersUpdated']).subscribe(
//   evt => {
//     //console.log('Se escucha evento: ', evt);
//     pubsub.publish('CronjobRegistersUpdated', {
//       CronjobRegistersUpdated: evt.data
//     });
//   },
//   error => console.error('Error listening CronjobRegistersUpdated', error),
//   () => console.log('CronjobRegistersUpdated listener STOPPED')
// );

/**
 * Connects every backend event to the right GQL subscription
 */
eventDescriptors.forEach(descriptor => {
  broker.getMaterializedViewsUpdates$([descriptor.backendEventName]).subscribe(
    evt => {
      if (descriptor.onEvent) {
        descriptor.onEvent(evt, descriptor);
      }
      const payload = {};
      payload[descriptor.gqlSubscriptionName] = descriptor.dataExtractor
        ? descriptor.dataExtractor(evt)
        : evt.data;
      pubsub.publish(descriptor.gqlSubscriptionName, payload);
    },
    error => {
      if (descriptor.onError) {
        descriptor.onError(error, descriptor);
      }
      console.error(`Error listening ${descriptor.gqlSubscriptionName}`, error);
    },

    () => console.log(`${descriptor.gqlSubscriptionName} listener STOPED.`)
  );
});

