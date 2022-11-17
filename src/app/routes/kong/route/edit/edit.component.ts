import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { BehaviorSubject, map } from 'rxjs';

import { KongHostService, KongProjectService, KongServiceService } from '../..';

@Component({
  selector: 'app-kong-route-edit',
  templateUrl: './edit.component.html'
})
export class KongRouteEditComponent implements OnInit {
  /**站点ID */
  hostId!: number;
  loading = false;
  copy!: boolean;
  title!: string;
  updatable!: boolean;
  creatable!: boolean;
  buttonName!: string;
  record: any = {};
  serviceSubject: BehaviorSubject<SFSchemaEnum[]>;
  gettimes: number = 0;
  id!: string;
  i: any;
  schema: SFSchema = {
    properties: {
      hostId: { type: 'number', title: '站点' },
      config: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '名称', default: 'localhost' },
          protocols: {
            type: 'string',
            title: '协议',
            default: ['http', 'https'],
            enum: ['tcp', 'tls', 'http', 'https', 'grpc', 'grpcs']
          },
          methods: {
            type: 'string',
            title: '方法',
            default: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT', 'HEAD', 'OPTIONS'],
            enum: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT', 'HEAD', 'OPTIONS']
          },
          hosts: { type: 'string', title: '域名', default: ['localhost'] },
          paths: { type: 'string', title: '路径', default: ['/'] },
          regex_priority: { type: 'number', title: '正则优先级', default: 0 },
          strip_path: { type: 'boolean', title: '路径不透传', default: true },
          preserve_host: { type: 'boolean', title: '域名透传', default: true },
          service: {
            type: 'object',
            properties: {
              id: { type: 'string', title: '服务' }
            }
          },
          tags: { type: 'string', title: '标签' },
          created_at: { type: 'string', title: '创建时间' },
          updated_at: { type: 'string', title: '更新时间' }
        },
        required: ['name', 'protocols', 'methods', 'hosts', 'paths', 'regex_priority', 'strip_path', 'preserve_host']
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
      $protocols: { widget: 'select', mode: 'multiple' },
      $methods: { spanLabel: 3, spanControl: 21, grid: { span: 24 }, widget: 'select', mode: 'multiple' },
      $hosts: { spanLabel: 3, spanControl: 21, grid: { span: 24 }, widget: 'select', mode: 'tags', tokenSeparators: [','] },
      $paths: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
      $service: { $id: { grid: { span: 24 }, widget: 'select', mode: 'default', asyncData: () => this.serviceSubject.asObservable() } },
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
    private kongServiceService: KongServiceService,
    private modal: NzModalRef,
    private messageService: NzMessageService
  ) {
    this.serviceSubject = new BehaviorSubject<SFSchemaEnum[]>([]);
  }

  ngOnInit(): void {
    if (this.hostId) {
      this.hostChange(this.hostId);
    }
    // 根据传入的操作方式，初始化标题及按钮
    if (this.id) {
      if (this.copy) {
        this.title = `路由另存为`;
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '另存为';
      } else {
        this.title = `编辑路由`;
        this.updatable = true;
        this.creatable = false;
        this.buttonName = '';
        this.ui['$hostId'].hidden = true;
      }
      this.i = { hostId: this.hostId };
      this.kongProjectService.show(this.hostId, 'route', this.id).subscribe(res => {
        console.debug('路由编辑页面获取的数据', res);
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
          this.i = { hostId: this.hostId };
        }
        console.debug('初始化后的表单数据', this.i);
      });
    } else {
      this.title = `创建路由`;
      this.updatable = false;
      this.creatable = true;
      this.buttonName = '创建';
      console.debug('hostId', this.hostId);
      this.i = { hostId: this.hostId };
    }
  }

  hostChange(value: number): void {
    this.hostId = value;
    this.kongHostService.hostId = value;
    this.kongServiceService.index(value).subscribe((res: any[]) => {
      console.debug('获取到的服务记录', res);
      this.serviceSubject.next(
        res.filter((item: any) => item.status).map((item: any) => ({ label: item.config.name, value: item.id } as SFSchemaEnum))
      );
    });
  }

  params(value: any): any {
    return {
      name: value.config.name,
      protocols: value.config.protocols,
      methods: value.config.methods,
      hosts: value.config.hosts,
      paths: value.config.paths,
      regex_priority: value.config.regex_priority,
      strip_path: value.config.strip_path,
      preserve_host: value.config.preserve_host,
      service: value.config.service,
      tags: value.config.tags
    };
  }

  saveas(value: any): void {
    this.loading = true;
    this.kongProjectService.create(value.hostId, 'route', this.params(value)).subscribe(res => {
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
    this.kongProjectService.update(value.hostId, 'route', this.id, this.params(value)).subscribe(res => {
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
