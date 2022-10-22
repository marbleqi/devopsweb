import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STColumnTag, STData } from '@delon/abc/st';
import { SFSchema, SFUISchema } from '@delon/form';
import { Observable, map, mergeMap, catchError, of } from 'rxjs';

import { WxworkUserService, WxworkUserEditComponent, WxworkUserAddComponent } from '..';

const statustag: STColumnTag = {
  0: { text: '禁用', color: 'red' },
  1: { text: '有效', color: 'green' }
};

@Component({
  selector: 'app-wxwork-user',
  templateUrl: './user.component.html'
})
export class WxworkUserComponent implements OnInit, OnReuseInit {
  i: any;
  value: any;
  departid!: number;
  schema: SFSchema = { properties: { depart: { type: 'number', title: '部门' } } };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 150 },
    $depart: {
      widget: 'tree-select',
      width: 450,
      virtualHeight: '800px',
      showLine: true,
      defaultExpandAll: true,
      change: (value: number) => this.departChange(value)
      // asyncData: () => this.departSrv.department()
    }
  };
  stdata: STData[] = [];
  columns: STColumn[] = [
    {
      title: '企业微信用户',
      children: [
        { title: '用户ID', index: 'userid', width: 130 },
        { title: '姓名', index: 'name', width: 100 }
      ]
    },
    {
      title: '关联系统用户',
      children: [
        { title: '用户ID', index: 'user.userid', width: 100 },
        { title: '姓名', index: 'user.username', width: 150 },
        { title: '状态', index: 'user.status', width: 100, sort: { compare: (a, b) => a.status - b.status }, type: 'tag', tag: statustag },
        { title: '更新人', index: 'user.update_username', width: 100 },
        {
          title: '更新时间',
          index: 'user.update_at',
          type: 'date',
          dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
          width: 170,
          sort: { compare: (a, b) => a.update_at - b.update_at }
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
          click: () => this.getdata(),
          modal: { component: WxworkUserEditComponent }
        },
        {
          text: '新建用户并关联',
          icon: 'edit',
          type: 'modal',
          tooltip: '修改用户信息',
          iif: record => !record?.user,
          click: () => this.getdata(),
          modal: { component: WxworkUserAddComponent }
        },
        {
          text: '编辑',
          icon: 'edit',
          type: 'modal',
          tooltip: '修改用户信息',
          iif: record => !!record?.user,
          click: () => this.getdata(),
          modal: { component: WxworkUserEditComponent }
        }
      ]
    }
  ];

  constructor(private readonly baseSrv: BaseService, private readonly userSrv: WxworkUserService) {}

  ngOnInit(): void {
    this.baseSrv.menuWebSub.next('wxwork');
  }

  _onReuseInit(): void {
    this.baseSrv.menuWebSub.next('wxwork');
  }

  departChange(value: number) {
    this.departid = value;
    this.getdata();
  }

  getdata(): void {
    if (this.departid) {
      this.userSrv.index().subscribe(() => {
        this.userSrv.index(this.departid).subscribe(res => {
          this.stdata = res.map((item: any) => {
            const user = this.userSrv.usermap.get(item.userid);
            if (user) {
              return { ...item, user };
            }
            return item;
          });
          console.debug('stdata', this.stdata);
        });
      });
    }
  }
}
