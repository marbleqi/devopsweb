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
      wxworkid: { type: 'string', title: '企业微信ID' },
      name: { type: 'string', title: '企业微信姓名' },
      userid: { type: 'number', title: '系统用户', enum: this.baseSrv.userList() },
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
    $wxworkid: { widget: 'text' },
    $name: { widget: 'text' },
    $userid: { widget: 'select', mode: 'default' },
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $update_username: { widget: 'text' },
    $update_at: { widget: 'text' }
  };

  constructor(
    private readonly client: _HttpClient,
    private readonly baseSrv: BaseService,
    private readonly modal: NzModalRef,
    private readonly msgSrv: NzMessageService
  ) {}

  ngOnInit(): void {
    console.debug('userlist', this.baseSrv.userList());
    if (this.record.user) {
      this.i = {
        wxworkid: this.record.userid,
        name: this.record.name,
        userid: this.record.user.userid,
        status: this.record.user.status,
        update: true,
        update_username: this.record.user.update_username,
        update_at: format(this.record.user.update_at, 'yyyy-MM-dd HH:mm:ss.SSS')
      };
    } else {
      this.i = {
        wxworkid: this.record.userid,
        name: this.record.name,
        userid: 0,
        status: 1,
        update: true
      };
    }
  }

  save(value: any): void {
    this.client
      .post('wxwork/user/save', { wxworkid: this.record.userid, userid: value.userid, status: value.status, update: value.update })
      .subscribe((res: any) => {
        if (res.code === 0) {
          this.msgSrv.success('关联成功');
          this.modal.close(true);
        }
      });
  }

  close(): void {
    this.modal.destroy();
  }
}
