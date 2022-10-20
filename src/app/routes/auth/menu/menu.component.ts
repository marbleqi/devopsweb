import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData, STColumnTag } from '@delon/abc/st';
import { SFSchema, SFSchemaEnum, SFUISchema } from '@delon/form';
import { ModalHelper } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { SortComponent } from '@shared';
import { Subject } from 'rxjs';

import { AuthMenuService, AuthMenuEditComponent } from '..';

const statustag: STColumnTag = {
  1: { text: '有效', color: 'green' },
  2: { text: '停用', color: 'red' }
};

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
  scroll!: { x?: string; y?: string };
  stData!: STData[];
  columns: STColumn[] = [
    { title: '菜单ID', index: 'menuId', width: 100, sort: { compare: (a, b) => a.menuId - b.menuId } },
    {
      title: '标题',
      index: 'config.text',
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
      index: 'config.link',
      width: 150,
      sort: { compare: (a, b) => a.config.link.localeCompare(b.config.link) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.link.includes(filter.value) }
    },
    { title: '状态', index: 'status', width: 100, sort: { compare: (a, b) => a.status - b.status }, type: 'tag', tag: statustag },
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
          click: (record, modal) => this.getData(modal)
        },
        {
          text: '复制',
          icon: 'copy',
          type: 'modal',
          modal: { component: AuthMenuEditComponent, params: () => ({ copy: true }) },
          click: (record, modal) => this.getData(modal)
        }
      ]
    }
  ];

  constructor(private baseSrv: BaseService, private menuSrv: AuthMenuService, private arrSrv: ArrayService, private modal: ModalHelper) {
    console.debug('菜单构建函数执行');
    this.baseSrv.menuChange('auth');
    this.menuSubject = new Subject<any[]>();
  }

  ngOnInit(): void {
    console.debug('菜单初始化函数执行');
    this.columns = this.columns.map((item: STColumn) => ({ ...item, className: 'text-center' }));
    console.debug('窗体内高', window.innerHeight);
    this.scroll = { y: `${(window.innerHeight - 489).toString()}px` };
    this.reload();
    this.i = { pMenuId: 0 };
    this.getData(0);
  }

  _onReuseInit(): void {
    this.baseSrv.menuChange('auth');
  }

  reload() {
    this.menuSrv.index().subscribe(res => {
      console.debug('获取的所有菜单数据', res);
      let pidlist: SFSchemaEnum[] = res
        .filter(item => !item.config.isLeaf)
        .map(item => ({ title: item.config.text, key: item.menuId, pMenuId: item.pMenuId }));
      pidlist.unshift({ title: '主菜单', key: 0, expanded: true });
      pidlist = this.arrSrv.arrToTree(pidlist, { idMapName: 'key', parentIdMapName: 'pMenuId' });
      console.debug('下拉列表获取数据', pidlist);
      this.menuSubject.next(pidlist);
    });
  }

  getData(pMenuId: number, operateId?: number): void {
    this.pMenuId = pMenuId;
    this.menuSrv.index(operateId).subscribe(res => {
      console.debug('获取的所有菜单数据', res);
      this.stData = res.filter(item => item.pMenuId === this.pMenuId);
      console.debug('数据列表获取数据', this.stData);
      this.dissort = this.stData.length <= 1;
    });
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
