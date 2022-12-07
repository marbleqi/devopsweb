import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData, STChange } from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { SFSchema, SFUISchema } from '@delon/form';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { SysQueueService, SysQueueViewComponent } from '..';

@Component({
  selector: 'app-sys-queue',
  templateUrl: './queue.component.html'
})
export class SysQueueComponent implements OnInit, OnReuseInit {
  disremove = true;
  i: any;
  value: any;
  schema: SFSchema = {
    properties: {
      types: {
        type: 'string',
        title: '任务状态',
        enum: [
          { label: '活动中', value: 'active' },
          { label: '已完成', value: 'completed' },
          { label: '已延迟', value: 'delayed' },
          { label: '已失败', value: 'failed' },
          { label: '已暂停', value: 'paused' },
          { label: '等待中', value: 'waiting' }
        ]
      },
      range: { type: 'number', title: '创建时间' },
      asc: {
        type: 'boolean',
        title: '排序',
        enum: [
          { value: true, label: '升序' },
          { value: false, label: '降序' }
        ]
      }
    }
  };
  ui: SFUISchema = {
    $types: { widget: 'select', mode: 'multiple', width: 550 },
    $range: {
      widget: 'date',
      mode: 'range',
      rangeMode: 'date',
      showTime: true,
      displayFormat: 'yyyy-MM-dd HH:mm:ss',
      disabledDate: (current: Date) => current > new Date()
    },
    $asc: { widget: 'select' }
  };
  stData: STData[] = [];
  checkData: STData[] = [];
  columns: STColumn[] = [
    { type: 'checkbox' },
    {
      title: 'ID',
      index: 'id',
      width: 100,
      sort: { compare: (a, b) => Number(a.id) - Number(b.id) }
    },
    { title: '任务名称', index: 'name', width: 150, sort: { compare: (a, b) => a.name - b.name } },
    {
      title: '时间戳',
      index: 'timestamp',
      type: 'date',
      dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
      width: 170,
      sort: { compare: (a, b) => a.timestamp - b.timestamp }
    },
    { title: '操作', buttons: [{ text: '查看', icon: 'file', type: 'modal', modal: { component: SysQueueViewComponent } }] }
  ];

  constructor(
    private queueService: SysQueueService,
    private xlsxService: XlsxService,
    private messageService: NzMessageService,
    private baseService: BaseService
  ) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('sys');
    this.i = {
      types: ['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'],
      range: [Date.now() - 86400000, Date.now()],
      asc: true
    };
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('sys');
  }

  getData(value?: any): void {
    if (value) {
      this.value = value;
    }
    this.queueService.index(this.value).subscribe((data: STData[]) => {
      console.debug('data', data);
      this.stData = data;
    });
  }

  export() {
    const data = [['任务ID', '任务名', '时间戳']];
    for (const jobItem of this.stData) {
      data.push([jobItem['id'], jobItem['name'], format(jobItem['timestamp'], 'yyyy-MM-dd HH:mm:ss.SSS')]);
    }
    console.debug('data', data);
    this.xlsxService.export({
      sheets: [
        {
          data,
          name: '消息队列记录'
        }
      ],
      filename: '消息队列记录.xlsx'
    });
  }

  change(value: STChange) {
    if (value.type === 'checkbox') {
      this.checkData = value.checkbox as STData[];
      this.disremove = this.checkData.length === 0;
      console.debug(this.checkData);
    }
  }

  remove(record?: STData): void {
    if (record) {
      this.checkData = [record];
    }
    this.queueService.remove({ idlist: this.checkData.map(item => item['id']) }).subscribe(res => {
      if (res.code) {
        this.messageService.warning(`删除任务失败`);
      } else {
        this.messageService.success(`删除任务成功`);
        this.getData();
      }
    });
  }

  clean(): void {
    this.queueService.clean().subscribe(res => {
      if (res.code) {
        this.messageService.warning(`清理任务失败`);
      } else {
        this.messageService.success(`清理任务成功`);
        this.getData();
      }
    });
  }
}
