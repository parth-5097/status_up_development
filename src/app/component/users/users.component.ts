import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ExportService } from 'src/app/service/export.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  data: any[] = [];
  dataId: any[] = [];
  filterUser: any;

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private exportService: ExportService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      pageLength: 20,
      scrollX: true,
      scrollY: '50vh',
      responsive: true,
    };
    this.getdbData();
  }

  getdbData() {
    return new Promise((resolve, reject) => {
      this.db
        .collection('/users')
        .ref.get()
        .then((querySnapshot) => {
          let count = 1;
          querySnapshot.forEach((res: any) => {
            this.dataId.push(res.id);
            this.data.push(res.data());
            count == querySnapshot.size ? this.dtTrigger.next() : ``;
            count++;
          });
        });
    });
  }

  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      window.dispatchEvent(new Event('resize'));
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  onSearch(data: any) {
    let temp: any = [];
    this.data.find((user) => {
      JSON.stringify(Object.values(user)).match(data) ? temp.push(user) : '';
    });
    this.data = temp;
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  onBlock(id: any, val: any, field: any) {
    if (val == true || val == 'true') {
      this.db
        .collection('/users')
        .doc(id)
        .ref.update(
          field == 'accountActivated'
            ? { accountActivated: false }
            : { eWallet: false }
        );
    } else {
      this.db
        .collection('/users')
        .doc(id)
        .ref.update(
          field == 'accountActivated'
            ? { accountActivated: true }
            : { eWallet: true }
        );
    }
    this.toastrService.success('This account has been blocked successfully');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  onFilId(val: any) {
    if (val) {
      this.filterUser = this.data.find((x) => x.userId === val);
    }
    this.toastrService.info('Filtered');
  }

  onFilEmail(val: any) {
    if (val) {
      this.filterUser = this.data.find((x) => x.email === val);
    }
    this.toastrService.info('Filtered');
  }

  onExport() {
    this.exportService.exportToCsv(this.data, `${Date()}`);
    this.toastrService.info('Exported');
  }

  onChange(id: any, val: any) {
    this.db.collection('users').doc(id).ref.update({ wallet: val });
    this.toastrService.success('Updated');
  }

  onSubmissions(id: any) {
    this.router.navigate([`submissions/${id}`]);
  }

  onPayouts(id: any) {
    this.router.navigate([`payouts/${id}`]);
  }
}
