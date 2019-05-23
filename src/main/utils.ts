import { homedir } from "os";
import path from "path";
import { remote, shell } from "electron";

export function saveToDesktop(data: string, successCb?: () => void, failCb?: () => void) {
    const outputPath = path.join(homedir(), "Desktop", "calendone-output.json");
    try {
        remote.require("fs").writeFile(outputPath, data, "utf8", (err: Error) => {
            if (err) {
                throw err;
            }
            successCb && successCb();
        });
    } catch (err) {
        console.error(err);
        failCb && failCb();
    }
}

export function openExternalLink(href: string) {
    shell.openExternal(href);
}
