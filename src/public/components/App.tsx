import { BitBurnerClient } from '@/lib/BitBurnerClient';
import '@/style/App.css';
import { useEffect } from 'react';
import { NetworkGraph } from './NetworkGraph';

export function App() {
  console.log(BitBurnerClient);

  useEffect(() => {
    console.log('EFFECT');

    // BitBurnerClient.on('message', ({ data }) => console.log(data));

    BitBurnerClient.loadTheme();


    return () => {
      BitBurnerClient.close();
    }
  })

  return <>
    <div className='layout'>
      <div></div>
      <NetworkGraph
        // client={client}
        serverClicked={(path) => BitBurnerClient.connectToServer(path)}
      ></NetworkGraph>
    </div>
  </>
}
