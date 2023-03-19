import '@/style/NetworkGraph.css';
import network from '@/assets/network.json';
import * as d3 from 'd3';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import { Tooltip } from './Tooltip';

type ServerData = ReturnType<typeof getGraphData>['nodes'][number];

type Props = {
  serverClicked: (path: string[]) => void;
}

function getGraphData() {
  const nodes = network
    .map(([server], index) => ({ id: index, name: server as string }))

  const links = network
    .flatMap(([_, connections], serverIndex) =>
      (connections as string[])
        .map((connection) => ({ source: serverIndex, target: nodes.find(el => el.name == connection)?.id ?? 0 }))
    )

  return { nodes, links };
}

function findPathToServer(network: ReturnType<typeof getGraphData>, target: number) {
  //ooga booga small brain
  //idc anymore... ;_;

  const links = network.links;

  //find all connected nodes
  const visited = new Set<Number>();
  const startNode = network.nodes.find(node => node.name == 'home')!.id;

  if (target == startNode) return [];

  function explore(node: number): number[] {
    if (visited.has(node)) {
      return []
    };

    visited.add(node);
    const connectedNodes = links.filter(link => link.source == node);

    if (connectedNodes.find(node => node.target == target)) {
      return [target];
    }

    for (const { target: connectedNode } of connectedNodes) {
      const path = explore(connectedNode);
      if (path.length > 0)
        return [connectedNode, ...path]
    }

    return [];
  }

  const path = explore(startNode);
  return path.map(nodeId => network.nodes.find(node => node.id == nodeId)!.name);
}

export function NetworkGraph({ serverClicked }: Props) {

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [currentServerData, setCurrentServerData] = useState<ServerData>();
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    document.getElementById('network-graph-svg-wrapper')!.innerHTML = '';

    const graphData = getGraphData();

    const width = 600;
    const height = 400;

    const homeNode = graphData.nodes.find(node => node.name == 'home')! as any;
    homeNode.fx = width / 2;
    homeNode.fy = height / 2;

    const svg = d3.select("#network-graph-svg-wrapper")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")

    const link = svg
      .selectAll("line")
      .data(graphData.links)
      .enter()
      .append("line")
      .style("stroke", "#aaa")

    // Initialize the nodes
    const node = svg
      .selectAll("circle")
      .data(graphData.nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .style("fill", "#69b3a2")
      .attr("class", "network-node")
      .on('mouseover', (event, d) => { setShowTooltip(true), setCurrentServerData(d) })
      .on('mouseleave', () => setShowTooltip(false))
      ;
    node.on('click', (env, d) => serverClicked(findPathToServer(getGraphData(), d.id)))


    // Let's list the force we wanna apply on the network
    d3.forceSimulation(graphData.nodes as any)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
        .id(function (d: any) { return d.id; })                     // This provide  the id of a node
        .links(graphData.links)
        .strength(2)                                // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-1000))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      // .force("center", d3.forceCenter(width / 2, height / 4))     // This force attracts nodes to the center of the svg area
      .force('forceX', d3.forceX(width / 2).strength(1.5))
      .force('forceY', d3.forceY(height / 2).strength(3))
      .on("end", () => {
        node
          .attr("cx", function (d: any) { return d.x; })
          .attr("cy", function (d: any) { return d.y; });

        link
          .attr("x1", function (d: any) { return d.source.x; })
          .attr("y1", function (d: any) { return d.source.y; })
          .attr("x2", function (d: any) { return d.target.x; })
          .attr("y2", function (d: any) { return d.target.y; });
      });

  }, []);


  return <>
    <div ref={ref as LegacyRef<HTMLDivElement>} style={{ position: 'relative' }}>
      <Tooltip
        show={showTooltip}
        parent={ref.current!}
      >
        <p>Server: {currentServerData?.name ?? ''}</p>
      </Tooltip>
      <div id="network-graph-svg-wrapper">
      </div>
    </div>
  </>
}