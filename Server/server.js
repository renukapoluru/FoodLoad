const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser());

/** csv file
a,b,c
1,2,3
4,5,6
*/
const csvFilePath='./assets/restaurants.csv';
const csv=require('csvtojson');

class Items {
	constructor() {
		this.RestaurantsArray = [];
	}
	async getItems() {
		// Async / await usage
		this.RestaurantsArray= await csv().fromFile(csvFilePath);
		return this.RestaurantsArray;
	}

	async getCities() {
		const citiesList = [];
		const cities = await this.RestaurantsArray.map((el,index) => {
			if(citiesList.indexOf(el.City) < 0){
				citiesList.push(el.City);
				return true;
			}
			else {
				return false;
			}
		});
		return citiesList;
	}

	async getCuisines() {
		var cuisinesList = [];
		const cuisines = await this.RestaurantsArray.map((el,index) => {
			var cuisinesArray = this.getCuisineArray(el["Cuisine Style"]);
			cuisinesArray.map((cs) => {
				if(cuisinesList.indexOf(cs.trim()) < 0) {
					cuisinesList.push(cs.trim());
				}
			});
		});
		return cuisinesList;
	}

	getCuisineArray(cuisineString) {
		var cuisineString1 = cuisineString.replace(/[\[\]']+/g,'');
		var cuisinesArray = cuisineString1.split(',');
		return cuisinesArray;
	}
}

const ITEMS = new Items();
ITEMS.getItems();
 
Restaurant = [];

app.get('/', function (req, res) {
    res.send('Hello, This is my FoodLoad API');
});

app.get('/getRestaurants/:search/:city/:cuisine/:sortby/:pageNo', async (req, res) => {
	const search = req.params.search;
	const city = req.params.city;
	const cuisine = req.params.cuisine;
	const sortby = req.params.sortby;
	const pageNo = req.params.pageNo;
	var restList = await ITEMS.getItems();
	restList = await restList.filter((el) => {
		var cuisineArray = ITEMS.getCuisineArray(el["Cuisine Style"]);
		if(
			(el.City == city || city == 'nocity' ) &&
			( (cuisineArray.includes(cuisine)) || (cuisine == 'nocuisine') )&&
			((search == 'NoSearch') || (el.Name.toLowerCase()).includes(search.toLowerCase()))
		) {
			return el;
		}
	});
	if(sortby == 'ranking-high') {
		restList.sort((a,b) => {
			return b.Ranking - a.Ranking
		})		
	}
	else if(sortby == 'rating-low')	{
		restList.sort((a,b) => {
			return a.Rating - b.Rating
		})
	}
	else {
		restList.sort((a,b) => {
			return b.Rating - a.Rating
		})
	}
	res.status(200).json({
		error: false,
		Restaurant: restList.slice(pageNo*15-15,pageNo*15),
		numberOfPages: Math.ceil(restList.length/15)
	});
});

app.get('/getSearchList/:search', async (req, res) => {
	const search = req.params.search;
	var restList = await ITEMS.getItems();
	restList = await restList.filter((el) => {
		var cuisineArray = ITEMS.getCuisineArray(el["Cuisine Style"]);
		if(
			( (cuisineArray.includes(search)) ) ||
			((search == 'NoSearch') || (el.Name.toLowerCase()).includes(search.toLowerCase()))
		) {
			return el.Name;
		}
	});
	res.status(200).json({
		error: false,
		searchResults: restList.slice(0,10),
	});
});

app.get('/getCities', async (req, res) => {
	const citiesList = await ITEMS.getCities();
    res.status(200).json({
        error: false,
		Cities: citiesList
    });
});

app.get('/getCuisines', async (req, res) => {
	const cuisinesList = await ITEMS.getCuisines();
    res.status(200).json({
        error: false,
		Cuisines: cuisinesList
    });
});


app.all('**', function (req, res) {
      res.send(`404`)
});


app.listen(4000, function () {
    console.log('CORS-enabled web server listening on port 4000')
})
