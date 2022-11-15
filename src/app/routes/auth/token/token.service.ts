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
   * @param clientService 注入的http服务
   * @param baseService 注入的基础服务
   */
  constructor(private readonly clientService: _HttpClient, private baseService: BaseService) {}

  /**
   * 获取令牌列表
   *
   * @returns 令牌列表
   */
  index(): Observable<any[]> {
    return this.clientService.get('auth/token').pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          return res.data
            .map((item: any) => {
              const userId = Number(item.userId);
              const expired = Number(item.expired);
              const createAt = Number(item.createAt);
              const updateAt = Number(item.updateAt);
              return { ...item, userId, userName: this.baseService.userName(userId), expired, createAt, updateAt };
            })
            .sort((a: any, b: any) => b.createAt - a.createAt);
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
    return this.clientService.delete(`auth/token/${token}`);
  }
}
