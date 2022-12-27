import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';

@Injectable()
export class WechatOrderService {
  constructor(private clientService: _HttpClient, private baseService: BaseService) {}

  /**
   * 获取商家详情
   *
   * @param mchid 商家ID
   * @returns 商家详情
   */
  show(mchid: string, order_type: string, order_id: string): Observable<any> {
    return this.clientService.get(`wechat/order/${mchid}/show`, { order_type, order_id });
  }
}
