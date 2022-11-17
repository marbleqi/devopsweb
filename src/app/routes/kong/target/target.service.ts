import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { Observable, map } from 'rxjs';

@Injectable()
export class KongTargetService {
  /**目标操作中缓存的上游ID */
  id: string;
  /**
   * 构建函数
   *
   * @param clientService 注入的http服务
   */
  constructor(private clientService: _HttpClient) {
    this.id = '';
  }

  /**
   * 获取目标列表
   *
   * @param hostId 站点ID
   * @param id 上游ID
   * @returns 目标列表
   */
  index(hostId: number, id: string): Observable<any[]> {
    return this.clientService.get(`kong/target/${hostId}/${id}/index`).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          return res.data;
        }
        return [];
      })
    );
  }

  /**
   * 获取目标变更历史
   *
   * @param hostId 站点ID
   * @param id 上游ID
   * @returns 对象变更历史
   */
  log(hostId: number, id: string): Observable<any[]> {
    return this.clientService.get(`kong/target/${hostId}/${id}/log`).pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          return res.data;
        }
      })
    );
  }

  /**
   * 创建目标
   *
   * @param hostId 站点ID
   * @param id 上游ID
   * @param value 对象配置
   * @returns 操作结果
   */
  create(hostId: number, id: string, value: any): Observable<Result> {
    return this.clientService.post(`kong/target/${hostId}/${id}/create`, value);
  }

  /**
   * 删除目标
   *
   * @param hostId 站点ID
   * @param id 上游ID
   * @param targetId 目标ID
   * @returns 操作结果
   */
  remove(hostId: number, id: string, targetId: string): Observable<Result> {
    return this.clientService.delete(`kong/target/${hostId}/${id}/${targetId}`);
  }
}
