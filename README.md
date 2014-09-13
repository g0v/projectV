# 前置環境

Project V 目前用 grunt/bower 管理，請先確定你有 node.js 0.10 以上的版本並且安裝好 npm，接下來用以下指令安裝 grunt 與 bower:

```bash
npm i grunt-cli -g
npm i bower -g
```

接下來進入專案目錄，並且用以下指令安裝相依元件：

```bash
npm i
```

# 開發

進入專案目錄，用以下指令即可執行本地 http server 開發

```shell
grunt serve
```

這個時候預設的瀏覽器會啟動，並且開啓 Project V 頁面。當你存檔後頁面會自動刷新。

如果需要新增 angularjs 的任何元件，我建議採用 yeoman 一併管理。相同的使用前也是要先安裝 yeoman 跟 angularjs 的 generator:

```shell
npm i yo -g
npm i generator-angular -g
```

接下來就可以用 yeoman 管理，比如說想要新增一個 controller:

```shell
yo angular:controller <controller-name>
```
