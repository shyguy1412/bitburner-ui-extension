import { BitburnerInstance } from '@/lib/BitburnerInstance';
import '@/style/App.css';
import React from 'react';
import { NetworkGraph } from './NetworkGraph';

export function App() {
  // console.log(BitBurnerClient);
  // 
  // useEffect(() => {
  //   console.log('EFFECT');

  //   // BitBurnerClient.on('message', ({ data }) => console.log(data));

  BitburnerInstance.loadTheme();


  //   return () => {
  //     BitBurnerClient.close();
  //   }
  // })

  return <>
    {/* <div></div> */}
    {/* <div>HELLO WORLD FROM REACT</div> */}
    <NetworkGraph
      // client={client}
      serverClicked={(path) => BitburnerInstance.connectToServer(path)}
    ></NetworkGraph>
  </>
}