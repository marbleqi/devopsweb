import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STComponent, STData, STColumnTag } from '@delon/abc/st';
import { SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map } from 'rxjs';

import { WechatMerchantService, WechatRefundService } from '..';

@Component({
  selector: 'app-wechat-refund',
  templateUrl: './refund.component.html'
})
export class WechatRefundComponent implements OnInit, OnReuseInit {
  searching: boolean = false;
  refunding: boolean = false;
  schema: SFSchema = {
    properties: {
      mchid: { type: 'string', title: '商户ID' },
      createAt: { type: 'string', title: '退款时间' }
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
    $createAt: { spanLabelFixed: 100, width: 300, widget: 'date', mode: 'range', format: 'yyyy-MM-dd', displayFormat: 'yyyy-MM-dd' }
  };
  i: any = {};
  stData: STData[] = [];
  columns: STColumn[] = [
    { title: '退款单号', index: 'refund_id' },
    { title: '商家订单号', index: 'out_trade_no' },
    { title: '退款状态', index: 'status' },
    { title: '订单金额', index: 'amount.total' },
    { title: '退款金额', index: 'amount.refund' },
    { title: '应结订单金额', index: 'amount.settlement_total' },
    { title: '应结退款金额', index: 'amount.settlement_refund' },
    { title: '操作人', index: 'createUserName', width: 150 },
    {
      title: '操作时间',
      index: 'createAt',
      type: 'date',
      dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
      width: 170,
      sort: { compare: (a, b) => a.createAt - b.createAt }
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
    if (this.wechatMerchantService.mchid) {
      this.i = { mchid: this.wechatMerchantService.mchid, createAt: [format(Date.now(), 'yyyy-MM-01'), format(Date.now(), 'yyyy-MM-dd')] };
    } else {
      this.i = { createAt: [format(Date.now(), 'yyyy-MM-01'), format(Date.now(), 'yyyy-MM-dd')] };
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
    this.searching = true;
    this.wechatRefundService.index(value.mchid, value.createAt[0], value.createAt[0]).subscribe((res: any) => {
      if (res.code) {
        this.msgSrv.warning(res.msg);
      } else {
        this.stData = res.data;
      }
      this.searching = false;
    });
  }
}
