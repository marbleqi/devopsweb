import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

@Injectable()
export class WechatRefundService {
  /**最新操作ID */
  private operateId: number;

  constructor(private clientService: _HttpClient, private baseService: BaseService) {
    this.operateId = 0;
  }

  /**
   * 获取退款列表
   *
   * @param mchid 商家ID
   * @returns 退款列表
   */
  index(operateId?: number): Observable<any> {
    if (typeof operateId === 'number') {
      this.operateId = operateId;
    }
    return this.clientService.get(`wechat/refund/index`);
  }

  /**
   * 获取退款详情
   *
   * @param mchid 商家ID
   * @param refund_id 退款单ID
   * @returns 商家详情
   */
  show(mchid: string, refund_id: string): Observable<any> {
    return this.clientService.get(`wechat/refund/${refund_id}/show`);
  }

  /**
   * 发起退款请求
   *
   * @param value 退款信息
   * @returns 商家详情
   */
  create(value: { mchid: string; out_trade_no: string; amount: number; refund: number }): Observable<any> {
    return this.clientService.post(`wechat/refund/create`, value);
  }
}
