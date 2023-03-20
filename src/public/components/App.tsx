import { BitBurnerClient } from '@/lib/BitBurnerClient';
import '@/style/App.css';
import { useEffect } from 'react';
import { NetworkGraph } from './NetworkGraph';

export function App() {

  useEffect(() => {
    return () => {
      BitBurnerClient.close();
    }
  })  

  return <>
    <NetworkGraph
      // client={client}
      serverClicked={(path) => BitBurnerClient.connectToServer(path)}
    ></NetworkGraph>
  </>
}
