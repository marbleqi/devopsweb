import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.less']
})
export class SortComponent implements OnInit {
  title!: string;
  titles!: string[];
  fields!: string[];
  url!: string;
  keys!: string[];
  sortData!: any[];
  constructor(private clientService: _HttpClient, private modal: NzModalRef, private messageService: NzMessageService) {}

  ngOnInit(): void {
    let i = 1;
    this.sortData = this.sortData.map((item: any) => ({ ...item, index: i++ }));
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.sortData, event.previousIndex, event.currentIndex);
    let i = 1;
    this.sortData = this.sortData.map((item: any) => ({ ...item, index: i++ }));
  }

  save(): void {
    const params: any[] = this.sortData.map((item: any) => {
      const result: any = {};
      result.orderId = item.index;
      for (const key of this.keys) {
        result[key] = item[key];
      }
      return result;
    });
    this.clientService.post(this.url, params).subscribe(res => {
      if (res.code === 0) {
        this.messageService.success('保存成功');
        this.modal.close(true);
      }
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
