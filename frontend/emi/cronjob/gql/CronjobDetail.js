import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const getCronjobDetail = gql`
  query getCronjobDetail($id: String!) {
    getCronjobDetail(id: $id) {
      id
      name
      eventType
      cronjobFormat
      body
      active
    }
  }
`;

export const updateCronjob = gql`
  mutation updateCronjob($input: CronjobUpdateInput) {
    updateCronjob(input: $input) {
      code
      message
    }
  }
`;

export const persistCronjob = gql`
  mutation persistCronjob($input: CronjobPersistInput) {
    persistCronjob(input: $input) {
      code
      message
    }
  }
`;

export const removeCronjob = gql`
  mutation removeCronjob($cronjobId: String) {
    removeCronjob(cronjobId: $cronjobId) {
      code
      message
    }
  }
`;
