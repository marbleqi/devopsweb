import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class SysReqService {
  constructor(private readonly clientService: _HttpClient, private readonly baseService: BaseService) {}

  /**
   * 获取模块备选项
   *
   * @returns 模块列表
   */
  module(): Observable<string[]> {
    return this.clientService.get('sys/req/module').pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          return res.data.map((item: any) => item.module);
        }
      })
    );
  }

  /**
   * 获取控制器备选项
   *
   * @param module 模块名
   * @returns 控制器列表
   */
  controller(module: string): Observable<string[]> {
    return this.clientService.get('sys/req/controller', { module }).pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          return res.data.map((item: any) => item.controller);
        }
      })
    );
  }

  /**
   * 获取操作备选项
   *
   * @param module 模块
   * @param controller 控制器
   * @returns 操作列表
   */
  action(module: string, controller: string): Observable<string[]> {
    return this.clientService.get('sys/req/action', { module, controller }).pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          return res.data.map((item: any) => item.action);
        }
      })
    );
  }

  /**
   * 获取任务列表
   *
   * @returns 任务列表
   */
  index(value: any): Observable<any[]> {
    return this.clientService.get('sys/req/index', value).pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          return res.data
            .map((item: any) => ({
              ...item,
              userName: this.baseService.userName(item.userId)
            }))
            .sort((a: any, b: any) => b.reqId - a.reqId);
        }
      })
    );
  }

  /**
   * 获取任务详情
   *
   * @param reqId 日志ID
   * @returns 任务详情
   */
  show(reqId: number): Observable<any> {
    return this.clientService.get(`sys/req/${reqId}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return null;
        } else {
          return {
            ...res.data,
            request: {
              ...res.data.request,
              params: JSON.stringify(res.data.request.params, null, 2),
              query: JSON.stringify(res.data.request.query, null, 2),
              body: JSON.stringify(res.data.request.body, null, 2)
            },
            result: { ...res.data.result, data: JSON.stringify(res.data.result.data, null, 2) },
            userName: this.baseService.userName(res.data.userId),
            startAt: format(res.data.startAt, 'yyyy-MM-dd HH:mm:ss.SSS'),
            endAt: format(res.data.endAt, 'yyyy-MM-dd HH:mm:ss.SSS')
          };
        }
      })
    );
  }
}
