import { NgModule } from '@angular/core';
import { SharedModule } from '../../../core/modules/shared.module';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CronjobsComponent } from './cronjobs/cronjobs.component';
import { CronjobDetailComponent } from './cronjob-detail/cronjob-detail.component';
import { CronjobsService } from './cronjobs/cronjobs.service';
import { CronjobDetailService } from './cronjob-detail/cronjob-detail.service';
import { FuseWidgetModule } from '../../../core/components/widget/widget.module';
import { UpdateCronjobDialogComponent } from './cronjob-detail/update-cronjob-dialog/update-cronjob-dialog.component';
import { CreateCronjobDialogComponent } from './cronjob-detail/create-cronjob-dialog/create-cronjob-dialog.component';
import { RemoveCronjobDialogComponent } from './cronjob-detail/remove-cronjob-dialog/remove-cronjob-dialog.component';
import { ExecuteCronjobDialogComponent } from './cronjobs/execute-cronjob-dialog/execute-cronjob-dialog.component';

const routes = [
  {
    path: '',
    component: CronjobsComponent
  }
];

@NgModule({
  declarations: [
    CronjobsComponent,
    CronjobDetailComponent,
    UpdateCronjobDialogComponent,
    CreateCronjobDialogComponent,
    RemoveCronjobDialogComponent,
    ExecuteCronjobDialogComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes), FuseWidgetModule],
  entryComponents: [
    UpdateCronjobDialogComponent,
    CreateCronjobDialogComponent,
    RemoveCronjobDialogComponent,
    ExecuteCronjobDialogComponent
  ],
  providers: [CronjobsService, CronjobDetailService, DatePipe]
})
export class CronjobModule { }