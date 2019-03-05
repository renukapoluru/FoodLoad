import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

interface HttpResponse {
    error: boolean;
    message: string;
}
@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(private http: HttpClient) { }

    getRestaurants(search, city, cuisine, sortby, currentPage): Observable<any> {
        return this.http.get(`${environment.API_URL}/getRestaurants/${search}/${city}/${cuisine}/${sortby}/${currentPage}`);
    }

    getCities(): Observable<any> {
        return this.http.get(`${environment.API_URL}/getCities`);
    }

    getCuisines(): Observable<any> {
        return this.http.get(`${environment.API_URL}/getCuisines`);
    }

    getSearch(searchText): Observable<any> {
        return this.http.get(`${environment.API_URL}/getSearchList/${searchText}`);
    }
}
