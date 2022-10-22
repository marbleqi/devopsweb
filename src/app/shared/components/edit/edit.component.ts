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
  copy: boolean | undefined;
  title: string | undefined;
  updatable!: boolean;
  creatable!: boolean;
  buttonname!: string;
  record: any = {};
  i: any;
  @ViewChild('sf') private readonly sf!: SFComponent;
  schema: SFSchema = {
    properties: {
      loginname: { type: 'string', title: '登陆名' },
      username: { type: 'string', title: '姓名' },
      email: { type: 'string', title: '邮箱' },
      avatar: { type: 'string', title: '头像' },
      status: {
        type: 'number',
        title: '状态',
        enum: [
          { label: '有效', value: 1 },
          { label: '禁用', value: 0 }
        ]
      },
      config: {
        type: 'object',
        properties: { pswlogin: { type: 'boolean', title: '允许密码登陆' }, qrlogin: { type: 'boolean', title: '允许扫码登录' } }
      },
      roles: { type: 'string', title: '角色' }
    },
    required: ['loginname', 'username']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 12 } },
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $roles: {
      widget: 'transfer',
      showSearch: true,
      titles: ['未授权角色', '已授权角色'],
      grid: { span: 24 },
      listStyle: { 'width.px': 1000, 'height.px': 400 },
      asyncData: () => {
        let rolelist: SFSchemaEnum[];
        return this.client.post('admin/role/index').pipe(
          tap((res: any) => {
            rolelist = res.data.map((item: any) => ({ title: item.rolename, value: item.rolecode }));
          }),
          map(() => rolelist)
        );
      }
    }
  };

  constructor(private client: _HttpClient, private modal: NzModalRef, private msgSrv: NzMessageService) {}

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
      this.client.post('admin/user/show', { userid: this.record.userid }).subscribe((res: any) => {
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
    this.client.post('admin/user/update', { ...value, userid: this.record.userid }).subscribe((res: any) => {
      if (res.code === 0) {
        this.msgSrv.success(res.msg);
        this.modal.close(true);
      } else {
        this.msgSrv.error(res.msg);
      }
      this.loading = false;
    });
  }

  saveas(value: any): void {
    this.loading = true;
    this.client.post('admin/user/create', value).subscribe((res: any) => {
      if (res.code === 0) {
        this.msgSrv.success(res.msg);
        this.modal.close(true);
      } else {
        this.msgSrv.error(res.msg);
      }
      this.loading = false;
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
