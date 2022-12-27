import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class WechatCompanyService {
  /**在企业服务中保存当前选中的企业ID */
  corpid: string;
  /**最新操作ID */
  private operateId: number;
  /**缓存的菜单列表 */
  private companyMap: Map<string, any>;

  /**
   * 构建函数
   *
   * @param clientService 客户端服务
   * @param baseService 基础服务
   */
  constructor(private clientService: _HttpClient, private baseService: BaseService) {
    this.corpid = '';
    this.operateId = 0;
    this.companyMap = new Map<string, any>();
  }

  /**
   * 获取企业列表
   *
   * @returns 企业列表
   */
  index(operateId?: number): Observable<any[]> {
    if (typeof operateId === 'number') {
      this.operateId = operateId;
    }
    return this.clientService.get('wechat/company/index', { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const hostItem of res.data) {
            this.companyMap.set(hostItem.corpid, {
              ...hostItem,
              updateUserName: this.baseService.userName(hostItem.updateUserId)
            });
            if (this.operateId < hostItem.operateId) {
              this.operateId = hostItem.operateId;
            }
          }
        }
        return Array.from(this.companyMap.values()).sort((a, b) => a.orderId - b.orderId);
      })
    );
  }

  /**
   * 获取企业详情
   *
   * @param corpid 企业ID
   * @returns 企业详情
   */
  show(corpid: string): Observable<any> {
    return this.clientService.get(`wechat/company/${corpid}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { corpid };
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
      corpid: value.corpid,
      corpsecret: value.corpsecret,
      description: value.description,
      status: value.status
    };
  }

  /**
   * 创建企业
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  create(value: any): Observable<Result> {
    return this.clientService.post('wechat/company/create', this.params(value));
  }

  /**
   * 修改企业
   *
   * @param corpid 企业ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  update(corpid: string, value: any): Observable<Result> {
    return this.clientService.post(`wechat/company/${corpid}/update`, this.params(value));
  }
}
