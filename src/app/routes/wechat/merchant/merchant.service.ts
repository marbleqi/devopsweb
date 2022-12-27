import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class WechatMerchantService {
  /**在商家服务中保存当前选中的商家ID */
  mchid: string;
  /**最新操作ID */
  private operateId: number;
  /**缓存的菜单列表 */
  private merchantMap: Map<string, any>;

  /**
   * 构建函数
   *
   * @param clientService 客户端服务
   * @param baseService 基础服务
   */
  constructor(private clientService: _HttpClient, private baseService: BaseService) {
    this.mchid = '';
    this.operateId = 0;
    this.merchantMap = new Map<string, any>();
  }

  /**
   * 获取商家列表
   *
   * @returns 商家列表
   */
  index(operateId?: number): Observable<any[]> {
    if (typeof operateId === 'number') {
      this.operateId = operateId;
    }
    return this.clientService.get('wechat/merchant/index', { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const hostItem of res.data) {
            this.merchantMap.set(hostItem.mchid, {
              ...hostItem,
              updateUserName: this.baseService.userName(hostItem.updateUserId)
            });
            if (this.operateId < hostItem.operateId) {
              this.operateId = hostItem.operateId;
            }
          }
        }
        return Array.from(this.merchantMap.values()).sort((a, b) => a.orderId - b.orderId);
      })
    );
  }

  /**
   * 获取商家详情
   *
   * @param mchid 商家ID
   * @returns 商家详情
   */
  show(mchid: string): Observable<any> {
    return this.clientService.get(`wechat/merchant/${mchid}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { mchid };
        } else {
          return {
            ...res.data,
            createUserName: this.baseService.userName(res.data.createUserId),
            createAt: format(res.data.createAt, 'yyyy-MM-dd HH:mm:ss.SSS'),
            updateUserName: this.baseService.userName(res.data.updateUserId),
            updateAt: format(res.data.updateAt, 'yyyy-MM-dd HH:mm:ss.SSS')
          };
        }
      })
    );
  }

  /**
   * 处理待提交参数，最小化数据交换
   *
   * @param value 表单数据
   * @returns 提交后台的数据
   */
  params(value: any): any {
    return {
      mchid: value.mchid,
      appid: value.appid,
      serial_no: value.serial_no,
      cert: value.cert,
      key: value.key,
      secret: value.secret,
      status: value.status
    };
  }

  /**
   * 创建商家
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  create(value: any): Observable<Result> {
    return this.clientService.post('wechat/merchant/create', this.params(value));
  }

  /**
   * 修改商家
   *
   * @param mchid 商家ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  update(mchid: string, value: any): Observable<Result> {
    return this.clientService.post(`wechat/merchant/${mchid}/update`, this.params(value));
  }
}
