import { Component } from '@angular/core';
import { STColumn, STColumnTag, STData, STChange } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { Result, LogComponent } from '@shared';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { KongHostService, KongProjectService, KongServiceService, KongServiceEditComponent } from '..';

@Component({
  selector: 'app-kong-service',
  templateUrl: './service.component.html'
})
export class KongServiceComponent {
  disremove: boolean = true;
  hostId!: number;
  columns: STColumn[] = [
    { type: 'checkbox' },
    {
      title: '名称',
      width: 200,
      render: 'name',
      sort: { compare: (a, b) => a.config.name.localeCompare(b.config.name) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.name.indexOf(filter.value) !== -1 }
    },
    { title: '协议', index: 'config.protocol' },
    {
      title: '主机',
      index: 'config.host',
      sort: { compare: (a, b) => a.config.host.localeCompare(b.config.host) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.host.indexOf(filter.value) !== -1 }
    },
    {
      title: '端口',
      index: 'config.port',
      sort: { compare: (a, b) => a.config.port - b.config.port },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.port.toString() === filter.value }
    },
    { title: '路径', index: 'config.path' },
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
    }
  ];
  data: STData[] = [];
  checkRecords: STData[] = [];

  /**
   * 构造函数
   *
   * @param kongProjectService 对象服务
   * @param kongServiceService 服务
   * @param messageService 消息
   * @param modal 对话框
   */
  constructor(
    private kongHostService: KongHostService,
    private kongProjectService: KongProjectService,
    private kongServiceService: KongServiceService,
    private messageService: NzMessageService,
    private modal: ModalHelper
  ) {}

  hostChange(value: number): void {
    this.hostId = value;
    this.kongHostService.hostId = value;
    this.getData();
  }

  sync(): void {
    this.kongProjectService.sync(this.hostId, 'service').subscribe(res => {
      console.debug('同步结果', res);
      if (res.code) {
        this.messageService.warning(res.msg);
      } else {
        this.getData();
      }
    });
  }

  getData(): void {
    this.kongServiceService.index(this.hostId).subscribe((data: any[]) => {
      console.debug('获得数据', data);
      this.data = data;
    });
  }

  change(e: STChange): void {
    if (e.checkbox) {
      this.checkRecords = e.checkbox;
      this.disremove = this.checkRecords.length === 0;
    }
  }

  add(): void {
    this.modal.createStatic(KongServiceEditComponent, { hostId: this.hostId }).subscribe(() => this.getData());
  }

  edit(id: string, copy: boolean): void {
    this.modal.createStatic(KongServiceEditComponent, { hostId: this.hostId, id, copy }).subscribe(() => this.getData());
  }

  log(record: any): void {
    this.modal
      .createStatic(
        LogComponent,
        {
          title: `查看服务${record.config.name}变更历史`,
          url: `kong/service/${this.hostId}/${record.id}/log`,
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
  }

  remove(record?: STData): void {
    if (record) {
      this.checkRecords = [record];
    }
    const allNum = this.checkRecords.length;
    let curNum = 0;
    for (const item of this.checkRecords) {
      this.kongProjectService.remove(this.hostId, 'service', item['id']).subscribe((res: Result) => {
        if (res.code === 0) {
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
