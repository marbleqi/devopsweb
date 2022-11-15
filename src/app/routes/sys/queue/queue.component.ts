import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData, STChange, STComponent } from '@delon/abc/st';
import { SFSchema, SFUISchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { SysQueueService, SysQueueViewComponent } from '..';

@Component({
  selector: 'app-sys-queue',
  templateUrl: './queue.component.html'
})
export class SysQueueComponent implements OnInit {
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
  scroll!: { x?: string; y?: string };
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

  constructor(private queueService: SysQueueService, private msgService: NzMessageService, private baseService: BaseService) {}

  ngOnInit(): void {
    console.debug('窗体内高', window.innerHeight);
    this.baseService.menuWebSub.next('sys');
    this.scroll = { y: `${(window.innerHeight - 0).toString()}px` };
    this.i = {
      types: ['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'],
      range: [Date.now() - 86400000, Date.now()],
      asc: true
    };
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('sys');
  }

  getdata(value?: any): void {
    if (value) {
      this.value = value;
    }
    this.queueService.index(this.value).subscribe((data: STData[]) => {
      console.debug('data', data);
      this.stData = data;
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
        this.msgService.warning(`删除任务失败`);
      } else {
        this.msgService.success(`删除任务成功`);
        this.getdata();
      }
    });
  }

  clean(): void {
    this.queueService.clean().subscribe(res => {
      if (res.code) {
        this.msgService.warning(`清理任务失败`);
      } else {
        this.msgService.success(`清理任务成功`);
        this.getdata();
      }
    });
  }
}
