import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData, STColumnTag } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthUserService, AuthUserEditComponent, AuthUserResetComponent } from '..';

const statustag: STColumnTag = {
  0: { text: '停用', color: 'red' },
  1: { text: '有效', color: 'green' }
};

@Component({
  selector: 'app-auth-user',
  templateUrl: './user.component.html'
})
export class AuthUserComponent implements OnInit, OnReuseInit {
  loading: boolean = false;
  stData: STData[] = [];
  scroll!: { x?: string; y?: string };
  columns: STColumn[] = [{}];

  constructor(
    private baseSrv: BaseService,
    private userSrv: AuthUserService,
    private msgSrv: NzMessageService,
    private modal: ModalHelper
  ) {}

  ngOnInit(): void {
    this.baseSrv.menuChange('auth');
    this.columns = [
      { title: '用户ID', index: 'userid', width: 100, sort: { compare: (a, b) => a.userid - b.userid } },
      {
        title: '登陆名',
        index: 'loginname',
        filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.loginname.includes(filter.value) }
      },
      {
        title: '姓名',
        index: 'config.userName',
        filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.userName.includes(filter.value) }
      },
      { title: '状态', index: 'status', width: 100, sort: { compare: (a, b) => a.status - b.status }, type: 'tag', tag: statustag },
      { title: '更新人', index: 'update_userName', width: 150 },
      {
        title: '更新时间',
        index: 'update_at',
        type: 'date',
        dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
        width: 170,
        sort: { compare: (a, b) => a.update_at - b.update_at }
      },
      {
        title: '操作',
        className: 'text-center',
        buttons: [
          {
            text: '编辑',
            icon: 'edit',
            type: 'modal',
            tooltip: '修改用户信息',
            click: () => this.getData(),
            modal: { component: AuthUserEditComponent, params: () => ({ copy: false }) }
          },
          {
            text: '复制',
            icon: 'copy',
            type: 'modal',
            tooltip: '以用户参数为模板，创建新的用户',
            click: () => this.getData(),
            modal: { component: AuthUserEditComponent, params: () => ({ copy: true }) }
          },
          {
            text: '更多',
            children: [
              { text: '解锁', icon: 'lock', click: record => this.unlock(record), tooltip: '解锁用户' },
              {
                text: '重置密码',
                icon: 'setting',
                type: 'modal',
                tooltip: '重置用户密码',
                click: () => this.getData(),
                modal: { component: AuthUserResetComponent, params: () => ({ copy: false }), size: 'sm' }
              }
            ]
          }
        ]
      }
    ];
    console.debug('窗体内高', window.innerHeight);
    this.scroll = { y: `${(window.innerHeight - 0).toString()}px` };
    this.getData();
  }

  _onReuseInit(): void {
    this.baseSrv.menuChange('auth');
  }

  getData(): void {
    this.loading = true;
    console.debug('获取用户数据');
    this.userSrv.index().subscribe(res => {
      this.stData = res;
      this.loading = false;
    });
  }

  add(): void {
    this.modal.createStatic(AuthUserEditComponent, { record: false }, { size: 'xl' }).subscribe(() => this.getData());
  }

  unlock(record: STData): void {
    this.userSrv.unlock(record['userid']).subscribe(res => {
      if (res.code) {
        this.msgSrv.warning('解锁失败');
      } else {
        this.msgSrv.success('解锁成功');
      }
    });
  }
}
