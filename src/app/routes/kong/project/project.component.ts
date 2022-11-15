import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseService } from '@core';
import { LoadingService } from '@delon/abc/loading';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { STChange, STColumn, STColumnTag, STComponent, STData } from '@delon/abc/st';
import { SFComponent, SFSchema, SFSchemaEnum, SFUISchema } from '@delon/form';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { format, fromUnixTime } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { KongHostService } from '..';

@Component({
  selector: 'app-kong-project',
  templateUrl: './project.component.html'
})
export class KongProjectComponent implements OnInit, OnReuseInit {
  disremove = true;
  discreate = true;
  dissync = true;
  disfresh = true;
  hostSubject: Subject<any[]>;
  @Input() project!: string;
  @Input() title!: string;
  @Input() data!: STData[];
  @Input() columns!: STColumn[];
  checkRecords: STData[] = [];
  @Output() readonly hostChange = new EventEmitter<number>();
  @Output() readonly getdata = new EventEmitter();
  @Output() readonly sync = new EventEmitter();
  @Output() readonly add = new EventEmitter();
  @Output() readonly remove = new EventEmitter<STData[]>();
  schema: SFSchema = { properties: { hostId: { type: 'number', title: '站点' } } };
  ui: SFUISchema = {
    $hostId: {
      widget: 'select',
      mode: 'default',
      asyncData: () => this.hostSubject.asObservable(),
      change: (value: number) => {
        if (value) {
          this.disfresh = false;
          this.discreate = false;
          this.dissync = false;
          this.hostChange.emit(value);
        }
      },
      spanLabelFixed: 100,
      width: 200
    }
  };
  i: any = {};

  constructor(private baseService: BaseService, private kongHostService: KongHostService) {
    this.hostSubject = new Subject<any[]>();
  }

  ngOnInit(): void {
    this.baseService.menuWebSub.next('kong');
    this.reload();
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('kong');
  }
  reload() {
    this.kongHostService.index().subscribe((res: any[]) => {
      this.hostSubject.next(res.map((item: any) => ({ label: item.name, value: item.hostId })));
    });
  }

  change(e: STChange): void {
    if (e.checkbox) {
      this.checkRecords = e.checkbox;
      this.disremove = this.checkRecords.length === 0;
    }
  }
}
