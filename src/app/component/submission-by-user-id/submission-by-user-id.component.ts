import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ExportService } from 'src/app/service/export.service';

@Component({
  selector: 'app-submission-by-user-id',
  templateUrl: './submission-by-user-id.component.html',
  styleUrls: ['./submission-by-user-id.component.css']
})
export class SubmissionByUserIdComponent implements OnInit, OnDestroy {
  userId: any;
  image: any;
  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  data: any[] = [];
  totalAmount: any = 0;

  constructor(private db: AngularFirestore, private route: ActivatedRoute, private toastrService: ToastrService, private exportService:ExportService) { }

  ngOnInit(): void {
    this.route.params.subscribe(res=>{
      this.userId = res.id;
    })
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      responsive: true,
      scrollY: "50vh",
      scrollX: true
    };
    this.getData().then(data=>{
      this.dtTrigger.next();
    });
  }

  getData(){
    return new Promise((resolve,reject)=>{
      this.db.collection("newSubmissions").ref.where("userID","==", this.userId).get().then(res => {
        res.forEach((final: any) => {
          final.data()?this.data.push({id:final.id,...final.data()}):"";
        });
        resolve(res);
      });
    })
  }

  onFillDate(val:any){
    this.db.collection("newSubmissions").ref.where("date", "==", val).where("userID","==",this.userId).get().then(res=>{
      res.forEach((final: any) => {
        final.data()?this.data.push({id:final.id,...final.data()}):""
      })
    })
  }

  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next()
    });
  }

  onImage(image: any){
    this.image = ""
    this.image = image;
    document.getElementById("userModel")?.classList.add("block"); 
  }
  
  loadMore(){
    this.getData();
  }

  onClick(id: any, views: any, path: any) {
    let temp = path.split("/");
    if(views == 'true' || views == true) {
      this.db.collection("newSubmissions").doc(id).update({viewsApproved: false});
      this.db.collection("submissions").doc(temp[2]).collection(temp[3]).doc(temp[4]).update({viewsApproved: false});
      this.data.filter(el => el.id == id? el.viewsApproved = false: '');
    } else {
      this.db.collection("newSubmissions").doc(id).update({viewsApproved: true});
      this.db.collection("submissions").doc(temp[2]).collection(temp[3]).doc(temp[4]).update({viewsApproved: false});
      this.data.filter(el => el.id == id? el.viewsApproved = true: '');
    }
    this.toastrService.success("Updated")
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  onFilApprove(val: any){
    if(val){
      this.data = this.data.find(x => x.viewsApproved === val)
    }
    this.toastrService.info("Filtered")
  }

  onFilEmail(val: any){
    if(val) {
      this.db.collection("users").ref.where("email","==",val).get().then(res=>{
        res.forEach(doc=>{  
          this.data = [];
          this.db.collection("newSubmissions").ref.where("userID","==",doc.id).get().then(doc_2 => {
            doc_2.forEach((final: any) => {
              final.data()?this.data.push({id:final.id,...final.data()}):""
            })
          })
        })
      })
    }
    this.toastrService.info("Filtered")
  }

  onExport() {
    this.exportService.exportToCsv(this.data, `${Date()}`);
    this.toastrService.info("Exported")
  }

  onClose(){
    document.getElementById("userModel")?.classList.remove("block"); 
  }
}
