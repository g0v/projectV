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

# Deploy

如果你有 g0v/projectV 的權限，你可以用 deploy.sh 部署最新的源碼，不過首先要先把 git 設置正確，請先用下面的指令看一下 git remote 的設定

```shell
git remote -v
```

結果應該看起來像這樣：

```shell
origin  git@github.com:yurenju/projectV.git (fetch)
origin  git@github.com:yurenju/projectV.git (push)
upstream  git@github.com:g0v/projectV.git (fetch)
upstream  git@github.com:g0v/projectV.git (push)
```

如果沒有 upstream 這個位置，請用以下指令加入：

```shell
git remote add upstream git@github.com:g0v/projectV.git
```

接下來只要執行 `./deploy.sh` 即可部署到 github，就可以到 http://g0v.github.io/projectV/ 看看部署結果囉，通常數分鐘後會生效。
