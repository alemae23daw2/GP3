
const margin = { top: 70, right: 90, bottom: 40, left: 80 };
const width = 1550 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


const tooltip = d3.select("#tooltip");


d3.csv("V_ctimes_viol_ncia_masclista____mbit_parella_20240518.csv").then(data => {

    const datosFiltrados = data.map(d => ({
        Any: +d.Any,
        VíctimesAteses: +d['Víctimes ateses']
    }));


    const datosAgrupados = d3.rollup(
        datosFiltrados,
        v => d3.sum(v, d => d.VíctimesAteses),
        d => d.Any
    );

    const datosFinales = Array.from(datosAgrupados, ([Any, VíctimesAteses]) => ({ Any, VíctimesAteses }));


    const x = d3.scaleBand()
        .domain(datosFinales.map(d => d.Any))
        .range([0, width])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([0, d3.max(datosFinales, d => d.VíctimesAteses)])
        .nice()
        .range([height, 0]);


    svg.selectAll(".bar")
        .data(datosFinales)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Any))
        .attr("y", d => y(0))
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "#fb7053")
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr("y", d => y(d.VíctimesAteses))
        .attr("height", d => height - y(d.VíctimesAteses));

    svg.selectAll(".bar")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("color", "white")
                .style("opacity", .9);
            tooltip.html(`Año: ${d.Any}<br>Víctimas: ${d.VíctimesAteses}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", d => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "chart-title")
        .style("font-size", "25px")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .style("text-anchor", "middle")
        .text("Víctimas violencia machista – Ámbito pareja");

    svg.append("text")
        .attr("class", "source-credit")
        .attr("x", width - 1400)
        .attr("y", height + margin.bottom - 3)
        .style("font-size", "12px")
        .style("font-family", "sans-serif")
        .text("Source: Dades Obertes de Catalunya ");
}).catch(error => {
    console.error("Error al cargar los datos:", error);
});