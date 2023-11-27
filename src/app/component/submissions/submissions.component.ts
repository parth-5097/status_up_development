import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ExportService } from 'src/app/service/export.service';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.css'],
})
export class SubmissionsComponent implements OnInit, OnDestroy {
  userId: any;
  image: any;
  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  data: any[] = [];
  totalAmount: any = 0;

  constructor(
    private db: AngularFirestore,
    private exportService: ExportService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      responsive: true,
      scrollY: '50vh',
      scrollX: true,
    };
    this.getData();
  }

  getData() {
    return new Promise((resolve, reject) => {
      this.db
        .collection('newSubmissions')
        .ref.get()
        .then((res) => {
          let count = 1;
          res.forEach((doc: any) => {
            this.data.push({ id: doc.id, ...doc.data() });
            count == res.size ? this.dtTrigger.next() : ``;
            count++;
          });
          this.totalAmount = this.data.length;
        });
    });
  }

  onFillDate(val: any) {
    this.db
      .collection('newSubmissions')
      .ref.where('date', '==', val)
      .get()
      .then((res) => {
        this.data = [];
        res.forEach((doc: any) => {
          this.data.push({ id: doc.id, ...doc.data() });
        });
      });
  }

  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  onImage(image: any) {
    console.log(image);

    this.image = '';
    this.image = image;
    document.getElementById('userModel')?.classList.add('block');
  }

  onExport() {
    this.exportService.exportToCsv(this.data, `${Date()}`);
    this.toastrService.info('Exported');
  }

  onClick(id: any, views: any, path: any) {
    let temp = path.split('/');
    if (views == 'true' || views == true) {
      this.db
        .collection('newSubmissions')
        .doc(id)
        .update({ viewsApproved: false });
      this.db
        .collection('submissions')
        .doc(temp[2])
        .collection(temp[3])
        .doc(temp[4])
        .update({ viewsApproved: false });
      this.data.filter((el) => (el.id == id ? (el.viewsApproved = false) : ''));
    } else {
      this.db
        .collection('newSubmissions')
        .doc(id)
        .update({ viewsApproved: true });
      this.db
        .collection('submissions')
        .doc(temp[2])
        .collection(temp[3])
        .doc(temp[4])
        .update({ viewsApproved: true });
      this.data.filter((el) => (el.id == id ? (el.viewsApproved = true) : ''));
    }
    this.toastrService.success('Updated');
  }

  loadMore() {
    this.getData();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  onFilApprove(val: any) {
    if (val) {
      this.data = this.data.filter((x) => x.viewsApproved == val);
    }
    this.toastrService.info('Filtered');
  }

  onFilEmail(val: any) {
    if (val) {
      this.db
        .collection('users')
        .ref.where('email', '==', val)
        .get()
        .then((res) => {
          res.forEach((doc) => {
            this.data = [];
            this.db
              .collection('newSubmissions')
              .ref.where('userID', '==', doc.id)
              .get()
              .then((doc_2) => {
                doc_2.forEach((final: any) => {
                  final.data()
                    ? this.data.push({ id: final.id, ...final.data() })
                    : '';
                });
              });
          });
        });
    }
    this.toastrService.info('Filtered');
  }

  onClose() {
    document.getElementById('userModel')?.classList.remove('block');
  }
}
