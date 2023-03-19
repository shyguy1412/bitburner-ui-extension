import { BitBurnerClient } from '@/lib/BitBurnerClient';
import '@/style/App.css';
import { NetworkGraph } from './NetworkGraph';

export function App() {

  const bitburnerClient = new BitBurnerClient();

  console.log(bitburnerClient);

  return <>
    {/* <div style={{ position: 'relative' }} id="my_dataviz"></div> */}
    <NetworkGraph
      serverClicked={(path) => bitburnerClient.connectToServer(path)}
    ></NetworkGraph>
  </>
}
