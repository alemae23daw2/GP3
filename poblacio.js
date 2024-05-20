import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const camps = ["Density (P/Km2)", "Abbreviation", "Agricultural Land( %)", "Land Area(Km2)", "Birth Rate", "Calling Code", "Capital/Major City", "Co2-Emissions", "Currency-Code", "Fertility Rate", "Forested Area (%)", "Gasoline Price", "GDP", "Gross primary education enrollment (%)", "Gross tertiary education enrollment (%)", "Infant mortality", "Largest city", "Life expectancy", "Maternal mortality ratio", "Minimum wage", "Official language", "Out of pocket health expenditure", "Population", "Tax revenue (%)", "Total tax rate", "Unemployment rate"]

document.addEventListener("DOMContentLoaded", function () {

    var pais = "ES";
    dades();
    grafic();

    let pais_select = document.querySelector("#countrySelect");
    pais_select.addEventListener("change", () => {
        pais = pais_select.value;
        dades();
        grafic();
    });

    function dades() {
        d3.csv("world-data-2023.csv").then(function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].Abbreviation == pais) {
                    let infoPais = document.querySelector(".pais").childNodes;
                    let a = 0;
                    for (let o in infoPais) {
                        if (o % 2 != 0) {
                            infoPais[o].childNodes[1].textContent = data[i][camps[a]] || "No hi ha informació";
                            a++;
                        }
                    }

                }
            }
        });
    }

    function parse(int){
        return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    var div = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("opacity", 0);

    function mouseover(event, d) {
        div.style("opacity", 0.9)
            .html(
                "<b>" + parse(d) + "</b>"
            );
    }
    
    function mousemove(event, d) {
        div.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    }
    
    function mouseout(event, d) {
        div.style("opacity", 0);
    }

    const width = 800;
    const height = 500;
    const margin = { top: 80, right: 50, bottom: 80, left: 80 };
    const svg = d3.select("#graficPoblacio").append("svg")
                        .attr("width", width)
                        .attr("height", height);

    function grafic() {
        d3.csv("world_population.csv").then(function (data) {
            svg.selectAll("*").remove();
            for (var i = 0; i < data.length; i++) {
                if (data[i].CCA3 == pais) {
                    const years = Object.keys(data[i]).filter(key => key.match(/Població/));
                    const populationData = years.map(year => data[i][year]);
                    populationData.reverse();

                    const xScale = d3.scaleBand()
                        .domain(years.reverse())
                        .range([margin.left, width - margin.right])
                        .padding(0.1);

                    const yScale = d3.scaleLinear()
                        .domain([0, d3.max(populationData)])
                        .range([height - margin.bottom, margin.top]);

                    svg.selectAll("rect")
                        .data(populationData)
                        .enter().append("rect")
                        .attr("x", (d, i) => xScale(years[i]))
                        .attr("y", d => yScale(d))
                        .attr("width", xScale.bandwidth())
                        .attr("height", d => height - margin.bottom - yScale(d))
                        .attr("fill", "steelblue")
                        .on("mouseover", mouseover)
                        .on("mousemove", mousemove)
                        .on("mouseout", mouseout);

                    svg.append("g")
                        .attr("transform", `translate(0, ${height - margin.bottom})`)
                        .call(d3.axisBottom(xScale))
                        .selectAll("text")
                        .attr("transform", "rotate(-45)")
                        .style("text-anchor", "end");

                    svg.append("g")
                        .attr("transform", `translate(${margin.left}, 0)`)
                        .call(d3.axisLeft(yScale));

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", height - margin.bottom / 2)
                        .attr("text-anchor", "middle")

                    svg.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("x", -(height / 2))
                        .attr("y", margin.left / 2)
                        .attr("text-anchor", "middle")
                }
            }
        });
    }

});