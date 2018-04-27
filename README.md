<h2>主要功能</h2>

1. 对七种主流地图服务商(高德地图、百度地图、bing地图、google地图、腾讯地图、天地图、OpenStreetMap)提供的数种地图类型进行实时加载。同时对其中涉及到坐标加密的进行反向校正。

    + 本程序中除谷歌地图包含四种地图类型(道路、卫星、复合、地形)和OpenStreetMap提供一种地图类型(道路)外，其余五种地图服务商的均包含两种地图类型(道路和卫星)。可根据需要在最上方工具条中进行切换。
    + 每种地图服务商的初始化坐标顺序与坐标加密(偏移)情况如下表所示：

    |     Type      | Center  |             坐标加密/偏移             |
    |:-------------:|:-------:|:-------------------------------------:|
    |     AMap      | Lng,Lat |           gcj02(火星坐标系)           |
    |     BMap      | Lng,Lat |   bd09(本质是在gcj02偏移之上再偏移)   |
    |   BingMaps    | Lat,Lng |           国内数据gcj02加密           |
    |    Google     | Lat,Lng | goole.com 无偏移; google.cn gcj02加密 |
    |    QQMaps     | Lat,Lng |               gcj02加密               |
    |     TMap      | Lng,Lat |              不加密(orz)              |
    | OpenStreetMap | Lng,Lat |                不加密                 |

2. 利用Openlayers JS API实现三种几何要素(点、线、多边形，可在地图显示下方点击按钮进行编辑或切换)编辑与捕捉处理。



<h2>注意事项</h2>

1. 谷歌的四种地图和bing地图的卫星影像如果要正常加载，需要自行绕过GFW;
2. 从release界面下载的源码或者仓库主页download的代码均需要设置以下两个位置的参数后才可以正常使用。
    + web/index.html第46行(如下代码片段)中的两个参数替换为真实的经纬度(统一转换为以度为单位的十进制小数)
    ```html
    center: [Your Longitude, Your Latitude],
    ```
    + web/lib/mapcontrol.js第19至23行(如下所示代码片段)中的各个参数值替换为自己真实申请的JS API的开发人员密钥key。
    ```javascript
    alibaba: "Your AMap JS Key",
    google: "Your Google Map JS Key",
    baidu: "Your BMap JS Key",
    bing: "Your Bing Map JS Key",
    qq: "Your QQ Map JS Key"
    ```   
