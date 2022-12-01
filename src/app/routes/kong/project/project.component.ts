import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { SFSchema, SFUISchema, SFSchemaEnum } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { Subject } from 'rxjs';

import { KongHostService } from '..';

@Component({
  selector: 'app-kong-project',
  templateUrl: './project.component.html'
})
export class KongProjectComponent implements OnInit, OnReuseInit {
  discreate = true;
  dissync = true;
  disfresh = true;
  disexport = true;
  hostSubject: Subject<SFSchemaEnum[]>;
  @Input() project!: string;
  @Input() title!: string;
  @Input() disremove: boolean = true;
  @Output() readonly hostChange = new EventEmitter<number>();
  @Output() readonly getData = new EventEmitter();
  @Output() readonly sync = new EventEmitter();
  @Output() readonly export = new EventEmitter();
  @Output() readonly add = new EventEmitter();
  @Output() readonly remove = new EventEmitter();
  schema: SFSchema = { properties: { hostId: { type: 'number', title: '站点', default: this.kongHostService.hostId } } };
  ui: SFUISchema = {
    '*': { spanLabelFixed: 100 },
    $hostId: {
      widget: 'select',
      width: 200,
      mode: 'default',
      asyncData: () => this.hostSubject.asObservable(),
      change: (value: number) => {
        if (value) {
          this.disfresh = false;
          this.discreate = false;
          this.disexport = false;
          this.dissync = false;
          this.kongHostService.hostId = value;
          this.hostChange.emit(value);
        }
      }
    }
  };
  i: any;

  constructor(private baseService: BaseService, private kongHostService: KongHostService) {
    this.hostSubject = new Subject<SFSchemaEnum[]>();
  }

  ngOnInit(): void {
    this.baseService.menuWebSub.next('kong');
    this.reload();
    if (this.kongHostService.hostId) {
      this.hostChange.emit(this.kongHostService.hostId);
      this.i = { hostId: this.kongHostService.hostId };
    }
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('kong');
  }

  reload() {
    this.kongHostService.index().subscribe((res: any[]) => {
      this.hostSubject.next(res.map((item: any) => ({ label: item.name, value: item.hostId } as SFSchemaEnum)));
    });
  }
}
