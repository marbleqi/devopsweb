import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map } from 'rxjs';

import { WechatMerchantService, WechatOrderService, WechatRefundService } from '..';

@Component({
  selector: 'app-wechat-order',
  templateUrl: './order.component.html'
})
export class WechatOrderComponent implements OnInit, OnReuseInit {
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
          { label: '微信订单号', value: 'transaction_id' }
        ],
        default: 'out_trade_no'
      },
      out_trade_no: { type: 'string', title: '商户订单号' },
      transaction_id: { type: 'string', title: '微信订单号' }
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
    $ordertype: { spanLabelFixed: 100, width: 400, widget: 'select', mode: 'default' },
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
  orderschema: SFSchema = {
    properties: {
      mchid: { type: 'string', title: '商户ID' },
      transaction_id: { type: 'string', title: '微信订单号' },
      out_trade_no: { type: 'string', title: '商户订单号' },
      success_time: { type: 'string', title: '支付时间' },
      trade_state: { type: 'string', title: '支付状态' },
      trade_state_desc: { type: 'string', title: '支付结果' },
      amount: { type: 'number', title: '订单金额（单位：分）' },
      refund: { type: 'number', title: '退款金额（单位：分）' }
    },
    required: ['refund']
  };
  orderui: SFUISchema = {
    '*': { spanLabelFixed: 200, grid: { span: 12 } },
    $mchid: { widget: 'text' },
    $transaction_id: { widget: 'text' },
    $out_trade_no: { widget: 'text' },
    $success_time: { widget: 'text' },
    $trade_state: { widget: 'text' },
    $trade_state_desc: { widget: 'text' },
    $amount: { widget: 'text' },
    $refund: { widget: 'string', visibleIf: { trade_state: ['SUCCESS', 'REFUND'] } }
  };
  orderi: any = null;
  disrefund: boolean = true;

  constructor(
    private baseService: BaseService,
    private wechatMerchantService: WechatMerchantService,
    private wechatOrderService: WechatOrderService,
    private wechatRefundService: WechatRefundService,
    private msgSrv: NzMessageService
  ) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('wechat');
    if (this.wechatMerchantService.mchid) {
      this.i = { mchid: this.wechatMerchantService.mchid, ordertype: 'out_trade_no' };
    } else {
      this.i = { ordertype: 'out_trade_no' };
    }
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('wechat');
  }

  mchChange(mchid: string): void {
    this.wechatMerchantService.mchid = mchid;
  }

  search(value: any): void {
    if (!this.wechatMerchantService.mchid) {
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
    this.wechatOrderService.show(this.wechatMerchantService.mchid, orderType, orderId).subscribe((res: any) => {
      if (res.code) {
        this.msgSrv.warning(res.msg);
      } else {
        this.orderi = { ...res.data, refund: res.data.amount };
        this.disrefund = false;
      }
      this.searching = false;
    });
  }

  refund(value: any): void {
    if (!value.refund) {
      this.msgSrv.warning('请输入退款金额！');
      return;
    }
    if (value.refund <= 0 || value.refund > value.amount) {
      this.msgSrv.warning('退款金额必须大于0，且不大于订单付款金额！');
      return;
    }
    this.refunding = true;
    const params = { mchid: value.mchid, out_trade_no: value.out_trade_no, amount: value.amount, refund: value.refund };
    this.wechatRefundService.create(params).subscribe((res: any) => {
      if (res.code === 0) {
        this.msgSrv.success('退款成功！');
        this.disrefund = true;
      } else {
        this.msgSrv.warning(res.msg);
      }
      this.refunding = false;
    });
  }
}
