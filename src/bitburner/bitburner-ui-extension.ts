import { payload } from './dist/payload';
import { UIWindow } from "./lib/UIWindow";
import { NS } from "./types/NetscriptDefinitions";

export async function main(netscript: NS) {
  const ID = `BB_UI_EXT:${netscript.pid}`;
  netscript.tail(netscript.pid, 'home');
  netscript.print(ID);

  await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

  const tailWindows = [...document.querySelectorAll('.react-resizable')];

  const spans = tailWindows.map(win => [...win.querySelectorAll('span')]).flat();
  const idSpan = spans.filter((cur) => cur.innerHTML == ID)[0];
  const windowEl = findRoot(idSpan);
  const window = new UIWindow(netscript, windowEl);

  windowEl.innerHTML = '<div id=bb-ui-ext-root></div>';

  const scriptEl = document.createElement("script");
  scriptEl.innerHTML = atob(payload[0]);


  const styleEl = document.createElement("style");
  styleEl.innerHTML = atob(payload[1]);

  windowEl.appendChild(scriptEl);
  windowEl.appendChild(styleEl);

  return new Promise<void>(resolve => watchElForDeletion(windowEl, () => resolve()));
}

function findRoot(span: Element) {
  let el = span;
  while (!el.parentElement.classList.contains('react-resizable'))
    el = el.parentElement;
  return el;
}

function watchElForDeletion(elToWatch: Element, callback: () => void) {
  const parent = document.body;
  const observer = new MutationObserver(function (mutations) {

    // loop through all mutations
    mutations.forEach(function (mutation) {
      // check for changes to the child list
      if (mutation.type === 'childList') {
        mutation.removedNodes.forEach(node => !containsRecursive(node, elToWatch) || callback());
      }
    });
  });
  // start observing the parent - defaults to document body
  observer.observe(parent, { childList: true, subtree: true });
};

function containsRecursive(container: Node | Element, child: Element) {
  if (!('children' in container)) return;
  return [...container.children].reduce((prev, cur) => prev || cur == child || containsRecursive(cur, child), false);
}