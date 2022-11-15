import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseService } from '@core';
import { SFComponent, SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { WxworkUserService } from '../..';

@Component({
  selector: 'app-wxwork-user-add',
  templateUrl: './add.component.html'
})
export class WxworkUserAddComponent implements OnInit {
  loading = false;
  copy: boolean | undefined;
  title: string | undefined;
  updatable!: boolean;
  creatable!: boolean;
  buttonname!: string;
  record: any = {};
  gettimes: number = 0;
  i: any;
  @ViewChild('sf') private readonly sf!: SFComponent;
  schema: SFSchema = {
    properties: {
      loginName: { type: 'string', title: '登陆名' },
      userName: { type: 'string', title: '姓名' },
      config: {
        type: 'object',
        properties: {
          avatar: { type: 'string', title: '头像地址' },
          email: { type: 'string', title: '电子邮箱' },
          pswlogin: { type: 'boolean', title: '允许密码登陆', default: true },
          qrlogin: { type: 'boolean', title: '允许扫码登录', default: true },
          applogin: { type: 'boolean', title: '允许APP登录', default: true }
        }
      },
      status: {
        type: 'number',
        title: '状态',
        enum: [
          { label: '有效', value: 1 },
          { label: '禁用', value: 0 }
        ]
      },
      roles: { type: 'number', title: '角色' }
    },
    required: ['loginName', 'userName', 'status']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 12 } },
    $config: {
      grid: { span: 24 },
      $pswlogin: { grid: { span: 8 } },
      $qrlogin: { grid: { span: 8 } },
      $applogin: { grid: { span: 8 } }
    },
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $roles: {
      widget: 'transfer',
      showSearch: true,
      titles: ['未授权角色', '已授权角色'],
      operations: ['授予', '没收'],
      grid: { span: 24 },
      listStyle: { width: '100%', 'height.px': window.innerHeight - 700 },
      asyncData: () => this.baseService.roleSub
    }
  };

  constructor(
    private readonly baseService: BaseService,
    private readonly userService: WxworkUserService,
    private readonly modal: NzModalRef,
    private readonly msgService: NzMessageService
  ) {}

  ngOnInit(): void {
    if (this.record) {
      this.i = {
        loginName: this.record.userId,
        userName: this.record.name,
        config: { pswlogin: false, qrlogin: true, applogin: true },
        status: 1,
        roles: []
      };
    }
  }

  saveas(value: any): void {
    this.loading = true;
    this.userService.create({ ...value, wxworkId: this.record.userId }).subscribe(res => {
      if (res.code) {
        this.msgService.error(res.msg);
      } else {
        this.msgService.success(res.msg);
        this.modal.close(true);
      }
      this.loading = false;
    });
  }

  close(): void {
    this.modal.destroy(true);
  }
}
