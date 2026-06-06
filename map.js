(function () {
  const svg = d3.select('#us-map');
  const tooltip = document.getElementById('us-map-tooltip');
  const mapWrap = document.querySelector('.us-map-wrap');

  if (!svg.node() || !tooltip || !mapWrap || typeof topojson === 'undefined') {
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

  const stateNotes = {
    Michigan: 'PhD Student @ the University of Michigan & newly-minted Ann Arborite',
    NewYork: 'Native New Yorker, huge Knicks fan, and lover of a good bagel.',
    Texas: 'Former employee of the Bureau of Labor Statistics Dallas office & frequent H-Town visitor!',
    Illinois: 'Researcher for the Community Study in Madison County, IL. Maybe I knocked on your door?', 
    Arkansas: 'Researcher for the Community Study in Crittenden County, AR. Maybe I knocked on your door?',
    Missouri: 'PAA 2026 attendee and fried ravioli enjoyer', 
    Colorado: 'Frequent visitor of beautiful Golden, CO',
    Maryland: 'Spent my early 20s in Baltimore, the Greatest City in America. Hopkins grad.'
  };

  function stateKey(stateName) {
    return stateName.replace(/\s+/g, '');
  }

  const interactiveStateKeys = new Set(Object.keys(stateNotes));

  function isInteractiveState(stateName) {
    return interactiveStateKeys.has(stateKey(stateName));
  }

  function noteForState(stateName) {
    const key = stateKey(stateName);
    return stateNotes[key] || 'Add a custom note for ' + stateName + ' in map.js.';
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showTooltip(title, body, x, y) {
    tooltip.innerHTML =
      '<div class="us-map-tooltip-title">' + escapeHtml(title) + '</div>' +
      '<div class="us-map-tooltip-body">' + escapeHtml(body) + '</div>';

    const wrapRect = mapWrap.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const pad = 10;

    let left = x + 14;
    let top = y + 14;

    if (left + tooltipRect.width > wrapRect.width - pad) {
      left = wrapRect.width - tooltipRect.width - pad;
    }

    if (top + tooltipRect.height > wrapRect.height - pad) {
      top = wrapRect.height - tooltipRect.height - pad;
    }

    if (left < pad) left = pad;
    if (top < pad) top = pad;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('is-visible');
  }

  function hideTooltip() {
    tooltip.classList.remove('is-visible');
  }

  d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
    .then(function (us) {
      const excludedStateIds = new Set([2, 15]);
      const excludedStateNames = new Set(['Alaska', 'Hawaii']);
      const states = topojson
        .feature(us, us.objects.states)
        .features
        .filter(function (state) {
          const stateId = Number(state.id);
          const stateName = stateNamesByFips[stateId] || '';
          return !excludedStateIds.has(stateId) && !excludedStateNames.has(stateName);
        });
      const width = 975;
      const height = 610;

      const projection = d3.geoAlbersUsa().fitSize([width, height], { type: 'FeatureCollection', features: states });
      const path = d3.geoPath(projection);

      svg.attr('viewBox', '0 0 ' + width + ' ' + height);

      svg
        .append('g')
        .selectAll('path')
        .data(states)
        .enter()
        .append('path')
        .attr('class', function (d) {
          const stateId = Number(d.id);
          const name = stateNamesByFips[stateId] || 'State';
          return isInteractiveState(name) ? 'us-map-state is-selectable' : 'us-map-state is-muted';
        })
        .attr('d', path)
        .attr('tabindex', function (d) {
          const stateId = Number(d.id);
          const name = stateNamesByFips[stateId] || 'State';
          return isInteractiveState(name) ? 0 : -1;
        })
        .attr('role', function (d) {
          const stateId = Number(d.id);
          const name = stateNamesByFips[stateId] || 'State';
          return isInteractiveState(name) ? 'button' : 'img';
        })
        .attr('aria-label', function (d) {
          const stateId = Number(d.id);
          const name = stateNamesByFips[stateId] || 'State';
          return isInteractiveState(name) ? name + '. Hover for details.' : name + '. No details available.';
        })
        .on('mouseenter', function (event, d) {
          const stateId = Number(d.id);
          const name = stateNamesByFips[stateId] || 'State';
          if (!isInteractiveState(name)) return;
          d3.select(this).classed('is-active', true);
          showTooltip(name, noteForState(name), event.offsetX, event.offsetY);
        })
        .on('mousemove', function (event, d) {
          const stateId = Number(d.id);
          const name = stateNamesByFips[stateId] || 'State';
          if (!isInteractiveState(name)) return;
          showTooltip(name, noteForState(name), event.offsetX, event.offsetY);
        })
        .on('mouseleave', function () {
          d3.select(this).classed('is-active', false);
          hideTooltip();
        })
        .on('focus', function (event, d) {
          const stateId = Number(d.id);
          const name = stateNamesByFips[stateId] || 'State';
          if (!isInteractiveState(name)) return;
          const bounds = this.getBBox();
          const x = bounds.x + bounds.width / 2;
          const y = bounds.y + bounds.height / 2;
          d3.select(this).classed('is-active', true);
          showTooltip(name, noteForState(name), x, y);
        })
        .on('blur', function () {
          d3.select(this).classed('is-active', false);
          hideTooltip();
        });

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
    .catch(function () {
      tooltip.textContent = 'Map failed to load. Check network access and try again.';
      tooltip.classList.add('is-visible');
      tooltip.style.left = '10px';
      tooltip.style.top = '10px';
    });
})();
