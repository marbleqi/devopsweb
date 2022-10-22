import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class AuthRoleService {
  /**最新操作ID */
  private operateId: number;
  /**缓存的角色列表 */
  private roleMap: Map<number, any>;

  /**
   * 构建函数
   *
   * @param client 注入的http服务
   * @param baseSrv 注入的用户服务
   */
  constructor(private client: _HttpClient, private baseSrv: BaseService) {
    this.operateId = 0;
    this.roleMap = new Map<number, any>();
  }

  /**
   * 获取角色列表
   *
   * @returns 角色列表
   */
  index(operateId?: number): Observable<any[]> {
    if (typeof operateId === 'number') {
      this.operateId = operateId;
    }
    return this.client.get('auth/role/index', { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const roleItem of res.data) {
            this.roleMap.set(roleItem.roleId, {
              ...roleItem,
              updateUserName: this.baseSrv.userName(roleItem.updateUserId)
            });
            if (this.operateId < roleItem.operateId) {
              this.operateId = roleItem.operateId;
            }
          }
        }
        return Array.from(this.roleMap.values()).sort((a, b) => a.orderId - b.orderId);
      })
    );
  }

  /**
   * 获取角色详情
   *
   * @param roleId 角色ID
   * @returns 角色详情
   */
  show(roleId: number): Observable<any> {
    return this.client.get(`auth/role/${roleId}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { roleId, abilities: [] };
        } else {
          return {
            ...res.data,
            createUserName: this.baseSrv.userName(res.data.createUserId),
            createAt: format(res.data.createAt, 'yyyy-MM-dd HH:mm:ss.SSS'),
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
      roleName: value.roleName,
      description: value.description,
      config: value.config,
      status: value.status,
      abilities: value.abilities
    };
  }

  /**
   * 创建角色
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  create(value: any): Observable<Result> {
    return this.client.post('auth/role/create', this.params(value));
  }

  /**
   * 修改角色
   *
   * @param roleId 角色ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  update(roleId: number, value: any): Observable<Result> {
    return this.client.post(`auth/role/${roleId}/update`, this.params(value));
  }

  /**
   * 获取某角色的已授权用户
   *
   * @param roleId 角色ID
   * @returns 用户ID列表
   */
  granted(roleId: number): Observable<number[]> {
    return this.client.get(`auth/role/${roleId}/grant`).pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        }
        return res.data as number[];
      })
    );
  }

  /**
   * 设置某角色的授权用户
   *
   * @param roleId 角色ID
   * @param userList 待授权的用户ID列表
   * @returns 后端响应报文
   */
  granting(roleId: number, userList: number[]): Observable<Result> {
    return this.client.post(`auth/role/${roleId}/grant`, userList);
  }
}
