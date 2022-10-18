import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { SFSchema, SFUISchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';

import { SysSettingService } from '..';

@Component({
  selector: 'app-sys-setting',
  templateUrl: './setting.component.html'
})
export class SysSettingComponent implements OnInit, OnReuseInit {
  i!: any;
  schema: SFSchema = {
    properties: {
      value: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '系统名称' },
          title: { type: 'string', title: '标题' },
          description: { type: 'string', title: '系统说明' },
          company: { type: 'string', title: '公司' },
          domain: { type: 'string', title: '域名' },
          icp: { type: 'string', title: 'ICP备案号' },
          expired: { type: 'number', title: '令牌期限', minimum: 5, maximum: 1440, multipleOf: 5, default: 5 },
          password: { type: 'boolean', title: '密码登陆' },
          wxwork: { type: 'boolean', title: '企业微信扫码' },
          dingtalk: { type: 'boolean', title: '钉钉扫码' }
        }
      },
      updateUserName: { type: 'string', title: '最后更新人' },
      updateAt: { type: 'string', title: '最后更新时间' },
      operateId: { type: 'number', title: '操作序号' }
    },
    required: ['name', 'title', 'description', 'password', 'wxwork', 'dingtalk']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 150, grid: { span: 12 } },
    $value: {
      grid: { span: 24 },
      $name: { placeholder: '显示在登录页的系统名称' },
      $title: { placeholder: '显示在标题栏的后缀' },
      $description: { placeholder: '显示在登录页的系统说明' },
      $expired: { optionalHelp: '令牌有效期，单位：分钟' }
    },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $operateId: { widget: 'text' }
  };

  constructor(private baseSrv: BaseService, private settingSrv: SysSettingService, private msgSrv: NzMessageService) {}

  ngOnInit(): void {
    this.baseSrv.menuchange('sys');
    console.debug('页面自身初始化');
    this.reset();
  }

  _onReuseInit(): void {
    this.baseSrv.menuchange('sys');
    console.debug('页面路由复用初始化');
    this.reset();
  }

  save(value: any): void {
    this.settingSrv.set(value.value).subscribe(res => {
      if (res.code) {
        this.msgSrv.warning('修改基础配置失败！');
      } else {
        this.msgSrv.success('修改基础配置成功！');
      }
    });
  }

  reset(): void {
    this.settingSrv.get().subscribe((res: any) => {
      console.debug('重置后的系统配置', res);
      this.i = res;
    });
  }
}
