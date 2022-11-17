import { Component, OnInit, ViewChild } from '@angular/core';
import { manifest } from '@ant-design/icons-angular';
import { SFComponent, SFSchema, SFSchemaEnum, SFUISchema } from '@delon/form';
import { ArrayService } from '@delon/util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzTreeComponent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { map } from 'rxjs';

import { AuthAbilityService, AuthMenuService } from '../..';

@Component({
  selector: 'app-auth-menu-edit',
  templateUrl: './edit.component.html'
})
export class AuthMenuEditComponent implements OnInit {
  copy!: boolean;
  title!: string;
  updatable!: boolean;
  creatable!: boolean;
  buttonName!: string;
  pMenuId: number;
  direction: string[];
  suggestion: string[];
  edit: string[];
  data: string[];
  logo: string[];
  other: string[];
  iconList: string[] = [];
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      pMenuId: { type: 'number', title: '上级菜单' },
      link: { type: 'string', title: '链接' },
      config: {
        type: 'object',
        properties: {
          text: { type: 'string', title: '菜单名' },
          description: { type: 'string', title: '菜单说明' },
          reuse: { type: 'boolean', title: '路由复用', default: true },
          iconType: {
            type: 'string',
            title: '图标类型',
            enum: [
              { label: '方向', value: 'direction' },
              { label: '建议', value: 'suggestion' },
              { label: '编辑', value: 'edit' },
              { label: '数据', value: 'data' },
              { label: '品牌', value: 'logo' },
              { label: '其他', value: 'other' }
            ]
          },
          isLeaf: { type: 'boolean', title: '末级菜单', default: true },
          icon: { type: 'string', title: '图标' }
        },
        required: ['text', 'link']
      },
      status: {
        type: 'number',
        title: '状态',
        default: 1,
        enum: [
          { value: 1, label: '启用' },
          { value: 0, label: '禁用' }
        ]
      },
      abilities: { type: 'number', title: '授权权限点' },
      updateUserName: { type: 'string', title: '更新人' },
      updateAt: { type: 'string', title: '更新时间' },
      operateId: { type: 'number', title: '操作序号' }
    },
    required: ['pid', 'description']
  };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100, spanLabel: 4, spanControl: 20, grid: { span: 12 } },
    $pMenuId: {
      widget: 'tree-select',
      mode: 'default',
      showLine: true,
      defaultExpandAll: true,
      change: (value: number) => this.change(value),
      asyncData: () =>
        this.menuService.index().pipe(
          map(res => {
            let pidList: SFSchemaEnum[] = res
              .filter(item => !item.config.isLeaf)
              .map(item => ({ title: item.config.text, key: item.menuId, pMenuId: item.pMenuId }));
            pidList.unshift({ title: '主菜单', key: 0, expanded: true });
            pidList = this.arrService.arrToTree(pidList, { idMapName: 'key', parentIdMapName: 'pMenuId' });
            console.debug('下拉列表获取数据', pidList);
            return pidList;
          })
        )
    },
    $config: {
      grid: { span: 24 },
      $iconType: {
        widget: 'radio',
        styleType: 'button',
        buttonStyle: 'solid',
        change: (value: string) => this.iconTypeChange(value)
      },
      $icon: { widget: 'custom', grid: { span: 24 } }
    },
    $status: { widget: 'radio', styleType: 'button', buttonStyle: 'solid' },
    $abilities: {
      widget: 'transfer',
      showSearch: true,
      titles: ['未授权权限点', '已授权权限点'],
      operations: ['授予', '没收'],
      grid: { span: 24 },
      listStyle: { width: '100%', 'height.px': window.innerHeight - 700 },
      asyncData: () =>
        this.abilityService.index().pipe(map(res => res.map(item => ({ title: `${item.name}——${item.description}`, value: item.id }))))
    },
    $updateUserName: { widget: 'text' },
    $updateAt: { widget: 'text' },
    $operateId: { widget: 'text' }
  };

  constructor(
    private abilityService: AuthAbilityService,
    private menuService: AuthMenuService,
    private arrService: ArrayService,
    private messageService: NzMessageService,
    private modal: NzModalRef
  ) {
    this.pMenuId = 0;
    // 所有图标
    const all = manifest['outline'] as string[];
    // 方向类图标
    this.direction = [
      'step-backward',
      'step-forward',
      'fast-backward',
      'fast-forward',
      'shrink',
      'arrows-alt',
      'down',
      'up',
      'left',
      'right',
      'caret-up',
      'caret-down',
      'caret-left',
      'caret-right',
      'up-circle',
      'down-circle',
      'left-circle',
      'right-circle',
      'double-right',
      'double-left',
      'vertical-left',
      'vertical-right',
      'vertical-align-top',
      'vertical-align-middle',
      'vertical-align-bottom',
      'forward',
      'backward',
      'rollback',
      'enter',
      'retweet',
      'swap',
      'swap-left',
      'swap-right',
      'arrow-up',
      'arrow-down',
      'arrow-left',
      'arrow-right',
      'play-circle',
      'up-square',
      'down-square',
      'left-square',
      'right-square',
      'login',
      'logout',
      'menu-fold',
      'menu-unfold',
      'border-bottom',
      'border-horizontal',
      'border-inner',
      'border-outer',
      'border-left',
      'border-right',
      'border-top',
      'border-verticle',
      'pic-center',
      'pic-left',
      'pic-right',
      'radius-bottomleft',
      'radius-bottomright',
      'radius-upleft',
      'radius-upright',
      'fullscreen',
      'fullscreen-exit'
    ];
    // 建议类图标
    this.suggestion = [
      'question',
      'question-circle',
      'plus',
      'plus-circle',
      'pause',
      'pause-circle',
      'minus',
      'minus-circle',
      'plus-square',
      'minus-square',
      'info',
      'info-circle',
      'exclamation',
      'exclamation-circle',
      'close',
      'close-circle',
      'close-square',
      'check',
      'check-circle',
      'check-square',
      'clock-circle',
      'warning',
      'issues-close',
      'stop'
    ];
    // 编辑类图标
    this.edit = [
      'edit',
      'form',
      'copy',
      'scissor',
      'delete',
      'snippets',
      'diff',
      'highlight',
      'align-center',
      'align-left',
      'align-right',
      'bg-colors',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'redo',
      'undo',
      'zoom-in',
      'zoom-out',
      'font-colors',
      'font-size',
      'line-height',
      'dash',
      'small-dash',
      'sort-ascending',
      'sort-descending',
      'drag',
      'ordered-list',
      'unordered-list',
      'radius-setting',
      'column-width',
      'column-height'
    ];
    // 数据类图标
    this.data = [
      'area-chart',
      'pie-chart',
      'bar-chart',
      'dot-chart',
      'line-chart',
      'radar-chart',
      'heat-map',
      'fall',
      'rise',
      'stock',
      'box-plot',
      'fund',
      'sliders'
    ];
    // 品牌类图标
    this.logo = [
      'android',
      'apple',
      'windows',
      'ie',
      'chrome',
      'github',
      'aliwangwang',
      'dingding',
      'dingtalk',
      'weibo-square',
      'weibo-circle',
      'taobao-circle',
      'html5',
      'weibo',
      'twitter',
      'wechat',
      'youtube',
      'alipay-circle',
      'taobao',
      'skype',
      'qq',
      'medium-workmark',
      'gitlab',
      'medium',
      'linkedin',
      'google-plus',
      'dropbox',
      'facebook',
      'codepen',
      'code-sandbox',
      'amazon',
      'google',
      'codepen-circle',
      'alipay',
      'ant-design',
      'ant-cloud',
      'aliyun',
      'zhihu',
      'slack',
      'slack-square',
      'behance',
      'behance-square',
      'dribbble',
      'dribbble-square',
      'instagram',
      'yuque',
      'alibaba',
      'yahoo',
      'reddit',
      'sketch'
    ];
    this.other = all
      .filter((item: string) => !this.direction.includes(item))
      .filter((item: string) => !this.suggestion.includes(item))
      .filter((item: string) => !this.edit.includes(item))
      .filter((item: string) => !this.data.includes(item))
      .filter((item: string) => !this.logo.includes(item));
  }

  ngOnInit(): void {
    if (this.record) {
      if (this.copy) {
        this.title = '菜单另存为';
        this.updatable = false;
        this.creatable = true;
        this.buttonName = '另存为';
      } else {
        this.title = '编辑菜单';
        this.updatable = true;
        this.creatable = false;
        this.buttonName = '';
      }
      this.menuService.show(this.record.menuId).subscribe(res => {
        console.log('菜单编辑窗口', res);
        this.pMenuId = res.pMenuId;
        const iconType = this.iconType(res.config.icon);
        this.iconTypeChange(iconType);
        this.i = { ...res, config: { ...res.config, iconType } };
      });
    } else {
      this.title = '创建菜单';
      this.updatable = false;
      this.creatable = true;
      this.buttonName = '创建';
      this.iconTypeChange('direction');
      this.i = { pmenuid: this.pMenuId, iconType: 'direction', abilities: [] };
    }
  }

  iconType(icon: string): string {
    if (this.direction.includes(icon)) {
      return 'direction';
    }
    if (this.suggestion.includes(icon)) {
      return 'suggestion';
    }
    if (this.edit.includes(icon)) {
      return 'edit';
    }
    if (this.data.includes(icon)) {
      return 'data';
    }
    if (this.logo.includes(icon)) {
      return 'logo';
    }
    return 'other';
  }

  iconTypeChange(value: string): void {
    if (value === 'direction') {
      this.iconList = this.direction.sort((a, b) => a.localeCompare(b));
    } else if (value === 'suggestion') {
      this.iconList = this.suggestion.sort((a, b) => a.localeCompare(b));
    } else if (value === 'edit') {
      this.iconList = this.edit.sort((a, b) => a.localeCompare(b));
    } else if (value === 'data') {
      this.iconList = this.data.sort((a, b) => a.localeCompare(b));
    } else if (value === 'logo') {
      this.iconList = this.logo.sort((a, b) => a.localeCompare(b));
    } else {
      this.iconList = this.other.sort((a, b) => a.localeCompare(b));
    }
    console.debug('触发图标类型调整事件', value);
  }

  change(pmenuid: number) {
    this.pMenuId = pmenuid;
  }

  saveas(value: any): void {
    console.debug('value', value);
    this.menuService.create(value).subscribe(res => {
      if (res.code) {
        this.messageService.error(res.msg);
      } else {
        this.messageService.success('创建成功');
        this.modal.close(this.pMenuId);
      }
    });
  }

  save(value: any): void {
    console.debug('value', value);
    this.menuService.update(this.record.menuId, value).subscribe(res => {
      if (res.code) {
        this.messageService.error(res.msg);
      } else {
        this.messageService.success('保存成功');
        this.modal.close(this.pMenuId);
      }
    });
  }

  close(): void {
    this.modal.destroy(this.pMenuId);
  }
}
