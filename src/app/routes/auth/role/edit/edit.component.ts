import { Component, OnInit, ViewChild } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzTreeComponent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { map } from 'rxjs';

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
          { value: 1, label: '有效' },
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
    $abilities: {
      widget: 'transfer',
      showSearch: true,
      titles: ['未授权权限点', '已授权权限点'],
      operations: ['授予', '没收'],
      grid: { span: 24 },
      listStyle: { width: '100%', 'height.px': window.innerHeight - 700 },
      asyncData: () =>
        this.abilityService.index().pipe(map(res => res.map(item => ({ title: `${item.name}——${item.description}`, value: item.id }))))
    },
    $createUserName: { widget: 'text' },
    $createAt: { widget: 'text' },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $operateId: { widget: 'text' }
  };

  constructor(
    private abilityService: AuthAbilityService,
    private roleService: AuthRoleService,
    private messageService: NzMessageService,
    private modal: NzModalRef
  ) {}

  /**对话框初始化 */
  ngOnInit(): void {
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
      this.roleService.show(this.record.roleId).subscribe(res => {
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
    this.roleService.create(value).subscribe(res => {
      if (res.code) {
        this.messageService.error(res.msg);
      } else {
        this.messageService.success('创建成功');
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
    this.roleService.update(this.record.roleId, value).subscribe(res => {
      if (res.code) {
        this.messageService.error(res.msg);
      } else {
        this.messageService.success('保存成功');
        this.modal.close(true);
      }
    });
  }

  /**关闭对话框 */
  close(): void {
    this.modal.destroy();
  }
}
