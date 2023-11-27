import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ExportService } from 'src/app/service/export.service';

@Component({
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.css'],
})
export class PayoutsComponent implements OnInit, OnDestroy {
  date!: string;
  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  data: any[] = [];
  balance: any = {};
  sumTotal: any = 0;

  constructor(
    private db: AngularFirestore,
    private exportService: ExportService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      destroy: true,
      responsive: true,
      scrollX: true,
      scrollY: '50vh',
      processing: true,
    };
    this.getData();
  }

  getData() {
    return new Promise((resolve, reject) => {
      this.data = [];
      this.balance = {};
      this.db
        .collection('newPayouts')
        .ref.get()
        .then((res) => {
          let count = 1;
          res.forEach((doc: any) => {
            this.sumTotal += parseFloat(doc.data().value);
            this.data.push({ id: doc.id, ...doc.data() });
            this.balance[doc.data().userId]
              ? (this.balance[doc.data().userId] += parseFloat(
                  doc.data().value
                ))
              : (this.balance[doc.data().userId] = parseFloat(
                  doc.data().value
                ));
            count == res.size ? this.dtTrigger.next() : ``;
            count++;
          });
        });
    });
  }

  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
    });
  }

  loadMore() {
    this.getData();
  }

  onRefresh() {
    window.location.reload();
  }

  onChange(id: any, data: any, path: any) {
    let temp = path.split('/');
    this.db.collection('newPayouts').doc(id).update({ value: data });
    this.db
      .collection('payouts')
      .doc(temp[2])
      .collection(temp[3])
      .doc(temp[4])
      .update({ value: data });
    this.toastrService.success('Updated');
  }

  onFillDate(val: any) {
    this.data = [];
    this.sumTotal = 0;
    this.balance = {};
    this.db
      .collection('newPayouts')
      .ref.where('date', '==', val)
      .get()
      .then((res) => {
        res.forEach((doc: any) => {
          this.sumTotal += parseFloat(doc.data().value);
          this.data.push({ id: doc.id, ...doc.data() });
          this.balance[doc.data().userId]
            ? (this.balance[doc.data().userId] += parseFloat(doc.data().value))
            : (this.balance[doc.data().userId] = parseFloat(doc.data().value));
        });
      });
  }

  onPaymentChange(id: any, val: any, path: any) {
    let temp = path.split('/');
    if (val == 'true' || val == true) {
      this.db.collection('newPayouts').doc(id).update({ paidOut: false });
      this.db
        .collection('payouts')
        .doc(temp[2])
        .collection(temp[3])
        .doc(temp[4])
        .update({ paidOut: false });
      this.data.filter((el) => (el.id == id ? (el.paidOut = false) : ''));
    } else {
      this.db.collection('newPayouts').doc(id).update({ paidOut: true });
      this.db
        .collection('payouts')
        .doc(temp[2])
        .collection(temp[3])
        .doc(temp[4])
        .update({ paidOut: true });
      this.data.filter((el) => (el.id == id ? (el.paidOut = true) : ''));
    }
    this.toastrService.success('updated');
  }

  onApprovedChange(id: any, val: any, path: any) {
    let temp = path.split('/');
    if (val == 'true' || val == true) {
      this.db.collection('newPayouts').doc(id).update({ approved: false });
      this.db
        .collection('payouts')
        .doc(temp[2])
        .collection(temp[3])
        .doc(temp[4])
        .update({ paidOut: false });
      this.data.filter((el) => (el.id == id ? (el.approved = false) : ''));
    } else {
      this.db.collection('newPayouts').doc(id).update({ approved: true });
      this.db
        .collection('payouts')
        .doc(temp[2])
        .collection(temp[3])
        .doc(temp[4])
        .update({ paidOut: true });
      this.data.filter((el) => (el.id == id ? (el.approved = true) : ''));
    }
    this.toastrService.success('updated');
  }

  onExport() {
    this.exportService.exportToCsv(this.data, `${Date()}`);
    this.toastrService.info('Exported');
  }

  onPaidoutFilter(val: any) {
    let data = this.data.filter((el) => {
      if (el.paidOut == true) {
        if (val == 'true') {
          return el;
        }
      }
      if (el.paidOut == false) {
        if (val == 'false') {
          return el;
        }
      }
    });
    this.data = data;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
