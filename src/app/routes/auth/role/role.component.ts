import { Component, ViewChild, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STComponent, STColumn, STData, STColumnTag } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { LogComponent, SortComponent } from '@shared';

import { AuthRoleService, AuthRoleEditComponent, AuthRoleGrantComponent } from '..';

@Component({
  selector: 'app-auth-role',
  templateUrl: './role.component.html'
})
export class AuthRoleComponent implements OnInit, OnReuseInit {
  dissort = true;
  @ViewChild('st') private st!: STComponent;
  stData: STData[] = [];
  scroll!: { x?: string; y?: string };
  columns: STColumn[] = [
    { title: '角色ID', index: 'roleId', width: 100, sort: { compare: (a, b) => a.roleId - b.roleId } },
    {
      title: '角色名',
      render: 'name',
      width: 150,
      sort: { compare: (a, b) => a.roleName.localeCompare(b.roleName) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.roleName.includes(filter.value) }
    },
    {
      title: '说明',
      index: 'description',
      sort: { compare: (a, b) => a.description.localeCompare(b.description) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.description.includes(filter.value) }
    },
    {
      title: '状态',
      index: 'status',
      width: 100,
      sort: { compare: (a, b) => a.status - b.status },
      type: 'tag',
      tag: {
        1: { text: '有效', color: 'green' },
        0: { text: '禁用', color: 'red' }
      } as STColumnTag,
      filter: {
        menus: [
          { value: 1, text: '有效', checked: true },
          { value: 0, text: '禁用' }
        ],
        multiple: true,
        fn: (filter, record) => filter.value === null || filter.value === record.status
      }
    },
    { title: '更新人', index: 'updateUserName', width: 150 },
    {
      title: '更新时间',
      index: 'updateAt',
      type: 'date',
      dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
      width: 170,
      sort: { compare: (a, b) => a.updateAt - b.updateAt }
    },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          icon: 'edit',
          type: 'modal',
          modal: { component: AuthRoleEditComponent, params: () => ({ copy: false }), size: 1800 },
          click: () => this.getData()
        },
        {
          text: '复制',
          icon: 'copy',
          type: 'modal',
          modal: { component: AuthRoleEditComponent, params: () => ({ copy: true }), size: 1800 },
          click: () => this.getData()
        },
        {
          text: '授权',
          icon: 'audit',
          type: 'modal',
          modal: { component: AuthRoleGrantComponent },
          click: () => this.getData()
        },
        {
          text: '变更历史',
          icon: 'history',
          type: 'modal',
          modal: {
            component: LogComponent,
            params: record => ({
              title: `查看角色${record.roleName}变更历史`,
              url: `auth/role/${record.roleId}/log`,
              columns: [
                { title: '角色ID', index: 'roleId', width: 100 },
                { title: '角色名', index: 'roleName', width: 150 },
                { title: '说明', index: 'description' },
                { title: '状态', index: 'status', width: 100 },
                { title: '更新人', index: 'updateUserName', width: 150 },
                { title: '更新时间', index: 'updateAt', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS', width: 170 }
              ]
            }),
            size: 1800
          },
          click: (record, modal) => this.getData()
        }
      ]
    }
  ];

  constructor(private baseService: BaseService, private roleService: AuthRoleService, private modal: ModalHelper) {}

  ngOnInit(): void {
    console.debug('窗体内高', window.innerHeight);
    this.baseService.menuWebSub.next('auth');
    this.scroll = { y: `${(window.innerHeight - 0).toString()}px` };
    this.getData();
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('auth');
  }

  getData(operateId?: number): void {
    this.roleService.index(operateId).subscribe(roleList => {
      console.debug('res', roleList);
      this.stData = roleList;
      this.dissort = this.stData.length < 2;
    });
  }

  add(): void {
    this.modal.createStatic(AuthRoleEditComponent, { record: false }, { size: 'xl' }).subscribe(() => this.getData());
  }

  edit(record: any, copy: boolean): void {
    this.modal.createStatic(AuthRoleEditComponent, { record, copy }, { size: 'xl' }).subscribe(() => this.getData());
  }

  grant(record: any): void {
    this.modal.createStatic(AuthRoleGrantComponent, { record }, { size: 'xl' }).subscribe(() => this.getData());
  }

  log(record: any): void {
    this.modal
      .createStatic(
        LogComponent,
        {
          title: `查看角色${record.roleName}变更历史`,
          url: `auth/role/${record.roleId}/log`,
          columns: [
            { title: '角色ID', index: 'roleId', width: 100 },
            { title: '角色名', index: 'roleName', width: 150 },
            { title: '说明', index: 'description' },
            { title: '状态', index: 'status', width: 100 },
            { title: '更新人', index: 'updateUserName', width: 150 },
            { title: '更新时间', index: 'updateAt', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS', width: 170 }
          ] as STColumn[]
        },
        { size: 'xl' }
      )
      .subscribe(modal => this.getData(modal));
  }

  sort(): void {
    this.modal
      .createStatic(SortComponent, {
        title: '角色拖动排序',
        titles: ['角色编码', '角色名称', '新排序号'],
        fields: ['roleId', 'roleName', 'index'],
        url: 'auth/role/sort',
        keys: ['roleId'],
        sortData: this.stData.map((item: any) => ({ roleId: item.roleId, roleName: item.roleName }))
      })
      .subscribe(() => this.getData(0));
  }
}
