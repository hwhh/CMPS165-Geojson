let width = 960,
    height = 500;

// Define color scale
const color = d3.scaleLinear()
    .domain([25000, 85000])
    .clamp(true)
    .range(['#eef5f5', '#409A99']);

const projection = d3.geoAlbers()
    .center([0.7, 52.958])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(4500)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// Legend
const g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");

g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Number of people who voted");


const labels = ['26,000 - 38,000', '38,000 - 51,000', '51,000 - 63,000', '63,000 - 75,000', '75,000 - 88,000', '>88,000'];

const legend = d3.legendColor()
    .labels(function (d) {
        return labels[d.i];
    })
    .shapePadding(4)
    .scale(color);

svg.select(".legendThreshold")
    .call(legend);


function parseData() {
    d3.csv("data.csv", function (data) {
        let regions = formatData(data);
        d3.json('regions.geojson', function (error, mapData) {
            const features = mapData.features;
            svg.append("g")
                .attr("class", "countries")
                .selectAll("path")
                .data(features)
                .enter().append('path')
                .attr('d', path)
                .attr('vector-effect', 'non-scaling-stroke')
                .style('fill', function (d) {
                    return color(regions.get(d.properties.region_code).length)
                });
        });
    });
}


function formatData(data) {
    let regions = new Map();
    data.forEach(function (d) {
        if (regions.has(d.Region)) {
            let arr = regions.get(d.Region);
            arr.push(d.Person_ID);
            regions.set(d.Region, arr)
        } else {
            regions.set(d.Region, [d.Person_ID]);
        }
    });
    return regions
}


parseData();
