import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-create-cronjob-dialog.component',
  templateUrl: './create-cronjob-dialog.component.html',
  styleUrls: ['./create-cronjob-dialog.component.scss']
})
export class CreateCronjobDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CreateCronjobDialogComponent>) { }

  ngOnInit() {
  }

  createCronjob(createCronjob: Boolean) {
    this.dialogRef.close(createCronjob);
  }

}
