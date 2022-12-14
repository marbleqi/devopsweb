import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { SFSchema, SFSchemaEnum, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { map, tap } from 'rxjs';

@Component({
  selector: 'app-dingtalk-user-edit',
  templateUrl: './edit.component.html'
})
export class DingtalkUserEditComponent implements OnInit {
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      unionid: { type: 'string', title: 'unionid' },
      name: { type: 'string', title: '钉钉姓名' },
      userid: { type: 'number', title: '系统用户', enum: this.baseService.userList() },
      status: {
        type: 'number',
        title: '状态',
        enum: [
          { label: '有效', value: 1 },
          { label: '禁用', value: 0 }
        ]
      },
      update: { type: 'boolean', title: '更新用户信息' },
      update_username: { type: 'string', title: '更新用户' },
      update_at: { type: 'string', title: '更新时间' }
    },
    required: ['userid', 'update']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 200, grid: { span: 24 } },
    $unionid: { widget: 'text' },
    $name: { widget: 'text' },
    $userid: { widget: 'select', mode: 'default' },
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $update_username: { widget: 'text' },
    $update_at: { widget: 'text' }
  };

  constructor(
    private http: _HttpClient,
    private baseService: BaseService,
    private modal: NzModalRef,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    if (this.record.user) {
      this.i = {
        unionid: this.record.unionid,
        name: this.record.name,
        userid: this.record.user.userid,
        status: this.record.user.status,
        update: true,
        update_username: this.record.user.update_username,
        update_at: format(this.record.user.update_at, 'yyyy-MM-dd HH:mm:ss.SSS')
      };
    } else {
      this.i = {
        unionid: this.record.unionid,
        name: this.record.name,
        userid: 0,
        status: 1,
        update: true
      };
    }
    console.debug('i', this.i);
  }

  save(value: any): void {
    this.http
      .post('dingtalk/user/save', {
        wxworkid: this.record.wxworkid,
        userid: value.userid,
        update: value.update,
        olduserid: this.record.userid
      })
      .subscribe((res: any) => {
        if (res.code === 0) {
          this.messageService.success('关联成功');
          this.modal.close(true);
        }
      });
  }

  close(): void {
    this.modal.destroy();
  }
}
