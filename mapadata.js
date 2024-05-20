window.onload = () => {
    var width = 800;
    var height = 900;

    var svg = d3.select("#map-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geoMercator()
        .center([10, 40])
        .scale(450)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    var div = d3.select(".tooltip");

    function mapa() {
        d3.json("europe.geojson").then(function (geo) {
            d3.csv("europe.csv").then(function (data) {
                svg.selectAll("*").remove();

                var lifeExpectancySum = 0;
                var populationSum = 0;
                data.forEach(d => {
                    lifeExpectancySum += parseFloat(d.male_life_expectancy) + parseFloat(d.female_life_expectancy);
                    populationSum += parseFloat(d.population.replace(/,/g, ''));
                });
                var lifeExpectancyAverage = lifeExpectancySum / (data.length * 2);
                var populationAverage = populationSum / data.length;

                var geoData = geo.features.map(feature => {
                    const countryData = data.find(d => d.ISO3 === feature.properties.ISO3);
                    if (countryData) {
                        feature.properties = { ...feature.properties, ...countryData };
                    }
                    return feature;
                });

                svg.selectAll("path")
                    .data(geoData)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("class", "country")
                    .style("fill", "green")
                    .attr("stroke", "#202020")
                    .attr("stroke-width", 0.3)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseout", mouseout);

                function mouseover(event, d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(`<strong>${d.properties.NAME}</strong><br>
                              <strong>Capital:</strong> ${d.properties.capital}<br>
                              <strong>Población:</strong> ${d.properties.population}<br>
                              <strong>Esperanza de vida:</strong> ${((parseFloat(d.properties.male_life_expectancy) + parseFloat(d.properties.female_life_expectancy)) / 2).toFixed(1)}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }

                function mousemove(event) {
                    div.style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }

                function mouseout() {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                }

                d3.select("#highlightButton").on("click", function () {
                    svg.selectAll(".country")
                        .style("fill", d => {
                            var countryLifeExpectancy = (parseFloat(d.properties.male_life_expectancy) + parseFloat(d.properties.female_life_expectancy)) / 2;
                            return countryLifeExpectancy < lifeExpectancyAverage ? "red" : "green";
                        });
                });

            }).catch(function (error) {
                console.error("Error al cargar el archivo CSV:", error);
            });
        }).catch(function (error) {
            console.error("Error al cargar el archivo GeoJSON:", error);
        });
    }

    mapa();
}