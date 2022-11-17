import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { Observable, map } from 'rxjs';

@Injectable()
export class KongUpstreamService {
  /**站点ID */
  private hostId: number;
  /**操作序号 */
  private operateId: number;
  /**缓存的上游列表 */
  private upstreamMap: Map<string, any>;

  /**
   * 构建函数
   *
   * @param clientService 注入的http服务
   * @param baseService 注入的基础服务
   */
  constructor(private clientService: _HttpClient, private baseService: BaseService) {
    this.hostId = 0;
    this.operateId = 0;
    this.upstreamMap = new Map<string, any>();
  }

  /**
   * 获取上游列表
   *
   * @param hostId 站点ID
   * @param operateId 请求序号
   * @returns 上游列表
   */
  index(hostId: number, operateId?: number): Observable<any[]> {
    if (this.hostId !== hostId) {
      this.hostId = hostId;
      this.upstreamMap = new Map<string, any>();
      this.operateId = 0;
    } else if (operateId) {
      this.operateId = Number(operateId);
    }
    return this.clientService.get(`kong/upstream/${hostId}/index`, { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const projectItem of res.data) {
            this.upstreamMap.set(projectItem.id, {
              ...projectItem,
              updateUserName: this.baseService.userName(projectItem.updateUserId)
            });
            if (this.operateId < projectItem.operateId) {
              this.operateId = projectItem.operateId;
            }
          }
        }
        return Array.from(this.upstreamMap.values());
      })
    );
  }
}
