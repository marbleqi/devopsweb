import { Component } from '@angular/core';
import { STColumn, STColumnTag, STData, STChange } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { Result, LogComponent } from '@shared';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { KongHostService, KongProjectService, KongUpstreamService, KongUpstreamEditComponent } from '..';

@Component({
  selector: 'app-kong-upstream',
  templateUrl: './upstream.component.html'
})
export class KongUpstreamComponent {
  disremove: boolean = true;
  hostId!: number;
  status!: number;
  columns: STColumn[] = [
    { type: 'checkbox' },
    {
      title: '名称',
      render: 'name',
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.name.indexOf(filter.value) !== -1 }
    },
    { title: '标签', index: 'config.tags' },
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
          { value: 1, text: '有效', checked: true },
          { value: 0, text: '已删除' }
        ],
        multiple: true,
        fn: (filter, record) => filter.value === null || filter.value === record.status
      }
    },
    {
      title: '创建时间',
      width: 150,
      sort: { compare: (a, b) => a.config.created_at - b.config.created_at },
      format: item => format(fromUnixTime(item.config.created_at), 'yyyy-MM-dd HH:mm:ss')
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

  /**
   * 构造函数
   *
   * @param kongProjectService 对象服务
   * @param kongUpstreamService 上游服务
   * @param messageService 消息服务
   * @param modal 模式对话框
   */
  constructor(
    private kongHostService: KongHostService,
    private kongProjectService: KongProjectService,
    private kongUpstreamService: KongUpstreamService,
    private messageService: NzMessageService,
    private modal: ModalHelper
  ) {}

  hostChange(value: number): void {
    this.hostId = value;
    this.kongHostService.hostId = value;
    this.getData();
  }

  sync(): void {
    this.kongProjectService.sync(this.hostId, 'upstream').subscribe((res: Result) => {
      console.debug('同步结果', res);
      if (res.code) {
        this.messageService.warning(res.msg);
      } else {
        this.getData();
      }
    });
  }

  getData(): void {
    this.kongUpstreamService.index(this.hostId).subscribe((data: any[]) => {
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
    this.modal.createStatic(KongUpstreamEditComponent, { hostId: this.hostId }).subscribe(() => this.getData());
  }

  edit(id: string, copy: boolean): void {
    this.modal.createStatic(KongUpstreamEditComponent, { hostId: this.hostId, id, copy }).subscribe(() => this.getData());
  }

  log(record: any): void {
    this.modal
      .createStatic(
        LogComponent,
        {
          title: `查看上游${record.config.name}变更历史`,
          url: `kong/upstream/${this.hostId}/${record.id}/log`,
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

  remove(id?: string): void {
    console.debug('删除ID', id);
    if (id) {
      this.kongProjectService.remove(this.hostId, 'upstream', id).subscribe((res: any) => {
        if (res.code === 0) {
          this.messageService.success(`删除上游${id}成功！`);
          this.getData();
        }
      });
    } else {
      const allNum = this.checkRecords.length;
      let curNum = 0;
      for (const item of this.checkRecords) {
        this.kongProjectService.remove(this.hostId, 'upstream', item['id']).subscribe((res: any) => {
          if (res.code === 0) {
            this.messageService.success(`删除上游${item['id']}成功！`);
          }
          curNum++;
          if (allNum === curNum) {
            this.getData();
          }
        });
      }
    }
  }
}
