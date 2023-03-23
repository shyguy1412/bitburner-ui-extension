export function openWindow(payload:string[]){
  const newWindow = open("", '', 'alwaysOnTop=true,autoHideMenuBar=true,skipTaskbar=true');
  newWindow.document.body.innerHTML = '<div id=root></div>'

  const scriptEl = newWindow.document.createElement("script");
  scriptEl.innerHTML = atob(payload[0]);


  const styleEl = newWindow.document.createElement("style");
  styleEl.innerHTML = atob(payload[1]);

  newWindow.document.body.appendChild(scriptEl);
  newWindow.document.body.appendChild(styleEl);

  //@ts-ignore
  newWindow.console.log = (...args) => newWindow.dispatchEvent(new CustomEvent('log', {detail:args}));
  //@ts-ignore
  newWindow.console.error = (...args) => newWindow.dispatchEvent(new CustomEvent('error', {detail:args}));
  newWindow.addEventListener('log', ({detail}:CustomEvent) => console.log(...detail));
  newWindow.addEventListener('error', ({detail}:CustomEvent) => console.error(...detail));
  
  return newWindow;
}