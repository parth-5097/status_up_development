import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css'],
})
export class ImageComponent implements OnInit {
  todayDate: any;
  imageFile : any[] = [];
  imageData: any[] = [];
  dataId: any[]= [];
  imageAct: any;
  image: any;

  constructor(private db: AngularFirestore) { }

  ngOnInit(): void {
    let date = new Date();
    this.todayDate= date.toISOString().split('T')[0];
    this.db.collection("newSubmissions").ref.where("date","==",this.todayDate).get().then(res=>{
      res.forEach((doc: any)=>{
        this.imageFile.push(doc.data().imageFile);
        this.db.collection("users").ref.where("userId","==",doc.data().userID).limit(1).get().then(res=>{
          res.forEach((user: any) => {
            this.imageData.push({ id:user.id, name: user.data().firstName + " " +user.data().lastName, date: doc.data().date})
          })
        })
      })
    })
  }

  onChange(val:any){
    this.imageFile = []
    this.imageData = []
    this.db.collection("newSubmissions").ref.where("date","==",val).get().then(res=>{
      res.forEach((doc: any)=>{
        this.imageFile.push(doc.data().imageFile);
        this.db.collection("users").ref.where("userId","==",doc.data().userID).limit(1).get().then(res=>{
          res.forEach((user: any) => {
            this.imageData.push({ id:user.id, name: user.data().firstName + " " +user.data().lastName, date: doc.data().date})
          })
        })
      })
    })
  }

  onUserImage(id: any){
    this.imageFile = []
    this.imageData = []
    this.db.collection("newSubmissions").ref.where("userID","==",id).get().then(res=>{
      res.forEach((doc: any)=>{
        this.imageFile.push(doc.data().imageFile);
        this.db.collection("users").ref.where("userId","==",doc.data().userID).limit(1).get().then(res=>{
          res.forEach((user: any) => {
            this.imageData.push({ id:user.id, name: user.data().firstName + " " +user.data().lastName, date: doc.data().date})
          })
        })
      })
    })
  }

  onClickImage(image: any, val: any){
    this.imageAct = this.imageData[val];
    this.image = image;
    document.getElementById("userModel")?.classList.add("block"); 
  }

  onClose(){
    document.getElementById("userModel")?.classList.remove("block"); 
  }
}
