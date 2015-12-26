/**=========================================================
 * Module: location Directive.
 * Description: Directive for Location area.
 * Author: Marcin - 2015.12.24
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.location', [])
        .directive("location", ['$http', 'APP_APIS', 'AccountService', 'LocationService', 'Flash', function($http, APP_APIS, AccountService, LocationService, Flash) {
        	return {
        		restrict: 'E',
        		scope: {
        			accountId: '='
        		},
        		templateUrl: 'app/views/partials/location.html',
        		link: function(scope, elem, attrs) {
        			var zoomVal = 17;
					var defaultMapPos = {lat: 51.50013, lng: -0.126305};

        			// Set Location area.
        			AccountService.getLocation(scope.accountId).then(function(locations){
        				if(locations.length != 0){
							scope.hasLocations = true;
							scope.locations = locations;

							// Show Google map.
							var map = new google.maps.Map(document.getElementById('map_'+scope.accountId), {
								center: {lat: locations[0].lat, lng: locations[0].lon},
								zoom: zoomVal,
								mapTypeId: google.maps.MapTypeId.ROADMAP
							});

							var marker = new google.maps.Marker({
								position: {lat: locations[0].lat, lng: locations[0].lon},
								map: map,
								title: locations[0].name
							});
						}else{
							scope.hasLocations = false;
							scope.locations = [];

							var map = new google.maps.Map(document.getElementById('map_'+scope.accountId), {
								center: defaultMapPos,
								zoom: zoomVal,
								mapTypeId: google.maps.MapTypeId.ROADMAP
							});
						}

						// Create the search box and link it to the UI element.
						var input = document.getElementById('pacInput_'+scope.accountId);
						var searchBox = new google.maps.places.SearchBox(input);

						map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

						// Bias the SearchBox results towards current map's viewport.
						map.addListener('bounds_changed', function() {
							searchBox.setBounds(map.getBounds());
						});

						var markers = [];
						// [START region_getplaces]
						// Listen for the event fired when the user selects a prediction and retrieve
						// more details for that place.
						searchBox.addListener('places_changed', function() {
							scope.places = searchBox.getPlaces();
							if (scope.places.length == 0) {
								return;
							}

							// Clear out the old markers.
							markers.forEach(function(marker) {
								marker.setMap(null);
							});
							markers = [];

							// For each place, get the icon, name and location.
							var bounds = new google.maps.LatLngBounds();
							scope.places.forEach(function(place) {
								var icon = {
									url: place.icon,
									size: new google.maps.Size(71, 71),
									origin: new google.maps.Point(0, 0),
									anchor: new google.maps.Point(17, 34),
									scaledSize: new google.maps.Size(25, 25)
								};

								// Create a marker for each place.
								markers.push(new google.maps.Marker({
									map: map,
									icon: icon,
									title: place.name,
									position: place.geometry.location
								}));

								if (place.geometry.viewport) {
									// Only geocodes have viewport.
									bounds.union(place.geometry.viewport);
								} else {
									bounds.extend(place.geometry.location);
								}
							});
							map.fitBounds(bounds);

							// Get Country, County, Postal/Zipcode, Lat, Lon using address
							console.log(scope.places[0].formatted_address);              
							$http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+scope.places[0].formatted_address)
								.success(function(data){
									console.log(data);                  
									scope.places[0].address_components = data.results[0].address_components;
									scope.places[0].geometry = data.results[0].geometry;
								})
						});
						// [END region_getplaces]
        			}, function(error){
        				console.log(error);
        				return;
        			})

					scope.addLocation = function() {
						var place = scope.places[0];

						if(!place) return;

						var areaCounty = '';
						var country = '';
						var postal_code = '';

						for(var i in place.address_components){
							if(place.address_components[i].types[0] == 'administrative_area_level_2')
								areaCounty = place.address_components[i].short_name;
							else if(place.address_components[i].types[0] == 'administrative_area_level_1')
								areaCounty = place.address_components[i].short_name;
							else if(place.address_components[i].types[0] == 'country')
								country = place.address_components[i].short_name;
							else if(place.address_components[i].types[0] == 'postal_code')
								postal_code = place.address_components[i].short_name;
						}

						var lat = place.geometry.location.lat;
						var lon = place.geometry.location.lng;
						var fullAddress = place.formatted_address;
						var name = place.name;
						var place_id = place.place_id;

						var params = {
							"areaCounty": areaCounty,
							"country": country,
							"fullAddress": fullAddress,
							"googlePlaceID": place_id,
							"lat": lat,
							"lon": lon,
							"name": name,
							"zipPostcode": postal_code
						};

						LocationService.createLocation(params).then(function(data){
							var locationId = data.externalId;
							AccountService.setLocation(scope.accountId, locationId).then(function(data){
								Flash.create('success', "Location added successfully!");
							}, function(error){
								console.log(error);
								return;
							})
						}, function(error){
							console.log(error);
							return;
						})
					}

					scope.updateLocation = function() {
						var locations = scope.locations;
						var locationId = locations[0].externalId;
						var place = scope.places[0];

						if(!place) return;

						var areaCounty = '';
						var country = '';
						var postal_code = '';

						for(var i in place.address_components){
							if(place.address_components[i].types[0] == 'administrative_area_level_2')
								areaCounty = place.address_components[i].short_name;
							else if(place.address_components[i].types[0] == 'administrative_area_level_1')
								areaCounty = place.address_components[i].short_name;
							else if(place.address_components[i].types[0] == 'country')
								country = place.address_components[i].short_name;
							else if(place.address_components[i].types[0] == 'postal_code')
								postal_code = place.address_components[i].short_name;
						}

						var lat = place.geometry.location.lat;
						var lon = place.geometry.location.lng;
						var fullAddress = place.formatted_address;
						var name = place.name;
						var place_id = place.place_id;

						var params = {
							"areaCounty": areaCounty,
							"country": country,
							"fullAddress": fullAddress,
							"googlePlaceID": place_id,
							"lat": lat,
							"lon": lon,
							"name": name,
							"zipPostcode": postal_code          
						};

						LocationService.updateLocation(locationId, params).then(function(data){
							Flash.create('success', "Location updated successfully!");
						}, function(error){
							console.log(error);
							return;
						})
					}
        		}
        	}
		}])
})();		