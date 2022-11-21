import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { AliyunAccesskeyService } from '../..';

@Component({
  selector: 'app-aliyun-accesskey-edit',
  templateUrl: './edit.component.html'
})
export class AliyunAccesskeyEditComponent implements OnInit {
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
      name: { type: 'string', title: '密钥名' },
      description: { type: 'string', title: '密钥说明' },
      accessKeyId: { type: 'string', title: 'accessKeyId' },
      accessKeySecret: { type: 'string', title: 'accessKeySecret' },
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
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $createUserName: { widget: 'text' },
    $createAt: { widget: 'text' },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $operateId: { widget: 'text' }
  };

  constructor(
    private aliyunAccesskeyService: AliyunAccesskeyService,
    private messageService: NzMessageService,
    private modal: NzModalRef
  ) {}

  /**对话框初始化 */
  ngOnInit(): void {
    console.debug('this.record', this.record);
    // 初始化数据
    if (this.record) {
      if (this.copy) {
        this.title = '密钥另存为';
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '另存为';
      } else {
        this.title = '编辑密钥';
        this.updatable = true;
        this.creatable = false;
      }
      this.aliyunAccesskeyService.show(this.record.keyId).subscribe(res => {
        this.i = res;
      });
    } else {
      this.title = '创建密钥';
      this.updatable = false;
      this.creatable = true;
      this.buttonName = '创建';
      this.i = {};
    }
  }

  /**
   * 创建新密钥
   *
   * @param value 原始表单数据
   */
  saveas(value: any): void {
    this.aliyunAccesskeyService.create(value).subscribe(res => {
      if (res.code) {
        this.messageService.error(res.msg);
      } else {
        this.messageService.success('创建成功');
        this.modal.close(true);
      }
    });
  }

  /**
   * 修改已有密钥
   *
   * @param value 原始表单数据
   */
  save(value: any): void {
    this.aliyunAccesskeyService.update(this.record.keyId, value).subscribe(res => {
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
