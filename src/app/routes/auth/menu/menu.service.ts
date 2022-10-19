import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class AuthMenuService {
  /**最新操作ID */
  private operateId: number;
  /**缓存的菜单列表 */
  private menuMap: Map<number, any>;

  /**
   * 构建函数
   *
   * @param client 注入的http服务
   * @param baseSrv 注入的用户服务
   */
  constructor(private client: _HttpClient, private baseSrv: BaseService) {
    this.operateId = 0;
    this.menuMap = new Map<number, any>();
    this.baseSrv.sortSub.subscribe((res: string) => {
      if (res === 'menu') {
        this.operateId = 0;
      }
    });
  }

  /**
   * 获取菜单列表
   *
   * @returns 菜单列表
   */
  index(operateId?: number): Observable<any[]> {
    console.debug('菜单服务中', operateId, typeof operateId);
    if (typeof operateId === 'number') {
      this.operateId = 0;
    }
    return this.client.get('auth/menu/index', { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const menuItem of res.data) {
            this.menuMap.set(menuItem.menuId, {
              ...menuItem,
              updateUserName: this.baseSrv.userName(menuItem.updateUserId)
            });
            if (this.operateId < menuItem.operateId) {
              this.operateId = menuItem.operateId;
            }
          }
        }
        return Array.from(this.menuMap.values()).sort((a, b) => a.orderId - b.orderId);
      })
    );
  }

  /**
   * 获取菜单详情
   *
   * @param menuId 菜单ID
   * @returns 菜单详情
   */
  show(menuId: number): Observable<any> {
    return this.client.get(`auth/menu/${menuId}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { menuId, abilities: [] };
        } else {
          return {
            ...res.data,
            updateUserName: this.baseSrv.userName(res.data.updateUserId),
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
      pMenuId: value.pMenuId,
      config: {
        text: value.config.text,
        description: value.config.description,
        link: value.config.link,
        reuse: value.config.reuse,
        isLeaf: value.config.isLeaf,
        icon: value.config.icon
      },
      status: value.status,
      abilities: value.abilities
    };
  }

  /**
   * 创建菜单
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  create(value: any): Observable<Result> {
    return this.client.post('auth/menu/create', this.params(value));
  }

  /**
   * 修改菜单
   *
   * @param menuId 菜单ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  update(menuId: number, value: any): Observable<Result> {
    return this.client.post(`auth/menu/${menuId}/update`, this.params(value));
  }
}
