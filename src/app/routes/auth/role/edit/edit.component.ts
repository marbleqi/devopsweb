import { Component, OnInit, ViewChild } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzTreeComponent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';

import { AuthAbilityService, AuthRoleService } from '../..';

@Component({
  selector: 'app-auth-role-edit',
  templateUrl: './edit.component.html'
})
export class AuthRoleEditComponent implements OnInit {
  loading = false;
  copy!: boolean;
  title!: string;
  updatable!: boolean;
  creatable!: boolean;
  buttonName!: string;
  @ViewChild('abilities') private readonly abilities!: NzTreeComponent;
  /**树型组件高度 */
  height!: string;
  /**权限点节点树 */
  abilityNodes!: NzTreeNodeOptions[];
  /**已选权限点 */
  checkedAbilities!: number[];
  /**已展开权限点 */
  expandAbilities!: number[];
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      roleName: { type: 'string', title: '角色名称' },
      description: { type: 'string', title: '角色说明' },
      status: {
        type: 'number',
        title: '状态',
        default: 1,
        enum: [
          { value: 1, label: '启用' },
          { value: 0, label: '禁用' }
        ]
      },
      abilities: { type: 'number', title: '授权权限点' },
      createUserName: { type: 'string', title: '创建人' },
      createAt: { type: 'string', title: '创建时间' },
      updateUserName: { type: 'string', title: '最后更新人' },
      updateAt: { type: 'string', title: '最后更新时间' },
      operateId: { type: 'number', title: '操作序号' }
    },
    required: ['rolename', 'description', 'status', 'abilities']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 150, grid: { span: 12 } },
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $abilities: { widget: 'custom', grid: { span: 24 } },
    $createUserName: { widget: 'text' },
    $createAt: { widget: 'text' },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $operateId: { widget: 'text' }
  };

  constructor(
    private abilitySrv: AuthAbilityService,
    private roleSrv: AuthRoleService,
    private msgSrv: NzMessageService,
    private modal: NzModalRef
  ) {}

  /**对话框初始化 */
  ngOnInit(): void {
    // 设置权限点树形组件的高度
    this.height = `${(window.innerHeight - 500).toString()}px`;
    // 设置权限点备选项
    this.abilitySrv.index('tree').subscribe((res: any) => {
      this.abilityNodes = res;
    });
    // 初始化数据
    if (this.record) {
      if (this.copy) {
        this.title = '角色另存为';
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '另存为';
      } else {
        this.title = '编辑角色';
        this.updatable = true;
        this.creatable = false;
      }
      this.roleSrv.show(this.record.roleId).subscribe(res => {
        this.i = res;
      });
    } else {
      this.title = '创建角色';
      this.updatable = false;
      this.creatable = true;
      this.buttonName = '创建';
      this.i = {};
    }
  }

  /**
   * 创建新角色
   *
   * @param value 原始表单数据
   */
  saveas(value: any): void {
    this.roleSrv.create(value).subscribe(res => {
      if (res.code) {
        this.msgSrv.error(res.msg);
      } else {
        this.msgSrv.success('创建成功');
        this.modal.close(true);
      }
    });
  }

  /**
   * 修改已有角色
   *
   * @param value 原始表单数据
   */
  save(value: any): void {
    this.roleSrv.update(this.record.roleId, value).subscribe(res => {
      if (res.code) {
        this.msgSrv.error(res.msg);
      } else {
        this.msgSrv.success('保存成功');
        this.modal.close(true);
      }
    });
  }

  /**关闭对话框 */
  close(): void {
    this.modal.destroy();
  }
}
