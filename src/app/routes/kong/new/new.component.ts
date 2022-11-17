import { Component, OnInit, ViewChild } from '@angular/core';
import { SFButton, SFComponent, SFSchema, SFSchemaEnum, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-kong-new',
  templateUrl: './new.component.html'
})
export class KongNewComponent implements OnInit {
  record: any;
  @ViewChild('sf') private readonly sf!: SFComponent;
  i: any;
  button: SFButton = { edit: '新建代理' };
  schema: SFSchema = {
    properties: {
      hostid: { type: 'number', title: '站点' },
      name: { type: 'string', title: '路由及服务名称' },
      hosts: { type: 'string', title: '域名' },
      protocols: { type: 'string', title: '协议', enum: ['tcp', 'tls', 'http', 'https'] },
      methods: { type: 'string', title: '方法', enum: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT', 'HEAD', 'OPTIONS'] },
      paths: { type: 'string', title: '路由路径' },
      regex_priority: { type: 'number', title: '正则优先级' },
      strip_path: { type: 'boolean', title: '路径不透传' },
      preserve_host: { type: 'boolean', title: '域名透传' },
      url: { type: 'string', title: '上游URL' },
      connect_timeout: {
        type: 'number',
        title: '连接超时',
        minimum: 1800000,
        exclusiveMinimum: false,
        maximum: 7200000,
        exclusiveMaximum: false,
        multipleOf: 1000
      },
      write_timeout: {
        type: 'number',
        title: '写超时',
        minimum: 1800000,
        exclusiveMinimum: false,
        maximum: 7200000,
        exclusiveMaximum: false,
        multipleOf: 1000
      },
      read_timeout: {
        type: 'number',
        title: '读超时',
        minimum: 1800000,
        exclusiveMinimum: false,
        maximum: 7200000,
        exclusiveMaximum: false,
        multipleOf: 1000
      }
    },
    required: [
      'hostid',
      'name',
      'hosts',
      'protocols',
      'methods',
      'paths',
      'regex_priority',
      'strip_path',
      'preserve_host',
      'url',
      'connect_timeout',
      'write_timeout',
      'read_timeout'
    ]
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 200, grid: { span: 12 } },
    $hostid: {
      widget: 'select',
      placeholder: '站点',
      asyncData: () => {
        let hostlist: SFSchemaEnum[];
        return this.http.post('kong/host/index', { type: 'select' }).pipe(
          tap((res: any) => {
            if (res.code === 0) {
              hostlist = res.data.map((item: any) => ({ label: item.description, value: item.hostid }));
            }
          }),
          map(() => hostlist)
        );
      },
      change: (value: number) => localStorage.setItem('kong_hostid', value.toString())
    },
    $name: { widget: 'string', placeholder: '路由及服务名称' },
    $hosts: { widget: 'select', mode: 'tags', tokenSeparators: [','], placeholder: '域名' },
    $protocols: { widget: 'select', mode: 'multiple', placeholder: '协议' },
    $methods: { widget: 'select', mode: 'multiple', placeholder: '方法' },
    $paths: { widget: 'select', mode: 'tags', tokenSeparators: [','], placeholder: '路由路径' },
    $url: { widget: 'string', placeholder: '上游URL' }
  };
  constructor(private http: _HttpClient, private msgSrv: NzMessageService) {}

  ngOnInit(): void {
    this.i = {
      hostid: localStorage.getItem('kong_hostid') ? Number(localStorage.getItem('kong_hostid')) : null,
      name: 'localhost',
      hosts: ['localhost'],
      protocols: ['http', 'https'],
      methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT', 'HEAD', 'OPTIONS'],
      paths: ['/'],
      regex_priority: 0,
      strip_path: true,
      preserve_host: true,
      url: 'http://localhost:8080/',
      connect_timeout: 3600000,
      write_timeout: 3600000,
      read_timeout: 3600000
    };
  }

  save(value: any): void {
    this.http.post('kong/proxy/new', value).subscribe((data: any) => {
      if (data.code === 0) {
        this.msgSrv.success('创建成功');
      }
    });
  }
}
