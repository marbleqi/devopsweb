import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { Observable, map } from 'rxjs';

@Injectable()
export class SysQueueService {
  /**
   * 构建函数
   *
   * @param client 注入的http服务
   */
  constructor(private client: _HttpClient) {}
  /**
   * 获取任务列表
   *
   * @returns 任务列表
   */
  index(value: any): Observable<any[]> {
    return this.client.get('sys/queue/index', value).pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          return res.data
            .map((item: any) => ({ ...item, data: JSON.stringify(item.data, null, 2) }))
            .sort((a: any, b: any) => b.timestamp - a.timestamp);
        }
      })
    );
  }

  /**
   * 删除任务列表
   *
   * @returns 响应报文
   */
  remove(value: any): Observable<Result> {
    return this.client.post('sys/queue/remove', value);
  }

  /**
   * 清理任务列表
   *
   * @returns 响应报文
   */
  clean(): Observable<Result> {
    return this.client.post('sys/queue/clean');
  }
}
