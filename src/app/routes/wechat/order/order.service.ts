import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';

@Injectable()
export class WechatOrderService {
  constructor(private clientService: _HttpClient) {}

  /**
   * 获取订单详情
   *
   * @param mchid 商家ID
   * @param order_type 订单类型
   * @param order_id 订单ID
   * @returns 商家详情
   */
  show(mchid: string, order_type: 'out_trade_no' | 'transaction_id', order_id: string): Observable<any> {
    return this.clientService.get(`wechat/order/${mchid}/show`, { order_type, order_id });
  }
}
