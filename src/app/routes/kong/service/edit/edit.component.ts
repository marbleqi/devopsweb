import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { SFComponent, SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { BehaviorSubject, map } from 'rxjs';

import { KongHostService, KongProjectService, KongUpstreamService, KongServiceService } from '../..';

@Component({
  selector: 'app-kong-service-edit',
  templateUrl: './edit.component.html'
})
export class KongServiceEditComponent implements OnInit {
  /**站点ID */
  hostId!: number;
  loading = false;
  copy!: boolean;
  title!: string;
  updatable!: boolean;
  creatable!: boolean;
  buttonName!: string;
  record: any = {};
  upstreamSubject: BehaviorSubject<SFSchemaEnum[]>;
  gettimes: number = 0;
  id!: string;
  i: any;
  schema: SFSchema = {
    properties: {
      hostId: { type: 'number', title: '站点' },
      config: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '名称' },
          retries: { type: 'number', title: '重试次数', default: 5 },
          type: {
            type: 'string',
            title: '后端类型',
            enum: [
              { label: 'URL', value: 'url' },
              { label: '上游', value: 'upstream' }
            ]
          },
          url: { type: 'string', title: 'URL', format: 'uri' },
          host: { type: 'string', title: '上游' },
          tags: { type: 'string', title: '标签' },
          connect_timeout: { type: 'number', title: '连接超时' },
          write_timeout: { type: 'number', title: '写超时' },
          read_timeout: { type: 'number', title: '读超时' },
          created_at: { type: 'string', title: '创建时间' },
          updated_at: { type: 'string', title: '更新时间' }
        },
        required: ['name', 'type']
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
      asyncData: () => this.kongHostService.index().pipe(map(res => res.map((item: any) => ({ label: item.name, value: item.hostId })))),
      change: (value: number) => this.hostChange(value)
    },
    $config: {
      grid: { span: 24 },
      $type: { widget: 'radio', placeholder: '后端类型', styleType: 'button', buttonStyle: 'solid' },
      $url: { widget: 'string', visibleIf: { type: ['url'] } },
      $host: {
        widget: 'select',
        mode: 'default',
        visibleIf: { type: ['upstream'] },
        asyncData: () => this.upstreamSubject.asObservable()
      },
      $tags: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
      $created_at: { widget: 'text' },
      $updated_at: { widget: 'text' }
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
    private kongUpstreamService: KongUpstreamService,
    private modal: NzModalRef,
    private messageService: NzMessageService
  ) {
    this.upstreamSubject = new BehaviorSubject<SFSchemaEnum[]>([]);
  }

  ngOnInit(): void {
    if (this.hostId) {
      this.hostChange(this.hostId);
    }
    // 根据传入的操作方式，初始化标题及按钮
    if (this.id) {
      if (this.copy) {
        this.title = `服务另存为`;
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '另存为';
      } else {
        this.title = `编辑服务`;
        this.updatable = true;
        this.creatable = false;
        this.buttonName = '';
        this.ui['$hostId'].hidden = true;
      }
      this.kongProjectService.show(this.hostId, 'service', this.id).subscribe(res => {
        console.debug('服务编辑页面获取的数据', res);
        if (res.apidata) {
          if (res.dbdata) {
            this.i = {
              ...res.dbdata,
              config: {
                ...res.apidata,
                created_at: format(fromUnixTime(res.apidata.created_at), 'yyyy-MM-dd HH:mm:ss'),
                updated_at: format(fromUnixTime(res.apidata.updated_at), 'yyyy-MM-dd HH:mm:ss')
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
                created_at: format(fromUnixTime(res.apidata.created_at), 'yyyy-MM-dd HH:mm:ss'),
                updated_at: format(fromUnixTime(res.apidata.updated_at), 'yyyy-MM-dd HH:mm:ss')
              }
            };
          }
        } else if (res.dbdata) {
          this.i = res.dbdata;
        } else {
          this.i = { hostId: this.hostId, config: { type: 'url', url: '' } };
        }
        if (this.i.config.host) {
          this.upstreamSubject.subscribe((res: SFSchemaEnum[]) => {
            if (res.some(item => item.value === this.i.config.host)) {
              this.i.config = { ...this.i.config, type: 'upstream', url: `` };
            } else {
              this.i.config = {
                ...this.i.config,
                type: 'url',
                url: `${this.i.config.protocol}://${this.i.config.host}:${this.i.config.port}${this.i.config.path}`
              };
            }
          });
        }
      });
    } else {
      this.title = `创建服务`;
      this.updatable = false;
      this.creatable = true;
      this.buttonName = '创建';
      this.i = { hostId: this.hostId, config: { type: 'url', url: 'http://localhost:8080/' } };
    }
  }

  hostChange(value: number): void {
    this.hostId = value;
    this.kongHostService.hostId = value;
    this.kongUpstreamService.index(value).subscribe((res: any[]) => {
      console.debug('获取到的上游记录', res);
      this.upstreamSubject.next(res.map((item: any) => ({ label: item.config.name, value: item.config.name } as SFSchemaEnum)));
    });
  }

  params(value: any): any {
    if (value.config.type === 'upstream') {
      return {
        name: value.config.name,
        retries: value.config.retries,
        host: value.config.host,
        protocol: 'http',
        port: 80,
        path: '/',
        tags: value.config.tags,
        connect_timeout: value.config.connect_timeout,
        write_timeout: value.config.write_timeout,
        read_timeout: value.config.read_timeout
      };
    } else {
      return {
        name: value.config.name,
        retries: value.config.retries,
        url: value.config.url,
        tags: value.config.tags,
        connect_timeout: value.config.connect_timeout,
        write_timeout: value.config.write_timeout,
        read_timeout: value.config.read_timeout
      };
    }
  }

  saveas(value: any): void {
    this.loading = true;
    this.kongProjectService.create(value.hostId, 'service', this.params(value)).subscribe(res => {
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
    this.kongProjectService.update(value.hostId, 'service', this.id, this.params(value)).subscribe(res => {
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
