import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { Result } from '@shared';
import { Observable, map, of } from 'rxjs';

@Injectable()
export class AuthAbilityService {
  /**缓存的角色列表 */
  private abilityList: any[];
  /**缓存的角色树 */
  private abilityTree: any[];

  /**
   * 构建函数
   *
   * @param client 注入的http服务
   * @param arrSrv 注入的数组服务
   */
  constructor(private client: _HttpClient, private arrSrv: ArrayService) {
    this.abilityList = [];
    this.abilityTree = [];
  }

  /**
   * 获取权限点列表
   *
   * @param type 指定返回的数据类型为列表或树
   * @returns 权限点列表
   */
  index(type: 'list' | 'tree' = 'list'): Observable<any[]> {
    if (this.abilityList.length) {
      if (type === 'list') {
        return of(this.abilityList);
      } else {
        return of(this.abilityTree);
      }
    } else {
      return this.client.get(`auth/ability/index`).pipe(
        map((res: Result) => {
          if (res.code) {
            return [];
          } else {
            this.abilityList = res.data.sort((a: any, b: any) => a.id - b.id);
            this.abilityTree = this.arrSrv.arrToTree(
              this.abilityList.map((item: any) => ({
                key: item.id,
                pid: item.pid,
                title: `${item.name}——${item.description}`
              })),
              { idMapName: 'key', parentIdMapName: 'pid' }
            );
            if (type === 'list') {
              return this.abilityList;
            } else {
              return this.abilityTree;
            }
          }
        })
      );
    }
  }

  /**
   * 获取某权限点的已授权对象
   *
   * @param type 对象类型
   * @param id 权限点ID
   * @returns 对象ID列表
   */
  granted(type: 'menu' | 'role', id: number): Observable<number[]> {
    return this.client.get(`auth/ability/${id}/${type}`).pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        }
        return res.data as number[];
      })
    );
  }

  /**
   * 设置某权限点的授权对象
   *
   * @param type 对象类型
   * @param id 权限点ID
   * @param objectlist 待授权的对象ID列表
   * @returns 后端响应报文
   */
  granting(type: 'menu' | 'role', id: number, objectlist: number[]): Observable<Result> {
    return this.client.post(`auth/ability/${id}/${type}`, { objectlist });
  }
}
