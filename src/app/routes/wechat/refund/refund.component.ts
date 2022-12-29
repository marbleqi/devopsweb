import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STComponent, STData, STColumnTag } from '@delon/abc/st';
import { SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map } from 'rxjs';

import { WechatMerchantService, WechatRefundService } from '..';

@Component({
  selector: 'app-wechat-refund',
  templateUrl: './refund.component.html'
})
export class WechatRefundComponent implements OnInit {
  mchid: string | null = null;
  searching: boolean = false;
  refunding: boolean = false;
  schema: SFSchema = {
    properties: {
      mchid: { type: 'string', title: '商户ID' },
      order_type: {
        type: 'string',
        title: '订单类型',
        enum: [
          { label: '商户订单号', value: 'out_trade_no' },
          { label: '微信支付订单号', value: 'transaction_id' }
        ],
        default: 'out_trade_no'
      },
      out_trade_no: { type: 'string', title: '商户订单号' },
      transaction_id: { type: 'string', title: '微信支付订单号' }
    }
  };
  ui: SFUISchema = {
    $mchid: {
      widget: 'select',
      mode: 'default',
      asyncData: () => this.wechatMerchantService.index().pipe(map(res => res.map(item => ({ label: item.mchid, value: item.mchid })))),
      change: (value: string) => this.mchChange(value),
      spanLabelFixed: 100,
      width: 200
    },
    $ordertype: { spanLabelFixed: 100, width: 300, widget: 'select', mode: 'default' },
    $out_trade_no: {
      spanLabelFixed: 100,
      width: 400,
      visibleIf: { order_type: ['out_trade_no'] }
    },
    $transaction_id: {
      spanLabelFixed: 100,
      width: 400,
      visibleIf: { order_type: ['transaction_id'] }
    }
  };
  i: any = {};
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
    }
  ];

  constructor(
    private baseService: BaseService,
    private wechatMerchantService: WechatMerchantService,
    private wechatRefundService: WechatRefundService,
    private msgSrv: NzMessageService
  ) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('wechat');
    if (localStorage.getItem('wxpay_mchid')) {
      this.mchid = localStorage.getItem('wxpay_mchid');
      this.i = { mchid: this.mchid, ordertype: 'out_trade_no' };
    }
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('wechat');
  }

  mchChange(mchid: string): void {
    localStorage.setItem('wxpay_mchid', mchid);
    this.mchid = mchid;
    console.debug('mchid', this.mchid);
  }

  search(value: any): void {
    if (!this.mchid) {
      this.msgSrv.warning('请选择有效商户！');
      return;
    }
    if (value.ordertype === 'out_trade_no' && !value.out_trade_no) {
      this.msgSrv.warning('商户订单号必填！');
      return;
    }
    if (value.ordertype === 'transaction_id' && !value.transaction_id) {
      this.msgSrv.warning('微信支付订单号必填！');
      return;
    }
    const orderType = value.ordertype;
    const orderId = value.ordertype === 'out_trade_no' ? value.out_trade_no : value.transaction_id;
    this.searching = true;
    // this.wechatOrderService.show(this.mchid, orderType, orderId).subscribe((res: any) => {
    //   if (res.code) {
    //     this.msgSrv.warning(res.msg);
    //   } else {
    //     this.orderi = { ...res.data, refund: res.data.amount };
    //     this.disrefund = false;
    //   }
    //   this.searching = false;
    // });
  }
}
