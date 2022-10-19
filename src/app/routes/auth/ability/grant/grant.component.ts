import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { ArrayService } from '@delon/util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';

import { AuthAbilityService, AuthMenuService, AuthRoleService } from '../..';

@Component({
  selector: 'app-auth-ability-grant',
  templateUrl: './grant.component.html'
})
export class AuthAbilityGrantComponent implements OnInit {
  granttype!: 'menu' | 'role';
  loading = false;
  title!: string;
  record: any = {};
  gettimes: number = 0;
  i: any;
  schema!: SFSchema;
  ui!: SFUISchema;
  /**树型组件高度 */
  height!: string;
  /**权限点节点树 */
  menunodes!: NzTreeNodeOptions[];

  /**
   * 构造函数
   *
   * @param arrSrv 注入的数组服务
   * @param abilitySrv 注入的权限服务
   * @param menuSrv 注入的菜单服务
   * @param roleSrv 注入的角色服务
   * @param msgSrv 注入的消息服务
   * @param modal 注入的模式框服务
   */
  constructor(
    private readonly arrSrv: ArrayService,
    private readonly abilitySrv: AuthAbilityService,
    private readonly menuSrv: AuthMenuService,
    private readonly roleSrv: AuthRoleService,
    private readonly msgSrv: NzMessageService,
    private readonly modal: NzModalRef
  ) {}

  /**对话框初始化 */
  ngOnInit(): void {
    console.debug('record', this.record);
    if (this.granttype === 'menu') {
      this.title = `编辑${this.record.name}的授权菜单`;
      this.menuSrv.index().subscribe(res => {
        this.menunodes = this.arrSrv.arrToTree(
          res
            .sort((a: any, b: any) => a.orderid - b.orderid)
            .map((item: any) => ({ key: item.menuid, pid: item.pmenuid, title: item.config.text })),
          { idMapName: 'key', parentIdMapName: 'pid' }
        );
        this.schema = {
          properties: {
            id: { type: 'number', title: '权限点ID' },
            name: { type: 'string', title: '权限名称' },
            description: { type: 'string', title: '权限说明' },
            menulist: { type: 'number', title: '菜单授权' }
          },
          required: ['menulist']
        };
        this.ui = {
          '*': { spanLabelFixed: 100, grid: { span: 12 } },
          $id: { widget: 'text' },
          $name: { widget: 'text' },
          $description: { widget: 'text' },
          $menulist: { widget: 'custom', grid: { span: 24 } }
        };
        this.abilitySrv.granted('menu', this.record.id).subscribe(res => {
          this.i = { id: this.record.id, name: this.record.name, description: this.record.description, menulist: res };
        });
      });
    } else {
      this.title = `编辑${this.record.name}的授权角色`;
      this.roleSrv.index().subscribe(res => {
        const rolelist: SFSchemaEnum[] = res.map(item => ({ title: item.config.rolename, value: item.roleId }));
        this.schema = {
          properties: {
            id: { type: 'number', title: '权限点ID' },
            name: { type: 'string', title: '权限名称' },
            description: { type: 'string', title: '权限说明' },
            rolelist: { type: 'number', title: '角色授权', enum: rolelist }
          },
          required: ['rolelist']
        };
        this.ui = {
          '*': { spanLabelFixed: 100, grid: { span: 12 } },
          $id: { widget: 'text' },
          $name: { widget: 'text' },
          $description: { widget: 'text' },
          $rolelist: {
            widget: 'transfer',
            showSearch: true,
            titles: ['未授权角色', '已授权角色'],
            grid: { span: 24 },
            listStyle: { width: '100%', 'height.px': window.innerHeight - 700 }
          }
        };
        this.abilitySrv.granted('role', this.record.id).subscribe(res => {
          this.i = { id: this.record.id, name: this.record.name, description: this.record.description, rolelist: res };
        });
      });
    }
  }

  /**
   * 授权拥有角色的用户
   *
   * @param value 原始表单数据
   */
  save(value: any): void {
    const objectlist: number[] = this.granttype === 'menu' ? value.menulist : value.rolelist;
    this.abilitySrv.granting(this.granttype, this.record.id, objectlist).subscribe(res => {
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
