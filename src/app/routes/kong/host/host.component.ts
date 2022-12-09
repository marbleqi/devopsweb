import { Component, ViewChild, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STComponent, STColumn, STData, STColumnTag } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { LogComponent, SortComponent } from '@shared';

import { KongHostService, KongHostEditComponent } from '..';
@Component({
  selector: 'app-kong-host',
  templateUrl: './host.component.html'
})
export class KongHostComponent implements OnInit, OnReuseInit {
  dissort = true;
  @ViewChild('st') private st!: STComponent;
  stData: STData[] = [];
  columns: STColumn[] = [
    { title: '站点ID', index: 'hostId', width: 100, sort: { compare: (a, b) => a.roleId - b.roleId } },
    {
      title: '站点名',
      index: 'name',
      width: 150,
      sort: { compare: (a, b) => a.name.localeCompare(b.name) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.name.includes(filter.value) }
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
          modal: { component: KongHostEditComponent, params: () => ({ copy: false }), size: 1800 },
          click: () => this.getData()
        },
        {
          text: '复制',
          icon: 'copy',
          type: 'modal',
          modal: { component: KongHostEditComponent, params: () => ({ copy: true }), size: 1800 },
          click: () => this.getData()
        },
        {
          text: '变更历史',
          icon: 'history',
          type: 'modal',
          modal: {
            component: LogComponent,
            params: record => ({
              title: `查看站点${record.name}变更历史`,
              url: `kong/host/${record.hostId}/log`,
              columns: [
                { title: '日志ID', index: 'logId', width: 100 },
                { title: '站点ID', index: 'hostId', width: 100 },
                { title: '站点名', index: 'name', width: 150 },
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

  constructor(private baseService: BaseService, private hostService: KongHostService, private modal: ModalHelper) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('kong');
    this.getData();
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('kong');
  }

  getData(operateId?: number): void {
    this.hostService.index(operateId).subscribe(hostList => {
      this.stData = hostList;
      this.dissort = this.stData.length < 2;
    });
  }

  add(): void {
    this.modal.createStatic(KongHostEditComponent, { record: false }, { size: 'xl' }).subscribe(() => this.getData());
  }

  sort(): void {
    this.modal
      .createStatic(SortComponent, {
        title: '站点拖动排序',
        titles: ['站点编码', '站点名称', '新排序号'],
        fields: ['hostId', 'name', 'index'],
        url: 'kong/host/sort',
        keys: ['hostId'],
        sortData: this.stData.map((item: any) => ({ roleId: item.roleId, roleName: item.roleName }))
      })
      .subscribe(() => this.getData(0));
  }
}
