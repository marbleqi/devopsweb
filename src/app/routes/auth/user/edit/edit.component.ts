import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { Result } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { AuthRoleService, AuthUserService } from '../..';

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
  schema!: SFSchema;
  ui!: SFUISchema;

  constructor(
    private roleSrv: AuthRoleService,
    private userSrv: AuthUserService,
    private modal: NzModalRef,
    private msgSrv: NzMessageService
  ) {}

  ngOnInit(): void {
    this.roleSrv.index().subscribe(res => {
      const rolelist: SFSchemaEnum[] = res.map(item => ({ title: item.config.rolename, value: item.roleId }));
      this.schema = {
        properties: {
          loginname: { type: 'string', title: '登陆名' },
          config: {
            type: 'object',
            properties: {
              userName: { type: 'string', title: '姓名' },
              avatar: { type: 'string', title: '头像地址' },
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
          roles: { type: 'number', title: '角色', enum: rolelist },
          update_userName: { type: 'string', title: '更新用户' },
          update_at: { type: 'string', title: '更新时间' },
          pswtimes: { type: 'number', title: '密码错误次数' },
          logintimes: { type: 'number', title: '登陆次数' },
          first_login_at: { type: 'string', title: '首次登录时间' },
          last_login_at: { type: 'string', title: '最后登录时间' },
          last_session_at: { type: 'string', title: '最后会话时间' }
        },
        required: ['loginname', 'userName']
      };
      this.ui = {
        '*': { spanLabelFixed: 100, grid: { span: 12 } },
        $config: {
          grid: { span: 24 },
          $userName: { grid: { span: 12 } },
          $avatar: { grid: { span: 12 } },
          $pswlogin: { grid: { span: 8 } },
          $qrlogin: { grid: { span: 8 } },
          $applogin: { grid: { span: 8 } }
        },
        $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
        $roles: {
          widget: 'transfer',
          showSearch: true,
          titles: ['未授权角色', '已授权角色'],
          grid: { span: 24 },
          listStyle: { width: '100%', 'height.px': window.innerHeight - 700 }
        },
        $update_userName: { widget: 'text' },
        $update_at: { widget: 'text' },
        $pswtimes: { widget: 'text' },
        $logintimes: { widget: 'text' },
        $first_login_at: { widget: 'text' },
        $last_login_at: { widget: 'text' },
        $last_session_at: { widget: 'text' }
      };
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
        this.userSrv.show(this.record.userid).subscribe(res => {
          this.i = res;
        });
      } else {
        this.title = '创建用户';
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '创建';
        this.i = { config: { pswlogin: true, qrlogin: true }, roles: [] };
      }
    });
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
    this.userSrv.update(this.record.userid, value).subscribe((res: Result) => {
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
