import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PayoutsComponent } from '../component/payouts/payouts.component';
import { PayoutsByUserIdComponent } from '../component/payouts-by-user-id/payouts-by-user-id.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';

const payoutRoutes: Routes = [
  {
    path: "",
    component: PayoutsComponent
  },
  {
    path: ":id",
    component: PayoutsByUserIdComponent
  },
]

@NgModule({
  declarations: [PayoutsComponent,PayoutsByUserIdComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(payoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule
  ]
})
export class PayoutModule { }
