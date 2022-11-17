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
      newPassword: { type: 'string', title: '新密码' },
      confirmPassword: { type: 'string', title: '确认密码' }
    },
    required: ['newPassword', 'confirmPassword']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, grid: { span: 24 } },
    $newPassword: {
      widget: 'string',
      type: 'password',
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
    $confirmPassword: {
      widget: 'string',
      type: 'password',
      validator: (value, formProperty, form) => {
        if (form.value === null) {
          return [];
        }
        const msg = [];
        if (!value) {
          msg.push({ keyword: 'required', message: '确认密码为必填项！' });
        }
        if (form.value.newPassword !== value) {
          msg.push({ keyword: 'not', message: '新密码与确认密码必须一致！' });
        }
        return msg;
      }
    }
  };

  constructor(private userService: AuthUserService, private modal: NzModalRef, private messageService: NzMessageService) {}

  ngOnInit(): void {
    this.title = '重置用户密码';
  }

  save(value: any): void {
    this.userService.resetpsw(this.record.userId, { newPassword: value.newPassword }).subscribe(res => {
      if (res.code) {
        this.messageService.warning('重置失败');
      } else {
        this.messageService.success('重置成功');
        this.modal.close(true);
      }
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
