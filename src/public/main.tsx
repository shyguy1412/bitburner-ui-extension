import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from '@/components/App'
import '@/style/global.css'
import '@/style/normalize.css'

ReactDOM.createRoot(document.getElementById('bb-ui-ext-root') as HTMLElement).render(
  // <></>
//   // <React.StrictMode>
    <App />
//     // <div></div>
//   // </React.StrictMode>,
)
