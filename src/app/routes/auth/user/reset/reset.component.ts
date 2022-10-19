import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { AuthUserService } from '../..';

@Component({
  selector: 'app-auth-user-reset',
  templateUrl: './reset.component.html'
})
export class AuthUserResetComponent implements OnInit {
  record: any = {};
  i: any = {};
  title!: string;
  schema: SFSchema = {
    properties: {
      newpsw1: { type: 'string', title: '新密码' },
      newpsw2: { type: 'string', title: '确认新密码' }
    },
    required: ['newpsw1', 'newpsw2']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 24 } },
    $newpsw1: {
      widget: 'string',
      type: 'password',
      visibleIf: { chgpsw: [true] },
      validator: (value, formProperty, form) => {
        if (form.value === null) {
          return [];
        }
        const msg = [];
        if (!value) {
          msg.push({ keyword: 'required', message: '新密码为必填项！' });
        }
        return msg;
      }
    },
    $newpsw2: {
      widget: 'string',
      type: 'password',
      visibleIf: { chgpsw: [true] },
      validator: (value, formProperty, form) => {
        if (form.value === null) {
          return [];
        }
        const msg = [];
        if (!value) {
          msg.push({ keyword: 'required', message: '确认新密码为必填项！' });
        }
        if (form.value.newpsw1 !== value) {
          msg.push({ keyword: 'not', message: '新密码与确认新密码必须一致！' });
        }
        return msg;
      }
    }
  };

  constructor(private userSrv: AuthUserService, private modal: NzModalRef, private msgSrv: NzMessageService) {}

  ngOnInit(): void {
    this.title = '重置用户密码';
  }

  save(value: any): void {
    this.userSrv.resetpsw(this.record.userid, { loginpsw: value.newpsw1 }).subscribe(res => {
      if (res.code) {
        this.msgSrv.warning('重置失败');
      } else {
        this.msgSrv.success('重置成功');
        this.modal.close(true);
      }
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
