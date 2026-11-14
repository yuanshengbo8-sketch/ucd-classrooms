# UC Davis 教室地图

[English](README.md) | **简体中文**

把 UC Davis 校园做成一张 3D 地图，用来找地方自习和上课：通用教室（General Assignment）的容量、座位和设备，以及 Shields Library 小组自习室的实时预约情况。

**[打开网站](https://yuanshengbo8-sketch.github.io/ucd-classrooms/)** · **[Shields Library 自习室](https://yuanshengbo8-sketch.github.io/ucd-classrooms/?b=shields-library)** · **[Wellman Hall](https://yuanshengbo8-sketch.github.io/ucd-classrooms/?b=wellman-hall)**

这是非官方的学生项目，与 University of California, Davis 没有隶属关系，也未获其背书。

它和 [WashU 教室地图](https://github.com/yuanshengbo8-sketch/washu-classrooms)用的是同一套代码，见[通用核心](#通用核心)。

## 功能

- **自习室与实时预约：** Shields Library 里学生可以预约的 8 间小组自习室。每间显示现在是否空着、空到几点，今天和明天的预约时间条，以及直达图书馆预约页的按钮。
- **3D 校园地图：** 由 OpenStreetMap 生成：带屋顶和窗格的建筑、草坪、球场、停车场和带路名的道路。有通用教室的楼是蓝色屋顶，标签上写着教室数量；Shields Library 是金色。
- **教室：** 地图上的 143 间通用教室，分布在 32 栋楼：容量、座位形式、黑板、影音设备和课堂录制，其中 141 间有注册处拍的教室照片。
- **楼层分解：** 选中一栋楼后按楼层拆开。楼层由房间号推断。
- **座位视角：** 在教室示意图里点任意座位，从那个位置看黑板。示意图根据座位数和座位形式生成，不是真实教室。
- **找教室：** 按最少座位数、座位形式和设备筛选。
- **收藏、分享链接、步行导航、街景：** 收藏只保存在你的浏览器里。
- **中文 / English。**

## 目前做不到的

- **哪间教室空着：** UC Davis 公开的 [Class Search Tool](https://registrar-apps.ucdavis.edu/courses/search/index.cfm) 只有上课时间，没有教室；教室在需要登录的 Schedule Builder 里。所以这里没有教室课表，也没有课程搜索。
- **教室列表里的照片缩略图：** 注册处的教室照片每张有几 MB，所以列表里只标出有几张照片，点开教室才加载。
- **Edwards Family Athletics Center 的 5 间教室** 在注册处清单里，但那栋楼不在这张地图上。

## 本地运行

需要 Node.js 20 或更高版本。

```sh
git clone https://github.com/yuanshengbo8-sketch/ucd-classrooms.git
cd ucd-classrooms
npm ci
npm run dev
```

然后打开 http://localhost:5184/。

## 更新数据

```sh
npm run data:osm            # OpenStreetMap 建筑、道路、树木、绿地
npm run data:study          # 图书馆预约网站上的可预约房间
npm run data:photos         # Wikimedia Commons 上的建筑照片候选，需人工挑选
npm run data:classroom-photos   # 每间教室的照片地址，来自注册处教室页面的存档
npm run data:build          # 生成 classrooms.json 和 campus.json
npm run data:availability   # 今天和明天的自习室预约情况
```

教室清单来自注册处的 [Room Summary – Sorted by Room](https://registrar.ucdavis.edu/faculty-staff/academic-classroom-scheduling/general-assignment-classrooms/ga-room-summary-by-room) 页面。用浏览器把该页面另存为 `data/raw/ga/summary.html`，再运行 `npm run data:build`。

`.github/workflows/study-availability.yml` 白天每 20 分钟运行一次：读取图书馆公开的预约表（2 个请求，间隔 10 秒，无需登录），把一个 JSON 文件推送到 `live-data` 分支，网站从那里读取。在 Actions 里停用这个 workflow 即可关闭。

## 通用核心

[`shared.json`](shared.json) 里列出的文件（React 应用、3D 场景、`scripts/lib/` 里的地图生成、workflow）和 WashU 仓库完全相同。属于 UC Davis 的只有 `src/campus.ts`、`src/lib/schools.ts`、`campus.data.json`、`index.html`、数据和数据脚本。改了通用文件之后，同步到另一个仓库：

```sh
node scripts/sync-shared.mjs ../washu-classrooms           # 复制过去
node scripts/sync-shared.mjs ../washu-classrooms --check   # 只列出差异
```

## 数据与准确性

- **教室：** 注册处（Office of the University Registrar）的[通用教室](https://registrar.ucdavis.edu/faculty-staff/academic-classroom-scheduling/general-assignment-classrooms)一览表。
- **教室照片：** 注册处自己拍的照片，143 间教室里有 141 间。注册处网站会拦截脚本，所以照片地址是从 [Internet Archive](https://web.archive.org/) 保存的教室页面里读取一次得到的，清单在 `data/classroom-photos.json`。照片不做拷贝，由你的浏览器直接从学校的服务器加载。
- **自习室：** UC Davis 图书馆的[预约网站](https://reservations.library.ucdavis.edu/allspaces)。预约情况是最多滞后 20 分钟的副本，以图书馆网站为准，预约也在那里完成。
- **建筑照片：** 10 栋楼的外观照片来自 [Wikimedia Commons](https://commons.wikimedia.org/)，按各自标注的许可使用，从 Commons 直接加载、不做拷贝。清单在 `data/building-photos.json`，每张都人工核对过。每栋楼另有 Google 街景链接。
- **地图：** © [OpenStreetMap](https://www.openstreetmap.org/copyright) 贡献者，ODbL。大部分树、屋顶形状和窗户是为了好看而生成的；校内已测绘的树只有几百棵。
- **楼层和高度：** 楼层由房间号推断（`1060`、`179` 算 1 楼，`2205` 算 2 楼；Wellman 2 这类一两位数的房间显示为底层）。建筑高度优先用 OpenStreetMap 的标注，没有则估算。

## 致谢与许可

基于 WashU 教室地图，后者的灵感来自 [@zhenzhenfufu](https://github.com/zhenzhenfufu) 维护的 [UCSD Classroom Explorer](https://github.com/zhenzhenfufu/ucsd-classrooms)，它建立在 [@wenhaoquestion](https://github.com/wenhaoquestion) 和 [SheepTester](https://github.com/SheepTester/ucsd-classrooms) 的工作之上。

代码采用 [MIT 许可证](LICENSE)。地图和教室数据归各自来源所有。
