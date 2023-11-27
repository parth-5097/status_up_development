import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "users",
    pathMatch:"full"
  },
  {
    path:"login",
    component:LoginComponent
  },
  {
    path: "users",
    loadChildren: () => import("./lazy/users.module").then(m => m.UsersModule).catch(err => console.error(err))
  },
  {
    path: "submissions",
    loadChildren: () => import("./lazy/submission.module").then(m => m.SubmissionModule).catch(err=>console.error(err))
  },
  {
    path: "payouts",
    loadChildren: () => import("./lazy/payout.module").then(m => m.PayoutModule).catch(err => console.error(err))
  },
  {
    path: "image",
    loadChildren: () => import("./lazy/image.module").then(m => m.ImageModule).catch(err => console.error(err))
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
