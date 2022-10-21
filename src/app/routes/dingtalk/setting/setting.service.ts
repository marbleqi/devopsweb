import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class DingtalkSettingService {
  /**
   * 构建函数
   *
   * @param client 注入的http服务
   * @param baseSrv 注入的用户服务
   */
  constructor(private client: _HttpClient, private baseSrv: BaseService) {}

  /**
   * 设置企业微信配置
   *
   * @param value 提交的表单数据
   * @returns 后端响应报文
   */
  set(value: any): Observable<Result> {
    return this.client.post('dingtalk/setting', value);
  }

  /**
   * 获取企业微信配置
   *
   * @returns 企业微信配置详情
   */
  get(): Observable<object> {
    return this.client.get('dingtalk/setting').pipe(
      map((res: Result) => {
        if (res.code) {
          return {};
        }
        return {
          ...res.data,
          updateUserName: this.baseSrv.userName(res.data.updateUserId),
          updateAt: format(res.data.updateAt, 'yyyy-MM-dd HH:mm:ss.SSS')
        };
      })
    );
  }
}
