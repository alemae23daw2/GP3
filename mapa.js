var trimestres = [
  "2015TII",
  "2015TI",
  "2014TIV",
  "2014TIII",
  "2014TII",
  "2014TI",
  "2013TIV",
  "2013TIII",
  "2013TII",
  "2013TI",
  "2012TIV",
  "2012TIII",
  "2012TII",
  "2012TI",
  "2011TIV",
  "2011TIII",
  "2011TII",
  "2011TI",
  "2010TIV",
  "2010TIII",
  "2010TII",
  "2010TI",
  "2009TIV",
  "2009TIII",
  "2009TII",
  "2009TI",
  "2008TIV",
  "2008TIII",
  "2008TII",
  "2008TI",
  "2007TIV",
  "2007TIII",
  "2007TII",
  "2007TI",
  "2006TIV",
  "2006TIII",
  "2006TII",
  "2006TI",
  "2005TIV",
  "2005TIII",
  "2005TII",
  "2005TI"
];
trimestres.reverse();

var colors = ["#9FFF88", "#7EF06E", "#5EE053", "#3DD139", "#1CC11E"];

function getColor(d) {
  return d > 40
    ? colors[4]
    : d > 30
    ? colors[3]
    : d > 20
    ? colors[2]
    : d > 10
    ? colors[1]
    : colors[0];
}

var div = d3
  .select("#wrapper")
  .append("div")
  .attr("class", "tooltip")
  .attr("opacity", 0);

var wmap = 600;
var hmap = 520;
var projection = d3.geo
  .mercator()
  .translate([410, 2140])
  .scale(2500);
var path = d3.geo.path().projection(projection);
var map = d3
  .select("#mapa")
  .append("svg")
  .attr("width", wmap)
  .attr("height", hmap);
d3.select("#trimestre").html(
  "Trimestre " + trimestres[trimestres.length - 1].replace(/^\d{4}T/, '')
);
d3.select("#any").html(trimestres[trimestres.length - 1].match(/^\d{4}/));

var height = 330,
  width = 885,
  trans = 60;
var w = 950,
  h = 380;
var aux = trimestres.length - 1;
var width_slider = 920;
var height_slider = 50;
d3.csv("historico.csv", function(data) {
  d3.json("Provincias.json", function(json) {
      for (var i = 0; i < data.length; i++) {
        var codeState = data[i].code;
        var dataValue = data[i][trimestres[trimestres.length - 1]];
        for (var j = 0; j < json.features.length; j++) {
          var jsonState = json.features[j].properties.code;
          if (codeState == jsonState) {
            json.features[j].properties.value = dataValue;
            break;
          }
        }
      }
      var cont = map
        .selectAll("#mapa path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("class", "path")
        .attr("d", path)
        .style("fill", function(d) {
          return getColor(d.properties.value);
        })
        .attr("fill-opacity", "1")
        .attr("stroke", "#202020")
        .attr("stroke-width", 0.3)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

      function mouseover(d) {
        d3.select(this)
          .attr("stroke-width", "1px")
          .attr("fill-opacity", "0.9");
        div.style("opacity", 0.9);
        div.html(
          "<b>" +
            d.properties.name +
            "</b></br>Percentatge d'atur: <b>" +
            data[d.properties.code][trimestres[aux]] +
            "%</b> <br>" +
            d.properties.comunidad
        );
      }

      function mouseout(d) {
        d3.select(this)
          .attr("stroke-width", ".3")
          .attr("fill-opacity", "1");
        div.style("opacity", 0);
      }

      function mousemove(d) {
        div.style({
          left: function() {
            if (d3.event.pageX > 780) {
              return d3.event.pageX - 180 + "px";
            } else {
              return d3.event.pageX + 23 + "px";
            }
          },
          top: d3.event.pageY - 20 + "px"
        });
      }

      let trimestre_select = document.querySelector("#trimestres");
      trimestre_select.addEventListener("change", ()=>{
          trimestre = trimestre_select.value;
          drawMap(trimestre);
      });

      function drawMap(index) {
        d3.select("#trimestre").html("Trimestre " + trimestres[index].substring(5));
        d3.select("#any").html(trimestres[index].substring(0, 4));
        cont.style("fill", function(d) {
          for (var i = 0; i < data.length; i++) {
            var codeState = data[i].code;
            var dataValue = data[i][trimestres[index]];
            for (var j = 0; j < json.features.length; j++) {
              var jsonState = json.features[j].properties.code;
              if (codeState == jsonState) {
                json.features[j].properties.value = dataValue;
                break;
              }
            }
          }
          var value = d.properties.value;
          if (value) {
            return getColor(value);
          } else {
            return "#ccc";
          }
        });
        cont
          .on("mousemove", function(d) {
            div.style("opacity", 0.9);
            div
              .html(
                "<b>" +
                  d.properties.name +
                  "</b></br>Percentatge d'atur: <b>" +
                  data[d.properties.code][trimestres[aux]] +
                  "%</b> <br>" +
                  d.properties.comunidad
              )
              .style("left", function() {
                if (d3.event.pageX > 780) {
                  return d3.event.pageX - 180 + "px";
                } else {
                  return d3.event.pageX + 23 + "px";
                }
              })
              .style("top", d3.event.pageY - 20 + "px");
          })
          .on("mouseout", function() {
            return div.style("opacity", 0);
          })
          .on("mouseout", mouseout);
      }
      maxMin(data, aux);

      function maxMin(d, index) {
        d3.select("#minimoParo").html("");
        d3.select("#maximoParo").html("");
        var datos = [];
        var provincia = [];
        for (var i = 0; i < data.length - 1; i++) {
          datos.push(d[i][trimestres[index]]);
          provincia.push(d[i].state);
        }
        var max_min = d3.extent(datos);
        console.log(max_min);
        var provinciaMax;
        var provinciaMin;
        for (var j = 0; j < data.length - 1; j++) {
          if (max_min[0] == datos[j]) {
            provinciaMin = provincia[j];
          }
          if (max_min[1] == datos[j]) {
            provinciaMax = provincia[j];
          }
        }
        var nombreProvinciaMax = d3
          .select("#maximoParo")
          .html(
            max_min[1] +
              "%<br>" +
              "<span id='provincia'>" +
              provinciaMax +
              "</span>"
          );
        var nombreProvinciaMin = d3
          .select("#minimoParo")
          .html(
            max_min[0] +
              "%<br>" +
              "<span id='provincia'>" +
              provinciaMin +
              "</span"
          );
      }
  });
});

d3.select("#wrapper").on("touchstart", function() {
  div
    .transition()
    .duration(100)
    .style("opacity", 0);
});
