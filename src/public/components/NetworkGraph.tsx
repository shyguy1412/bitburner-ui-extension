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

  //filter own servers. will be displayed elsewhere cause there are potentionally way too many
  const filteredNetwork = network.filter(server => !server.purchasedByPlayer || server.hostname == 'home');

  const nodes = filteredNetwork
    .map((node, index) => ({ id: index, ...node }))

  const links = filteredNetwork
    .flatMap(({ connections }, serverIndex) =>
      (connections as string[])
        .map((connection) => ({ source: serverIndex, target: nodes.find(el => el.hostname == connection)?.id ?? 0 }))
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
  const startNode = network.nodes.find(node => node.hostname == 'home')!.id;

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
  return path.map(nodeId => network.nodes.find(node => node.id == nodeId)!.hostname);
}

type moveProxy = {
  listeners: ((ev: MouseEvent) => void)[],
  trigger: (ev: MouseEvent) => void,
  onTrigger: (listener: (ev: MouseEvent) => void) => void
}

export function NetworkGraph({ serverClicked }: Props) {

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [currentServerData, setCurrentServerData] = useState<ServerData>();
  const ref = useRef<HTMLDivElement>();

  const moveProxy: moveProxy = {
    listeners: [],
    trigger(event) { this.listeners.forEach(listener => listener(event)) },
    onTrigger(listener) { this.listeners.push(listener) }
  }

  useEffect(() => {
    (async function () {

      document.getElementById('network-graph-svg-wrapper')!.innerHTML = '';

      const network = await BitBurnerClient.getNetworkData();

      const graphData = getGraphData(network);
      const width = 600;
      const height = 400;

      const homeNode = graphData.nodes.find(node => node.hostname == 'home')! as any;
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
        .force('forceX', d3.forceX(width / 2).strength(1.2))
        .force('forceY', d3.forceY(height / 2).strength(2))
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
        // .attr("width", width)
        // .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")

      const link = svg
        .selectAll("line")
        .data(graphData.links)
        .enter()
        .append("line")
        .style("stroke", "var(--secondarylight)")


      // Initialize the nodes
      const node = svg
        .selectAll("circle")
        .data(graphData.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("class", (d) => `network-node ${d.hasAdminRights ? 'root' : ''}`)
        .on('mouseover', (ev, d) => { setShowTooltip(true); setCurrentServerData(d); moveProxy.trigger(ev) })
        .on('mousemove', (ev) => moveProxy.trigger(ev))
        .on('mouseleave', () => setShowTooltip(false))
        .on('click', async (env, d) => serverClicked(findPathToServer(getGraphData(network), d.id)))
        .call(drag(simulation) as any)
        .attr("cx", width / 2)
        .attr("cy", height / 2);

    })();
    console.log(ref);
    
  }, []);


  return <>
    <div className='network-graph' ref={ref as LegacyRef<HTMLDivElement>}>
      <Tooltip
        show={showTooltip}
        parent={ref}
        onMove={(listener) => moveProxy.onTrigger(listener)}
      >
        <p><span>Server: </span><span>{`${currentServerData?.hostname} (${currentServerData?.ip})` ?? ''}</span></p>
        <p><span>HTTP: </span><span>{currentServerData?.httpPortOpen ? 'open' : 'closed'}</span></p>
        <p><span>SSH: </span><span>{currentServerData?.sshPortOpen ? 'open' : 'closed'}</span></p>
        <p><span>FTP: </span><span>{currentServerData?.ftpPortOpen ? 'open' : 'closed'}</span></p>
        <p><span>SQL: </span><span>{currentServerData?.sqlPortOpen ? 'open' : 'closed'}</span></p>
        <p><span>SMTP: </span><span>{currentServerData?.smtpPortOpen ? 'open' : 'closed'}</span></p>
        <p><span>root: </span><span>{currentServerData?.hasAdminRights ? 'yes' : 'no'}</span></p>
      </Tooltip>
      <div id="network-graph-svg-wrapper">
      </div>
    </div>
  </>
}