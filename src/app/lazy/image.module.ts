import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ImageComponent } from '../component/image/image.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';

const imageRoutes: Routes = [
  {
    path: "",
    component: ImageComponent
  }
]

@NgModule({
  declarations: [ImageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(imageRoutes),
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule
  ]
})
export class ImageModule { }
