import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-wxwork-user-edit',
  templateUrl: './edit.component.html'
})
export class WxworkUserEditComponent implements OnInit {
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      wxworkId: { type: 'string', title: '企业微信ID' },
      name: { type: 'string', title: '企业微信姓名' },
      userId: { type: 'number', title: '系统用户' },
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
    '*': { spanLabelFixed: 200, grid: { span: 12 } },
    $wxworkId: { widget: 'text' },
    $name: { widget: 'text' },
    $userId: { widget: 'select', mode: 'default', asyncData: () => this.baseService.userSub },
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $update_username: { widget: 'text' },
    $update_at: { widget: 'text' }
  };

  constructor(
    private clientService: _HttpClient,
    private baseService: BaseService,
    private modal: NzModalRef,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    console.debug('userlist', this.baseService.userList());
    if (this.record.user) {
      this.i = {
        wxworkId: this.record.userId,
        name: this.record.name,
        userId: this.record.user.userId,
        status: this.record.user.status,
        update: true,
        updateUserName: this.record.user.updateUserName,
        updateAt: format(this.record.user.updateAt, 'yyyy-MM-dd HH:mm:ss.SSS')
      };
    } else {
      this.i = {
        wxworkid: this.record.userId,
        name: this.record.name,
        userid: 0,
        status: 1,
        update: true
      };
    }
  }

  save(value: any): void {
    this.clientService
      .post('wxwork/user/save', { wxworkId: this.record.userId, userId: value.userId, status: value.status, update: value.update })
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
