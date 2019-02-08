import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-execute-cronjob-dialog.component',
  templateUrl: './execute-cronjob-dialog.component.html',
  styleUrls: ['./execute-cronjob-dialog.component.scss']
})
export class ExecuteCronjobDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ExecuteCronjobDialogComponent>) { }

  ngOnInit() {
  }

  executeCronjob(executeCronjob: Boolean) {
    this.dialogRef.close(executeCronjob);
  }

}
