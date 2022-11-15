import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class AuthUserService {
  /**最新操作ID */
  private operateId: number;
  /**缓存的角色列表 */
  private userMap: Map<number, any>;

  /**
   * 构建函数
   *
   * @param clientService 注入的http服务
   * @param baseService 注入的基础服务
   */
  constructor(private readonly clientService: _HttpClient, private baseService: BaseService) {
    this.operateId = 0;
    this.userMap = new Map<number, any>();
  }

  /**
   * 获取用户列表
   *
   * @returns 用户列表
   */
  index(): Observable<any[]> {
    return this.clientService.get('auth/user/index', { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const userItem of res.data) {
            this.userMap.set(userItem.userId, {
              ...userItem,
              updateUserName: this.baseService.userName(userItem.updateUserId)
            });
            if (this.operateId < userItem.operateId) {
              this.operateId = userItem.operateId;
            }
          }
        }
        return Array.from(this.userMap.values()).sort((a, b) => a.userId - b.userId);
      })
    );
  }

  /**
   * 获取用户详情
   *
   * @param id 用户ID
   * @returns 用户详情
   */
  show(id: number): Observable<any> {
    return this.clientService.get(`auth/user/${id}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { userid: id, roles: [] };
        } else {
          return {
            ...res.data,
            createUserName: this.baseService.userName(res.data.createUserId),
            createAt: format(res.data.createAt, 'yyyy-MM-dd HH:mm:ss.SSS'),
            updateUserName: this.baseService.userName(res.data.updateUserId),
            updateAt: format(res.data.updateAt, 'yyyy-MM-dd HH:mm:ss.SSS'),
            firstLoginAt: res.data.firstLoginAt ? format(res.data.firstLoginAt, 'yyyy-MM-dd HH:mm:ss.SSS') : 0,
            lastLoginAt: res.data.lastLoginAt ? format(res.data.lastLoginAt, 'yyyy-MM-dd HH:mm:ss.SSS') : 0,
            lastSessionAt: res.data.lastSessionAt ? format(res.data.lastSessionAt, 'yyyy-MM-dd HH:mm:ss.SSS') : 0
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
      loginName: value.loginName,
      userName: value.userName,
      config: value.config,
      status: value.status,
      roles: value.roles
    };
  }

  /**
   * 创建用户
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  create(value: any): Observable<Result> {
    return this.clientService.post('auth/user/create', this.params(value));
  }

  /**
   * 修改用户
   *
   * @param userId 用户ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  update(userId: number, value: any): Observable<Result> {
    return this.clientService.post(`auth/user/${userId}/update`, this.params(value));
  }

  /**
   * 解锁用户
   *
   * @param userId 用户ID
   * @returns 后端响应报文
   */
  unlock(userId: number): Observable<Result> {
    return this.clientService.post(`auth/user/${userId}/unlock`);
  }

  /**
   * 重置用户密码
   *
   * @param userId 用户ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  resetpsw(userId: number, value: any): Observable<Result> {
    return this.clientService.post(`auth/user/${userId}/resetpsw`, value);
  }
}
