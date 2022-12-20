import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData } from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { ModalHelper } from '@delon/theme';

import { AuthAbilityService, AuthAbilityGrantComponent } from '..';

@Component({
  selector: 'app-auth-ability',
  templateUrl: './ability.component.html'
})
export class AuthAbilityComponent implements OnInit, OnReuseInit {
  stData: STData[] = [];
  columns: STColumn[] = [
    { title: '权限点ID', index: 'id', width: 100, sort: { compare: (a, b) => a.id - b.id } },
    { title: '上级权限点ID', index: 'pid', width: 150, sort: { compare: (a, b) => a.pid - b.pid } },
    {
      title: '权限',
      render: 'name',
      width: 150,
      sort: { compare: (a, b) => a.name.localeCompare(b.name) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.name.includes(filter.value) }
    },
    {
      title: '权限说明',
      index: 'description',
      sort: { compare: (a, b) => a.description.localeCompare(b.description) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.description.includes(filter.value) }
    },
    {
      title: '类型',
      index: 'type',
      filter: {
        menus: [
          { value: '模块', text: '模块' },
          { value: '对象', text: '对象' },
          { value: '接口', text: '接口' }
        ],
        multiple: true,
        fn: (filter, record) => filter.value === null || record.type === filter.value
      }
    },
    {
      title: '模块',
      index: 'moduleName',
      sort: { compare: (a, b) => a.moduleName.localeCompare(b.moduleName) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.description.includes(filter.value) }
    },
    {
      title: '对象',
      index: 'objectName',
      sort: { compare: (a, b) => a.objectName.localeCompare(b.objectName) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.description.includes(filter.value) }
    },
    {
      title: '操作',
      buttons: [
        {
          text: '菜单授权',
          icon: 'audit',
          type: 'modal',
          modal: { component: AuthAbilityGrantComponent, params: () => ({ grantType: 'menu' }) },
          click: () => this.getData()
        },
        {
          text: '角色授权',
          icon: 'audit',
          type: 'modal',
          modal: { component: AuthAbilityGrantComponent, params: () => ({ grantType: 'role' }) },
          click: () => this.getData()
        }
      ]
    }
  ];

  constructor(
    private abilityService: AuthAbilityService,
    private baseService: BaseService,
    private xlsxService: XlsxService,
    private modal: ModalHelper
  ) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('auth');
    this.getData();
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('auth');
  }

  getData(): void {
    this.abilityService.index().subscribe(res => {
      this.stData = res;
    });
  }

  export() {
    const data = [['权限点ID', '上级权限点ID', '权限', '权限说明', '类型', '模块', '对象']];
    for (const routeItem of this.stData) {
      data.push([
        routeItem['id'],
        routeItem['pid'],
        routeItem['name'],
        routeItem['description'],
        routeItem['type'],
        routeItem['moduleName'],
        routeItem['objectName']
      ]);
    }
    this.xlsxService.export({
      sheets: [
        {
          data,
          name: '权限点清单记录'
        }
      ],
      filename: '权限点清单记录.xlsx'
    });
  }

  edit(record: any, grantType: string): void {
    this.modal.createStatic(AuthAbilityGrantComponent, { record, grantType }, { size: 'xl' }).subscribe(() => this.getData());
  }
}
