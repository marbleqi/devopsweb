import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData, STColumnTag } from '@delon/abc/st';
import { SFSchema, SFUISchema, SFComponent, SFSchemaEnum } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { format, fromUnixTime, getUnixTime } from 'date-fns';
import { NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject, of } from 'rxjs';

import { DingtalkUserService, DingtalkUserAddComponent, DingtalkUserEditComponent } from '..';

const statustag: STColumnTag = {
  0: { text: '禁用', color: 'red' },
  1: { text: '有效', color: 'green' }
};

@Component({
  selector: 'app-dingtalk-user',
  templateUrl: './user.component.html'
})
export class DingtalkUserComponent implements OnInit, OnReuseInit {
  i: any;
  value: any;
  departid!: number;
  @ViewChild('sf') private readonly sf!: SFComponent;
  schema: SFSchema = {
    properties: { id: { type: 'number', title: '部门', enum: [{ key: 1, title: '根部门' }], default: 1 } },
    required: ['id']
  };
  ui: SFUISchema = {
    $id: {
      widget: 'tree-select',
      width: 500,
      virtualHeight: '800px',
      showLine: true,
      expandChange: (e: NzFormatEmitEvent) => {
        if (e.node?.key) {
          return this.userSrv.depart(Number(e.node?.key));
        }
        return of([]);
      },
      change: (value: number) => this.departChange(value)
    }
  };
  stdata: STData[] = [];
  columns: STColumn[] = [
    {
      title: '钉钉用户',
      children: [
        { title: '手机号', index: 'mobile' },
        { title: '姓名', index: 'name' },
        { title: '头像', type: 'img', index: 'avatar' }
      ]
    },
    {
      title: '关联系统用户',
      children: [
        { title: '用户ID', index: 'user.userId', width: 100 },
        { title: '姓名', index: 'user.userName', width: 150 },
        { title: '状态', index: 'user.status', width: 100, sort: { compare: (a, b) => a.status - b.status }, type: 'tag', tag: statustag },
        { title: '更新人', index: 'user.updateUserName', width: 100 },
        {
          title: '更新时间',
          index: 'user.updateAt',
          type: 'date',
          dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
          width: 170,
          sort: { compare: (a, b) => a.updateAt - b.updateAt }
        }
      ]
    },
    {
      title: '操作',
      buttons: [
        {
          text: '关联已有用户',
          icon: 'edit',
          type: 'modal',
          iif: record => !record?.user,
          modal: { component: DingtalkUserEditComponent },
          click: () => this.getdata()
        },
        {
          text: '新建用户并关联',
          icon: 'edit',
          type: 'modal',
          tooltip: '修改用户信息',
          iif: record => !record?.user,
          click: () => this.getdata(),
          modal: { component: DingtalkUserAddComponent }
        },
        {
          text: '编辑',
          icon: 'edit',
          type: 'modal',
          iif: record => !!record?.user,
          modal: { component: DingtalkUserEditComponent },
          click: () => this.getdata()
        }
      ]
    }
  ];

  constructor(private readonly baseSrv: BaseService, private readonly userSrv: DingtalkUserService) {}

  ngOnInit(): void {
    this.baseSrv.menuWebSub.next('dingtalk');
    this.userSrv.init();
  }

  _onReuseInit(): void {
    this.baseSrv.menuWebSub.next('dingtalk');
    console.debug('页面路由复用初始化');
  }

  departChange(value: number) {
    console.debug('value', value);
    this.departid = value;
  }

  getdata(value?: any): void {
    console.debug('查询条件', value);
    if (value?.id) {
      this.userSrv.index(value.id).subscribe(res => {
        console.debug('钉钉用户数据', res);
        this.stdata = res;
        this.stdata = res.map((item: any) => {
          const user = this.userSrv.userMap.get(item.unionId);
          if (user) {
            return { ...item, user };
          }
          return item;
        });
        console.debug('stdata', this.stdata);
      });
    }
  }
}
