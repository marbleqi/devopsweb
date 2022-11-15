import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class KongProjectService {
  /**最新操作ID */
  private operateId: number;
  /**缓存的对象列表 */
  private projectMap: Map<string, any>;

  /**
   * 构建函数
   *
   * @param clientService 注入的http服务
   * @param baseService 注入的基础服务
   */
  constructor(private readonly clientService: _HttpClient, private baseService: BaseService) {
    this.operateId = 0;
    this.projectMap = new Map<string, any>();
  }

  /**
   * 同步对象数据
   *
   * @param hostId 站点ID
   * @param project 对象类型
   * @returns 菜单详情
   */
  sync(hostId: number, project: string): Observable<any> {
    return this.clientService.post(`kong/${project}/${hostId}/sync`);
  }

  /**
   * 获取对象列表
   *
   * @param hostId 站点ID
   * @param project 对象类型
   * @param operateId 请求序号
   * @returns 对象列表
   */
  index(hostId: number, project: string, operateId?: number): Observable<any[]> {
    console.debug('菜单服务中', operateId, typeof operateId);
    if (typeof operateId === 'number') {
      this.operateId = operateId;
    }
    return this.clientService.get(`kong/${project}/${hostId}/index`, { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const projectItem of res.data) {
            this.projectMap.set(projectItem.id, {
              ...projectItem,
              updateUserName: this.baseService.userName(projectItem.updateUserId)
            });
            if (this.operateId < projectItem.operateId) {
              this.operateId = projectItem.operateId;
            }
          }
        }
        return Array.from(this.projectMap.values());
      })
    );
  }

  /**
   * 获取对象详情
   *
   * @param menuId 菜单ID
   * @returns 菜单详情
   */
  show(hostId: number, project: string, id: string): Observable<any> {
    return this.clientService.get(`kong/${project}/${hostId}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { id, abilities: [] };
        } else {
          return {
            ...res.data,
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
    return this.clientService.post('auth/menu/create', this.params(value));
  }

  /**
   * 修改菜单
   *
   * @param menuId 菜单ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  update(menuId: number, value: any): Observable<Result> {
    return this.clientService.post(`auth/menu/${menuId}/update`, this.params(value));
  }
}
