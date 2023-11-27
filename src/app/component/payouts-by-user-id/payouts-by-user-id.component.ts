import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ExportService } from 'src/app/service/export.service';

@Component({
  selector: 'app-payouts-by-user-id',
  templateUrl: './payouts-by-user-id.component.html',
  styleUrls: ['./payouts-by-user-id.component.css']
})
export class PayoutsByUserIdComponent implements OnInit {
  date!: string;
  userId: any;
  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  data: any[] = [];
  balance: any = {};
  sumTotal: any = 0;

  constructor(private db: AngularFirestore, private route: ActivatedRoute, private toastrService: ToastrService, private exportService: ExportService) { }

  ngOnInit(): void {
    this.route.params.subscribe(res=>{
      this.userId = res.id;
    })
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      responsive: true,
      scrollX: true,
      scrollY: "50vh",
      processing: true,
    };
    this.getData().then(data => {
      this.dtTrigger.next();
    })
  }

  getData(){
    return new Promise((resolve,reject)=>{
      this.db.collection("newPayouts").ref.where("userId","==",this.userId).get().then(res => {
        res.forEach((doc: any) => {
          this.sumTotal += parseFloat(doc.data().value);
          this.data.push({id: doc.id,...doc.data()});
          this.balance[doc.data().userId] ? this.balance[doc.data().userId] += parseFloat(doc.data().value):this.balance[doc.data().userId] = parseFloat(doc.data().value)
        })
        resolve(res);
      })
    })
  }

  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next()
    });
  }

  loadMore(){
    this.getData();
  }

  onChange(id: any, data:any, path: any){
    let temp = path.split("/"); 
    this.db.collection("newPayouts").doc(id).update({value: data});
    this.db.collection("payouts").doc(temp[2]).collection(temp[3]).doc(temp[4]).update({value: data});
    this.toastrService.success("Updated");
  }

  onFillDate(val:any){
    this.data = [];
    this.sumTotal = 0;
    this.balance = {}
    this.db.collection("newPayouts").ref.where("date","==",val).get().then(res => {
      res.forEach((doc: any) => {
        this.sumTotal += parseFloat(doc.data().value);
        this.data.push({id: doc.id,...doc.data()});
        this.balance[doc.data().userId] ? this.balance[doc.data().userId] += parseFloat(doc.data().value):this.balance[doc.data().userId] = parseFloat(doc.data().value)
      })
    })
  }

  onPaymentChange(id: any, val: any, path: any){
    let temp = path.split("/");
    if(val == 'true' || val == true){
      this.db.collection("newPayouts").doc(id).update({paidOut: false});
      this.db.collection("payouts").doc(temp[2]).collection(temp[3]).doc(temp[4]).update({paidOut: false})
      this.data.filter(el => el.id == id? el.paidOut = false: '');
    } else {
      this.db.collection("newPayouts").doc(id).update({paidOut: true});
      this.db.collection("payouts").doc(temp[2]).collection(temp[3]).doc(temp[4]).update({paidOut: true})
      this.data.filter(el => el.id == id? el.paidOut = true: '');
    }
    this.toastrService.success("updated")
  }

  onExport() {
    this.exportService.exportToCsv(this.data, `${Date()}`);
    this.toastrService.info("Exported")
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
