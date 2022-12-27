import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { map } from 'rxjs';

import { WechatCompanyService, WechatMerchantService } from '../..';

@Component({
  selector: 'app-wechat-merchant-edit',
  templateUrl: './edit.component.html'
})
export class WechatMerchantEditComponent implements OnInit {
  loading = false;
  copy!: boolean;
  title!: string;
  updatable!: boolean;
  creatable!: boolean;
  buttonName!: string;
  /**已选权限点 */
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      mchid: { type: 'string', title: '商家ID' },
      appid: { type: 'string', title: '企业' },
      serial_no: { type: 'string', title: '证书序列号' },
      cert: { type: 'string', title: '证书cert' },
      key: { type: 'string', title: '证书key' },
      secret: { type: 'string', title: 'API密钥' },
      status: {
        type: 'number',
        title: '状态',
        default: 1,
        enum: [
          { value: 1, label: '有效' },
          { value: 0, label: '禁用' }
        ]
      },
      createUserName: { type: 'string', title: '创建人' },
      createAt: { type: 'string', title: '创建时间' },
      updateUserName: { type: 'string', title: '最后更新人' },
      updateAt: { type: 'string', title: '最后更新时间' },
      operateId: { type: 'number', title: '操作序号' }
    },
    required: ['name', 'description', 'url', 'status']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 150, grid: { span: 12 } },
    $appid: {
      widget: 'select',
      asyncData: () => this.companyService.index().pipe(map(res => res.map(item => ({ label: item.description, value: item.corpid }))))
    },
    $cert: { widget: 'textarea', grid: { span: 24 }, autosize: { minRows: 10, maxRows: 10 } },
    $key: { widget: 'textarea', grid: { span: 24 }, autosize: { minRows: 10, maxRows: 10 } },
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $createUserName: { widget: 'text' },
    $createAt: { widget: 'text' },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $operateId: { widget: 'text' }
  };

  constructor(
    private companyService: WechatCompanyService,
    private merchantService: WechatMerchantService,
    private messageService: NzMessageService,
    private modal: NzModalRef
  ) {}

  /**对话框初始化 */
  ngOnInit(): void {
    console.debug('this.record', this.record);
    // 初始化数据
    if (this.record) {
      if (this.copy) {
        this.title = '商家另存为';
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '另存为';
      } else {
        this.title = '编辑商家';
        this.updatable = true;
        this.creatable = false;
      }
      this.merchantService.show(this.record.mchid).subscribe(res => {
        this.i = res;
      });
    } else {
      this.title = '创建商家';
      this.updatable = false;
      this.creatable = true;
      this.buttonName = '创建';
      this.i = {};
    }
  }

  /**
   * 创建新商家
   *
   * @param value 原始表单数据
   */
  saveas(value: any): void {
    this.merchantService.create(value).subscribe(res => {
      if (res.code) {
        this.messageService.error(res.msg);
      } else {
        this.messageService.success('创建成功');
        this.modal.close(true);
      }
    });
  }

  /**
   * 修改已有商家
   *
   * @param value 原始表单数据
   */
  save(value: any): void {
    console.debug('相关信息', this.record.mchid, value);
    this.merchantService.update(this.record.mchid, value).subscribe(res => {
      if (res.code) {
        this.messageService.error(res.msg);
      } else {
        this.messageService.success('保存成功');
        this.modal.close(true);
      }
    });
  }

  /**关闭对话框 */
  close(): void {
    this.modal.destroy();
  }
}
