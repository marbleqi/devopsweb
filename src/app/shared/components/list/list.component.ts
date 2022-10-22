import { Component, OnInit } from '@angular/core';
import { STColumn, STData } from '@delon/abc/st';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styles: []
})
export class ListComponent implements OnInit {
  stdata: STData[] = [];
  scroll!: { x?: string; y?: string };
  columns: STColumn[] = [
    { title: '用户ID', index: 'userid' },
    {
      title: '登陆名',
      index: 'loginname',
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.loginname.includes(filter.value) }
    },
    {
      title: '姓名',
      index: 'username',
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.username.includes(filter.value) }
    },
    { title: '头像', type: 'img', index: 'config.avatar' },
    { title: '状态', index: 'status' },
    { title: '更新时间', index: 'update_at', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss.SSS' },
    {
      title: '操作',
      className: 'text-center',
      buttons: [
        {
          text: '编辑',
          icon: 'edit',
          type: 'modal',
          tooltip: '修改用户信息',
          click: () => this.getdata()
          // modal: { component: SysUserEditComponent, params: () => ({ copy: false }) }
        },
        {
          text: '复制',
          icon: 'copy',
          type: 'modal',
          tooltip: '以用户参数为模板，创建新的用户',
          click: () => this.getdata()
          // modal: { component: SysUserEditComponent, params: () => ({ copy: true }) }
        },
        {
          text: '更多',
          children: [
            { text: '解锁', icon: 'lock', click: record => this.unlock(record), tooltip: '解锁用户' },
            {
              text: '重置密码',
              icon: 'setting',
              type: 'modal',
              tooltip: '重置用户密码',
              click: () => this.getdata()
              // modal: { component: SysUserResetComponent, params: () => ({ copy: false }), size: 'sm' }
            },
            { text: '删除', icon: 'delete', type: 'del', click: record => this.remove(record), tooltip: '删除用户' }
          ]
        }
      ]
    }
  ];

  constructor(private client: _HttpClient, private msgSrv: NzMessageService, private modal: ModalHelper) {}

  ngOnInit(): void {
    this.columns = this.columns.map((item: STColumn) => ({ ...item, className: 'text-center' }));
    console.debug('窗体内高', window.innerHeight);
    this.scroll = { y: `${(window.innerHeight - 0).toString()}px` };
    this.getdata();
  }

  getdata(): void {
    this.client.get('sys/user').subscribe((res: any) => {
      this.stdata = res.data;
    });
  }

  add(): void {
    // this.modal.createStatic(SysUserEditComponent, { record: false }, { size: 'xl' }).subscribe(() => this.getdata());
  }

  unlock(record: STData): void {
    const params = { userid: record['userid'] };
    this.client.post('admin/user/unblock', params).subscribe((res: any) => {
      if (res.code === 0) {
        this.msgSrv.success('解锁成功');
        this.getdata();
      }
    });
  }

  remove(record: STData): void {
    const params = { userid: record['userid'] };
    this.client.post('admin/user/destroy', params).subscribe((res: any) => {
      if (res.code === 0) {
        this.msgSrv.success('删除成功');
        this.getdata();
      }
    });
  }
}
