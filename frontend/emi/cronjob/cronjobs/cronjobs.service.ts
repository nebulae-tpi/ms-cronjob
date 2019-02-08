import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { GatewayService } from '../../../../api/gateway.service';
import { getCronjobs, getCronjobTableSize, executeCronjob} from '../gql/Cronjobs';
import gql from 'graphql-tag';

@Injectable()
export class CronjobsService {
  constructor(
    private gateway: GatewayService
  ) { }

  getCronjobs$(pageValue, countValue, filterText, sortColumn, sortOrder): Observable<any[]> {
    return this.gateway.apollo
      .query<any>({
        query: getCronjobs,
        variables: {
          page: pageValue,
          count: countValue,
          filterText: filterText,
          sortColumn: sortColumn,
          sortOrder: sortOrder
        },
        fetchPolicy: "network-only"
      })
      .pipe(map(rawData => rawData.data.getCronjobs));
  }


  getCronjobTableSize$(): Observable<number> {
    return this.gateway.apollo
    .query<any>({
      query: getCronjobTableSize
    })
    .pipe(map(rawData => rawData.data.getCronjobTableSize));
  }

  subscribeToDeviceVolumesStateReportedEvent$(): Observable<any> {
    return this.gateway.apollo.subscribe({
      query: gql`
        subscription {
          CronjobRegistersUpdated
        }
      `
    });
  }

  executeCronjob$(cronjobId): Observable<number> {
    return this.gateway.apollo
    .mutate<any>({
      mutation: executeCronjob,
      variables: {
        cronjobId
      }
    })
    .pipe(map(rawData => rawData.data.executeCronjob));
  }

}


