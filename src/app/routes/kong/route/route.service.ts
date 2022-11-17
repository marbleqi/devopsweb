import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { Observable, map } from 'rxjs';

@Injectable()
export class KongRouteService {
  /**站点ID */
  private hostId: number;
  /**操作序号 */
  private operateId: number;
  /**缓存的路由列表 */
  private routeMap: Map<string, any>;

  /**
   * 构建函数
   *
   * @param clientService 注入的http服务
   * @param baseService 注入的基础服务
   */
  constructor(private clientService: _HttpClient, private baseService: BaseService) {
    this.hostId = 0;
    this.operateId = 0;
    this.routeMap = new Map<string, any>();
  }

  /**
   * 获取路由列表
   *
   * @param hostId 站点ID
   * @param operateId 请求序号
   * @returns 路由列表
   */
  index(hostId: number, operateId?: number): Observable<any[]> {
    if (this.hostId !== hostId) {
      this.hostId = hostId;
      this.routeMap = new Map<string, any>();
      this.operateId = 0;
    } else if (operateId) {
      this.operateId = Number(operateId);
    }
    return this.clientService.get(`kong/route/${hostId}/index`, { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const projectItem of res.data) {
            this.routeMap.set(projectItem.id, {
              ...projectItem,
              updateUserName: this.baseService.userName(projectItem.updateUserId)
            });
            if (this.operateId < projectItem.operateId) {
              this.operateId = projectItem.operateId;
            }
          }
        }
        return Array.from(this.routeMap.values());
      })
    );
  }
}
