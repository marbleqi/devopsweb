import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData, STColumnTag } from '@delon/abc/st';
import { SFSchema, SFSchemaEnum, SFUISchema } from '@delon/form';
import { ModalHelper } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { LogComponent, SortComponent } from '@shared';
import { Subject } from 'rxjs';

import { AuthMenuService, AuthMenuEditComponent } from '..';

@Component({
  selector: 'app-auth-menu',
  templateUrl: './menu.component.html'
})
export class AuthMenuComponent implements OnInit, OnReuseInit {
  pMenuId = 0;
  dissort = true;
  menuSubject: Subject<any[]>;
  i: any = {};
  schema: SFSchema = {
    properties: {
      pMenuId: { type: 'number', title: '上级菜单' }
    }
  };
  ui: SFUISchema = {
    $pMenuId: {
      widget: 'tree-select',
      width: 300,
      showLine: true,
      defaultExpandAll: true,
      change: (value: number) => this.getData(value),
      asyncData: () => this.menuSubject.asObservable()
    }
  };
  stData!: STData[];
  columns: STColumn[] = [
    { title: '菜单ID', index: 'menuId', width: 100, sort: { compare: (a, b) => a.menuId - b.menuId } },
    {
      title: '标题',
      render: 'name',
      width: 150,
      sort: { compare: (a, b) => a.config.text.localeCompare(b.config.text) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.text.includes(filter.value) }
    },
    {
      title: '说明',
      index: 'config.description',
      width: 200,
      sort: { compare: (a, b) => a.config.description.localeCompare(b.config.description) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.description.includes(filter.value) }
    },
    { title: '图标', render: 'icon', width: 50 },
    {
      title: '链接',
      index: 'link',
      width: 150,
      sort: { compare: (a, b) => a.config.link.localeCompare(b.config.link) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.link.includes(filter.value) }
    },
    {
      title: '状态',
      index: 'status',
      width: 100,
      sort: { compare: (a, b) => a.status - b.status },
      type: 'tag',
      tag: {
        1: { text: '有效', color: 'green' },
        0: { text: '禁用', color: 'red' }
      } as STColumnTag,
      filter: {
        menus: [
          { value: 1, text: '有效', checked: true },
          { value: 0, text: '禁用' }
        ],
        multiple: true,
        fn: (filter, record) => filter.value === null || filter.value === record.status
      }
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
      buttons: [
        {
          text: '编辑',
          icon: 'edit',
          type: 'modal',
          modal: { component: AuthMenuEditComponent, params: () => ({ copy: false }) },
          click: modal => this.getData(modal)
        },
        {
          text: '复制',
          icon: 'copy',
          type: 'modal',
          modal: { component: AuthMenuEditComponent, params: () => ({ copy: true }) },
          click: modal => this.getData(modal)
        },
        {
          text: '变更历史',
          icon: 'history',
          type: 'modal',
          modal: {
            component: LogComponent,
            params: record => ({
              title: `查看菜单${record.config.text}变更历史`,
              url: `auth/menu/${record.menuId}/log`,
              columns: [
                { title: '菜单ID', index: 'menuId', width: 100 },
                { title: '标题', index: 'config.text', width: 150 },
                { title: '说明', index: 'config.description', width: 200 },
                { title: '图标', index: 'config.icon', width: 50 },
                { title: '链接', index: 'config.link', width: 150 },
                { title: '状态', index: 'status', width: 100 },
                { title: '更新人', index: 'updateUserName', width: 150 },
                { title: '更新时间', index: 'updateAt', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS', width: 170 }
              ]
            }),
            size: 1800
          },
          click: modal => this.getData(modal)
        }
      ]
    }
  ];

  constructor(
    private baseService: BaseService,
    private menuService: AuthMenuService,
    private arrService: ArrayService,
    private modal: ModalHelper
  ) {
    console.debug('菜单构建函数执行');
    this.baseService.menuWebSub.next('auth');
    this.menuSubject = new Subject<any[]>();
  }

  ngOnInit(): void {
    console.debug('菜单初始化函数执行');
    this.columns = this.columns.map((item: STColumn) => ({ ...item, className: 'text-center' }));
    this.reload();
    this.i = { pMenuId: 0 };
    this.getData(0);
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('auth');
  }

  reload() {
    this.menuService.index().subscribe(res => {
      console.debug('获取的所有菜单数据', res);
      let pidlist: SFSchemaEnum[] = res
        .filter(item => !item.config.isLeaf)
        .map(item => ({ title: item.config.text, key: item.menuId, pMenuId: item.pMenuId }));
      pidlist.unshift({ title: '主菜单', key: 0, expanded: true });
      pidlist = this.arrService.arrToTree(pidlist, { idMapName: 'key', parentIdMapName: 'pMenuId' });
      console.debug('下拉列表获取数据', pidlist);
      this.menuSubject.next(pidlist);
    });
  }

  getData(pMenuId: number, operateId?: number): void {
    this.pMenuId = pMenuId;
    this.menuService.index(operateId).subscribe(res => {
      console.debug('获取的所有菜单数据', res);
      this.stData = res.filter(item => item.pMenuId === this.pMenuId);
      console.debug('数据列表获取数据', this.stData);
      this.dissort = this.stData.length <= 1;
    });
  }

  edit(record: any, copy: boolean): void {
    this.modal.createStatic(AuthMenuEditComponent, { record, copy }, { size: 'xl' }).subscribe(modal => this.getData(modal));
  }

  log(record: any): void {
    this.modal
      .createStatic(
        LogComponent,
        {
          title: `查看菜单${record.config.text}变更历史`,
          url: `auth/menu/${record.menuId}/log`,
          columns: [
            { title: '菜单ID', index: 'menuId', width: 100 },
            { title: '标题', index: 'config.text', width: 150 },
            { title: '说明', index: 'config.description', width: 200 },
            { title: '图标', index: 'config.icon', width: 50 },
            { title: '链接', index: 'config.link', width: 150 },
            { title: '状态', index: 'status', width: 100 },
            { title: '更新人', index: 'updateUserName', width: 150 },
            { title: '更新时间', index: 'updateAt', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS', width: 170 }
          ] as STColumn[]
        },
        { size: 'xl' }
      )
      .subscribe(modal => this.getData(modal));
  }

  add(): void {
    this.modal
      .createStatic(AuthMenuEditComponent, { record: false, copy: false, pMenuId: this.pMenuId || 0 }, { size: 'xl' })
      .subscribe(pMenuId => this.getData(pMenuId));
  }

  sort(): void {
    this.modal
      .createStatic(SortComponent, {
        title: '菜单拖动排序',
        titles: ['菜单编号', '菜单名称', '菜单说明', '新排序号'],
        fields: ['menuId', 'title', 'description', 'index'],
        url: 'auth/menu/sort',
        keys: ['menuId'],
        sortData: this.stData.map((item: any) => ({ menuId: item.menuId, title: item.config.text, description: item.config.description }))
      })
      .subscribe(() => this.getData(this.pMenuId, 0));
  }
}
