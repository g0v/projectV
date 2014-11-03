# 簡介

Project V 是一個將割闌尾遊戲化的專案，目前成果可以到 http://g0v.github.io/projectV/ 觀看。

# 前置環境

Project V 目前用 grunt/bower 管理，並且使用 sass 與 compass 管理樣式，在這邊建議使用 [nvm](https://github.com/creationix/nvm) 以及 [rvm](http://rvm.io/) 分別管理 Node.js 與 Ruby 的版本。

請先確定你有 node.js 0.10 以上的版本並且安裝好 npm，接下來用以下指令安裝 grunt 與 bower:

```bash
npm i grunt-cli -g
npm i bower -g
```

接下來進入專案目錄，並且用以下指令安裝 npm 以及 bower 相依元件（如果出現權限問題，請在指令最前面加上 `sudo`）：

```bash
npm i
bower i
```

而且也需要 compass 跟 sass，請輸入以下指令（如果出現權限問題，請在指令最前面加上 `sudo`)

```shell
gem install sass
gem install compass
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

關於 Yeoman angularjs generator 的詳細資訊可以參考[官方網站](https://github.com/yeoman/generator-angular/blob/master/readme.md)。

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

這樣就設定好了，最後只要下達以下指令即可 deploy 至 github.io：

```shell
grunt build && ./deploy.sh
```

即可部署完畢，數分鐘後可以到 http://g0v.github.io/projectV/ 看看部署結果囉。

# Contribution

如果您發現了任何網站問題，或是希望新增的功能，請至 [github issue tracker](https://github.com/g0v/projectV/issues) 回報給我們。若您想修復或改善 issue 清單裡的任何一個項目，請利用 pull request 提交你的 branch，並且在該 branch 裡面僅附上一個 commit，commit title 格式如下：

```
Fixed #ISSUE_NUM: your commit description
```

ISSUE_NUM 代換成您要修復的 issue 編號，我們將會 review 你所送來的 pull request。

# Contributor

本專案為 g0v 底下的開源專案，source code contributor 請見 [github - contributer](https://github.com/g0v/projectV/graphs/contributors)，此外本專案由子龍提供視覺設計，Han Lin 負責專案協調。
