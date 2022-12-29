import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { SFSchema, SFUISchema, SFSchemaEnum, SFSchemaEnumType } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { BehaviorSubject, map } from 'rxjs';

import { KongHostService, KongProjectService, KongServiceService, KongRouteService, KongConsumerService, KongPluginService } from '../..';

@Component({
  selector: 'app-kong-plugin-edit',
  templateUrl: './edit.component.html'
})
export class KongPluginEditComponent implements OnInit {
  hostId!: number;
  loading = false;
  copy: boolean | undefined;
  title: string | undefined;
  updatable!: boolean;
  creatable!: boolean;
  buttonName!: string;
  id: any;
  i: any;
  pluginSubject: BehaviorSubject<SFSchemaEnumType[]>;
  serviceSubject: BehaviorSubject<SFSchemaEnum[]>;
  routeSubject: BehaviorSubject<SFSchemaEnum[]>;
  consumerSubject: BehaviorSubject<SFSchemaEnum[]>;
  schema: SFSchema = {
    properties: {
      hostId: { type: 'number', title: '站点' },
      config: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '插件' },
          route: {
            type: 'object',
            properties: {
              id: { type: 'string', title: '路由' }
            }
          },
          service: {
            type: 'object',
            properties: {
              id: { type: 'string', title: '服务' }
            }
          },
          consumer: {
            type: 'object',
            properties: {
              id: { type: 'string', title: '用户' }
            }
          },
          protocols: { type: 'string', title: '协议', enum: ['tcp', 'tls', 'http', 'https', 'grpc', 'grpcs'] },
          enabled: { type: 'boolean', title: '状态' },
          tags: { type: 'string', title: '标签' },
          created_at: { type: 'string', title: '创建时间' },
          cors: {
            type: 'object',
            title: '跨域设置',
            properties: {
              origins: { type: 'string', title: '授权前端地址' },
              methods: {
                type: 'string',
                title: '授权方法',
                default: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'],
                enum: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT']
              },
              headers: { type: 'string', title: '授权消息头' },
              exposed_headers: { type: 'string', title: '扩展消息头' },
              credentials: { type: 'boolean', title: '授权认证' },
              max_age: { type: 'number', title: '缓存时间' },
              preflight_continue: { type: 'boolean', title: '转发预检' }
            }
          },
          httpLog: {
            type: 'object',
            title: '日志转发http',
            properties: {
              http_endpoint: { type: 'string', title: '转发地址', format: 'uri' },
              method: { type: 'string', title: '方法', default: 'POST', enum: ['POST', 'PUT', 'PATCH'] },
              content_type: { type: 'string', title: '数据类型', default: 'application/json', enum: ['application/json'] },
              timeout: { type: 'integer', title: '超时时间', default: 10000, multipleOf: 1000 },
              keepalive: { type: 'integer', title: '存活时间', default: 60000, multipleOf: 1000 },
              flush_timeout: { type: 'integer', title: '超时次数', default: 2 },
              retry_count: { type: 'integer', title: '重试次数', default: 10 },
              queue_size: { type: 'integer', title: '发送次数', default: 1 },
              headers: { type: 'string', title: '消息头' }
            }
          },
          ipRestriction: {
            type: 'object',
            title: '访问IP限制',
            properties: {
              method: {
                type: 'string',
                title: '授权策略',
                default: 'allow',
                enum: [
                  { label: '允许', value: 'allow' },
                  { label: '拒绝', value: 'deny' }
                ]
              },
              list: { type: 'string', title: 'IP网段', format: 'ipv4' }
            }
          },
          proxyCache: {
            type: 'object',
            title: '代理缓存',
            properties: {
              response_code: {
                type: 'number',
                title: '响应码',
                default: [200, 301, 404]
              },
              request_method: { type: 'string', title: '缓存方法', default: ['GET', 'HEAD'] },
              content_type: { type: 'string', title: '缓存响应类型', default: ['text/plain', 'application/json'] },
              vary_headers: { type: 'string', title: '缓存请求头' },
              vary_query_params: { type: 'string', title: '缓存请求参数' },
              cache_ttl: { type: 'number', title: '缓存时间(秒)', default: 300 },
              cache_control: { type: 'boolean', title: '缓存控制', default: false },
              storage_ttl: { type: 'number', title: '实体时间(秒)' },
              strategy: { type: 'string', title: '实体时间(秒)', default: 'memory' },
              memory: {
                type: 'object',
                properties: { dictionary_name: { type: 'string', title: '缓存请求头', default: 'kong_db_cache' } }
              }
            }
          },
          redirect: {
            type: 'object',
            title: '重定向',
            properties: {
              status: {
                type: 'number',
                title: '状态码',
                default: 301,
                enum: [
                  { label: '永久重定向', value: 301 },
                  { label: '临时重定向', value: 302 }
                ]
              },
              url: { type: 'string', title: '重定向地址', format: 'uri' }
            }
          },
          requestTermination: {
            type: 'object',
            title: '请求阻止',
            properties: {
              status_code: { type: 'number', title: '状态码', default: 404, minimum: 400, maximum: 500 },
              type: {
                type: 'string',
                title: '响应类型',
                default: 'message',
                enum: [
                  { label: '默认消息', value: 'message' },
                  { label: '自定义', value: 'body' }
                ]
              },
              message: { type: 'string', title: '消息内容' },
              body: { type: 'string', title: '报文体' }
            }
          },
          responseTransformer: {
            type: 'object',
            title: '响应消息转换',
            properties: {
              remove: {
                type: 'object',
                title: '移除',
                properties: { headers: { type: 'string', title: '消息头' }, json: { type: 'string', title: 'json对象' } }
              },
              rename: { type: 'object', title: '重命名', properties: { headers: { type: 'string', title: '消息头' } } },
              replace: {
                type: 'object',
                title: '替换',
                properties: {
                  headers: { type: 'string', title: '消息头' },
                  json_types: { type: 'string', title: 'json对象类型' },
                  json: { type: 'string', title: 'json对象值' }
                }
              },
              add: {
                type: 'object',
                title: '增加',
                properties: {
                  headers: { type: 'string', title: '消息头' },
                  json_types: { type: 'string', title: 'json对象类型' },
                  json: { type: 'string', title: 'json对象值' }
                }
              },
              append: {
                type: 'object',
                title: '追加',
                properties: {
                  headers: { type: 'string', title: '消息头' },
                  json_types: { type: 'string', title: 'json对象类型' },
                  json: { type: 'string', title: 'json对象值' }
                }
              }
            }
          }
        },
        required: ['name', 'protocols', 'enabled']
      },
      createUserName: { type: 'string', title: '首次同步人' },
      createAt: { type: 'string', title: '首次同步时间' },
      updateUserName: { type: 'string', title: '最后同步人' },
      updateAt: { type: 'string', title: '最后同步时间' },
      operateId: { type: 'number', title: '操作序号' }
    }
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 24 } },
    $hostId: {
      grid: { span: 12 },
      widget: 'select',
      mode: 'default',
      hidden: false,
      asyncData: () => this.kongHostService.index().pipe(map(res => res.map((item: any) => ({ label: item.name, value: item.hostId })))),
      change: (value: number) => this.hostChange(value)
    },
    $config: {
      $name: {
        widget: 'radio',
        styleType: 'button',
        buttonStyle: 'solid',
        spanLabel: 2,
        spanControl: 22,
        grid: { span: 24 },
        asyncData: () => this.pluginSubject.asObservable()
      },
      $route: {
        spanLabel: 6,
        spanControl: 18,
        grid: { span: 8 },
        $id: {
          widget: 'select',
          mode: 'default',
          allowClear: true,
          asyncData: () => this.routeSubject.asObservable()
        }
      },
      $service: {
        spanLabel: 6,
        spanControl: 18,
        grid: { span: 8 },
        $id: {
          widget: 'select',
          mode: 'default',
          allowClear: true,
          asyncData: () => this.serviceSubject.asObservable()
        }
      },
      $consumer: {
        spanLabel: 6,
        spanControl: 18,
        grid: { span: 8 },
        $id: {
          widget: 'select',
          mode: 'default',
          allowClear: true,
          asyncData: () => this.consumerSubject.asObservable()
        }
      },
      $protocols: { widget: 'select', mode: 'multiple', spanLabel: 4, spanControl: 20, grid: { span: 12 } },
      $enabled: { spanLabel: 4, spanControl: 20, grid: { span: 12 } },
      $tags: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
      $created_at: { widget: 'text' },
      $cors: {
        showTitle: true,
        visibleIf: { name: ['cors'] },
        spanLabel: 2,
        spanControl: 22,
        grid: { span: 24 },
        $origins: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
        $methods: { widget: 'select', mode: 'multiple' },
        $headers: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
        $exposed_headers: { widget: 'select', mode: 'tags', tokenSeparators: [','] }
      },
      $httpLog: {
        showTitle: true,
        visibleIf: { name: ['http-log'] },
        spanLabel: 2,
        spanControl: 22,
        grid: { span: 24 },
        $http_endpoint: { widget: 'string' },
        $method: { widget: 'select' },
        $content_type: { widget: 'select' },
        $headers: { widget: 'select', mode: 'tags' }
      },
      $ipRestriction: {
        showTitle: true,
        visibleIf: { name: ['ip-restriction'] },
        spanLabel: 2,
        spanControl: 22,
        grid: { span: 24 },
        $method: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
        $list: { widget: 'select', mode: 'tags', tokenSeparators: [','] }
      },
      $proxyCache: {
        showTitle: true,
        visibleIf: { name: ['proxy-cache'] },
        spanLabel: 2,
        spanControl: 22,
        grid: { span: 24 },
        $response_code: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
        $request_method: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
        $vary_headers: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
        $vary_query_params: { widget: 'select', mode: 'tags', tokenSeparators: [','] }
      },
      $redirect: {
        showTitle: true,
        visibleIf: { name: ['redirect'] },
        spanLabel: 4,
        spanControl: 20,
        grid: { span: 24 },
        $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' }
      },
      $requestTermination: {
        showTitle: true,
        visibleIf: { name: ['request-termination'] },
        spanLabel: 2,
        spanControl: 22,
        grid: { span: 24 },
        $type: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
        $message: { visibleIf: { type: ['message'] } },
        $body: { visibleIf: { type: ['body'] } }
      },
      $responseTransformer: {
        showTitle: true,
        visibleIf: { name: ['response-transformer'] },
        spanLabel: 2,
        spanControl: 22,
        grid: { span: 24 },
        $remove: {
          showTitle: true,
          $headers: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
          $json: { widget: 'select', mode: 'tags', tokenSeparators: [','] }
        },
        $rename: {
          showTitle: true,
          $headers: { widget: 'select', mode: 'tags', tokenSeparators: [','] }
        },
        $replace: {
          showTitle: true,
          $headers: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
          $json_types: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
          $json: { widget: 'select', mode: 'tags', tokenSeparators: [','] }
        },
        $add: {
          showTitle: true,
          $headers: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
          $json_types: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
          $json: { widget: 'select', mode: 'tags', tokenSeparators: [','] }
        },
        $append: {
          showTitle: true,
          $headers: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
          $json_types: { widget: 'select', mode: 'tags', tokenSeparators: [','] },
          $json: { widget: 'select', mode: 'tags', tokenSeparators: [','] }
        }
      }
    },
    $createUserName: { widget: 'text', grid: { span: 12 } },
    $createAt: { widget: 'text', grid: { span: 12 } },
    $updateUserName: { widget: 'text', grid: { span: 12 } },
    $updateAt: { widget: 'text', grid: { span: 12 } },
    $operateId: { widget: 'text', grid: { span: 12 } }
  };

  constructor(
    private baseService: BaseService,
    private kongHostService: KongHostService,
    private kongProjectService: KongProjectService,
    private kongServiceService: KongServiceService,
    private kongRouteService: KongRouteService,
    private kongConsumerService: KongConsumerService,
    private kongPluginService: KongPluginService,
    private modal: NzModalRef,
    private messageService: NzMessageService
  ) {
    this.pluginSubject = new BehaviorSubject<SFSchemaEnumType[]>([]);
    this.serviceSubject = new BehaviorSubject<SFSchemaEnum[]>([]);
    this.routeSubject = new BehaviorSubject<SFSchemaEnum[]>([]);
    this.consumerSubject = new BehaviorSubject<SFSchemaEnum[]>([]);
  }

  ngOnInit(): void {
    if (this.hostId) {
      this.hostChange(this.hostId);
    }
    // 根据传入的操作方式，初始化标题及按钮
    if (this.id) {
      if (this.copy) {
        this.title = `插件另存为`;
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '另存为';
      } else {
        this.title = `编辑插件`;
        this.updatable = true;
        this.creatable = false;
        this.buttonName = '';
        this.ui['$hostId'].hidden = true;
      }
      this.kongProjectService.show(this.hostId, 'plugin', this.id).subscribe(res => {
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
        // 针对传入的不同插件类型，重新初始化表单值
        if (this.i?.config?.name === 'cors') {
          this.i.config.cors = this.i.config.config;
        }
        if (this.i?.config?.name === 'http-log') {
          this.i.config.httpLog = this.i.config.config;
        }
        if (this.i?.config?.name === 'ip-restriction') {
          this.i.config.ipRestriction = this.i.config.config;
        }
        if (this.i?.config?.name === 'proxy-cache') {
          this.i.config.proxyCache = this.i.config.config;
        }
        if (this.i?.config?.name === 'redirect') {
          this.i.config.redirect = this.i.config.config;
        }
        if (this.i?.config?.name === 'request-termination') {
          this.i.config.requestTermination = this.i.config.config;
        }
        if (this.i?.config?.name === 'response-transformer') {
          this.i.config.responseTransformer = this.i.config.config;
        }
      });
    } else {
      this.title = `创建插件`;
      this.updatable = false;
      this.creatable = true;
      this.buttonName = '创建';
      this.i = { hostId: this.hostId };
    }
  }

  hostChange(value: number): void {
    this.hostId = value;
    this.kongHostService.hostId = value;
    this.kongPluginService.plugin(value).subscribe((res: SFSchemaEnumType[]) => {
      console.debug('获取到的可选插件', res);
      this.pluginSubject.next(res);
    });
    this.kongRouteService.index(value).subscribe((res: any[]) => {
      console.debug('获取到的路由记录', res);
      this.routeSubject.next(
        res.filter((item: any) => item.status).map((item: any) => ({ label: item.config.name, value: item.id } as SFSchemaEnum))
      );
    });
    this.kongServiceService.index(value).subscribe((res: any[]) => {
      console.debug('获取到的服务记录', res);
      this.serviceSubject.next(
        res.filter((item: any) => item.status).map((item: any) => ({ label: item.config.name, value: item.id } as SFSchemaEnum))
      );
    });
    this.kongConsumerService.index(value).subscribe((res: any[]) => {
      console.debug('获取到的用户记录', res);
      this.consumerSubject.next(
        res.filter((item: any) => item.status).map((item: any) => ({ label: item.config.username, value: item.id } as SFSchemaEnum))
      );
    });
  }

  params(value: any): any {
    const result = {
      name: value.config.name,
      route: value.config.route?.id ? value.config.route : undefined,
      service: value.config.service?.id ? value.config.service : undefined,
      consumer: value.config.consumer?.id ? value.config.consumer : undefined,
      protocols: value.config.protocols,
      enabled: value.config.enabled,
      tags: value.config.tags
    };
    console.debug('result', result);
    // 针对传入的不同插件类型，重新初始化表单值
    if (result.name === 'cors') {
      return {
        ...result,
        config: value.config.cors
      };
    }
    if (result.name === 'http-log') {
      return {
        ...result,
        config: value.config.httpLog
      };
    }
    if (result.name === 'ip-restriction') {
      return {
        ...result,
        config: value.config.ipRestriction
      };
    }
    if (result.name === 'proxy-cache') {
      return {
        ...result,
        config: value.config.proxyCache
      };
    }
    if (result.name === 'redirect') {
      return {
        ...result,
        config: value.config.redirect
      };
    }
    if (result.name === 'request-termination') {
      return {
        ...result,
        config: value.config.requestTermination
      };
    }
    if (result.name === 'response-transformer') {
      return {
        ...result,
        config: value.config.responseTransformer
      };
    }
  }

  saveas(value: any): void {
    console.debug('value', value);
    this.loading = true;
    this.kongProjectService.create(value.hostId, 'plugin', this.params(value)).subscribe(res => {
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
    console.debug('value', value);
    this.loading = true;
    this.kongProjectService.update(value.hostId, 'plugin', this.id, this.params(value)).subscribe(res => {
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
