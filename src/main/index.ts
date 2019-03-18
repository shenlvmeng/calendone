import Application from "./app";

interface Global {
    app: Application;
}
declare var global: Global;
class App extends Application {
    protected mainHtml = "teacher.html";
}

global.app = new App();
global.app.init();
