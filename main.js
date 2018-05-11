let dataSet1 = new Map();
let dataSet2 = new Map();
let dataSetFlag = 0;


let width = 960,
    height = 500;


const projection = d3.geoAlbers()
    .center([0.7, 52.958])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(4500)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

const g = svg.append('g')
    .attr('class', 'key')
    .attr('transform', 'translate(0,40)');


const color1 = d3.scaleThreshold()
    .domain([150, 200, 250, 300, 350, 400, 450, 500, 550])
    .range(d3.schemeBlues[7]);

const color2 = d3.scaleThreshold()
    .domain([20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000])
    .range(d3.schemeYlGn[7]);

const x1 = d3.scaleSqrt()
    .domain([150, 550])
    .rangeRound([500, 1100]);

const x2 = d3.scaleSqrt()
    .domain([20000, 100000])
    .rangeRound([500, 1100]);


function createLegend1() {
    d3.selectAll("#legend2").remove();
    g.selectAll('rect')
        .data(
            color1.range().map(function (d) {
                d = color1.invertExtent(d);
                if (d[0] == null) d[0] = x1.domain()[0];
                if (d[1] == null) d[1] = x1.domain()[1];
                return d;
            }))
        .enter().append('rect')
        .attr('id', 'legend1')
        .attr('height', 8)
        .attr('x', function (d) {
            return x1(d[0]);
        })
        .attr('width', function (d) {
            return x1(d[1]) - x1(d[0]);
        })
        .attr('fill', function (d) {
            return color1(d[0]);
        })

    g.append('text')
        .attr('id', 'legend1')
        .attr('class', 'caption')
        .attr('x', x1.range()[0])
        .attr('y', -6)
        .attr('fill', '#000')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('Population per square km')
}

function createLegend2() {
    d3.selectAll("#legend1").remove();
    g.selectAll('rect')
        .data(
            color2.range().map(function (d) {
                d = color2.invertExtent(d);
                if (d[0] == null) d[0] = x2.domain()[0];
                if (d[1] == null) d[1] = x2.domain()[1];
                return d;
            }))
        .enter().append('rect')
        .attr('id', 'legend2')
        .attr('height', 8)
        .attr('x', function (d) {
            return x2(d[0]);
        })
        .attr('width', function (d) {
            return x2(d[1]) - x2(d[0]);
        })
        .attr('fill', function (d) {
            return color2(d[0]);
        });


    g.append('text')
        .attr('id', 'legend2')
        .attr('class', 'caption')
        .attr('x', x2.range()[0])
        .attr('y', -6)
        .attr('fill', '#000')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('Number of people who voted in 2011 consensus')
}


$(function () {
    $('.toggle').on('click', function (event) {
        event.preventDefault();
        $(this).toggleClass('active');
        if (dataSetFlag === 0) {
            createLegend2();
            g.call(d3.axisBottom(x2)
                .tickSize(13)
                .tickValues(color2.domain()))
                .select(".domain")
                .remove();
            d3.select('svg').select('#countries1').transition().duration(1000).style('opacity', 0);
            d3.select('svg').select('#countries2').transition().duration(1000).style('opacity', 1);

            // d3.select('svg').select('.key').selectAll('#legend1').style('opacity', 0);
            // d3.select('svg').select('.key').selectAll('#legend2').style('opacity', 1);
        } else {
            createLegend1();
            g.call(d3.axisBottom(x1)
                .tickSize(13)
                .tickValues(color1.domain()))
                .select(".domain")
                .remove();
            d3.select('svg').select('#countries1').transition().duration(1000).style('opacity', 1);
            d3.select('svg').select('#countries2').transition().duration(1000).style('opacity', 0);
            //
            // d3.select('svg').select('.key').selectAll('#legend1').style('opacity', 1);
            // d3.select('svg').select('.key').selectAll('#legend2').style('opacity', 0);
        }
        dataSetFlag = dataSetFlag === 1 ? 0 : 1;
    });
});

let loadDataSet1 = new Promise((resolve, reject) => {
    d3.csv('population_data.csv', function (data) {
        data.forEach(function (d) {
            dataSet1.set(d.Region, +d.People_per_Sq_km);
        });
        resolve();
    });
});

let loadDataSet2 = new Promise((resolve, reject) => {
    d3.csv('consensus_data.csv', function (data) {
        data.forEach(function (d) {
            if (dataSet2.has(d.Region)) {
                let count = dataSet2.get(d.Region);
                dataSet2.set(d.Region, ++count)
            } else {
                dataSet2.set(d.Region, 1);
            }
        });
        resolve();
    });
});

function renderMap() {
    d3.json('regions.geojson', function (error, mapData) {
        const features = mapData.features;
        svg.append('g')
            .attr('id', 'countries1')
            .attr('class', 'countries')
            .style('opacity', 1)
            .selectAll('path')
            .data(features)
            .enter().append('path')
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style('fill', function (d) {
                return color1(dataSet1.get(d.properties.region_code))
            });
        svg.append('g')
            .attr('id', 'countries2')
            .attr('class', 'countries')
            .style('opacity', 0)
            .selectAll('path')
            .data(features)
            .enter().append('path')
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style('fill', function (d) {
                return color2(dataSet2.get(d.properties.region_code))
            });
    });
}

Promise.all([loadDataSet1, loadDataSet2]).then(values => {
    renderMap();
    createLegend1();
    g.call(d3.axisBottom(x1)
        .tickSize(13)
        .tickValues(color1.domain()))
        .select(".domain")
        .remove();
});


