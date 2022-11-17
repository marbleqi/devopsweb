import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseService } from '@core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { map } from 'rxjs';

import { KongHostService, KongProjectService } from '../..';

@Component({
  selector: 'app-kong-upstream-edit',
  templateUrl: './edit.component.html'
})
export class KongUpstreamEditComponent implements OnInit {
  hostId!: number;
  loading = false;
  copy: boolean | undefined;
  title: string | undefined;
  updatable!: boolean;
  creatable!: boolean;
  buttonName!: string;
  id: any;
  i: any;
  @ViewChild('sf') private sf!: SFComponent;
  schema: SFSchema = {
    properties: {
      hostId: { type: 'number', title: '站点' },
      config: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '名称' },
          created_at: { type: 'string', title: '创建时间' }
        },
        required: ['name']
      },
      createUserName: { type: 'string', title: '首次同步人' },
      createAt: { type: 'string', title: '首次同步时间' },
      updateUserName: { type: 'string', title: '最后同步人' },
      updateAt: { type: 'string', title: '最后同步时间' },
      operateId: { type: 'number', title: '操作序号' }
    }
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 12 } },
    $hostId: {
      widget: 'select',
      mode: 'default',
      hidden: false,
      asyncData: () => this.kongHostService.index().pipe(map(res => res.map((item: any) => ({ label: item.name, value: item.hostId }))))
    },
    $config: {
      grid: { span: 24 },
      $created_at: { widget: 'text' }
    },
    $createUserName: { widget: 'text' },
    $createAt: { widget: 'text' },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $operateId: { widget: 'text' }
  };

  constructor(
    private baseService: BaseService,
    private kongHostService: KongHostService,
    private kongProjectService: KongProjectService,
    private modal: NzModalRef,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    console.debug('初始化数据', this.hostId, this.id);
    // 根据传入的操作方式，初始化标题及按钮
    if (this.id) {
      if (this.copy) {
        this.title = `上游另存为`;
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '另存为';
      } else {
        this.title = `编辑上游`;
        this.updatable = true;
        this.creatable = false;
        this.buttonName = '';
        this.ui['$hostId'].hidden = true;
      }
      this.kongProjectService.show(this.hostId, 'upstream', this.id).subscribe(res => {
        if (res.apidata) {
          if (res.dbdata) {
            this.i = {
              ...res.dbdata,
              config: {
                ...res.apidata,
                created_at: format(fromUnixTime(res.apidata.created_at), 'yyyy-MM-dd HH:mm:ss')
              },
              createUserName: this.baseService.userName(res.dbdata.createUserId),
              createAt: format(res.dbdata.createAt, 'yyyy-MM-dd HH:mm:ss.SSS'),
              updateUserName: this.baseService.userName(res.dbdata.updateUserId),
              updateAt: format(res.dbdata.updateAt, 'yyyy-MM-dd HH:mm:ss.SSS')
            };
          } else {
            this.i = {
              hostId: this.hostId,
              id: this.id,
              config: {
                ...res.apidata,
                created_at: format(fromUnixTime(res.apidata.created_at), 'yyyy-MM-dd HH:mm:ss')
              }
            };
          }
        } else if (res.dbdata) {
          this.i = res.dbdata;
        } else {
          this.i = {};
        }
      });
    } else {
      this.title = `创建上游`;
      this.updatable = false;
      this.creatable = true;
      this.buttonName = '创建';
      this.i = { hostId: this.hostId };
    }
  }

  params(value: any): any {
    return { name: value.config.name };
  }

  saveas(value: any): void {
    this.loading = true;
    this.kongProjectService.create(value.hostId, 'upstream', this.params(value)).subscribe(res => {
      if (res.code) {
        this.messageService.error(res.msg);
      } else {
        this.messageService.success(res.msg);
        this.modal.close(true);
      }
      this.loading = false;
    });
  }

  save(value: any): void {
    this.loading = true;
    this.kongProjectService.update(value.hostId, 'upstream', this.id, this.params(value)).subscribe(res => {
      if (res.code) {
        this.messageService.error(res.msg);
      } else {
        this.messageService.success(res.msg);
        this.modal.close(true);
      }
      this.loading = false;
    });
  }

  close(): void {
    this.modal.destroy(true);
  }
}
