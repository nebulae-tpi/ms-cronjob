import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { map, toArray } from 'rxjs/operators';
import { GatewayService } from '../../../../api/gateway.service';
import {
  getCronjobDetail,
  updateCronjob,
  persistCronjob,
  removeCronjob
} from '../gql/CronjobDetail';
import { Subscription, Subject } from 'rxjs';

@Injectable()
export class CronjobDetailService {
  constructor(private http: HttpClient, private gateway: GatewayService) {}
  private _subject = new Subject<any>();
  private _subjectRefreshTable = new Subject<any>();

  executeCloseDetail() {
    this._subject.next();
  }

  get closeDetail$() {
    return this._subject.asObservable();
  }

  executeRefreshTable() {
    this._subjectRefreshTable.next();
  }

  get refreshTable$() {
    return this._subjectRefreshTable.asObservable();
  }

  getCronjobDetail$(id): Observable<any[]> {
    return this.gateway.apollo
      .query<any>({
        query: getCronjobDetail,
        variables: {
          id
        },
        fetchPolicy: "network-only"
      })
      .pipe(map(rawData => rawData.data.getCronjobDetail));
  }

  updateCronjobDetail$(cronjob): Observable<any[]> {
    const cronjobUpdateInput = {
      id: cronjob.id,
      name: cronjob.name,
      active: cronjob.active,
      eventType: cronjob.eventType,
      cronjobFormat: cronjob.cronjobFormat,
      body: cronjob.body
    };
    return this.gateway.apollo
      .mutate<any>({
        mutation: updateCronjob,
        variables: {
          input: cronjobUpdateInput
        }
      })
      .pipe(map(rawData => rawData.data.updateCronjob));
  }

  createCronjobDetail$(cronjob): Observable<any[]> {
    const cronjobUpdateInput = {
      name: cronjob.name,
      active: cronjob.active,
      eventType: cronjob.eventType,
      cronjobFormat: cronjob.cronjobFormat,
      body: cronjob.body
    };
    return this.gateway.apollo
      .mutate<any>({
        mutation: persistCronjob,
        variables: {
          input: cronjobUpdateInput
        }
      })
      .pipe(
        map(rawData => {
          {
            if (rawData.errors) {
              //TODO: aca se toma errores
            }
            return rawData.data.persistCronjob;
          }
        })
      );
  }

  removeCronjobDetail$(cronjobId): Observable<any[]> {
    return this.gateway.apollo
      .mutate<any>({
        mutation: removeCronjob,
        variables: {
          cronjobId
        }
      })
      .pipe(map(rawData => rawData.data.removeCronjob));
  }
}
