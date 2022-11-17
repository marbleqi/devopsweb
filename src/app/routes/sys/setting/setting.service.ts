import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class SysSettingService {
  /**
   * 构建函数
   *
   * @param clientService 注入的http服务
   * @param baseService 注入的基础服务
   */
  constructor(private clientService: _HttpClient, private baseService: BaseService) {}

  /**
   * 设置系统配置
   *
   * @param value 提交的表单数据
   * @returns 后端响应报文
   */
  set(value: object): Observable<Result> {
    return this.clientService.post('sys/setting', value);
  }

  /**
   * 获取系统配置
   *
   * @returns 系统配置详情
   */
  get(): Observable<object> {
    return this.clientService.get('sys/setting/show').pipe(
      map((res: Result) => {
        if (res.code) {
          return {};
        }
        return {
          ...res.data,
          updateUserName: this.baseService.userName(res.data.updateUserId),
          updateAt: format(res.data.updateAt, 'yyyy-MM-dd HH:mm:ss.SSS')
        };
      })
    );
  }
}
