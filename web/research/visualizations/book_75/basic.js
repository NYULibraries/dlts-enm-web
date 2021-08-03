//create somewhere to put the force directed graph
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
svg.style("border", "1px solid #ccc");
globalStrength = -350;
globalDistanceMax = 400;
globalDistanceMin = 20;
globalAlphaRestart = 0.7;
d3.json("book_75.json", function(error, graph)
{
    if (error) throw error;

    var simulation = d3.forceSimulation().nodes(graph.nodes);

    var link_force = d3.forceLink(graph.links).distance(40).id(function(d)
    {
        return d.id;
    });
    //add forces
    var charge_force = d3.forceManyBody().strength(globalStrength).distanceMax(globalDistanceMax).distanceMin(globalDistanceMin);
    // var charge_force = d3.forceManyBody().distanceMin(160);
    console.log(" charge_force " + charge_force);
    simulation
        .force("charge_force", charge_force)
        .force("center_force", d3.forceCenter(width / 2, height / 2))
        .force("links", link_force);
    var holdAll = svg.append("g").attr("class", "holdAll");


    var link = holdAll.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", 1)
        .style("stroke", "#2C5178");

    var node = holdAll.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class",getIDNodeClass)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    node.append("circle")
        .attr("r", calculateRadius)
        .attr("fill", calculateNodeColor)
        .attr("class", "circle")
        .attr("class", getSpecialNodeClass);
    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .attr("class", "textlabel")
        .text(function(d)
        {
            return d.name;
        })
        .attr("font-size", "13");
    //var bbox = text.node().getBBox();



    function calculateRadius(d)
    {
        console.log("ocount " + d.ocount);
        var thisRad = (d.ocount === 0) ? 15 : d.ocount + 3;
        return (thisRad);
    }

    function calculateNodeColor(d)
    {
        console.log("color: ocount " + d.ocount);
        var thisColor = (d.ocount === 0) ? "green" : "#2C5178";
        return (thisColor);
    }
    function getIDNodeClass(d) {
        var thisid = "node node"+d.id;
        return (thisid);
    }
    function getSpecialNodeClass(d)
    {
        var thisClass = (d.ocount === 0) ? "zeroOccurrences" : "normal";
        return (thisClass);
    }

    function dragstarted(d)
    {
        console.log("dragstarted");
        simulation.restart();
        simulation.alpha(globalAlphaRestart);
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d)
    {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d)
    {
        d.fx = null;
        d.fy = null;
        simulation.alphaTarget(0.1);
    }

    function tickActions()
    {
        //update circle positions to reflect node updates on each tick of the simulation 


        node.attr("transform", function(d)
        {
            return "translate(" + d.x + "," + d.y + ")";
        });
        //update link positions 
        //simply tells one end of the line to follow one node around
        //and the other end of the line to follow the other node around
        link
            .attr("x1", function(d)
            {
                return d.source.x;
            })
            .attr("y1", function(d)
            {
                return d.source.y;
            })
            .attr("x2", function(d)
            {
                return d.target.x;
            })
            .attr("y2", function(d)
            {
                return d.target.y;
            });
    }


    //add zoom capabilities 
    var zoom_handler = d3.zoom().on("zoom", zoom_actions);

    zoom_handler(svg);
    //Zoom functions 
    function zoom_actions()
    {
        holdAll.attr("transform", d3.event.transform);
    }

    simulation.on("tick", tickActions);
    // JQuery, only used for the sliders 
    $(function()
    {
        $("#slider1").slider(
        {
            min: 1,
            max: 16,
            value: 5,
            slide: function(event, ui)
            {
                console.log("#slider1 Zoom to " + ui.value / 4);
                zoom_handler.scaleTo(svg, ui.value / 4);
                simulation.restart();
            }
        });
        $("#slider2").slider(
        {
            min: -500,
            max: 20,
            value: globalStrength,
            slide: function(event, ui)
            {
                globalStrength = ui.value;
                console.log(ui.value + "##  charge_force " + charge_force);
                charge_force = d3.forceManyBody().strength(globalStrength).distanceMax(globalDistanceMax).distanceMin(globalDistanceMin);
                simulation.force("charge_force", charge_force);
                simulation.restart();
                simulation.alpha(globalAlphaRestart);
            }

        });
        $("#slider3").slider(
        {
            min: 0,
            max: 120,
            value: globalDistanceMin,
            slide: function(event, ui)
            {
                globalDistanceMin = ui.value;
                charge_force = d3.forceManyBody().strength(globalStrength).distanceMax(globalDistanceMax).distanceMin(globalDistanceMin);
                simulation.force("charge_force", charge_force);
                simulation.restart();
                simulation.alpha(globalAlphaRestart);
            }

        });
        $("#slider4").slider(
        {
            min: 0,
            max: 1300,
            value: globalDistanceMax,
            slide: function(event, ui)
            {
                globalDistanceMax = ui.value;
                charge_force = d3.forceManyBody().strength(globalStrength).distanceMax(globalDistanceMax).distanceMin(globalDistanceMin);
                simulation.force("charge_force", charge_force);
                simulation.restart();
                simulation.alpha(globalAlphaRestart);
            }

        });
        $(".stopall").click( function()
        {
            console.log("clicked");
            simulation.alpha(0);
            simulation.stop();
        });
    });
});