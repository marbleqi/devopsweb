import { Component, OnInit, Input } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STColumn, STData } from '@delon/abc/st';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styles: []
})
export class ListComponent implements OnInit, OnReuseInit {
  stdata: STData[] = [];
  scroll!: { x?: string; y?: string };
  @Input('columns') columns!: STColumn[];
  @Input('main-menu') mainMenu!: string;
  @Input('sd-data') stData: STData[] = [];

  constructor(private readonly baseSrv: BaseService, private msgSrv: NzMessageService, private modal: ModalHelper) {}

  ngOnInit(): void {
    this.baseSrv.menuWebSub.next(this.mainMenu);
  }

  _onReuseInit(): void {
    this.baseSrv.menuWebSub.next(this.mainMenu);
  }
}
