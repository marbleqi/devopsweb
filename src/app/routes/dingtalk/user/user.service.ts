import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { Observable, map } from 'rxjs';

@Injectable()
export class DingtalkUserService {
  /**最新操作ID */
  private operateId: number;
  /**钉钉用户ID与姓名的映射关系 */
  dingtalkMap: Map<string, string>;
  /**钉钉用户ID与系统用户ID的映射关系 */
  userMap: Map<string, any>;

  /**
   * 构建函数
   *
   * @param client http服务
   * @param baseSrv 基础服务
   */
  constructor(private client: _HttpClient, private readonly baseSrv: BaseService) {
    this.operateId = 0;
    this.dingtalkMap = new Map<string, string>();
    this.userMap = new Map<string, any>();
  }

  /**
   * 获取用户记录
   *
   * @param id 部门ID
   * @returns 用户记录
   */
  index(id?: number): Observable<object[]> {
    if (id) {
      return this.client.get(`dingtalk/user/index/${id}`).pipe(
        map((res: Result) => {
          if (res.code) {
            return [];
          } else {
            for (const user of res.data) {
              this.dingtalkMap.set(user['unionid'], user['username']);
            }
            return res.data;
          }
        })
      );
    }
    // 如果没有部门ID传入，则返回系统中已关联钉钉的用户
    return this.client.get(`dingtalk/user/index`, { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const userItem of res.data) {
            this.userMap.set(userItem['unionid'], {
              ...userItem,
              userName: this.baseSrv.userName(userItem['userId']),
              updateUserName: this.baseSrv.userName(userItem['updateUserId'])
            });
            if (this.operateId < userItem['operateId']) {
              this.operateId = userItem['operateId'];
            }
          }
          return Array.from(this.userMap.values());
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
    return this.client.post('dingtalk/user/create', value);
  }
}
