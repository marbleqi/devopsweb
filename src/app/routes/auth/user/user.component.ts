import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData, STColumnTag } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { LogComponent } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthUserService, AuthUserEditComponent, AuthUserResetComponent } from '..';

@Component({
  selector: 'app-auth-user',
  templateUrl: './user.component.html'
})
export class AuthUserComponent implements OnInit, OnReuseInit {
  loading: boolean = false;
  stData: STData[] = [];
  scroll!: { x?: string; y?: string };
  columns: STColumn[] = [
    { title: '用户ID', index: 'userId', width: 100, sort: { compare: (a, b) => a.userId - b.userId } },
    {
      title: '登陆名',
      index: 'loginName',
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.loginName.includes(filter.value) }
    },
    {
      title: '姓名',
      index: 'userName',
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.userName.includes(filter.value) }
    },
    {
      title: '状态',
      index: 'status',
      width: 100,
      sort: { compare: (a, b) => a.status - b.status },
      type: 'tag',
      tag: {
        1: { text: '有效', color: 'green' },
        2: { text: '停用', color: 'red' }
      } as STColumnTag
    },
    { title: '更新人', index: 'updateUserName', width: 150 },
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
            },
            {
              text: '变更历史',
              icon: 'history',
              type: 'modal',
              modal: {
                component: LogComponent,
                params: record => ({
                  title: `查看用户${record.userName}变更历史`,
                  url: `auth/user/${record.userId}/log`,
                  columns: [
                    { title: '角色ID', index: 'userId', width: 100 },
                    { title: '登陆名', index: 'loginName', width: 150 },
                    { title: '姓名', index: 'userName', width: 150 },
                    { title: '状态', index: 'status', width: 100 },
                    { title: '更新人', index: 'updateUserName', width: 150 },
                    { title: '更新时间', index: 'updateAt', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS', width: 170 }
                  ]
                }),
                size: 1800
              },
              click: (record, modal) => this.getData()
            }
          ]
        }
      ]
    }
  ];

  constructor(
    private baseService: BaseService,
    private userService: AuthUserService,
    private msgService: NzMessageService,
    private modal: ModalHelper
  ) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('auth');
    console.debug('窗体内高', window.innerHeight);
    this.scroll = { y: `${(window.innerHeight - 0).toString()}px` };
    this.getData();
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('auth');
  }

  getData(): void {
    this.loading = true;
    console.debug('获取用户数据');
    this.userService.index().subscribe(res => {
      this.stData = res;
      this.loading = false;
    });
  }

  add(): void {
    this.modal.createStatic(AuthUserEditComponent, { record: false }, { size: 'xl' }).subscribe(() => this.getData());
  }

  unlock(record: STData): void {
    this.userService.unlock(record['userId']).subscribe(res => {
      if (res.code) {
        this.msgService.warning('解锁失败');
      } else {
        this.msgService.success('解锁成功');
      }
    });
  }
}
