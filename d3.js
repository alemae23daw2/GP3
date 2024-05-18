import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
window.onload = () =>{

    var any = 2000;
    var sexe = "F";
    var edat = "Y15-19";
    var educacio = "ED0-2";
    mapa();

    var colores = new Array(
        "#b3ffb3",
        "#99ff99",
        "#80ff80",
        "#66ff66",
        "#4dff4d",
        "#33ff33",
        "#1aff1a",
        "#00ff00",
        "#00e600",
        "#00cc00",
        "#00b300",
        "#009900",
        "#008000",
        "#006600",
        "#004d00",
        "#003300",
        "#001a00",
        "#001000",
        "#000800",
        "#000600"
    );
    
    function getColor(d) {
        return d == "" 
        ? "red" 
            :d > 1900
                ? colores[19]
                : d > 1800
                    ? colores[18]
                    : d > 1700
                        ? colores[17]
                        : d > 1600
                            ? colores[16]
                            : d > 1500
                                ? colores[15]
                                : d > 1400
                                    ? colores[14]
                                    : d > 1300
                                        ? colores[13]
                                        : d > 1200
                                            ? colores[12]
                                            : d > 1100
                                                ? colores[11]
                                                : d > 1000
                                                    ? colores[10]
                                                    : d > 900
                                                        ? colores[9]
                                                        : d > 800
                                                            ? colores[8]
                                                            : d > 700
                                                                ? colores[7]
                                                                : d > 600
                                                                    ? colores[6]
                                                                    : d > 500
                                                                        ? colores[5]
                                                                        : d > 400
                                                                            ? colores[4]
                                                                            : d > 300
                                                                                ? colores[3]
                                                                                : d > 200
                                                                                    ? colores[2]
                                                                                    : d > 100
                                                                                        ? colores[1]
                                                                                        : colores[0];
    }
    
    let any_select = document.getElementById("any");
    any_select.addEventListener("change", () =>{
        any = any_select.value;
        mapa();
    });

    let sexe_select = document.getElementById("sexe");
    sexe_select.addEventListener("change", () =>{
        sexe = sexe_select.value;
        mapa();
    });

    let educacio_select = document.getElementById("educacio");
    educacio_select.addEventListener("change", () =>{
        educacio = educacio_select.value;
        mapa();
    });


    var width = 800;
    var height = 600;

    var svg = d3.select("#mapa")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geoMercator();
    var path = d3.geoPath().projection(projection);

    function mapa(){
        d3.json("europe.geojson").then(function (geo) {
            d3.csv("data.csv").then(function (data) {
                svg.selectAll("*").remove();
                for (var i = 0; i < data.length; i++) {
                    if(data[i].date == any && data[i].sex == sexe && data[i].age == edat && data[i].isced11 == educacio){
                        var codiPaisCSV = data[i].geography;
                        var dataValue = data[i].value;
                        for (var j = 0; j < geo.features.length; j++) {
                            var codiPaisJSON = geo.features[j].properties.ISO2;
                            if (codiPaisCSV == codiPaisJSON) {
                                geo.features[j].properties.value = dataValue;
                                break;
                            }
                        }
                    }
                }
        
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
                    .attr("stroke-width", 0.3);
        
            }).catch(function (error) {
                console.error("Error al cargar el archivo geojson:", error);
            });
        });
    }
}
