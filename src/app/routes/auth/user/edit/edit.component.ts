import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseService } from '@core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import { Result } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { AuthUserService } from '../..';

@Component({
  selector: 'app-auth-user-edit',
  templateUrl: './edit.component.html'
})
export class AuthUserEditComponent implements OnInit {
  loading = false;
  copy: boolean | undefined;
  title: string | undefined;
  updatable!: boolean;
  creatable!: boolean;
  buttonName!: string;
  record: any = {};
  gettimes: number = 0;
  i: any;
  @ViewChild('sf') private readonly sf!: SFComponent;
  schema: SFSchema = {
    properties: {
      userId: { type: 'number', title: '用户ID' },
      loginName: { type: 'string', title: '登陆名' },
      userName: { type: 'string', title: '姓名' },
      config: {
        type: 'object',
        properties: {
          avatar: { type: 'string', title: '头像地址' },
          email: { type: 'string', title: '电子邮箱' },
          pswLogin: { type: 'boolean', title: '允许密码登陆', default: true },
          qrLogin: { type: 'boolean', title: '允许扫码登录', default: true },
          appLogin: { type: 'boolean', title: '允许APP登录', default: true }
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
      roles: { type: 'number', title: '角色' },
      updateUserName: { type: 'string', title: '更新用户' },
      updateAt: { type: 'string', title: '更新时间' },
      pswTimes: { type: 'number', title: '密码错误次数' },
      loginTimes: { type: 'number', title: '登陆次数' },
      firstLoginAt: { type: 'string', title: '首次登录时间' },
      lastLoginAt: { type: 'string', title: '最后登录时间' },
      lastSessionAt: { type: 'string', title: '最后会话时间' }
    },
    required: ['loginName', 'userName', 'status']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 12 } },
    $userId: { widget: 'text', grid: { span: 24 } },
    $config: {
      grid: { span: 24 },
      $pswLogin: { grid: { span: 8 } },
      $qrLogin: { grid: { span: 8 } },
      $appLogin: { grid: { span: 8 } }
    },
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $roles: {
      widget: 'transfer',
      showSearch: true,
      titles: ['未授权角色', '已授权角色'],
      operations: ['授予', '没收'],
      grid: { span: 24 },
      listStyle: { width: '100%', 'height.px': window.innerHeight - 700 },
      asyncData: () => this.baseSrv.roleSub
    },
    $createUserName: { widget: 'text' },
    $createAt: { widget: 'text' },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $pswTimes: { widget: 'text' },
    $loginTimes: { widget: 'text' },
    $firstLoginAt: { widget: 'text' },
    $lastLoginIp: { widget: 'text' },
    $lastLoginAt: { widget: 'text' },
    $lastSessionAt: { widget: 'text' }
  };

  constructor(
    private baseSrv: BaseService,
    private userSrv: AuthUserService,
    private modal: NzModalRef,
    private msgSrv: NzMessageService
  ) {}

  ngOnInit(): void {
    if (this.record) {
      if (this.copy) {
        this.title = '用户另存为';
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '另存为';
      } else {
        this.title = '编辑用户';
        this.updatable = true;
        this.creatable = false;
        this.buttonName = '';
      }
      this.userSrv.show(this.record.userId).subscribe(res => {
        this.i = res;
      });
    } else {
      this.title = '创建用户';
      this.updatable = false;
      this.creatable = true;
      this.buttonName = '创建';
      this.i = { config: { pswLogin: true, qrLogin: true, appLogin: true }, roles: [] };
    }
  }

  saveas(value: any): void {
    this.loading = true;
    this.userSrv.create(value).subscribe(res => {
      if (res.code) {
        this.msgSrv.error(res.msg);
      } else {
        this.msgSrv.success(res.msg);
        this.modal.close(true);
      }
      this.loading = false;
    });
  }

  save(value: any): void {
    this.loading = true;
    this.userSrv.update(this.record.userId, value).subscribe((res: Result) => {
      if (res.code) {
        this.msgSrv.error(res.msg);
      } else {
        this.msgSrv.success(res.msg);
        this.modal.close(true);
      }
      this.loading = false;
    });
  }

  close(): void {
    this.modal.destroy(true);
  }
}
