import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-remove-cronjob-dialog.component',
  templateUrl: './remove-cronjob-dialog.component.html',
  styleUrls: ['./remove-cronjob-dialog.component.scss']
})
export class RemoveCronjobDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RemoveCronjobDialogComponent>) { }

  ngOnInit() {
  }

  removeCronjob(removeCronjob: Boolean) {
    this.dialogRef.close(removeCronjob);
  }

}
