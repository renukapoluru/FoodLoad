import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private httpService: HttpService) { }

  search(value) {
    return this.httpService.getSearch(value);
  }
}
