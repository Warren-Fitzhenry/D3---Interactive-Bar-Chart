import { select,
selectAll,
axisBottom,
axisLeft,
bandwith,
scaleBand,
scaleLinear
} from 'd3';
import { parsedData } from './data';

const svg = select('svg');

const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = +svg.attr('width');
const height = +svg.attr('height');
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const chart = svg.append('g')
  .attr('transform', `translate(${margin.top}, ${margin.left})`);

const xScale = scaleBand()
  .range([0, innerWidth])
  .domain(parsedData.map((s) => s.language))
  .padding(0.4)

const yScale = scaleLinear()
  .range([innerHeight, 0])
  .domain([0, 100]);

const makeYLines = () => axisLeft()
  .scale(yScale);

chart.append('g')
  .attr('transform', `translate(0, ${innerHeight})`)
  .call(axisBottom(xScale));

chart.append('g')
 .call(axisLeft(yScale));

chart.append('g')
  .attr('class', 'grid')
  .call(makeYLines()
    .tickSize(-innerWidth, 0, 0)
    .tickFormat(''))

const barGroups = chart.selectAll()
  .data(parsedData)
  .enter()
  .append('g');

barGroups
  .append('rect')
    .attr('class', 'bar')
    .attr('x', (g) => xScale(g.language))
    .attr('y', (g) => yScale(g.value))
    .attr('height', (g) => innerHeight - yScale(g.value))
    .attr('width', xScale.bandwidth())
		// on mouse enter, with callback
  	.on('mouseenter', function (language, i) {
      selectAll('.value')
        .attr('opacity', 0)
      select(this)
        .transition()
        .duration(300)
        .attr('opacity', 0.6)
        .attr('x', (a) => xScale(a.language) - 5)
        .attr('width', xScale.bandwidth() + 10)

        const y = yScale(language.value)
        const line = chart.append('line')
          .attr('id', 'limit')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', innerWidth)
          .attr('y2', y)

      barGroups.append('text')
        .attr('class', 'divergence')
        .attr('x', (a) => xScale(a.language) + xScale.bandwidth() / 2)
        .attr('y', (a) => yScale(a.value) + 30)
        .attr('fill', 'white')
        .attr('text-anchor', 'middle')
        .text((a, idx) => {
          const divergence = (a.value - language.value).toFixed(1)
          let text = ''
          if (divergence > 0) {
            text += '+'
          }
          text += `${divergence}%`
          return idx !== i ? text : `${a.value}%`;
        })
      })
    .on('mouseleave', function () {
      selectAll('.value')
        .attr('opacity', 1)
      select(this)
        .transition()
        .duration(300)
        .attr('opacity', 1)
        .attr('x', (a) => xScale(a.language))
        .attr('width', xScale.bandwidth())
      chart.selectAll('#limit').remove()
      chart.selectAll('.divergence').remove()
			});

barGroups.append('text')
  .attr('class', 'value')
  .attr('x', (a) => xScale(a.language) + xScale.bandwidth() / 2)
  .attr('y', (a) => yScale(a.value) + 30)
  .attr('text-anchor', 'middle')
  .text((a) => `${a.value}%`)

svg.append('text')
  .attr('class', 'label')
  .attr('x', -height / 2)
  .attr('y', margin.left / 3)
  .attr('transform', 'rotate(-90)')
  .attr('text-anchor', 'middle')
  .text('Popularity (%)')

svg.append('text')
  .attr('class', 'label')
  .attr('x', width / 2)
  .attr('y', height - margin.bottom / 3)
  .attr('text-anchor', 'middle')
  .text('Languages')

svg.append('text')
  .attr('class', 'title')
  .attr('x', width / 2 + margin.left)
  .attr('y', 30)
  .attr('text-anchor', 'middle')
  .text('Stack Overflow most popular languages of 2018')

svg.append('text')
  .attr('class', 'source')
  .attr('x', innerWidth - margin.right * 2)
  .attr('y', height - margin.bottom / 3.5)
  .attr('text-anchor', 'start')
  .text('Source: Stack Overflow, 2018')
