import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { Observable, map } from 'rxjs';

/**企业微信用户服务 */
@Injectable()
export class WxworkUserService {
  /**最新操作ID */
  private operateid: number;
  /**企业微信用户ID与姓名的映射关系 */
  wxworkmap: Map<string, string>;
  /**企业微信用户ID与系统用户ID的映射关系 */
  usermap: Map<string, any>;
  /**
   * 构建函数
   *
   * @param client 注入的http服务
   * @param baseSrv 注入的基础服务
   */
  constructor(private readonly client: _HttpClient, private readonly baseSrv: BaseService) {
    this.operateid = 0;
    this.wxworkmap = new Map<string, string>();
    this.usermap = new Map<string, any>();
  }

  /**
   * 获取用户列表
   *
   * @param id 部门ID
   * @returns 用户列表
   */
  index(id?: number): Observable<object[]> {
    // 如果有部门ID传入，则返回企业微信中的用户清单
    if (id) {
      return this.client.get(`wxwork/user/index/${id}`).pipe(
        map((res: Result) => {
          if (res.code) {
            return [];
          } else {
            for (const user of res['data']) {
              this.wxworkmap.set(user['userid'], user['name']);
            }
            return res['data'];
          }
        })
      );
    }
    // 如果没有部门ID传入，则返回系统中已关联企业微信的用户
    return this.client.get(`wxwork/user/index`, { operateid: this.operateid }).pipe(
      map((res: Result) => {
        if (!res.code && res['data'].length) {
          for (const useritem of res['data']) {
            this.usermap.set(useritem['wxworkid'], {
              ...useritem,
              username: this.baseSrv.userName(useritem['userid']),
              update_username: this.baseSrv.userName(useritem['update_userid'])
            });
            if (this.operateid < useritem['operateid']) {
              this.operateid = useritem['operateid'];
            }
          }
          return Array.from(this.usermap.values());
        }
        return [];
      })
    );
  }

  /**
   * 创建用户
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  create(value: any): Observable<Result> {
    return this.client.post('wxwork/user/create', value);
  }
}
