import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData, STChange } from '@delon/abc/st';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthTokenService } from '..';

@Component({
  selector: 'app-auth-token',
  templateUrl: './token.component.html'
})
export class AuthTokenComponent implements OnInit, OnReuseInit {
  disremove = true;
  stData: STData[] = [];
  checkData: STData[] = [];
  scroll!: { x?: string; y?: string };
  columns: STColumn[] = [{}];

  constructor(private tokenService: AuthTokenService, private msgService: NzMessageService, private baseService: BaseService) {}

  ngOnInit(): void {
    console.debug('窗体内高', window.innerHeight);
    this.baseService.menuWebSub.next('auth');
    this.scroll = { y: `${(window.innerHeight - 0).toString()}px` };
    this.columns = [
      { type: 'checkbox' },
      {
        title: '令牌',
        index: 'token',
        width: 350,
        sort: { compare: (a, b) => a.token.localeCompare(b.token) }
      },
      { title: '用户ID', index: 'userId', width: 75, sort: { compare: (a, b) => a.userId - b.userId } },
      {
        title: '用户姓名',
        index: 'userName',
        sort: { compare: (a, b) => a.userName.localeCompare(b.userName) },
        filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.userName.includes(filter.value) }
      },
      {
        title: '过期时间',
        index: 'expired',
        type: 'date',
        dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
        width: 170,
        sort: { compare: (a, b) => a.expired - b.expired }
      },
      {
        title: '创建时间',
        index: 'createAt',
        type: 'date',
        dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
        width: 170,
        sort: { compare: (a, b) => a.createAt - b.createAt }
      },
      {
        title: '更新时间',
        index: 'updateAt',
        type: 'date',
        dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
        width: 170,
        sort: { compare: (a, b) => a.updateAt - b.updateAt }
      },
      {
        title: '操作',
        buttons: [{ text: '删除', icon: 'delete', type: 'del', click: record => this.remove(record) }]
      }
    ];
    this.getData();
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('auth');
  }

  getData(): void {
    this.tokenService.index().subscribe((data: STData[]) => {
      console.debug('data', data);
      this.stData = data;
    });
  }

  change(value: STChange) {
    if (value.type === 'checkbox') {
      this.checkData = value.checkbox as STData[];
      this.disremove = this.checkData.length === 0;
      console.debug(this.checkData);
    }
  }

  remove(record: STData | null = null): void {
    if (record) {
      this.checkData = [record];
    }
    const allnum = this.checkData.length;
    let curnum = 0;
    for (const item of this.checkData) {
      this.tokenService.destroy(item['token']).subscribe(res => {
        if (res.code) {
          this.msgService.warning(`删除令牌${item['token']}失败`);
        } else {
          this.msgService.success(`删除令牌${item['token']}成功`);
        }
        curnum++;
        if (allnum === curnum) {
          this.getData();
        }
      });
    }
  }
}
