import { Component, ViewChild, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STComponent, STColumn, STData, STColumnTag } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { SortComponent } from '@shared';

import { AuthRoleService, AuthRoleEditComponent, AuthRoleGrantComponent } from '..';

const statusTag: STColumnTag = {
  0: { text: '禁用', color: 'red' },
  1: { text: '有效', color: 'green' }
};

@Component({
  selector: 'app-auth-role',
  templateUrl: './role.component.html'
})
export class AuthRoleComponent implements OnInit, OnReuseInit {
  dissort = true;
  @ViewChild('st') private readonly st!: STComponent;
  stData: STData[] = [];
  scroll!: { x?: string; y?: string };
  columns: STColumn[] = [
    { title: '角色ID', index: 'roleId', width: 100, sort: { compare: (a, b) => a.roleId - b.roleId } },
    {
      title: '角色名',
      index: 'roleName',
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
    { title: '状态', index: 'status', width: 100, sort: { compare: (a, b) => a.status - b.status }, type: 'tag', tag: statusTag },
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
          modal: { component: AuthRoleEditComponent, params: () => ({ copy: false }) },
          click: () => this.getData()
        },
        {
          text: '复制',
          icon: 'copy',
          type: 'modal',
          modal: { component: AuthRoleEditComponent, params: () => ({ copy: true }) },
          click: () => this.getData()
        },
        {
          text: '授权',
          icon: 'audit',
          type: 'modal',
          modal: { component: AuthRoleGrantComponent },
          click: () => this.getData()
        }
      ]
    }
  ];

  constructor(private baseSrv: BaseService, private roleSrv: AuthRoleService, private modal: ModalHelper) {}

  ngOnInit(): void {
    console.debug('窗体内高', window.innerHeight);
    this.baseSrv.menuWebSub.next('auth');
    this.scroll = { y: `${(window.innerHeight - 0).toString()}px` };
    this.getData();
  }

  _onReuseInit(): void {
    this.baseSrv.menuWebSub.next('auth');
  }

  getData(operateId?: number): void {
    this.roleSrv.index(operateId).subscribe(roleList => {
      console.debug('res', roleList);
      this.stData = roleList;
      this.dissort = this.stData.length < 2;
    });
  }

  add(): void {
    this.modal.createStatic(AuthRoleEditComponent, { record: false }, { size: 'xl' }).subscribe(() => this.getData());
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
