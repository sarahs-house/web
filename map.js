(function () {
  const svg = d3.select('#us-map');

  if (!svg.node() || typeof topojson === 'undefined') {
    return;
  }

  const stateNamesByFips = {
    1: 'Alabama',
    2: 'Alaska',
    4: 'Arizona',
    5: 'Arkansas',
    6: 'California',
    8: 'Colorado',
    9: 'Connecticut',
    10: 'Delaware',
    11: 'District of Columbia',
    12: 'Florida',
    13: 'Georgia',
    15: 'Hawaii',
    16: 'Idaho',
    17: 'Illinois',
    18: 'Indiana',
    19: 'Iowa',
    20: 'Kansas',
    21: 'Kentucky',
    22: 'Louisiana',
    23: 'Maine',
    24: 'Maryland',
    25: 'Massachusetts',
    26: 'Michigan',
    27: 'Minnesota',
    28: 'Mississippi',
    29: 'Missouri',
    30: 'Montana',
    31: 'Nebraska',
    32: 'Nevada',
    33: 'New Hampshire',
    34: 'New Jersey',
    35: 'New Mexico',
    36: 'New York',
    37: 'North Carolina',
    38: 'North Dakota',
    39: 'Ohio',
    40: 'Oklahoma',
    41: 'Oregon',
    42: 'Pennsylvania',
    44: 'Rhode Island',
    45: 'South Carolina',
    46: 'South Dakota',
    47: 'Tennessee',
    48: 'Texas',
    49: 'Utah',
    50: 'Vermont',
    51: 'Virginia',
    53: 'Washington',
    54: 'West Virginia',
    55: 'Wisconsin',
    56: 'Wyoming'
  };

  const highlightedStates = new Set([
    'Arkansas',
    'Colorado',
    'Illinois',
    'Maryland',
    'Michigan',
    'Mississippi',
    'Missouri',
    'New York',
    'Oklahoma',
    'Tennessee',
    'Texas'
  ]);

  function stateName(d) {
    return stateNamesByFips[Number(d.id)] || 'State';
  }

  d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
    .then(function (us) {
      const excludedStateNames = new Set(['Alaska', 'Hawaii']);
      const states = topojson
        .feature(us, us.objects.states)
        .features
        .filter(function (state) {
          return !excludedStateNames.has(stateNamesByFips[Number(state.id)] || '');
        });

      const width = 975;
      const height = 610;

      const projection = d3.geoAlbersUsa().fitSize([width, height], {
        type: 'FeatureCollection',
        features: states
      });
      const path = d3.geoPath(projection);

      svg.attr('viewBox', '0 0 ' + width + ' ' + height);

      svg
        .append('g')
        .selectAll('path')
        .data(states)
        .enter()
        .append('path')
        .attr('class', function (d) {
          return highlightedStates.has(stateName(d))
            ? 'us-map-state is-selectable'
            : 'us-map-state is-muted';
        })
        .attr('d', path)
        .attr('role', 'img')
        .attr('aria-label', stateName);

      const michiganPoint = projection([-84.65, 43.0]);
      if (michiganPoint) {
        const starSymbol = d3.symbol().type(d3.symbolStar).size(430);
        svg
          .append('path')
          .attr('class', 'us-city-star us-michigan-star')
          .attr('d', starSymbol)
          .attr('transform', 'translate(' + michiganPoint[0] + ',' + michiganPoint[1] + ')')
          .attr('aria-label', 'Michigan star marker')
          .attr('role', 'img');
      }
    })
    .catch(function (err) {
      console.error('Map failed to load:', err);
    });
})();
