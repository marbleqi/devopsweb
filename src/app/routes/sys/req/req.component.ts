import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData } from '@delon/abc/st';
import { SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { zip, first, BehaviorSubject } from 'rxjs';

import { SysReqService, SysReqViewComponent } from '..';

@Component({
  selector: 'app-sys-req',
  templateUrl: './req.component.html'
})
export class SysReqComponent implements OnInit, OnReuseInit {
  i: any;
  value: any;
  module: string;
  controller: string;
  action: string;
  controllerSub: BehaviorSubject<SFSchemaEnum[]>;
  actionSub: BehaviorSubject<SFSchemaEnum[]>;
  schema: SFSchema = { properties: {} };
  ui!: SFUISchema;
  stData: STData[] = [];
  columns: STColumn[] = [{}];

  constructor(private readonly baseSrv: BaseService, private readonly reqSrv: SysReqService, private modal: ModalHelper) {
    this.controllerSub = new BehaviorSubject<SFSchemaEnum[]>([]);
    this.actionSub = new BehaviorSubject<SFSchemaEnum[]>([]);
    this.module = '';
    this.controller = '';
    this.action = '';
  }

  ngOnInit(): void {
    this.baseSrv.menuWebSub.next('sys');
    zip(this.baseSrv.userSub.pipe(first()), this.reqSrv.module()).subscribe(([userList, module]: [SFSchemaEnum[], string[]]) => {
      userList.unshift({ label: '所有用户', value: 0 });
      const moduleList: SFSchemaEnum[] = module.map(item => ({ label: item, value: item }));
      moduleList.unshift({ label: '所有模块', value: '' });
      this.schema = {
        properties: {
          userId: { type: 'number', title: '用户', enum: userList },
          module: { type: 'string', title: '模块', enum: moduleList },
          controller: { type: 'string', title: '对象' },
          action: { type: 'string', title: '操作' },
          status: {
            type: 'number',
            title: '状态码',
            default: 200,
            enum: [
              { value: 200, label: '正常' },
              { value: 0, label: '异常' }
            ]
          },
          startAt: { type: 'number', title: '请求时间' }
        },
        required: ['userid', 'module']
      };
      this.ui = {
        $userId: { widget: 'select', width: 200 },
        $module: { widget: 'select', change: (value: string) => this.moduleChange(value) },
        $controller: {
          widget: 'select',
          change: (value: string) => this.controllerChange(value),
          asyncData: () => this.controllerSub.asObservable()
        },
        $action: { widget: 'select', change: (value: string) => this.actionChange(value), asyncData: () => this.actionSub.asObservable() },
        $status: { widget: 'select' },
        $startAt: {
          widget: 'date',
          mode: 'range',
          rangeMode: 'date',
          showTime: true,
          displayFormat: 'yyyy-MM-dd HH:mm:ss'
        }
      };
      this.columns = [
        { title: '请求ID', index: 'reqId', sort: { compare: (a, b) => a.reqid - b.reqid } },
        { title: '请求用户', index: 'userName' },
        { title: '模块', index: 'module' },
        { title: '控制器', index: 'controller' },
        { title: '接口', index: 'action' },
        { title: '响应码', index: 'status' },
        { title: '客户端IP', index: 'clientIp' },
        { title: '服务器IP', index: 'serverIp' },
        {
          title: '接收时间',
          index: 'startAt',
          type: 'date',
          dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
          width: 170,
          sort: { compare: (a, b) => a.startAt - b.startAt }
        },
        {
          title: '响应时间',
          index: 'endAt',
          type: 'date',
          dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
          width: 170,
          sort: { compare: (a, b) => a.endAt - b.endAt }
        },
        {
          title: '操作',
          buttons: [
            {
              text: '查看',
              icon: 'file',
              type: 'modal',
              modal: { component: SysReqViewComponent },
              click: () => this.getdata()
            }
          ]
        }
      ];
      this.i = { userid: 0, module: '', controller: '', action: '', start_at: [Date.now() - 86400000, Date.now()] };
    });
  }

  _onReuseInit(): void {
    this.baseSrv.menuWebSub.next('sys');
  }

  moduleChange(value: string) {
    this.module = value;
    if (this.module) {
      this.reqSrv.controller(this.module).subscribe(controller => {
        const controllerlist: SFSchemaEnum[] = controller.map(item => ({ label: item, value: item }));
        controllerlist.unshift({ label: '所有对象', value: '' });
        this.controllerSub.next(controllerlist);
        this.controllerChange('');
        this.actionChange('');
      });
    } else {
      this.controllerSub.next([{ label: '所有对象', value: '' }]);
      this.controllerChange('');
      this.actionChange('');
    }
  }

  controllerChange(value: string) {
    this.controller = value;
    if (this.controller) {
      this.reqSrv.action(this.module, this.controller).subscribe(action => {
        const actionlist: SFSchemaEnum[] = action.map(item => ({ label: item, value: item }));
        actionlist.unshift({ label: '所有操作', value: '' });
        this.actionSub.next(actionlist);
        this.actionChange('');
      });
    } else {
      this.actionSub.next([{ label: '所有操作', value: '' }]);
      this.actionChange('');
    }
  }

  actionChange(value: string) {
    this.action = value;
  }

  reset() {
    this.i.startAt = [Date.now() - 86400000, Date.now()];
  }

  getdata(value?: any): void {
    if (value) {
      this.value = value;
    }
    console.debug('value', this.value);
    const params: any = {};
    if (this.value.userId) {
      params['userId'] = this.value.userId;
    }
    if (this.module) {
      params['module'] = this.module;
    }
    if (this.controller) {
      params['controller'] = this.controller;
    }
    if (this.action) {
      params['action'] = this.action;
    }
    if (this.value.status) {
      params['status'] = this.value.status;
    }
    if (this.value.startAt) {
      params['startAt'] = this.value.startAt;
    }
    this.reqSrv.index(params).subscribe((data: STData[]) => {
      console.debug('data', data);
      this.stData = data;
    });
  }
}
