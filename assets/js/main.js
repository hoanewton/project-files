$(function () {
  console.log('Page loaded');
  var applicationID = 'RQ5R9HF6TL';
  var apiKey = '0676db78a890b2a03c323a1fe03f14f1';
  var indexName = 'restaurants';

  var client = algoliasearch(applicationID, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    facets: ['food_type'],
    hitsPerPage: 10,
    maxValuesPerFacet: 8
  });

  var x = document.getElementById("geolocation");
  function getLocation() {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(callSearch, showError);
      } else {
          x.innerHTML = "Geolocation is not supported by this browser.";
      }
  }
  function callSearch(position) {
    helper.setQueryParameter('aroundLatLng', position.coords.latitude + ',' + position.coords.longitude).search();
  }

  function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
  }
  getLocation();

  helper.on("result", searchCallback);

  var $hits = $('#hits');
  var $facets = $('#facets');

  $facets.on('click', handleFacetClick);

  $('#search-box').on('keyup', function() {
    helper.setQuery($(this).val())
          .search();
  });

  // helper.search();

  function searchCallback(results) {
    if (results.hits.length === 0) {
      // If there is no result we display a friendly message
      // instead of an empty page.
      $hits.empty().html("No results :(");
      return;
    }

      // Hits/results rendering
    renderHits($hits, results);
    renderFacets($facets, results);
  }



  function renderHits($hits, results) {
    // Scan all hits and display them
    var hits = results.hits.map(function renderHit(hit) {
      // We rely on the highlighted attributes to know which attribute to display
      // This way our end-user will know where the results come from
      // This is configured in our index settings
      var highlighted = hit._highlightResult;
    
      var attributesTemplate = '<div class="hit">' +
      '<div class="media-left">' +
        '<div class="media-object" style="background-image: url(\'' + hit.image_url + '\');"></div>' +
      '</div>' +
      '<div class="media-body">' +
        '<h4 class="">' + hit.name + '</h4>' +
        '<h5 class="stars_count gray-text">' + hit.stars_count + '<span class="star-ratings-sprite"><span style="width:'+ hit.stars_count*20 + '%" class="star-ratings-sprite-rating"></span></span>' + 
        '<span class="reviews-count">(' + hit.reviews_count + '  reviews)</span>' +
        '</h5>' + '<h5 class="gray-text">' + hit.food_type + ' | ' + hit.neighborhood + '/' + hit.area + ' | ' + hit.price_range + '</h5>' +
      '</div>' +
    '</div>';

      return '<div class="hit panel">' + attributesTemplate + '</div>';
    });
    $hits.html(hits);
  }

  function renderFacets($facets, results) {
    var facets = results.facets.map(function(facet) {
      var name = facet.name;
      var facetValues = results.getFacetValues(name);
      var facetsValuesList = $.map(facetValues, function(facetValue) {
        var facetValueClass = facetValue.isRefined ? 'refined'  : '';
        var valueAndCount = '<a data-attribute="' + name + '" data-value="' + facetValue.name + '" href="#">' + facetValue.name + ' (' + facetValue.count + ')' + '</a>';
        return '<li class="facet-item' + facetValueClass + '">' + valueAndCount + '</li>';
      })
      return '<ul class="facet-list">' + facetsValuesList.join('') + '</ul>';
    });
    
    $facets.html(facets.join(''));
  }

  function handleFacetClick(e) {
    e.preventDefault();
    var target = e.target;
    var attribute = target.dataset.attribute;
    var value = target.dataset.value;
    if(!attribute || !value) return;
    helper.toggleRefine(attribute, value).search();
  }
 
});
