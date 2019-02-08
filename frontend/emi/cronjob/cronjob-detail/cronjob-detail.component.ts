import { Component, OnInit, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { CronjobDetailService } from './cronjob-detail.service';
import { first, filter } from 'rxjs/operators';
import { CustomValidators } from './custom-validators';
import { MatDialog, MatSnackBar } from '@angular/material';
import { UpdateCronjobDialogComponent } from './update-cronjob-dialog/update-cronjob-dialog.component';
import { CreateCronjobDialogComponent } from './create-cronjob-dialog/create-cronjob-dialog.component';
import { RemoveCronjobDialogComponent } from './remove-cronjob-dialog/remove-cronjob-dialog.component';


@Component({
  selector: 'app-cronjob-detail',
  templateUrl: './cronjob-detail.component.html',
  styleUrls: ['./cronjob-detail.component.scss']
})
export class CronjobDetailComponent implements OnInit {
  cronjobForm: FormGroup;
  selectedCronjob: any;
  _cronjobId: String;
  _cronjobDetailAction: String;
  addNewCronjob: Boolean;

  get cronjobId(): any {
    return this._cronjobId;
  }

  @Input()
  set cronjobId(cronjobIdValue: any) {
    this._cronjobId = cronjobIdValue;
    if (cronjobIdValue) {
      this.cronjobDetailService
        .getCronjobDetail$(cronjobIdValue)
        .pipe(first())
        .subscribe(model => {
          this.selectedCronjob = JSON.parse(JSON.stringify(model));
        });
    }
  }

  get cronjobDetailAction(): any {
    return this._cronjobDetailAction;
  }

  @Input()
  set cronjobDetailAction(cronjobDetailAction: any) {
    this._cronjobDetailAction = cronjobDetailAction;
    this.addNewCronjob = cronjobDetailAction == 'ADD';
    this.selectedCronjob = {};
  }

  constructor(
    private formBuilder: FormBuilder,
    private cronjobDetailService: CronjobDetailService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cronjobForm = this.createCronjobForm();
  }

  createCronjobForm() {
    return this.formBuilder.group({
      name: new FormControl(),
      eventType: new FormControl(),
      cronjobFormat: new FormControl('', [Validators.pattern(/((\*\/\d{1,2}|\*|\d{1,2})\ ){1,5}(\*\/\d{1,2}|\*|\d{1,2})/)]),
      active: new FormControl(),
      body: new FormControl('', [CustomValidators.bodyFormatValidate])
    });
  }

  updateCronjob() {
    this.dialog
      .open(UpdateCronjobDialogComponent)
      .afterClosed()
      .pipe(filter(updateCronjob => updateCronjob))
      .subscribe(updateCronjob => {
        if (updateCronjob) {
          this.cronjobDetailService
            .updateCronjobDetail$(this.selectedCronjob)
            .pipe(first())
            .subscribe(model => {
              this.snackBar.open('Tarea programada ha sido editada', 'Cerrar', {
                duration: 2000
              });
            });
        }
      });
  }

  createCronjob() {
    this.dialog
      .open(CreateCronjobDialogComponent)
      .afterClosed()
      .pipe(filter(createCronjob => createCronjob))
      .subscribe(createCronjob => {
        if (createCronjob) {
          this.cronjobDetailService
            .createCronjobDetail$(this.selectedCronjob)
            .pipe(first())
            .subscribe(model => {
              this.snackBar.open('Tarea programada ha sido creada', 'Cerrar', {
                duration: 2000
              });
              this.cronjobDetailService.executeCloseDetail();
            });
        }
      });
  }

  removeCronjob() {
    this.dialog
      .open(RemoveCronjobDialogComponent)
      .afterClosed()
      .pipe(filter(removeCronjob => removeCronjob))
      .subscribe(removeCronjob => {
        if (removeCronjob) {
          this.cronjobDetailService
            .removeCronjobDetail$(this.selectedCronjob.id)
            .pipe(first())
            .subscribe(model => {
              this.snackBar.open('Tarea programada ha sido eliminada', 'Cerrar', {
                duration: 2000
              });
              this.cronjobDetailService.executeCloseDetail();
            });
        }
      });
  }

  closeDetail() {
    this.cronjobDetailService.executeCloseDetail();
  }
}
