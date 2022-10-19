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
  private usermap: Map<number, any>;

  /**
   * 构建函数
   *
   * @param client 注入的http服务
   * @param baseSrv 注入的用户服务
   */
  constructor(private client: _HttpClient, private baseSrv: BaseService) {
    this.operateId = 0;
    this.usermap = new Map<number, any>();
  }

  /**
   * 获取用户列表
   *
   * @returns 用户列表
   */
  index(): Observable<any[]> {
    return this.client.get('auth/user/index', { operateId: this.operateId, type: 'list' }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const useritem of res.data) {
            this.usermap.set(useritem['userid'], {
              ...useritem,
              update_userName: this.baseSrv.userName(useritem['update_userid'])
            });
            if (this.operateId < useritem['operateId']) {
              this.operateId = useritem['operateId'];
            }
          }
        }
        return Array.from(this.usermap.values()).sort((a, b) => a.userid - b.userid);
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
    return this.client.get(`auth/user/${id}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { userid: id, roles: [] };
        } else {
          return {
            ...res['data'],
            update_userName: this.baseSrv.userName(res['data'].update_userid),
            update_at: format(res['data'].update_at, 'yyyy-MM-dd HH:mm:ss.SSS'),
            first_login_at: res['data'].first_login_at ? format(res['data'].first_login_at, 'yyyy-MM-dd HH:mm:ss.SSS') : 0,
            last_login_at: res['data'].last_login_at ? format(res['data'].last_login_at, 'yyyy-MM-dd HH:mm:ss.SSS') : 0,
            last_session_at: res['data'].last_session_at ? format(res['data'].last_session_at, 'yyyy-MM-dd HH:mm:ss.SSS') : 0
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
      loginname: value.loginname,
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
    return this.client.post('auth/user/create', this.params(value));
  }

  /**
   * 修改用户
   *
   * @param id 用户ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  update(id: number, value: any): Observable<Result> {
    return this.client.post(`auth//user/${id}/update`, this.params(value));
  }

  /**
   * 解锁用户
   *
   * @param id 用户ID
   * @returns 后端响应报文
   */
  unlock(id: number): Observable<Result> {
    return this.client.post(`auth/user/${id}/unlock`);
  }

  /**
   * 重置用户密码
   *
   * @param id 用户ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  resetpsw(id: number, value: any): Observable<Result> {
    return this.client.post(`auth/user/${id}/resetpsw`, value);
  }
}
