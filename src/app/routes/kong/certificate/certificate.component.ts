import { Component } from '@angular/core';
import { STColumn, STColumnTag, STData, STChange } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { Result, LogComponent } from '@shared';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { KongHostService, KongProjectService, KongCertificateService, KongCertificateEditComponent } from '..';

@Component({
  selector: 'app-kong-certificate',
  templateUrl: './certificate.component.html'
})
export class KongCertificateComponent {
  disremove: boolean = true;
  hostId!: number;
  status!: number;
  columns: STColumn[] = [
    { type: 'checkbox' },
    {
      title: '域名',
      render: 'snis',
      sort: { compare: (a, b) => a.config.snis.join().localeCompare(b.config.snis.join()) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.snis.join().indexOf(filter.value) !== -1 }
    },
    { title: '域名个数', format: item => item.config.snis.length.toString() },
    { title: '标签', index: 'config.tags' },
    {
      title: '状态',
      index: 'status',
      width: 100,
      sort: { compare: (a, b) => a.status - b.status },
      type: 'tag',
      tag: {
        1: { text: '有效', color: 'green' },
        0: { text: '停用', color: 'red' }
      } as STColumnTag,
      filter: {
        menus: [
          { value: 1, text: '有效' },
          { value: 0, text: '停用' }
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
    },
    {
      title: '操作',
      buttons: [{ text: '删除', icon: 'delete', type: 'del', click: record => this.remove(record) }]
    }
  ];
  data: STData[] = [];
  checkRecords: STData[] = [];

  /**
   * 构造函数
   *
   * @param kongProjectService 对象服务
   * @param kongCertificateService 上游服务
   * @param messageService 消息服务
   * @param modal 模式对话框
   */
  constructor(
    private kongHostService: KongHostService,
    private kongProjectService: KongProjectService,
    private kongCertificateService: KongCertificateService,
    private messageService: NzMessageService,
    private modal: ModalHelper
  ) {}

  hostChange(value: number): void {
    this.hostId = value;
    this.kongHostService.hostId = value;
    this.getData();
  }

  sync(): void {
    this.kongProjectService.sync(this.hostId, 'certificate').subscribe((res: Result) => {
      console.debug('同步结果', res);
      if (res.code) {
        this.messageService.warning(res.msg);
      } else {
        this.getData();
      }
    });
  }

  getData(): void {
    this.kongCertificateService.index(this.hostId).subscribe((data: any[]) => {
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
    this.modal.createStatic(KongCertificateEditComponent, { hostId: this.hostId }).subscribe(() => this.getData());
  }

  edit(id: string, copy: boolean): void {
    this.modal.createStatic(KongCertificateEditComponent, { hostId: this.hostId, id, copy }).subscribe(() => this.getData());
  }

  log(record: any): void {
    this.modal
      .createStatic(
        LogComponent,
        {
          title: `查看证书${record.config.name}变更历史`,
          url: `kong/certificate/${this.hostId}/${record.id}/log`,
          columns: [
            { title: '日志ID', index: 'logId', width: 100 },
            { title: '域名', format: item => item.config.snis.join() },
            { title: '状态', index: 'status', width: 150 },
            { title: '更新人', index: 'updateUserName', width: 150 },
            { title: '更新时间', index: 'updateAt', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS', width: 170 }
          ] as STColumn[]
        },
        { size: 'xl' }
      )
      .subscribe(() => this.getData());
  }

  remove(id?: string): void {
    console.debug('删除ID', id);
    if (id) {
      this.kongProjectService.remove(this.hostId, 'certificate', id).subscribe((res: any) => {
        if (res.code === 0) {
          this.messageService.success(`删除证书${id}成功！`);
          this.getData();
        }
      });
    } else {
      const allnum = this.checkRecords.length;
      let curnum = 0;
      for (const item of this.checkRecords) {
        this.kongProjectService.remove(this.hostId, 'certificate', item['id']).subscribe((res: any) => {
          if (res.code === 0) {
            this.messageService.success(`删除证书${item['id']}成功！`);
          }
          curnum++;
          if (allnum === curnum) {
            this.getData();
          }
        });
      }
    }
  }
}
