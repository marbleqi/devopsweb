import { Component } from '@angular/core';
import { STColumn, STColumnTag, STData, STChange } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { Result, LogComponent } from '@shared';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { zip } from 'rxjs';

import {
  KongHostService,
  KongProjectService,
  KongServiceService,
  KongRouteService,
  KongServiceEditComponent,
  KongRouteEditComponent
} from '..';

@Component({
  selector: 'app-kong-route',
  templateUrl: './route.component.html'
})
export class KongRouteComponent {
  disremove: boolean = true;
  hostId!: number;
  columns: STColumn[] = [
    { type: 'checkbox' },
    {
      title: '路由',
      render: 'route',
      sort: { compare: (a, b) => a.config.name.localeCompare(b.config.name) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.name.indexOf(filter.value) !== -1 }
    },
    {
      title: '服务',
      render: 'service',
      sort: {
        compare: (a, b) => a.serviceName.localeCompare(b.serviceName)
      },
      filter: {
        type: 'keyword',
        fn: (filter, record) => !filter.value || (record?.service_name && record.service_name.indexOf(filter.value) !== -1)
      }
    },
    {
      title: '域名',
      render: 'hosts',
      sort: { compare: (a, b) => a.config.hosts.join().localeCompare(b.config.hosts.join()) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.hosts.join().indexOf(filter.value) !== -1 }
    },
    { title: '域名个数', format: item => item.config.hosts.length.toString() },
    {
      title: '路径',
      index: 'config.paths',
      sort: { compare: (a, b) => a.config.paths.join().localeCompare(b.config.paths.join()) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.paths.join().indexOf(filter.value) !== -1 }
    },
    {
      title: '状态',
      index: 'status',
      width: 100,
      sort: { compare: (a, b) => a.status - b.status },
      type: 'tag',
      tag: {
        1: { text: '有效', color: 'green' },
        0: { text: '已删除', color: 'red' }
      } as STColumnTag,
      filter: {
        menus: [
          { value: 1, text: '有效' },
          { value: 0, text: '已删除' }
        ],
        multiple: true,
        fn: (filter, record) => filter.value === null || filter.value === record.status
      }
    },
    {
      title: '创建时间',
      sort: { compare: (a, b) => a.config.created_at - b.config.created_at },
      format: item => format(fromUnixTime(item.config.created_at), 'yyyy-MM-dd HH:mm:ss')
    },
    {
      title: '更新时间',
      sort: { compare: (a, b) => a.config.updated_at - b.config.updated_at },
      format: item => format(fromUnixTime(item.config.updated_at), 'yyyy-MM-dd HH:mm:ss')
    },
    { title: '同步操作人', index: 'updateUserName' },
    {
      title: '同步时间',
      index: 'updateAt',
      type: 'date',
      dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
      width: 170,
      sort: { compare: (a, b) => a.updateAt - b.updateAt }
    }
  ];
  data: STData[] = [];
  checkRecords: STData[] = [];

  constructor(
    private kongHostService: KongHostService,
    private kongProjectService: KongProjectService,
    private kongServiceService: KongServiceService,
    private kongRouteService: KongRouteService,
    private messageService: NzMessageService,
    private modal: ModalHelper
  ) {}

  hostChange(value: number): void {
    this.hostId = value;
    this.kongHostService.hostId = value;
    this.getData();
  }

  sync(): void {
    this.kongProjectService.sync(this.hostId, 'route').subscribe(res => {
      console.debug('同步结果', res);
      if (res.code) {
        this.messageService.warning(res.msg);
      } else {
        this.getData();
      }
    });
  }

  getData(): void {
    zip(this.kongRouteService.index(this.hostId), this.kongServiceService.index(this.hostId)).subscribe(
      ([routeList, serviceList]: [any[], any[]]) => {
        console.debug('处理前的数据', routeList, serviceList);
        this.data = routeList.map(item => {
          return {
            ...item,
            serviceName: item.config.service ? this.kongServiceService.serviceMap.get(item.config.service.id).config.name : ''
          };
        });
        console.debug('处理后的数据', this.data);
      }
    );
  }

  change(e: STChange): void {
    if (e.checkbox) {
      this.checkRecords = e.checkbox;
      this.disremove = this.checkRecords.length === 0;
    }
  }

  add(): void {
    this.modal.createStatic(KongRouteEditComponent, { hostId: this.hostId }).subscribe(() => this.getData());
  }

  edit(type: 'route' | 'service', record: any, copy: boolean): void {
    if (type === 'route') {
      this.modal.createStatic(KongRouteEditComponent, { hostId: this.hostId, id: record.id, copy }).subscribe(() => this.getData());
    } else {
      this.modal
        .createStatic(KongServiceEditComponent, { hostId: this.hostId, id: record.config.service.id, copy })
        .subscribe(() => this.getData());
    }
  }

  log(type: 'route' | 'service', record: any): void {
    if (type === 'route') {
      this.modal
        .createStatic(
          LogComponent,
          {
            title: `查看路由${record.config.name}变更历史`,
            url: `kong/route/${this.hostId}/${record.id}/log`,
            columns: [
              { title: '日志ID', index: 'logId', width: 100 },
              { title: '名称', index: 'config.name', width: 100 },
              { title: '状态', index: 'status', width: 150 },
              { title: '同步操作人', index: 'updateUserName', width: 150 },
              { title: '同步时间', index: 'updateAt', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS', width: 170 }
            ] as STColumn[]
          },
          { size: 'xl' }
        )
        .subscribe(() => this.getData());
    } else {
      this.modal
        .createStatic(
          LogComponent,
          {
            title: `查看服务${record.serviceName}变更历史`,
            url: `kong/service/${this.hostId}/${record.config.service.id}/log`,
            columns: [
              { title: '日志ID', index: 'logId', width: 100 },
              { title: '名称', index: 'config.name', width: 100 },
              { title: '状态', index: 'status', width: 150 },
              { title: '更新人', index: 'updateUserName', width: 150 },
              { title: '更新时间', index: 'updateAt', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS', width: 170 }
            ] as STColumn[]
          },
          { size: 'xl' }
        )
        .subscribe(() => this.getData());
    }
  }

  remove(record?: any, type: 'route' | 'service' = 'route'): void {
    if (type === 'service' && record) {
      this.kongProjectService.remove(this.hostId, 'service', record.config.service.id).subscribe((res: Result) => {
        if (res.code) {
          this.messageService.warning(res.msg);
        } else {
          this.messageService.success('删除成功！');
        }
      });
    }
    if (record) {
      this.checkRecords = [record];
    }
    const allNum = this.checkRecords.length;
    let curNum = 0;
    for (const item of this.checkRecords) {
      this.kongProjectService.remove(this.hostId, 'route', item['id']).subscribe((res: Result) => {
        if (res.code) {
          this.messageService.warning(res.msg);
        } else {
          this.messageService.success('删除成功！');
        }
        curNum++;
        if (allNum === curNum) {
          this.getData();
        }
      });
    }
  }
}
