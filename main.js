const width = 960,
  height = 600;
const svg = d3.select('svg');
const tooltip = d3.select('.tooltip');

// Define the projection and path generator for the U.S. map
const projection = d3
  .geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale(1000);
const path = d3.geoPath().projection(projection);

// Load the TopoJSON and the sample airports data
Promise.all([
  d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'),
  d3.json('airports.json'),
])
  .then(([us, airports]) => {
    // Draw filled state areas
    svg
      .append('g')
      .selectAll('path')
      .data(topojson.feature(us, us.objects.states).features)
      .join('path')
      .attr('fill', '#333')
      .attr('stroke', 'none')
      .attr('d', path);

    // Draw state borders as a single path
    svg
      .append('path')
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr('fill', 'none')
      .attr('stroke', '#777')
      .attr('stroke-width', 1)
      .attr('d', path);

    // Create a scale for the circle radius based on unique login counts.
    const maxLogins = d3.max(airports, (d) => d.logins);
    const radiusScale = d3.scaleSqrt().domain([0, maxLogins]).range([5, 20]);

    // Plot each airport as a circle with a green fill
    svg
      .append('g')
      .selectAll('circle')
      .data(airports)
      .join('circle')
      .attr('cx', (d) => {
        const coords = projection([d.lon, d.lat]);
        return coords ? coords[0] : -100;
      })
      .attr('cy', (d) => {
        const coords = projection([d.lon, d.lat]);
        return coords ? coords[1] : -100;
      })
      .attr('r', (d) => radiusScale(d.logins))
      .attr('fill', 'green')
      .attr('fill-opacity', 0.85)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      // Tooltip events
      .on('mouseover', (event, d) => {
        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.code}</strong><br>Unique Logins: ${d.logins}`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });
  })
  .catch((error) => {
    console.error('Error loading data: ', error);
  });
