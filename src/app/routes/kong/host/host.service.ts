import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class KongHostService {
  /**最新操作ID */
  private operateId: number;
  /**缓存的菜单列表 */
  private hostMap: Map<number, any>;
  constructor(private readonly clientService: _HttpClient, private baseService: BaseService) {
    this.operateId = 0;
    this.hostMap = new Map<number, any>();
  }

  /**
   * 获取站点列表
   *
   * @returns 站点列表
   */
  index(operateId?: number): Observable<any[]> {
    if (typeof operateId === 'number') {
      this.operateId = operateId;
    }
    return this.clientService.get('kong/host/index', { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const hostItem of res.data) {
            this.hostMap.set(hostItem.hostId, {
              ...hostItem,
              updateUserName: this.baseService.userName(hostItem.updateUserId)
            });
            if (this.operateId < hostItem.operateId) {
              this.operateId = hostItem.operateId;
            }
          }
        }
        return Array.from(this.hostMap.values()).sort((a, b) => a.orderId - b.orderId);
      })
    );
  }

  /**
   * 获取站点详情
   *
   * @param hostId 站点ID
   * @returns 站点详情
   */
  show(hostId: number): Observable<any> {
    return this.clientService.get(`kong/host/${hostId}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { hostId, abilities: [] };
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
  params(value: any) {
    return {
      name: value.name,
      description: value.description,
      url: value.url,
      status: value.status
    };
  }

  /**
   * 创建站点
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  create(value: any): Observable<Result> {
    return this.clientService.post('kong/host/create', this.params(value));
  }

  /**
   * 修改站点
   *
   * @param hostId 站点ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  update(hostId: number, value: any): Observable<Result> {
    return this.clientService.post(`kong/host/${hostId}/update`, this.params(value));
  }
}
