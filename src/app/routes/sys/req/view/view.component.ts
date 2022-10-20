import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { SysReqService } from '../..';

@Component({
  selector: 'app-sys-req-view',
  templateUrl: './view.component.html'
})
export class SysReqViewComponent implements OnInit {
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      reqId: { type: 'number', title: '请求ID' },
      userName: { type: 'string', title: '请求用户' },
      module: { type: 'string', title: '模块' },
      controller: { type: 'string', title: '控制器' },
      action: { type: 'string', title: '方法' },
      request: {
        type: 'object',
        title: '请求',
        properties: {
          url: { type: 'string', title: 'url' },
          method: { type: 'string', title: 'method' },
          headers: {
            type: 'object',
            title: '请求头',
            properties: { host: { type: 'string', title: '域名' }, token: { type: 'string', title: '令牌' } }
          },
          params: { type: 'string', title: 'params', readOnly: true },
          query: { type: 'string', title: 'query', readOnly: true },
          body: { type: 'string', title: 'body', readOnly: true }
        }
      },
      result: {
        type: 'object',
        title: '响应',
        properties: {
          code: { type: 'string', title: 'code' },
          msg: { type: 'string', title: 'msg' },
          data: { type: 'string', title: 'data', readOnly: true }
        }
      },
      status: { type: 'number', title: '状态码' },
      clientIp: { type: 'string', title: '请求IP' },
      serverIp: { type: 'string', title: '响应IP' },
      startAt: { type: 'string', title: '开始时间' },
      endAt: { type: 'string', title: '结束时间' },
      operateId: { type: 'number', title: '操作ID' }
    }
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 24 } },
    $reqId: { widget: 'text', grid: { span: 12 } },
    $userName: { widget: 'text', grid: { span: 12 } },
    $module: { widget: 'text', grid: { span: 8 } },
    $controller: { widget: 'text', grid: { span: 8 } },
    $action: { widget: 'text', grid: { span: 8 } },
    $request: {
      showTitle: true,
      $url: { widget: 'text', grid: { span: 12 } },
      $method: { widget: 'text', grid: { span: 12 } },
      $headers: { showTitle: true, $host: { widget: 'text', grid: { span: 12 } }, $token: { widget: 'text', grid: { span: 12 } } },
      $params: { widget: 'textarea', grid: { span: 8 } },
      $query: { widget: 'textarea', grid: { span: 8 } },
      $body: { widget: 'textarea', grid: { span: 8 } }
    },
    $result: {
      showTitle: true,
      $code: { widget: 'text', grid: { span: 12 } },
      $msg: { widget: 'text', grid: { span: 12 } },
      $data: { widget: 'textarea' }
    },
    $status: { widget: 'text', grid: { span: 8 } },
    $clientIp: { widget: 'text', grid: { span: 8 } },
    $serverIp: { widget: 'text', grid: { span: 8 } },
    $startAt: { widget: 'text', grid: { span: 8 } },
    $endAt: { widget: 'text', grid: { span: 8 } },
    $operateId: { widget: 'text', grid: { span: 8 } }
  };

  constructor(private readonly reqSrv: SysReqService, private modal: NzModalRef) {}

  ngOnInit(): void {
    this.reqSrv.show(this.record.reqId).subscribe(res => {
      console.debug('res', res);
      this.i = res;
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
