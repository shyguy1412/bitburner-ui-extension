import {payload} from './dist/payload'
import {openWindow} from './WindowLoader'
import { NS } from "./types/NetscriptDefinitions";
import { UIWindow } from './lib/UIWindow';

export function main(netscript: NS) {
  const uiWindow = new UIWindow(netscript, openWindow(payload));


  return new Promise(resolve => {});
}