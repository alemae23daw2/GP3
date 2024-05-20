import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
window.onload = () => {

    var any = 2000;
    var sexe = "F";
    var edat = "Y15-19";
    var educacio = "ED0-2";
    mapa();
    busqueda();

    var colores = new Array(
        "#1CC11E",
        "#29C726",
        "#36CD2E",
        "#43D336",
        "#50D93E",
        "#5DDF46",
        "#6AE54E",
        "#77EB56",
        "#84F15E",
        "#91F766",
        "#9FFF6E",
        "#AFFF76",
        "#BFFF7E",
        "#CFFF86",
        "#DFFF8E",
        "#EFFF96",
        "#FFFF9E",
        "#FFFFA6",
        "#FFFFAE",
        "#FFFFB6",
        "#FF7961"
    );

    function getColor(d) {
        if (isNaN(d)) {
            return colores[20];
        }
    
        const umbrales = [1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100];
        for (let i = 0; i < umbrales.length; i++) {
            if (d > umbrales[i]) {
                return colores[19 - i];
            }
        }
    
        return colores[0];
    }

    function busqueda(){
        let sexeMostrar = sexe == "F" ? "femení" : "masculí";
        let regex = /Y(\d+)-(\d+)/;
        let edats = edat.match(regex);
        let educacioMostrar
        switch (educacio) {
            case "ED0-2":
                educacioMostrar = "la educació primaria o inferior";
                break;
            case "ED3_4":
                educacioMostrar = "secundaria i bachillerat o equivalents";
                break;
            case "ED5-8":
                educacioMostrar = "universitat, cicles superiors, master, doctorats o equivalents";
                break;
            case "TOTAL":
                educacioMostrar = "cualsevol tipus d'educació oficial";
                break;
        }
        document.querySelector(".busqueda").innerHTML="Filtrant dades de l'any " + any + 
        " per sexe " + sexeMostrar + " de entre " + edats[1] + " i " + edats[2] + " anys que tinguin " + educacioMostrar;
    }

    let any_select = document.getElementById("any");
    any_select.addEventListener("change", () => {
        any = any_select.value;
        mapa();
        busqueda();
    });

    let sexe_select = document.getElementById("sexe");
    sexe_select.addEventListener("change", () => {
        sexe = sexe_select.value;
        mapa();
        busqueda();
    });

    let educacio_select = document.getElementById("educacio");
    educacio_select.addEventListener("change", () => {
        educacio = educacio_select.value;
        mapa();
        busqueda();
    });

    let edat_select = document.getElementById("edat");
    edat_select.addEventListener("change", () => {
        edat = edat_select.value;
        mapa();
        busqueda();
    });

    var div = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("opacity", 0);

    var width = 800;
    var height = 500;

    var svg = d3.select("#mapa")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geoMercator();
    var path = d3.geoPath().projection(projection);

    function mapa() {
        d3.json("europe.geojson").then(function (geo) {
            d3.csv("data.csv").then(function (data) {
                svg.selectAll("*").remove();
                var highestDataValue = -Infinity;
                var highestCountry;
                var lowestDataValue = Infinity;
                var lowestCountry;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].date == any && data[i].sex == sexe && data[i].age == edat && data[i].isced11 == educacio) {
                        var codiPaisCSV = data[i].geography;
                        var dataValue = parseFloat(data[i].value);
                        for (var j = 0; j < geo.features.length; j++) {
                            var codiPaisJSON = geo.features[j].properties.ISO2;
                            if (codiPaisCSV == codiPaisJSON) {
                                geo.features[j].properties.value = dataValue;
                                if (dataValue > highestDataValue) {
                                    highestDataValue = dataValue;
                                    highestCountry = geo.features[j].properties.NAME;
                                }
                                if (dataValue < lowestDataValue) {
                                    lowestDataValue = dataValue;
                                    lowestCountry = geo.features[j].properties.NAME;
                                }
                                break;
                            }
                        }
                    }
                }
                document.querySelector("#max #valor").innerHTML = highestDataValue;
                document.querySelector("#min #valor").innerHTML = lowestDataValue;
                document.querySelector("#max #pais").innerHTML = highestCountry;
                document.querySelector("#min #pais").innerHTML = lowestCountry;

                projection.fitSize([width, height], geo);

                svg.selectAll("path")
                    .data(geo.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", function (d) {
                        return getColor(d.properties.value);
                    })
                    .attr("stroke", "black")
                    .attr("fill-opacity", "1")
                    .attr("stroke", "#202020")
                    .attr("stroke-width", 0.3)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseout", mouseout);

                function mouseover(event, d) {
                    let valor = d.properties.value || "No hi ha dades";
                    d3.select(this)
                        .attr("stroke-width", "1px")
                        .attr("fill-opacity", "0.9");
                    div.style("opacity", 0.9)
                        .html(
                            "<b style='color: grey;'>" +
                            d.properties.NAME +
                            "</b>" + "<br>" +
                            "<b style='color: grey;'>" + "Nivell mig d'educació: " +
                            valor +
                            "</b>"
                        );
                }
                
                function mousemove(event, d) {
                    div.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                }
                
                function mouseout(event, d) {
                    d3.select(this)
                        .attr("stroke-width", "0.3px")
                        .attr("fill-opacity", "1");
                    div.style("opacity", 0);
                }
            }).catch(function (error) {
                console.error("Error al cargar el archivo geojson:", error);
            });
        });
    }
}