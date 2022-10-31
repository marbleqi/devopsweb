import { Component, ViewChild, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STComponent, STColumn, STData, STColumnTag } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { LogComponent, SortComponent } from '@shared';

import { KongHostService, KongHostEditComponent } from '..';

const statusTag: STColumnTag = {
  0: { text: '禁用', color: 'red' },
  1: { text: '有效', color: 'green' }
};

@Component({
  selector: 'app-kong-host',
  templateUrl: './host.component.html'
})
export class KongHostComponent implements OnInit, OnReuseInit {
  dissort = true;
  @ViewChild('st') private readonly st!: STComponent;
  stData: STData[] = [];
  scroll!: { x?: string; y?: string };
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

  constructor(private baseSrv: BaseService, private hostSrv: KongHostService, private modal: ModalHelper) {}

  ngOnInit(): void {
    console.debug('窗体内高', window.innerHeight);
    this.baseSrv.menuWebSub.next('kong');
    this.scroll = { y: `${(window.innerHeight - 0).toString()}px` };
    this.getData();
  }

  _onReuseInit(): void {
    this.baseSrv.menuWebSub.next('kong');
  }

  getData(operateId?: number): void {
    this.hostSrv.index(operateId).subscribe(roleList => {
      console.debug('res', roleList);
      this.stData = roleList;
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