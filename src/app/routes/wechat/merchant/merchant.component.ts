import { Component, ViewChild, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STComponent, STColumn, STData, STColumnTag } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { LogComponent, SortComponent } from '@shared';

import { WechatMerchantService, WechatMerchantEditComponent } from '..';

@Component({
  selector: 'app-wechat-merchant',
  templateUrl: './merchant.component.html'
})
export class WechatMerchantComponent implements OnInit, OnReuseInit {
  dissort = true;
  @ViewChild('st') private st!: STComponent;
  stData: STData[] = [];
  columns: STColumn[] = [
    { title: '商家ID', index: 'mchid', sort: { compare: (a, b) => a.mchid.localeCompare(b.mchid) } },
    {
      title: '企业ID',
      index: 'appid',
      sort: { compare: (a, b) => a.appid.localeCompare(b.appid) }
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
          modal: { component: WechatMerchantEditComponent, params: () => ({ copy: false }), size: 1800 },
          click: () => this.getData()
        },
        {
          text: '复制',
          icon: 'copy',
          type: 'modal',
          modal: { component: WechatMerchantEditComponent, params: () => ({ copy: true }), size: 1800 },
          click: () => this.getData()
        },
        {
          text: '变更历史',
          icon: 'history',
          type: 'modal',
          modal: {
            component: LogComponent,
            params: record => ({
              title: `查看商家${record.name}变更历史`,
              url: `wechat/merchant/${record.mchid}/log`,
              columns: [
                { title: '日志ID', index: 'logId', width: 100 },
                { title: '商家ID', index: 'mchid', width: 100 },
                { title: '企业ID', index: 'appid' },
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
  ];

  constructor(private baseService: BaseService, private merchantService: WechatMerchantService, private modal: ModalHelper) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('wechat');
    this.getData();
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('wechat');
  }

  getData(operateId?: number): void {
    this.merchantService.index(operateId).subscribe(hostList => {
      this.stData = hostList;
      this.dissort = this.stData.length < 2;
    });
  }

  add(): void {
    this.modal.createStatic(WechatMerchantEditComponent, { record: false }, { size: 'xl' }).subscribe(() => this.getData());
  }

  sort(): void {
    this.modal
      .createStatic(SortComponent, {
        title: '商家拖动排序',
        titles: ['商家微信ID', '商家名称', '新排序号'],
        fields: ['mchid', 'appid', 'index'],
        url: 'wechat/merchant/sort',
        keys: ['mchid'],
        sortData: this.stData.map((item: any) => ({ roleId: item.roleId, roleName: item.roleName }))
      })
      .subscribe(() => this.getData(0));
  }
}
