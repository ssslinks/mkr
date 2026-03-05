import { app, BrowserWindow } from "electron";
let win;
app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1200,
    // ширина вікна
    height: 800,
    // висота вікна
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile("dist/index.html");
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
