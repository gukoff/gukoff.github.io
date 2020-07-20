var pi = Math.PI;

var MAGIC = 0.3861061048585385422861371299;

function SvgPane(div_id, center_x, center_y, width, height) {
    function circleJson(angle, to_center, radius, color='none', stroke='black') {
        return {
            "x_axis": center_x + Math.cos(angle) * to_center,
            "y_axis": center_y + Math.sin(angle) * to_center,
            "radius": radius,
            "color" : color,
            "stroke": stroke,
        }
    }

    function circleJsons(iterations, start_radius) {
        var result = [
            circleJson(0, 0, 1, color='black', stroke='none'),
            circleJson(0, 0, start_radius, color='none', stroke='black'),
        ]
        for (var iter = 0; iter < iterations; ++iter) {
            var radius = start_radius * (MAGIC ** iter) / 3;
            for (var circle_idx = 0; circle_idx < 6; ++ circle_idx) {
                result.push(circleJson(
                    angle = circle_idx * pi / 3 + (pi / 6) * (iter % 2),
                    to_center = radius * 2,
                    radius = radius,
                ));
            }
        }
        return result;
    }

    function svgContainer() {
        if (!svgContainer._cache) {
            svgContainer._cache = (
                d3.select(div_id)
               .append("svg")
               .attr("width", width)
               .attr("height", height)
            );
        }
        return svgContainer._cache;
    }

    function drawCircles(iterations, start_radius = Math.min(center_x, center_y) - 1) {
        var circleSvgArray = svgContainer().selectAll("circle")
                                         .data(circleJsons(iterations, start_radius))
                                         .enter()
                                         .append("circle");

        var circleAttributes = circleSvgArray
                               .attr("cx", function (d) { return d.x_axis; })
                               .attr("cy", function (d) { return d.y_axis; })
                               .attr("r", function (d) { return d.radius; })
                               .style("fill", function(d) { return d.color; })
                               .style("stroke", function(d) { return d.stroke; });
    }

    function drawText(coord, text, dx=0, dy=0, style='normal', size='15px') {
        svgContainer().append("text")
                      .attr('x', center_x + coord.x)
                      .attr('y', center_y - coord.y)
                      .attr('dx', dx)
                      .attr('dy', dy)
                      .attr('font-style', style)
                      .style('font-size', size)
                      .text(text);
    }

    function linear_sum(point1, point2, proportion) {
        return {
           'x': point1.x * proportion + point2.x * (1 - proportion),
           'y': point1.y * proportion + point2.y * (1 - proportion),
       }
    }

    function between(point1, point2) {
        return linear_sum(point1, point2, 0.5);
    }

    function drawLine(from, to, width=2, color='black') {
        svgContainer().append("line")
                      .attr("x1", center_x + from.x)
                      .attr("y1", center_y - from.y)
                      .attr("x2", center_x + to.x)
                      .attr("y2", center_y - to.y)
                      .attr("stroke-width", width)
                      .attr("stroke", color);
    }

    function drawFigures(start_radius) {
        var O = {
            'x': 0,
            'y': 0
        };
        var C = {
            'x': start_radius * 2 / 3,
            'y': 0,
        };
        var A = {
            'x': start_radius * MAGIC / (3**0.5),
            'y': 0,
        };
        var B = {
            'x': start_radius * MAGIC / (3**0.5),
            'y': start_radius * MAGIC / 3,
        };
        var E = {
            'x': A.x / 2,
            'y': A.x * 3 ** 0.5 / 2,
        };
        var D = {
            'x': 2 * E.x - B.x,
            'y': 2 * E.y - B.y,
        };

        drawText(between(D, E), 'r', dx=-5, dy=13, style='italic', size='13px');
        drawText(between(E, B), 'r', dx=-10, dy=10, style='italic', size='13px');
        drawText(between(A, B), 'r', dx=-10, dy=4, style='italic', size='13px');
        drawText(between(A, B), 'r', dx=-10, dy=4, style='italic', size='13px');
        drawText(between(B, linear_sum(B, C, 1 / (1 + MAGIC))), 'r', dx=2, dy=-3, style='italic', size='13px');
        drawText(between(C, linear_sum(B, C, 1 / (1 + MAGIC))), 'R', dx=-10, dy=-6, style='italic', size='13px');
        drawText(linear_sum(C, O, 1.25), 'R', dx=-5, dy=15, style='italic', size='13px');

        drawText(O, 'O', dx=-15);
        drawText(A, 'A', dx=2, dy=-5);
        drawText(B, 'B', dx=3, dy=-3);
        drawText(C, 'C', dx=0, dy=-3);
        drawText(D, 'D', dx=2, dy=-2);
        drawText(E, 'E', dx=8, dy=2);

        drawText(O, 'O', dx=-15);


        drawLine(O, {x: start_radius, y: 0}, width=1, color='grey');
        drawLine(O, {x: 0, y: start_radius}, width=1, color='grey');
        drawLine(O, D);
        drawLine(O, E);
        drawLine(O, C);
        drawLine(O, B);
        drawLine(A, B);
        drawLine(B, C);
        drawLine(B, D);
    }

    return {
        'circleJsons': circleJsons,
        'drawCircles': drawCircles,
        'drawFigures': drawFigures,
    }
}


pane1 = SvgPane(
    div_id = '#drawing1',
    center_x = 200,
    center_y = 200,
    width = 400,
    height = 400,
);
pane1.drawCircles(iterations=1);

pane2 = SvgPane(
    div_id = '#drawing2',
    center_x = 200,
    center_y = 200,
    width = 400,
    height = 400,
);
pane2.drawCircles(iterations=5);


var pane_3_offset = 20;
var pane_3_radius = 400 - pane_3_offset - 5
pane3 = SvgPane(
    div_id = '#drawing3',
    center_x = pane_3_offset,
    center_y = 400 - pane_3_offset,
    width = 400,
    height = 400,
);


pane3.drawCircles(iterations=2, start_radius=pane_3_radius);
pane3.drawFigures(start_radius=pane_3_radius);