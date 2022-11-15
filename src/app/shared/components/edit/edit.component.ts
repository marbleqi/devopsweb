import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFSchemaEnum, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styles: []
})
export class EditComponent implements OnInit {
  loading = false;
  copy!: boolean;
  title!: string;
  updatable!: boolean;
  creatable!: boolean;
  buttonname!: string;
  record: any = {};
  i: any;
  @ViewChild('sf') private readonly sf!: SFComponent;
  schema: SFSchema = { properties: {} };
  ui: SFUISchema = { '*': { spanLabelFixed: 100, grid: { span: 12 } } };

  constructor(private readonly clientService: _HttpClient, private modal: NzModalRef, private msgService: NzMessageService) {}

  ngOnInit(): void {
    if (this.record) {
      this.i = this.record;
      if (this.copy) {
        this.title = '用户另存为';
        this.updatable = false;
        this.creatable = true;
        this.buttonname = '另存为';
      } else {
        this.title = '编辑用户';
        this.updatable = true;
        this.creatable = false;
        this.buttonname = '';
        // this.ui.$action = { widget: 'text' };
      }
      this.clientService.post('admin/user/show', { userid: this.record.userid }).subscribe((res: any) => {
        // console.log(res);
        this.i = {
          ...res.data,
          create_at: format(new Date(res.data.create_at), 'yyyy-MM-dd HH:mm:ss.SSS'),
          update_at: format(new Date(res.data.update_at), 'yyyy-MM-dd HH:mm:ss.SSS')
        };
      });
    } else {
      this.title = '创建用户';
      this.updatable = false;
      this.creatable = true;
      this.buttonname = '创建';
      this.i = { config: { pswlogin: true, qrlogin: true }, roles: [] };
    }
  }

  save(value: any): void {
    this.loading = true;
    this.clientService.post('admin/user/update', { ...value, userid: this.record.userid }).subscribe((res: any) => {
      if (res.code === 0) {
        this.msgService.success(res.msg);
        this.modal.close(true);
      } else {
        this.msgService.error(res.msg);
      }
      this.loading = false;
    });
  }

  saveas(value: any): void {
    this.loading = true;
    this.clientService.post('admin/user/create', value).subscribe((res: any) => {
      if (res.code === 0) {
        this.msgService.success(res.msg);
        this.modal.close(true);
      } else {
        this.msgService.error(res.msg);
      }
      this.loading = false;
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
