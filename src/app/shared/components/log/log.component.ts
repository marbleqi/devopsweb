import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { STColumn, STData } from '@delon/abc/st';
import { _HttpClient } from '@delon/theme';
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styles: []
})
export class LogComponent implements OnInit {
  url!: string;
  title!: string;
  stData!: STData[];
  columns!: STColumn[];

  constructor(private client: _HttpClient, private baseSrv: BaseService, private modal: NzModalRef, private msgSrv: NzMessageService) {}

  ngOnInit(): void {
    this.client.get(this.url).subscribe(res => {
      this.stData = res.data.map((item: any) => ({
        ...item,
        updateUserName: this.baseSrv.userName(item.updateUserId),
        updateAt: format(item.updateAt, 'yyyy-MM-dd HH:mm:ss.SSS')
      }));
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
