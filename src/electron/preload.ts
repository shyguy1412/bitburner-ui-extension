import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import i18n, { availableLanguages } from "./i18next.config";

contextBridge.exposeInMainWorld('i18n', {
  t: (key: string, ns: string, lng?: string) => i18n.t(key, { ns, lng }),
  languages: availableLanguages,
  currentLanguage: () => i18n.language,
  setLanguage: (lang: string) => i18n.changeLanguage(lang)
})

contextBridge.exposeInMainWorld('IPC', {
  onMessage: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on(channel, listener),
  reloadApp: () => ipcRenderer.invoke('soft-reload'),
  changeLanguage: (lang: string) => ipcRenderer.invoke('change-language', lang)
})