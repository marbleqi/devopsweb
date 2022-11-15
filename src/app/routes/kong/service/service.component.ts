import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent, STData } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { format, fromUnixTime } from 'date-fns';

import { KongProjectService } from '..';

@Component({
  selector: 'app-kong-service',
  templateUrl: './service.component.html'
})
export class KongServiceComponent implements OnInit {
  hostId!: number;
  columns: STColumn[] = [
    { type: 'checkbox' },
    {
      title: '名称',
      index: 'config.name',
      sort: { compare: (a, b) => a.config.name.localeCompare(b.config.name) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.name.indexOf(filter.value) !== -1 }
    },
    { title: '协议', index: 'config.protocol' },
    {
      title: '主机',
      index: 'config.host',
      sort: { compare: (a, b) => a.config.host.localeCompare(b.config.host) },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.host.indexOf(filter.value) !== -1 }
    },
    {
      title: '端口',
      index: 'config.port',
      sort: { compare: (a, b) => a.config.port - b.config.port },
      filter: { type: 'keyword', fn: (filter, record) => !filter.value || record.config.port.toString() === filter.value }
    },
    { title: '路径', index: 'config.path' },
    {
      title: '创建时间',
      sort: { compare: (a, b) => a.config.created_at - b.config.created_at },
      format: (item, col, index) => format(fromUnixTime(item.config.created_at), 'yyyy-MM-dd HH:mm:ss')
    },
    {
      title: '更新时间',
      sort: { compare: (a, b) => a.config.updated_at - b.config.updated_at },
      format: (item, col, index) => format(fromUnixTime(item.config.updated_at), 'yyyy-MM-dd HH:mm:ss')
    },
    {
      title: '操作',
      buttons: [{ text: '删除', icon: 'delete', type: 'del', click: record => this.remove(record) }]
    }
  ];
  data: STData[] = [];
  constructor(private kongProjectService: KongProjectService, private modal: ModalHelper) {}

  ngOnInit(): void {
    console.debug('');
  }

  hostChange(hostId: number): void {
    localStorage.setItem('kong_hostid', hostId.toString());
    this.hostId = hostId;
    this.getdata();
  }

  sync(): void {
    this.kongProjectService.sync(this.hostId, 'service').subscribe(res => {
      console.debug('同步结果', res);
    });
  }

  getdata(): void {
    this.kongProjectService.index(this.hostId, 'service').subscribe((data: any[]) => {
      console.debug('获得数据', data);
      this.data = data;
    });
  }

  add(): void {
    // this.modal
    //   .createStatic(FormEditComponent, { i: { id: 0 } })
    //   .subscribe(() => this.st.reload());
  }

  remove(record?: STData): void {
    // this.loading = true;
    // this.loadingSrv.open({ type: 'spin', text: '删除中……' });
    // if (record) {
    //   this.checkrecords = [record];
    // }
    // const allnum = this.checkrecords.length;
    // let curnum = 0;
    // for (const item of this.checkrecords) {
    //   this.http.post('kong/proxy/destroy', { hostid: this.hostid, project: this.project, id: item['id'] }).subscribe((res: any) => {
    //     if (res.code === 0) {
    //       this.msgSrv.success('删除成功！');
    //     }
    //     curnum++;
    //     if (allnum === curnum) {
    //       this.getdata();
    //     }
    //   });
    // }
  }
}
