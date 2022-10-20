import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { format } from 'date-fns';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-sys-queue-view',
  templateUrl: './view.component.html'
})
export class SysQueueViewComponent implements OnInit {
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      id: { type: 'string', title: '任务ID' },
      name: { type: 'string', title: '任务名称' },
      timestamp: { type: 'string', title: '时间戳' },
      data: { type: 'string', title: '任务数据', readOnly: true }
    }
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 8 } },
    $id: { widget: 'text' },
    $name: { widget: 'text' },
    $timestamp: { widget: 'text' },
    $data: { widget: 'textarea', grid: { span: 24 } }
  };

  constructor(private modal: NzModalRef) {}

  ngOnInit(): void {
    this.i = { ...this.record, timestamp: format(this.record.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS') };
  }
  close(): void {
    this.modal.destroy();
  }
}
