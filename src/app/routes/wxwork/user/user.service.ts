import { Injectable } from '@angular/core';
import { BaseService } from '@core';
import { SFSchemaEnum } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { Result } from '@shared';
import { Observable, map, of } from 'rxjs';

/**企业微信用户服务 */
@Injectable()
export class WxworkUserService {
  /**缓存的部门信息 */
  departList: SFSchemaEnum[];
  /**最新操作ID */
  private operateId: number;
  /**企业微信用户ID与系统用户ID的映射关系 */
  userMap: Map<string, any>;
  /**
   * 构建函数
   *
   * @param clientService 注入的http服务
   * @param baseService 注入的基础服务
   */
  constructor(private arrayService: ArrayService, private clientService: _HttpClient, private baseService: BaseService) {
    this.departList = [];
    this.operateId = 0;
    this.userMap = new Map<string, any>();
  }

  /**
   * 获取部门列表
   *
   * @returns 部门列表
   */
  depart(): Observable<SFSchemaEnum[]> {
    // 如果已缓存过数据，则直接返回缓存
    if (this.departList.length) {
      return of(this.departList);
    }
    return this.clientService.get('wxwork/user/depart').pipe(
      map((res: Result) => {
        if (res.code) {
          return [];
        } else {
          // 请求到数据后，先进行缓存
          this.departList = this.arrayService.arrToTree(
            res.data.sort((a: any, b: any) => b.orderId - a.orderId),
            { idMapName: 'key', parentIdMapName: 'parentId' }
          );
          return this.departList;
        }
      })
    );
  }

  /**初始化 */
  init(): Observable<void> {
    return this.clientService.get(`wxwork/user/index`, { operateId: this.operateId }).pipe(
      map((res: Result) => {
        if (!res.code && res.data.length) {
          for (const userItem of res.data) {
            this.userMap.set(userItem['wxworkId'], {
              ...userItem,
              userName: this.baseService.userName(userItem['userId']),
              updateUserName: this.baseService.userName(userItem['updateUserId'])
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
   * 获取用户列表
   *
   * @param id 部门ID
   * @returns 用户列表
   */
  index(id: number): Observable<object[]> {
    // 如果有部门ID传入，则返回企业微信中的用户清单
    return this.clientService.get(`wxwork/user/index/${id}`).pipe(
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
    return this.clientService.post('wxwork/user/create', value);
  }

  /**
   * 创建用户
   *
   * @param value 表单数据
   * @returns 后端响应报文
   */
  save(value: any): Observable<Result> {
    return this.clientService.post('wxwork/user/create', value);
  }
}
