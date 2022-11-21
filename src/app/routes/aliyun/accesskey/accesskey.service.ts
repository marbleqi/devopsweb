import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Result } from '@shared';
import { format } from 'date-fns';
import { Observable, map } from 'rxjs';

@Injectable()
export class AliyunAccesskeyService {
  /**在密钥服务中保存当前选中的密钥ID */
  keyId: number;
  /**最新操作ID */
  private operateId: number;
  /**缓存的菜单列表 */
  private keyMap: Map<number, any>;

  /**
   * 构建函数
   *
   * @param clientService 客户端服务
   * @param baseService 基础服务
   */
  constructor(private clientService: _HttpClient, private baseService: BaseService) {
    this.keyId = 0;
    this.operateId = 0;
    this.keyMap = new Map<number, any>();
  }

  /**
   * 获取密钥列表
   *
   * @returns 密钥列表
   */
  index(operateId?: number): Observable<any[]> {
    if (typeof operateId === 'number') {
      this.operateId = operateId;
    }
    return this.clientService.get('aliyun/accesskey/index', { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const hostItem of res.data) {
            this.keyMap.set(hostItem.keyId, {
              ...hostItem,
              updateUserName: this.baseService.userName(hostItem.updateUserId)
            });
            if (this.operateId < hostItem.operateId) {
              this.operateId = hostItem.operateId;
            }
          }
        }
        return Array.from(this.keyMap.values()).sort((a, b) => a.orderId - b.orderId);
      })
    );
  }

  /**
   * 获取密钥详情
   *
   * @param keyId 密钥ID
   * @returns 密钥详情
   */
  show(keyId: number): Observable<any> {
    return this.clientService.get(`aliyun/accesskey/${keyId}/show`).pipe(
      map((res: Result) => {
        if (res.code) {
          return { keyId };
        } else {
          return {
            ...res.data,
            createUserName: this.baseService.userName(res.data.createUserId),
            createAt: format(res.data.createAt, 'yyyy-MM-dd HH:mm:ss.SSS'),
            updateUserName: this.baseService.userName(res.data.updateUserId),
            updateAt: format(res.data.updateAt, 'yyyy-MM-dd HH:mm:ss.SSS')
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
      name: value.name,
      description: value.description,
      accessKeyId: value.accessKeyId ? value.accessKeyId : null,
      accessKeySecret: value.accessKeySecret ? value.accessKeySecret : null,
      status: value.status
    };
  }

  /**
   * 创建密钥
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  create(value: any): Observable<Result> {
    return this.clientService.post('aliyun/accesskey/create', this.params(value));
  }

  /**
   * 修改密钥
   *
   * @param keyId 密钥ID
   * @param value 表单数据
   * @returns 后端响应报文
   */
  update(keyId: number, value: any): Observable<Result> {
    return this.clientService.post(`aliyun/accesskey/${keyId}/update`, this.params(value));
  }
}
