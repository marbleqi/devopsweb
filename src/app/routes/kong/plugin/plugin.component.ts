import { Component } from '@angular/core';
import { STColumn, STColumnTag, STData, STChange } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { Result, LogComponent } from '@shared';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { zip } from 'rxjs';

import { KongHostService, KongProjectService, KongRouteService, KongPluginService, KongPluginEditComponent } from '..';

@Component({
  selector: 'app-kong-plugin',
  templateUrl: './plugin.component.html'
})
export class KongPluginComponent {
  disremove: boolean = true;
  hostId!: number;
  status!: number;
  columns: STColumn[] = [
    { type: 'checkbox' },
    {
      title: '名称',
      render: 'name',
      sort: { compare: (a, b) => a.config.name.localeCompare(b.config.name) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.name.indexOf(filter.value) !== -1 }
    },
    {
      title: '路由',
      index: 'routeName',
      sort: { compare: (a, b) => a.routeName.localeCompare(b.routeName) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.routeName.indexOf(filter.value) !== -1 }
    },
    { title: '协议', index: 'config.protocols' },
    {
      title: '状态',
      index: 'config.enabled',
      type: 'tag',
      tag: {
        true: { text: '有效', color: 'green' },
        false: { text: '禁用', color: 'red' }
      } as STColumnTag,
      filter: {
        menus: [
          { value: true, text: '有效' },
          { value: false, text: '禁用' }
        ],
        multiple: true,
        fn: (filter, record) => filter.value === null || filter.value === record.config.enabled
      }
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
   * @param kongPluginService 插件服务
   * @param messageService 消息服务
   * @param modal 模式对话框
   */
  constructor(
    private kongHostService: KongHostService,
    private kongProjectService: KongProjectService,
    private kongRouteService: KongRouteService,
    private kongPluginService: KongPluginService,
    private messageService: NzMessageService,
    private modal: ModalHelper
  ) {}

  hostChange(value: number): void {
    this.hostId = value;
    this.kongHostService.hostId = value;
    this.getData();
  }

  sync(): void {
    this.kongProjectService.sync(this.hostId, 'plugin').subscribe((res: Result) => {
      console.debug('同步结果', res);
      if (res.code) {
        this.messageService.warning(res.msg);
      } else {
        this.getData();
      }
    });
  }

  getData(): void {
    zip(this.kongPluginService.index(this.hostId), this.kongRouteService.index(this.hostId)).subscribe(
      ([pluginList, routeList]: [any[], any[]]) => {
        console.debug('处理前的数据', pluginList, routeList);
        this.data = pluginList.map(item => {
          return {
            ...item,
            routeName: item.config.route ? this.kongRouteService.routeMap.get(item.config.route.id).config.name : ''
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
    this.modal.createStatic(KongPluginEditComponent, { hostId: this.hostId }, { size: 1800 }).subscribe(() => this.getData());
  }

  edit(id: string, copy: boolean): void {
    this.modal.createStatic(KongPluginEditComponent, { hostId: this.hostId, id, copy }, { size: 1800 }).subscribe(() => this.getData());
  }

  log(record: any): void {
    this.modal
      .createStatic(
        LogComponent,
        {
          title: `查看插件${record.config.name}变更历史`,
          url: `kong/plugin/${this.hostId}/${record.id}/log`,
          columns: [
            { title: '日志ID', index: 'logId', width: 100 },
            { title: '名称', index: 'config.name' },
            { title: '路由', index: 'config.route?.id' },
            { title: '协议', index: 'config.protocols' },
            { title: '状态', index: 'config.enabled' },
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
      this.kongProjectService.remove(this.hostId, 'plugin', id).subscribe((res: any) => {
        if (res.code === 0) {
          this.messageService.success(`删除插件${id}成功！`);
          this.getData();
        }
      });
    } else {
      const allnum = this.checkRecords.length;
      let curnum = 0;
      for (const item of this.checkRecords) {
        this.kongProjectService.remove(this.hostId, 'plugin', item['id']).subscribe((res: any) => {
          if (res.code === 0) {
            this.messageService.success(`删除插件${item['id']}成功！`);
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
