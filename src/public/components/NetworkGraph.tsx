import { BitBurnerClient } from '@/lib/BitBurnerClient';
import '@/style/NetworkGraph.css';
import * as d3 from 'd3';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import { Tooltip } from './Tooltip';


type Props = {
  // client: BitBurnerClient
  serverClicked: (path: string[]) => void;
}

type GraphData = Awaited<ReturnType<typeof getGraphData>>;
type ServerData = GraphData['nodes'][number];

function drag(simulation: any) {

  function dragstarted(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    setTimeout(() => console.log('SAVE GRAPH'), 1000);
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}


function getGraphData(network: Awaited<ReturnType<typeof BitBurnerClient['getNetworkData']>>) {
  const nodes = network
    .map(([server], index) => ({ id: index, name: server as string }))

  const links = network
    .flatMap(([_, connections], serverIndex) =>
      (connections as string[])
        .map((connection) => ({ source: serverIndex, target: nodes.find(el => el.name == connection)?.id ?? 0 }))
    )

  const graphData = { nodes, links };

  //make deep copy to prevent reference shenanigans
  return JSON.parse(JSON.stringify(graphData)) as typeof graphData;
}

function findPathToServer(network: GraphData, target: number) {
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
    (async function () {

      document.getElementById('network-graph-svg-wrapper')!.innerHTML = '';

      console.log('REQUEST NETWORK DATA');

      const network = await BitBurnerClient.getNetworkData();

      console.log('NETWORK: ', network);


      const graphData = getGraphData(network);

      const width = 600;
      const height = 400;

      const homeNode = graphData.nodes.find(node => node.name == 'home')! as any;
      homeNode.fx = width / 2;
      homeNode.fy = height / 2;

      const time = Date.now();

      const simulation = d3.forceSimulation(graphData.nodes as any)
        .force("link", d3.forceLink()
          .id(function (d: any) { return d.id; })
          .links(graphData.links)
          .strength(2)
        )
        .force("charge", d3.forceManyBody().strength(-1000))
        .force('forceX', d3.forceX(width / 2).strength(1.5))
        .force('forceY', d3.forceY(height / 2).strength(3))
        .on("tick", () => {
          if (Date.now() < time + 1000) return;
          node
            .attr("cx", function (d: any) { return d.x; })
            .attr("cy", function (d: any) { return d.y; });

          link
            .attr("x1", function (d: any) { return d.source.x; })
            .attr("y1", function (d: any) { return d.source.y; })
            .attr("x2", function (d: any) { return d.target.x; })
            .attr("y2", function (d: any) { return d.target.y; });
        });

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
        .on('click', async (env, d) => serverClicked(findPathToServer(getGraphData(network), d.id)))
        .call(drag(simulation) as any)
        .attr("cx", width / 2)
        .attr("cy", height / 2);

    })();
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