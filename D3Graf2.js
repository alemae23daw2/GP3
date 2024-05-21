const margin = { top: 70, right: 90, bottom: 40, left: 80 };
const width = 1500 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const tooltip = d3.select("#tooltip");


function initializeBarChart(containerId, data, color, title) {
    d3.select(containerId).selectAll("*").remove();

    const svg = d3.select(containerId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => d.Any))
        .range([0, width])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.VíctimesAteses)])
        .nice()
        .range([height, 0]);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Any))
        .attr("y", d => y(0))
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", color)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr("y", d => y(d.VíctimesAteses))
        .attr("height", d => height - y(d.VíctimesAteses));

    svg.selectAll(".bar")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Any: ${d.Any}<br>Víctimes: ${d.VíctimesAteses}`)
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
        .text(title);

    svg.append("text")
        .attr("class", "source-credit")
        .attr("x", width - 1400)
        .attr("y", height + margin.bottom - 3)
        .style("font-size", "12px")
        .style("font-family", "sans-serif")
        .text("Source: Dades Obertes de Catalunya");
}


function initializeDonutChart(containerId, data, color) {
    d3.select(containerId).selectAll("*").remove();

    const radius = Math.min(width, height) / 2;

    const svg = d3.select(containerId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${(width + margin.left + margin.right) / 2}, ${(height + margin.top + margin.bottom) / 2})`);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 70);

    const pie = d3.pie()
        .sort(null)
        .value(d => d.value);

    const g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", d => color(d.data.Country))
        .on("mouseover", function (event, d) {
            const infoBox = d3.select("#info-box");

            infoBox.transition()
                .duration(200)
                .style("opacity", .9);

            const infoBoxLeft = width / 2 + radius + 70;
            const infoBoxTop = height / 2 - 40;

            infoBox.html(`País: ${d.data.Country}<br>Suicidis: ${d.data.value}`)
                .style("left", `${infoBoxLeft}px`)
                .style("top", `${infoBoxTop}px`);
        })
        .on("mouseout", function (d) {
            d3.select("#info-box")
                .transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.append("text")
        .attr("class", "chart-title")
        .style("font-size", "25px")
        .attr("x", 0)
        .attr("y", 0 - (height / 2) - margin.top / 2)
        .style("text-anchor", "middle")
        .text("Suicidis per país al 2015");

    d3.select("#info-box")
        .style("position", "absolute")
        .style("background-color", "#fff")
        .style("border", "3px solid #000")
        .style("width", "230px")
        .style("height", "30px")
        .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.1)")
        .style("opacity", 0)
        .style("transition", "opacity 0.3s ease-in-out");
}

function loadData(csvFile, callback, transformFunc = null) {
    d3.csv(csvFile).then(data => {
        if (transformFunc) {
            data = transformFunc(data);
        }
        callback(data);
    }).catch(error => {
        console.error("Error al cargar los datos:", error);
    });
}

function transformBarData(data) {
    const datosFiltrados = data.map(d => ({
        Any: +d.Any,
        VíctimesAteses: +d['Víctimes ateses']
    }));

    const datosAgrupados = d3.rollup(
        datosFiltrados,
        v => d3.sum(v, d => d.VíctimesAteses),
        d => d.Any
    );

    return Array.from(datosAgrupados, ([Any, VíctimesAteses]) => ({ Any, VíctimesAteses }));
}

function transformDonutData(data) {
    return data
        .filter(d => d.Year === '2015')
        .map(d => ({
            Country: d.Country,
            value: +d['Suicides number']
        }));
}

loadData("V_ctimes_viol_ncia_masclista____mbit_parella_20240518.csv", data => {
    const transformedData = transformBarData(data);

    initializeBarChart("#chart-container", transformedData, "#fb7053", "Víctimes de violencia masclista – Ambit de Parella");

    d3.select("#thumbnail-initial").append("svg").attr("width", 100).attr("height", 100).append("rect")
        .attr("width", 100).attr("height", 100).attr("fill", "#fb7053");

    d3.select("#thumbnail-initial").on("click", () => initializeBarChart("#chart-container", transformedData, "#fb7053", "Víctimes de violencia masclista – Ambit de Parella"));

    loadData("30_merged_dataset_v00_final.csv", data2 => {
        const transformedData2 = transformDonutData(data2);
        d3.select("#thumbnail1")
        .append("svg")
        .attr("width", 100)
        .attr("height", 100)
        .append("rect")
        .attr("width", 100)
        .attr("height", 100)
        .attr("fill", "steelblue");

        d3.select("#thumbnail1").on("click", () => initializeDonutChart("#chart-container", transformedData2, d3.scaleOrdinal(d3.schemeCategory10)));
    });


});