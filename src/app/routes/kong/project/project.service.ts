import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { Observable, map } from 'rxjs';

@Injectable()
export class KongProjectService {
  /**
   * 构建函数
   *
   * @param clientService 注入的http服务
   * @param baseService 注入的基础服务
   */
  constructor(private clientService: _HttpClient) {}

  /**
   * 同步对象数据
   *
   * @param hostId 站点ID
   * @param project 对象类型
   * @returns 菜单详情
   */
  sync(hostId: number, project: string): Observable<Result> {
    return this.clientService.post(`kong/${project}/${hostId}/sync`);
  }

  /**
   * 获取对象详情
   *
   * @param hostId 站点ID
   * @param project 对象类型
   * @param id 对象ID
   * @returns 对象详情
   */
  show(hostId: number, project: string, id: string): Observable<any> {
    return this.clientService.get(`kong/${project}/${hostId}/${id}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { apidata: null, dbdata: null };
        } else {
          return { apidata: res.data, dbdata: res['dbdata'] };
        }
      })
    );
  }

  /**
   * 获取对象变更历史
   *
   * @param hostId 站点ID
   * @param project 对象类型
   * @param id 对象ID
   * @returns 对象变更历史
   */
  log(hostId: number, project: string, id: string): Observable<any[]> {
    return this.clientService.get(`kong/${project}/${hostId}/${id}/log`).pipe(
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
   * 创建对象
   *
   * @param hostId 站点ID
   * @param project 对象类型
   * @param value 对象配置
   * @returns 对象详情
   */
  create(hostId: number, project: string, value: any): Observable<Result> {
    return this.clientService.post(`kong/${project}/${hostId}/create`, value);
  }

  /**
   * 更新对象
   *
   * @param hostId 站点ID
   * @param project 对象类型
   * @param id 对象ID
   * @param value 对象配置
   * @returns 对象详情
   */
  update(hostId: number, project: string, id: string, value: any): Observable<Result> {
    return this.clientService.post(`kong/${project}/${hostId}/${id}/update`, value);
  }

  /**
   * 删除对象
   *
   * @param hostId 站点ID
   * @param project 对象类型
   * @param id 对象ID
   * @returns 对象详情
   */
  remove(hostId: number, project: string, id: string): Observable<Result> {
    return this.clientService.delete(`kong/${project}/${hostId}/${id}`);
  }
}
