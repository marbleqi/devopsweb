import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { SFSchema, SFUISchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';

import { WxworkSettingService } from '..';

@Component({
  selector: 'app-wxwork-setting',
  templateUrl: './setting.component.html'
})
export class WxworkSettingComponent implements OnInit, OnReuseInit {
  i!: any;
  schema: SFSchema = {
    properties: {
      value: {
        type: 'object',
        properties: {
          corpid: { type: 'string', title: '企业ID' },
          app: {
            type: 'object',
            title: '自定义应用',
            properties: {
              agentid: { type: 'string', title: '应用ID' },
              secret: { type: 'string', title: '应用秘钥' }
            },
            required: ['agentid', 'secret']
          },
          checkin: {
            type: 'object',
            title: '打卡应用',
            properties: {
              agentid: { type: 'string', title: '应用ID' },
              secret: { type: 'string', title: '应用秘钥' }
            },
            required: ['agentid', 'secret']
          }
        },
        required: ['corpid']
      },
      updateUserName: { type: 'string', title: '最后更新人' },
      updateAt: { type: 'string', title: '最后更新时间' },
      operateId: { type: 'number', title: '操作序号' }
    }
  };
  ui: SFUISchema = {
    '*': { spanLabel: 4, spanControl: 20, grid: { span: 12 } },
    $value: {
      grid: { span: 24 },
      $corpid: { spanLabel: 2, spanControl: 22, widget: 'string', grid: { span: 24 } },
      $app: {
        showTitle: true,
        type: 'card',
        $agentid: { grid: { span: 24 } },
        $secret: { grid: { span: 24 } }
      },
      $checkin: {
        showTitle: true,
        type: 'card',
        $agentid: { grid: { span: 24 } },
        $secret: { grid: { span: 24 } }
      }
    },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $operateId: { widget: 'text' }
  };

  constructor(private baseService: BaseService, private settingService: WxworkSettingService, private msgService: NzMessageService) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('wxwork');
    this.reset();
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('wxwork');
    console.debug('页面路由复用初始化');
    this.reset();
  }

  save(value: any): void {
    this.settingService.set(value.value).subscribe((res: any) => {
      if (res.code) {
        this.msgService.warning('修改企业微信配置失败！');
      } else {
        this.msgService.success('修改企业微信配置成功！');
      }
    });
  }

  reset(): void {
    this.settingService.get().subscribe((res: any) => {
      console.debug('重置后的企业微信配置', res);
      this.i = res;
    });
  }
}
