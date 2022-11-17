import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseService } from '@core';
import { LoadingService } from '@delon/abc/loading';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData, STChange } from '@delon/abc/st';
import { SFComponent, SFSchema, SFSchemaEnum, SFUISchema } from '@delon/form';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { Result, LogComponent } from '@shared';
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';

import { KongHostService, KongUpstreamService, KongTargetService, KongTargetEditComponent } from '..';

@Component({
  selector: 'app-kong-target',
  templateUrl: './target.component.html'
})
export class KongTargetComponent implements OnInit, OnReuseInit {
  discreate = true;
  disfresh = true;
  dishistory = true;
  disremove = true;
  hostSubject: Subject<SFSchemaEnum[]>;
  upstreamSubject: Subject<SFSchemaEnum[]>;
  @ViewChild('sf') private readonly sf!: SFComponent;
  hostId!: number;
  upstreamId!: string;
  i: any = null;
  schema: SFSchema = {
    properties: {
      hostId: { type: 'number', title: '站点' },
      upstreamId: { type: 'string', title: '上游' }
    }
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100 },
    $hostId: {
      widget: 'select',
      width: 200,
      mode: 'default',
      asyncData: () => this.hostSubject.asObservable(),
      change: (value: number) => this.hostChange(value)
    },
    $upstreamId: {
      width: 300,
      widget: 'select',
      mode: 'default',
      asyncData: () => this.upstreamSubject.asObservable(),
      change: (value: string) => this.uptreamChange(value)
    }
  };
  checkRecords: STData[] = [];
  stData: STData[] = [];
  columns: STColumn[] = [
    { type: 'checkbox' },
    { title: '目标', render: 'target' },
    { title: '权重', index: 'weight' },
    { title: '标签', index: 'tags' },
    {
      title: '创建时间',
      sort: { compare: (a, b) => a.created_at - b.created_at },
      format: (item, col, index) => format(item.created_at * 1000, 'yyyy-MM-dd HH:mm:ss')
    },
    {
      title: '操作',
      buttons: [
        {
          text: '复制',
          icon: 'copy',
          type: 'modal',
          modal: { component: KongTargetEditComponent, params: () => ({ hostId: this.hostId, upstreamId: this.upstreamId }), size: 'md' },
          click: () => this.getData()
        },
        { text: '删除', icon: 'delete', type: 'del', click: record => this.remove(record) }
      ]
    }
  ];

  constructor(
    private baseService: BaseService,
    private kongHostService: KongHostService,
    private kongUpstreamService: KongUpstreamService,
    private kongTargetService: KongTargetService,
    private messageService: NzMessageService,
    private loadingSrv: LoadingService,
    private modal: ModalHelper
  ) {
    this.hostSubject = new Subject<any[]>();
    this.upstreamSubject = new Subject<any[]>();
  }

  ngOnInit(): void {
    this.baseService.menuWebSub.next('kong');
    this.reload();
    if (this.kongHostService.hostId) {
      this.hostId = this.kongHostService.hostId;
      this.i = { hostId: this.hostId, upstreamId: this.upstreamId };
      this.hostChange(this.kongHostService.hostId);
    }
    if (this.kongTargetService.id) {
      this.upstreamId = this.kongTargetService.id;
      this.getData();
    }
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('kong');
  }

  reload() {
    this.kongHostService
      .index()
      .subscribe((res: any[]) => this.hostSubject.next(res.map((item: any) => ({ label: item.name, value: item.hostId } as SFSchemaEnum))));
  }

  hostChange(value: number): void {
    this.hostId = value;
    this.kongHostService.hostId = value;
    this.kongUpstreamService
      .index(value)
      .subscribe((res: any[]) =>
        this.upstreamSubject.next(res.map((item: any) => ({ label: item.config.name, value: item.id } as SFSchemaEnum)))
      );
  }

  uptreamChange(value: string): void {
    this.disfresh = false;
    this.discreate = false;
    this.dishistory = false;
    this.upstreamId = value;
    this.kongTargetService.id = value;
    this.getData();
  }

  getData(): void {
    this.kongTargetService.index(this.hostId, this.upstreamId).subscribe((res: any[]) => {
      this.stData = res;
      this.checkRecords = [];
      this.loadingSrv.close();
    });
  }

  change(e: STChange): void {
    if (e.checkbox) {
      this.checkRecords = e.checkbox;
      this.disremove = this.checkRecords.length === 0;
    }
  }

  add(): void {
    this.modal
      .createStatic(KongTargetEditComponent, { hostId: this.hostId, upstreamId: this.upstreamId, record: false }, { size: 'md' })
      .subscribe(() => this.getData());
  }

  edit(record: STData): void {
    this.modal
      .createStatic(KongTargetEditComponent, { hostId: this.hostId, upstreamId: this.upstreamId, record })
      .subscribe(() => this.getData());
  }

  history(): void {
    this.modal
      .createStatic(
        LogComponent,
        {
          title: `查看目标变更历史`,
          url: `kong/target/${this.hostId}/${this.upstreamId}/log`,
          columns: [
            { title: '日志ID', index: 'logId', width: 100 },
            { title: '目标ID', index: 'config.id', width: 300 },
            { title: '目标', index: 'config.target', width: 100 },
            { title: '权重', index: 'config.weight', width: 100 },
            { title: '状态', index: 'status', width: 150 },
            { title: '更新人', index: 'updateUserName', width: 150 },
            { title: '更新时间', index: 'updateAt', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS', width: 170 }
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
      this.kongTargetService.remove(this.hostId, this.upstreamId, item['id']).subscribe((res: Result) => {
        if (res.code === 0) {
          this.messageService.success('删除目标成功！');
        }
        curNum++;
        if (allNum === curNum) {
          this.getData();
        }
      });
    }
  }
}
