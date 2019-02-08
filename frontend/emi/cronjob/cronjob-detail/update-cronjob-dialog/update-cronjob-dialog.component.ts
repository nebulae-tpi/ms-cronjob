import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-update-cronjob-dialog.component',
  templateUrl: './update-cronjob-dialog.component.html',
  styleUrls: ['./update-cronjob-dialog.component.scss']
})
export class UpdateCronjobDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<UpdateCronjobDialogComponent>) { }

  ngOnInit() {
  }

  updateCronjob(updateCronjob: Boolean) {
    this.dialogRef.close(updateCronjob);
  }

}
