import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SubmissionsComponent } from '../component/submissions/submissions.component';
import { SubmissionByUserIdComponent } from '../component/submission-by-user-id/submission-by-user-id.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';

const submissionroutes: Routes = [
  {
    path: "",
    component: SubmissionsComponent
  },
  {
    path: ":id",
    component: SubmissionByUserIdComponent
  },
]

@NgModule({
  declarations: [SubmissionsComponent, SubmissionByUserIdComponent],
  imports: [
    CommonModule, 
    RouterModule.forChild(submissionroutes),
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
  ]
})
export class SubmissionModule { }
