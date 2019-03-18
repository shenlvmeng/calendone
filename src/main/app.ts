import { app, BrowserWindow } from "electron";
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import * as path from "path";

class Application {
    private mainWindow: BrowserWindow | null;
    private inited: boolean = false;

    private createWindow = async () => {
        if (process.env.NODE_ENV === "development") {
            await this.installExtension();
        }
        this.mainWindow = new BrowserWindow({
            width: 1140,
            height: 720,
            frame: false,
            titleBarStyle: "hiddenInset",
            webPreferences: {
                nodeIntegration: true
            }
        });
        this.mainWindow.setResizable(false);
        this.mainWindow.on("closed", () => {
            this.mainWindow = null;
        });
        this.loadContent();
    };

    private loadContent() {
        if (this.mainWindow === null) {
            return;
        }
        // 加载应用的 index.html。
        if (process.env.NODE_ENV === "development") {
            // 打开开发者工具。
            this.mainWindow.webContents.openDevTools();
            this.mainWindow.loadURL(`http://localhost:8080/index.html`);
        } else {
            this.mainWindow.loadURL(`file://${path.join(__dirname, "../pages/", "index.html")}`);
        }
    }

    private async installExtension() {
        try {
            await installExtension(REACT_DEVELOPER_TOOLS);
        } catch (e) {
            console.warn(e);
        }
    }

    public init() {
        if (this.inited) {
            return;
        }
        this.inited = true;

        app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
        app.on("ready", this.createWindow);

        // 当全部窗口关闭时退出。
        app.on("window-all-closed", () => {
            // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
            // 否则绝大部分应用及其菜单栏会保持激活。
            if (process.platform !== "darwin") {
                app.quit();
            }
        });

        app.on("activate", () => {
            // 在这文件，你可以续写应用剩下主进程代码。
            // 也可以拆分成几个文件，然后用 require 导入。
            if (this.mainWindow === null) {
                this.createWindow();
            }
        });
    }
    public minimize() {
        if (this.mainWindow) {
            this.mainWindow.minimize();
        }
    }

    public close() {
        app.quit();
    }

    public maximize() {
        if (this.mainWindow) {
            this.mainWindow.maximize();
        }
    }

    public get version() {
        return app.getVersion();
    }
}

export default Application;
