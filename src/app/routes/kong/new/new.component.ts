import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-kong-new',
  templateUrl: './new.component.html'
})
export class KongNewComponent implements OnInit {
  constructor(private http: _HttpClient) {}

  ngOnInit(): void {
    console.debug('');
  }
}
