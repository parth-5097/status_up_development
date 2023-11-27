import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { WindowService } from 'src/app/service/window.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  verifyForm: FormGroup;
  submitted = false;
  vsub = false;
  isSaving:any = false;
  windowRef: any;
  confirmationResult: any;
  div: any = 'false';
  user: any;
  settings: any =  {
    timer: 120,
  }

  constructor(
    private formBuilder: FormBuilder,
    private win: WindowService, 
    private fireAuth: AngularFireAuth, 
    private toastr: ToastrService,
    private db: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['',[Validators.required,Validators.email]],
      password: ['',Validators.required],
      phoneNumber: ['',Validators.required]
    });

    this.verifyForm = this.formBuilder.group({
      code: ['',Validators.required],
    });

    this.windowRef = this.win.windowRef;
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container',{
      'size': 'invisible'
    });

    this.windowRef.recaptchaVerifier.render().then( (widgetId: any) => {
      this.windowRef.recaptchaWidgetId = widgetId;
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  get f1(){
    return this.verifyForm.controls;
  }

  onInputChange(){
    this.sendLoginCode(`+${this.loginForm.value.phoneNumber}`);
  }

  onSubmit(){
    this.submitted = true;

    if(this.loginForm.invalid){
      return;
    } else {
      this.isSaving = true;
      this.fireAuth.signInWithEmailAndPassword(this.loginForm.value.email,this.loginForm.value.password).then(res => {
        this.db.collection("users").doc(res.user.uid).ref.get().then((doc: any)=>{
          if(doc.data().isAdmin == true){
            this.sendLoginCode(`+${this.loginForm.value.phoneNumber}`);
          } else {
            this.toastr.error("Account does not exist or not have admin privilege");
          }
        }).catch(err => {
          this.isSaving = false;
          this.toastr.error(err.message);
        });
      }).catch(err => {
        this.isSaving = false;
        this.toastr.error(err.message);
      });
    }
  }

  sendLoginCode(val : any) {
    const appVerifier = this.windowRef.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(val,appVerifier).then((result:any) => {
      this.toastr.success("Verification code has been sent to your mobile number");
      this.confirmationResult = result;
      this.div = 'true';
    }).catch((error: any) => {
      this.isSaving = false;
      this.toastr.error(error);
    });
  }

  verifyLoginCode() {
    this.vsub = true;

    if(this.verifyForm.invalid){
      return;
    } else {
      this.confirmationResult.confirm(this.verifyForm.value.code).then( (result: any) => {
        this.user = result.user;
        localStorage.setItem("User", JSON.stringify(this.user));
        window.location.href = 'users';
      }).catch((err:any) => this.toastr.error("Incorrect code entered?"));
    }
  }
}
