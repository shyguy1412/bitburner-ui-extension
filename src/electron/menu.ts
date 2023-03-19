import { app, BrowserWindow } from "electron";

export function toggleDevTools() {
  BrowserWindow.getFocusedWindow()!.webContents.toggleDevTools();
}

export function reloadWebContent() {
  BrowserWindow.getFocusedWindow()!.reload();
}

export function closeApp() {
  app.quit();
}