import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { SFSchema, SFUISchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';

import { DingtalkSettingService } from '..';

@Component({
  selector: 'app-dingtalk-setting',
  templateUrl: './setting.component.html'
})
export class DingtalkSettingComponent implements OnInit, OnReuseInit {
  i!: any;
  schema: SFSchema = {
    properties: {
      value: {
        type: 'object',
        title: '应用配置',
        properties: {
          agentid: { type: 'string', title: 'AgentId' },
          appkey: { type: 'string', title: 'AppKey' },
          appsecret: { type: 'string', title: 'AppSecret' }
        },
        required: ['agentid', 'appkey', 'appsecret']
      },
      updateUserName: { type: 'string', title: '最后更新人' },
      updateAt: { type: 'string', title: '最后更新时间' },
      operateId: { type: 'number', title: '操作序号' }
    }
  };
  ui: SFUISchema = {
    '*': { spanLabel: 4, spanControl: 20, grid: { span: 12 } },
    $value: { showTitle: true, grid: { span: 24 } },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $operateId: { widget: 'text' }
  };

  constructor(private baseSrv: BaseService, private settingSrv: DingtalkSettingService, private msgSrv: NzMessageService) {}

  ngOnInit(): void {
    this.baseSrv.menuChange('dingtalk');
    this.reset();
  }

  _onReuseInit(): void {
    this.baseSrv.menuChange('dingtalk');
    console.debug('页面路由复用初始化');
    this.reset();
  }

  save(value: any): void {
    this.settingSrv.set(value.value).subscribe((res: any) => {
      if (res.code) {
        this.msgSrv.warning('修改钉钉配置失败！');
      } else {
        this.msgSrv.success('修改钉钉配置成功！');
      }
    });
  }

  reset(): void {
    this.settingSrv.get().subscribe((res: any) => {
      console.debug('重置后的钉钉配置', res);
      this.i = res;
    });
  }
}
