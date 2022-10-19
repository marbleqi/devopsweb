import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { Observable, map } from 'rxjs';

@Injectable()
export class AuthTokenService {
  /**
   * 构建函数
   *
   * @param client 注入的http服务
   * @param baseSrv 注入的用户服务
   */
  constructor(private client: _HttpClient, private baseSrv: BaseService) {}

  /**
   * 获取令牌列表
   *
   * @returns 令牌列表
   */
  index(): Observable<any[]> {
    return this.client.get('auth/token').pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          return res['data']
            .map((item: any) => {
              const userid = Number(item.userid);
              const expired = Number(item.expired);
              const create_at = Number(item.create_at);
              const update_at = Number(item.update_at);
              return { ...item, userid, userName: this.baseSrv.userName(userid), expired, create_at, update_at };
            })
            .sort((a: any, b: any) => b.create_at - a.create_at);
        }
      })
    );
  }

  /**
   * 作废令牌
   *
   * @param token 待作废的令牌
   * @returns 后端响应报文
   */
  destroy(token: string): Observable<Result> {
    return this.client.delete(`auth/token/${token}`);
  }
}
