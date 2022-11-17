import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { KongHostService, KongUpstreamService, KongTargetService } from '../..';

@Component({
  selector: 'app-kong-target-edit',
  templateUrl: './edit.component.html'
})
export class KongTargetEditComponent implements OnInit {
  hostId!: number;
  upstreamId!: string;
  title!: string;
  buttonName!: string;
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      target: { type: 'string', title: '目标' },
      weight: { type: 'number', title: '权重' },
      tags: { type: 'string', title: '标签' },
      created_at: { type: 'string', title: '创建时间' }
    },
    required: ['target', 'weight']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 24 } },
    $tags: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
    $created_at: { widget: 'text' }
  };

  constructor(private kongTargetService: KongTargetService, private modal: NzModalRef, private messageService: NzMessageService) {}

  ngOnInit(): void {
    if (this.record) {
      this.title = '目标另存为';
      this.buttonName = '另存为';
      this.i = { ...this.record, created_at: format(this.record.created_at * 1000, 'yyyy-MM-dd HH:mm:ss') };
    } else {
      this.title = '创建目标';
      this.buttonName = '创建';
      this.i = {};
    }
  }

  saveas(value: any): void {
    this.kongTargetService
      .create(this.hostId, this.upstreamId, {
        target: value.target,
        weight: value.weight,
        tags: value.tags
      })
      .subscribe(res => {
        if (res.code === 0) {
          this.messageService.success('创建成功');
          this.modal.close(true);
        }
      });
  }

  close(): void {
    this.modal.destroy();
  }
}
