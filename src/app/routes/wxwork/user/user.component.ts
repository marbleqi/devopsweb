import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STColumnTag, STData } from '@delon/abc/st';
import { SFSchema, SFUISchema } from '@delon/form';
import { Result } from '@shared';
import { Observable, map, mergeMap, catchError, of, zip } from 'rxjs';

import { WxworkUserService, WxworkUserEditComponent, WxworkUserAddComponent } from '..';
@Component({
  selector: 'app-wxwork-user',
  templateUrl: './user.component.html'
})
export class WxworkUserComponent implements OnInit, OnReuseInit {
  i: any;
  value: any;
  departId!: number;
  schema: SFSchema = { properties: { depart: { type: 'number', title: '部门' } } };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 150 },
    $depart: {
      widget: 'tree-select',
      width: 450,
      virtualHeight: '800px',
      showLine: true,
      defaultExpandAll: true,
      change: (value: number) => this.departChange(value),
      asyncData: () => this.userService.depart()
    }
  };
  stData: STData[] = [];
  columns: STColumn[] = [
    {
      title: '企业微信用户',
      children: [
        { title: '用户ID', index: 'userId', width: 130 },
        { title: '姓名', index: 'name', width: 100 }
      ]
    },
    {
      title: '关联系统用户',
      children: [
        { title: '用户ID', index: 'user.userId', width: 100 },
        { title: '姓名', index: 'user.userName', width: 150 },
        {
          title: '状态',
          index: 'user.status',
          width: 100,
          sort: { compare: (a, b) => a.status - b.status },
          type: 'tag',
          tag: {
            1: { text: '有效', color: 'green' },
            0: { text: '禁用', color: 'red' }
          } as STColumnTag
        },
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
          tooltip: '修改用户信息',
          iif: record => !record?.user,
          click: () => this.getData(),
          modal: { component: WxworkUserEditComponent }
        },
        {
          text: '新建用户并关联',
          icon: 'edit',
          type: 'modal',
          tooltip: '修改用户信息',
          iif: record => !record?.user,
          click: () => this.getData(),
          modal: { component: WxworkUserAddComponent }
        },
        {
          text: '编辑',
          icon: 'edit',
          type: 'modal',
          tooltip: '修改用户信息',
          iif: record => !!record?.user,
          click: () => this.getData(),
          modal: { component: WxworkUserEditComponent }
        }
      ]
    }
  ];

  constructor(private baseService: BaseService, private userService: WxworkUserService) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('wxwork');
    this.userService.init().subscribe();
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('wxwork');
  }

  departChange(value: number) {
    this.departId = value;
    this.getData();
  }

  getData(): void {
    if (this.departId) {
      this.userService.init().subscribe(() => {
        this.userService.index(this.departId).subscribe(res => {
          this.stData = res.map((item: any) => {
            const user = this.userService.userMap.get(item.userId);
            if (user) {
              return { ...item, user };
            }
            return item;
          });
        });
      });
    }
  }
}
