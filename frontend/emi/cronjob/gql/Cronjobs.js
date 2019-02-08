import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const getCronjobs = gql`
  query getCronjobs($page: Int!, $count: Int!, $filterText: String, $sortColumn: String, $sortOrder: String){
  getCronjobs(page: $page, count: $count, filter: $filterText, sortColumn: $sortColumn, sortOrder: $sortOrder){
    id
    name
    cronjobFormat
    eventType
    active
    version
  }
}
`;

export const getCronjobTableSize = gql`
  query {
    getCronjobTableSize
  }
`;

export const executeCronjob = gql`
  mutation executeCronjob($cronjobId: String) {
    executeCronjob(cronjobId: $cronjobId) {
      code
      message
    }
  }
`;
