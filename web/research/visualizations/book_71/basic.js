//create somewhere to put the force directed graph
var svg = d3.select("svg"),
 width = +svg.attr("width"),
 height = +svg.attr("height");
 svg.style("border", "1px solid #ccc")

   

d3.json("adventures.json", function(error, graph) {
    if (error) throw error;

    var simulation = d3.forceSimulation().nodes(graph.nodes);

    var link_force =  d3.forceLink(graph.links).id(function(d) {return d.id;});
    //add forces
    var charge_force = d3.forceManyBody().strength(-50).distanceMax(400).distanceMin(60); 
    // var charge_force = d3.forceManyBody().distanceMin(160);
    simulation
        .force("charge_force", charge_force)
        .force("center_force", d3.forceCenter(width / 2, height / 2))
        .force("links",link_force);
   var holdAll = svg.append("g").attr("class", "holdAll");


    var link = holdAll.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", 2)
        .style("stroke", "blue"); 

   var node = holdAll.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start",dragstarted)
            .on("drag",dragged)
            .on("end",dragended));
        

    node.append("circle")
        .attr("r", calculateRadius)
        .attr("fill", "#ccc")
        .attr("class", "circle");
    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; })
        .attr("font-size", "13"); ;
    
    function calculateRadius(d){ 
        console.log("ocount " + d.ocount);
        return (d.ocount + 3);
    }    

    function dragstarted(d){ 
        console.log("dragstarted");
        simulation.restart();
        simulation.alpha(0.7);
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

    function tickActions() {
    //update circle positions to reflect node updates on each tick of the simulation 
   /* node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });*/

    node.attr("transform", function(d) {  return "translate(" + d.x + "," + d.y + ")"; });
    //update link positions 
    //simply tells one end of the line to follow one node around
    //and the other end of the line to follow the other node around
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    }
  

    //add zoom capabilities 
    var zoom_handler = d3.zoom().on("zoom", zoom_actions);

    zoom_handler(svg);  
  //Zoom functions 
    function zoom_actions(){
        console.log("zoom actions");
        holdAll.attr("transform", d3.event.transform)
    }

    simulation.on("tick", tickActions );
});