import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilKeyChanged, distinctUntilChanged } from 'rxjs/operators';
import { SearchService } from './search.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'FoodLoad';
    selectedID = null;
    Restaurants: {
        name: string,
        city: string,
        cuisine: string,
        ranking: number,
        rating: number,
        reviews: string
    }[] = [];
    Cities = [];
    Cuisines = [];
    currentPage = 1;
    pageSize = 10;
    pagesCount = 1;
    filtersForm: FormGroup;
    showingFilters = false;
    noElements = false;
    loaded = false;
    searchResults = null;
    searchSub;
    constructor(private httpService: HttpService, private searchService: SearchService) {

    }

    ngOnInit() {
        this.createFilterForm();
        this.getRestaurants();
        this.getCities();
        this.getCuisines();
    }

    createFilterForm() {
        this.filtersForm = new FormGroup({
            searchText: new FormControl(''),
            city: new FormControl('nocity'),
            cuisine: new FormControl('nocuisine'),
            sortby: new FormControl('nosort')
        });

        this.searchSub = this.filtersForm.controls.searchText.valueChanges.pipe(debounceTime(500),
            distinctUntilChanged()
        ).subscribe(value => {
            if (value !== '') {
                this.searchService.search(value).subscribe(response => {
                    this.searchResults = response.searchResults;
                });
            }
            this.getRestaurants();
        });

    }

    filterChange() {
        this.getRestaurants();
    }

    getRestaurants() {
        const searchText = this.filtersForm.controls.searchText.value === '' ? 'NoSearch' : this.filtersForm.controls.searchText.value;
        this.httpService.getRestaurants(
            searchText,
            this.filtersForm.controls.city.value,
            this.filtersForm.controls.cuisine.value,
            this.filtersForm.controls.sortby.value,
            this.currentPage
        )
        .subscribe(
            (response) => {
                if (response.error) {
                    alert('Error in fetching Restaurants.');
                } else {
                    this.Restaurants = response.Restaurant;
                    this.pagesCount = response.numberOfPages;
                    this.loaded = true;
                    console.log(this.pagesCount);
                }
            },
            (error) => {
                alert('Error in fetching Restaurants.');
            }
        );
    }

    getCities() {
        console.log('Inside Get Cities');
        this.httpService.getCities()
        .subscribe(
            (response) => {
                if (response.error) {
                    alert('Error in fetching Cities.');
                } else {
                    this.Cities = response.Cities;
                }
            },
            (error) => {
                alert('Error in fetching Cities.');
            }
        );
    }

    getCuisines() {
        this.httpService.getCuisines()
        .subscribe(
            (response) => {
                if (response.error) {
                    alert('Error in fetching Cuisines.');
                } else {
                    this.Cuisines = response.Cuisines;
                }
            },
            (error) => {
                alert('Error in fetching Cuisines.');
            }
        );
    }

    checkCurrentPage(pageNo) {
        this.currentPage = pageNo;
        this.getRestaurants();
    }

    showFilters() {
        this.showingFilters = !this.showingFilters;
    }

    clearSearch() {
        this.filtersForm.controls.searchText.setValue('');
    }

    getCuisineArray(cuisineString) {
        const cuisineString1 = cuisineString.replace(/[\[\]']+/g, '');
        const cuisinesArray = cuisineString1.split(',');
        return cuisinesArray;
    }

    removeAutocomplete() {
        this.searchResults = [];
    }

    setSearch(text) {
        this.filtersForm.controls.searchText.setValue(text);
        this.searchResults = null;
        this.getRestaurants();
    }

}
