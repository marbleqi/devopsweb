import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData } from '@delon/abc/st';

import { AuthAbilityService, AuthAbilityGrantComponent } from '..';

@Component({
  selector: 'app-auth-ability',
  templateUrl: './ability.component.html'
})
export class AuthAbilityComponent implements OnInit, OnReuseInit {
  stData: STData[] = [];
  scroll!: { x?: string; y?: string };
  columns: STColumn[] = [
    { title: '权限点ID', index: 'id', width: 100, sort: { compare: (a, b) => a.id - b.id } },
    { title: '上级权限点ID', index: 'pid', width: 150, sort: { compare: (a, b) => a.pid - b.pid } },
    {
      title: '权限',
      index: 'name',
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

  constructor(private abilitySrv: AuthAbilityService, private baseSrv: BaseService) {}

  ngOnInit(): void {
    console.debug('窗体内高', window.innerHeight);
    this.baseSrv.menuChange('auth');
    this.scroll = { y: `${(window.innerHeight - 0).toString()}px` };
    this.getData();
  }

  _onReuseInit(): void {
    this.baseSrv.menuChange('auth');
  }

  getData(): void {
    console.debug('刷新');
    this.abilitySrv.index().subscribe(res => {
      this.stData = res;
    });
  }
}
