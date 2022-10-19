import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { first } from 'rxjs';

import { AuthRoleService } from '../..';

@Component({
  selector: 'app-auth-role-grant',
  templateUrl: './grant.component.html'
})
export class AuthRoleGrantComponent implements OnInit {
  loading = false;
  title!: string;
  record: any = {};
  gettimes: number = 0;
  i: any;
  schema!: SFSchema;
  ui!: SFUISchema;

  /**
   * 构造函数
   *
   * @param baseSrv 注入的基础服务
   * @param roleSrv 注入的角色服务
   * @param msgSrv 注入的消息服务
   * @param modal 注入的模式框服务
   */
  constructor(
    private readonly baseSrv: BaseService,
    private readonly roleSrv: AuthRoleService,
    private readonly msgSrv: NzMessageService,
    private readonly modal: NzModalRef
  ) {}

  /**对话框初始化 */
  ngOnInit(): void {
    this.baseSrv.userSub.pipe(first()).subscribe((userenum: SFSchemaEnum[]) => {
      if (this.record) {
        this.title = `编辑角色${this.record.config.rolename}的授权用户`;
        this.schema = {
          properties: {
            config: {
              type: 'object',
              properties: { rolename: { type: 'string', title: '角色名称' }, description: { type: 'string', title: '角色说明' } }
            },
            userlist: { type: 'number', title: '用户授权', enum: userenum }
          },
          required: ['userlist']
        };
        this.ui = {
          '*': { spanLabelFixed: 100, grid: { span: 12 } },
          $config: { grid: { span: 24 }, $rolename: { widget: 'text' }, $description: { widget: 'text' } },
          $userlist: {
            widget: 'transfer',
            showSearch: true,
            titles: ['未授权用户', '已授权用户'],
            grid: { span: 24 },
            listStyle: { width: '100%', 'height.px': window.innerHeight - 700 }
          }
        };
        this.roleSrv.granted(this.record.roleId).subscribe(userlist => {
          this.i = { config: this.record.config, userlist };
          console.debug('i', this.i);
        });
      }
    });
  }

  /**
   * 授权拥有角色的用户
   *
   * @param value 原始表单数据
   */
  save(value: any): void {
    this.roleSrv.granting(this.record.roleId, value.userlist).subscribe(res => {
      if (res.code) {
        this.msgSrv.error(res.msg);
      } else {
        this.msgSrv.success(res.msg);
        this.modal.close(true);
      }
    });
  }

  /**关闭对话框 */
  close(): void {
    this.modal.destroy(true);
  }
}
