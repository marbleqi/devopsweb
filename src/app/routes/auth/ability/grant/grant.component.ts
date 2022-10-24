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
  grantType!: 'menu' | 'role';
  loading = false;
  title!: string;
  record: any = {};
  getTimes: number = 0;
  i: any;
  schema!: SFSchema;
  ui!: SFUISchema;
  /**树型组件高度 */
  height!: string;
  /**权限点节点树 */
  menuNodes!: NzTreeNodeOptions[];

  /**
   * 构造函数
   *
   * @param arraySrv 注入的数组服务
   * @param abilitySrv 注入的权限服务
   * @param menuSrv 注入的菜单服务
   * @param roleSrv 注入的角色服务
   * @param msgSrv 注入的消息服务
   * @param modal 注入的模式框服务
   */
  constructor(
    private readonly arraySrv: ArrayService,
    private readonly abilitySrv: AuthAbilityService,
    private readonly menuSrv: AuthMenuService,
    private readonly roleSrv: AuthRoleService,
    private readonly msgSrv: NzMessageService,
    private readonly modal: NzModalRef
  ) {}

  /**对话框初始化 */
  ngOnInit(): void {
    // TODO:待优化，去重代码
    console.debug('record', this.record);
    if (this.grantType === 'menu') {
      this.title = `编辑${this.record.name}的授权菜单`;
      this.menuSrv.index().subscribe(res => {
        this.menuNodes = this.arraySrv.arrToTree(
          res
            .sort((a: any, b: any) => a.orderId - b.orderId)
            .map((item: any) => ({ key: item.menuId, pMenuId: item.pMenuId, title: item.config.text })),
          { idMapName: 'key', parentIdMapName: 'pMenuId' }
        );
        this.schema = {
          properties: {
            id: { type: 'number', title: '权限点ID' },
            name: { type: 'string', title: '权限名称' },
            description: { type: 'string', title: '权限说明' },
            menuList: { type: 'number', title: '菜单授权' }
          },
          required: ['menuList']
        };
        this.ui = {
          '*': { spanLabelFixed: 100, grid: { span: 12 } },
          $id: { widget: 'text' },
          $name: { widget: 'text' },
          $description: { widget: 'text' },
          $menuList: { widget: 'custom', grid: { span: 24 } }
        };
        this.abilitySrv.granted('menu', this.record.id).subscribe(res => {
          this.i = { id: this.record.id, name: this.record.name, description: this.record.description, menuList: res };
        });
      });
    } else {
      this.title = `编辑${this.record.name}的授权角色`;
      this.roleSrv.index().subscribe(res => {
        const roleList: SFSchemaEnum[] = res.map(item => ({ title: item.roleName, value: item.roleId }));
        this.schema = {
          properties: {
            id: { type: 'number', title: '权限点ID' },
            name: { type: 'string', title: '权限名称' },
            description: { type: 'string', title: '权限说明' },
            roleList: { type: 'number', title: '角色授权', enum: roleList }
          },
          required: ['roleList']
        };
        this.ui = {
          '*': { spanLabelFixed: 100, grid: { span: 12 } },
          $id: { widget: 'text' },
          $name: { widget: 'text' },
          $description: { widget: 'text' },
          $roleList: {
            widget: 'transfer',
            showSearch: true,
            titles: ['未授权角色', '已授权角色'],
            grid: { span: 24 },
            listStyle: { width: '100%', 'height.px': window.innerHeight - 700 }
          }
        };
        this.abilitySrv.granted('role', this.record.id).subscribe(res => {
          this.i = { id: this.record.id, name: this.record.name, description: this.record.description, roleList: res };
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
    const objectList: number[] = this.grantType === 'menu' ? value.menuList : value.roleList;
    this.abilitySrv.granting(this.grantType, this.record.id, objectList).subscribe(res => {
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
