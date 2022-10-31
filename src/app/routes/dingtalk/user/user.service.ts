import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { SFSchemaEnum } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { Observable, map } from 'rxjs';

@Injectable()
export class DingtalkUserService {
  /**最新操作ID */
  private operateId: number;
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
    this.userMap = new Map<string, any>();
  }

  /**
   * 获取子部门
   *
   * @param id 部门ID
   * @returns 用户记录
   */
  depart(id: number): Observable<SFSchemaEnum[]> {
    return this.client.get(`dingtalk/user/depart/${id}`).pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          return res.data;
        }
      })
    );
  }

  /**初始化 */
  init(): Observable<void> {
    return this.client.get(`dingtalk/user/index`, { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          console.debug('res.data', res.data);
          for (const userItem of res.data) {
            this.userMap.set(userItem['unionId'], {
              ...userItem,
              userName: this.baseSrv.userName(userItem['userId']),
              updateUserName: this.baseSrv.userName(userItem['updateUserId'])
            });
            if (this.operateId < userItem['operateId']) {
              this.operateId = userItem['operateId'];
            }
          }
        }
      })
    );
  }

  /**
   * 获取用户记录
   *
   * @param id 部门ID
   * @returns 用户记录
   */
  index(id: number): Observable<object[]> {
    return this.client.get(`dingtalk/user/index/${id}`).pipe(
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
   * 创建用户
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  create(value: any): Observable<Result> {
    return this.client.post('dingtalk/user/create', value);
  }
}
