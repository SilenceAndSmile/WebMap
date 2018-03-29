/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var LJTransform = new CoordinateTransformUtil();

MapControl = function (opts) {
    var me = this;

    me.opts = $.extend(true, {
        width: 300,
        height: 240,
        center: [0, 0],
        zoom: 3,
        backgroundMapName: "NOTHING"
    }, opts);

    me._init();

};


MapControl.prototype._init = function () {
    var me = this;

    me.el = $("#" + me.opts.target).css({
        width: me.opts.width + "px",
        height: me.opts.height + "px"
    }).addClass("map-control");

    me.olmapId = uuid();
    me.bkmapId = uuid();

    me.olmapEl = $("<div>").attr("id", me.olmapId).appendTo(me.el).css({
        "z-index": 2
    }).addClass("map-layer");

    me.bkmapEl = $("<div>").attr("id", me.bkmapId).appendTo(me.el).css({
        "z-index": 1
    }).addClass("map-layer");


    var newcenter = ol.proj.transform(me.opts.center, "EPSG:4326", "EPSG:3857");

    me.olmap = new ol.Map({
        layers: [

        ],
        target: me.olmapId,
        controls: ol.control.defaults({
            attributionOptions: {
                collapsible: false
            }
        }),
        view: new ol.View({
            center: newcenter,
            zoom: me.opts.zoom
        })
    });

    $(".ol-attribution").remove();

    me.setBackgroundMap(me.opts.backgroundMapName);
    var bkmap = me.opts.backgroundMapName;

    me.olmap.getView().on("change", function (e) {
        me.updateBackgroundMap();
    });
    me.olmap.on("pointerdrag", function (e) {
        me.updateBackgroundMap();
    });

};


MapControl.prototype.setBackgroundMap = function (bkname) {
    var me = this;
    //me.destroyBackgroundMap();

    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.backgroundMap = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        me.olmap.getLayers().push(me.backgroundMap);
    } else if (bkname === "GOOGLE_SATELLITE" || "GOOGLE_HYBRID" || "GOOGLE_ROADMAP" || "GOOGLE_TERRAIN") {
        $.getScript("https://www.google.com/maps/api/js?key=AIzaSyAFplsFjJAIKV3qa3AgMRNopW_rduJVX38", function () {
            me.initGoogleMap();
        });
    } else if (bkname === "AMAP") {
        $.getScript("http://webapi.amap.com/maps?v=1.4.4&key=4aed923f0c2cba3a6d4aab8c293d7a3a", function () {
            me.initAMap();
        });
    } else if (bkname === "BMAP") {
        $.getScript("http://api.map.baidu.com/api?v=3.0&ak=bhaObEN4y04nOL9lBQRnWl0IKAB9a7oA&callback=__initBMap");
        window.__initBMap = function () {
            me.initBMap();
        };
    } else if (bkname === "BINGMAPS") {
        $.getScript("https://www.bing.com/api/maps/mapcontrol?callback=__initBingMaps");
        window.__initBingMaps = function () {
            me.initBingMaps();
        };
    } else if (bkname === "QQMAPS") {
        $.getScript("http://map.qq.com/api/js?v=2.exp&callback=__initQQMaps&key=2LZBZ-2ESKJ-SPSFV-K346Z-ISRME-G5BRV");
        window.__initQQMaps = function () {
            me.initQQMaps();
        }
    } else if (bkname === "TMAP") {
        $.getScript("http://api.tianditu.com/api?v=4.0", function () {
            me.initTMap();
        })
    }
};


MapControl.prototype.destroyBackgroundMap = function () {
    var me = this;
    var bkname = me.opts.backgroundMapName;
    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.olmap.removeLayer(me.backgroundMap);
    } else {
        me.bkmapEl.remove();
    }
//    } else if (bkname === "GOOGLE_SATELLITE") {
//        me.bkmapEl.remove();
//    } else if (bkname === "GOOGLE_HYBID") {
//
//    }
};


MapControl.prototype.initAMap = function () {
    var me = this;

    var LJCenter = LJTransform.wgs84togcj02(me.opts.center[0], me.opts.center[1]);
    me.bkmap = new AMap.Map(document.getElementById(me.bkmapId), {
        resizeEnable: true,
        zoom: me.opts.zoom,
        center: LJCenter
    });
};

MapControl.prototype.initBMap = function () {
    var me = this;
    var LJCenter = LJTransform.wgs84tobd09(me.opts.center[0], me.opts.center[1]);
    me.bkmap = new BMap.Map(document.getElementById(me.bkmapId));
    var point = new BMap.Point(LJCenter[0], LJCenter[1]);
    me.bkmap.centerAndZoom(point, me.opts.zoom);
};

MapControl.prototype.initBingMaps = function () {
    var me = this;
    //经测试发现Bing地图中国国内数据源采用gcj02加密，故需进行转换操作才可正常展示。
    var LJCenter = LJTransform.wgs84togcj02(me.opts.center[0], me.opts.center[1]);
    me.bkmap = new Microsoft.Maps.Map(document.getElementById(me.bkmapId),
            {
                credentials: 'AuaB5JrsBeJ256gk-WZ9EXbbXprgSgSLI9N-59Juc-Fa_sjFmXG8GgT9MLPqbJjo',
                center: new Microsoft.Maps.Location(LJCenter[1], LJCenter[0]),
                zoom: me.opts.zoom,
                showMapTypeSelector: false,
                showDashboard: false,
                showTermsLink: false,
            });
};

MapControl.prototype.initGoogleMap = function () {
    var me = this;
    var uluru = {
        lat: me.opts.center[1],
        lng: me.opts.center[0]
    };

    var bktype = google.maps.MapTypeId.ROADMAP;
    if (me.opts.backgroundMapName === "GOOGLE_SATELLITE") {
        bktype = google.maps.MapTypeId.SATELLITE;
    } else if (me.opts.backgroundMapName === "GOOGLE_HYBRID") {
        bktype = google.maps.MapTypeId.HYBRID;
    } else if (me.opts.backgroundMapName === "GOOGLE_TERRAIN") {
        bktype = google.maps.MapTypeId.TERRAIN;
    }
    me.bkmap = new google.maps.Map(document.getElementById(me.bkmapId), {
        zoom: me.opts.zoom,
        center: uluru,
        mapTypeId: bktype
    });

    setTimeout(function () {
        $(".gm-fullscreen-control").remove();
        $(".gmnoprint").remove();
    }, 1000);
};

MapControl.prototype.initQQMaps = function () {
    var me = this;
    var LJCenter = LJTransform.wgs84togcj02(me.opts.center[0], me.opts.center[1]);
    me.bkmap = new qq.maps.Map(document.getElementById(me.bkmapId), {
        center: new qq.maps.LatLng(LJCenter[1], LJCenter[0]),
        zoom: me.opts.zoom,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false
    });
}

MapControl.prototype.initTMap = function () {
    var me = this;
    me.bkmap = new T.Map(document.getElementById(me.bkmapId), {
        center: new T.LngLat(me.opts.center[0], me.opts.center[1]),
        zoom: me.opts.zoom
    });
}

MapControl.prototype.updateBackgroundMap = function () {
    var me = this;
    var bkname = me.opts.backgroundMapName;
    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.updateOSMMap();
    } else if (bkname === "GOOGLE_SATELLITE" || "GOOGLE_HYBID" || "GOOGLE_ROADMAP" || "GOOGLE_TERRAIN") {
        me.updateGoogleMap();
    } else if (bkname === "AMAP") {
        me.updateAMap();
    } else if (bkname === "BMAP") {
        me.updateBMap();
    } else if (bkname === "BINGMAPS") {
        me.updateBingMaps();
    } else if (bkname === "QQMAPS") {
        me.updateQQMaps();
    } else if (bkname === "TMAP") {
        me.updateTMap();
    }
};

MapControl.prototype.updateAMap = function () {
    var me = this;
    var v = me.olmap.getView();
    var Center = ol.proj.transform(v.getCenter(), "EPSG:3857", "EPSG:4326");
    var LJCenter = LJTransform.wgs84togcj02(Center[0], Center[1]);
    // 设置缩放级别和中心点
    me.bkmap.setZoomAndCenter(v.getZoom(), LJCenter);
};

MapControl.prototype.updateBMap = function () {
    var me = this;
    var v = me.olmap.getView();
    var Center = ol.proj.transform(v.getCenter(), "EPSG:3857", "EPSG:4326");
    var LJCenter = LJTransform.wgs84tobd09(Center[0], Center[1]);
    // 设置缩放级别和中心点
    me.bkmap.centerAndZoom(new BMap.Point(LJCenter[0], LJCenter[1]), v.getZoom());
};

MapControl.prototype.updateBingMaps = function () {
    var me = this;
    var v = me.olmap.getView();
    var Center = ol.proj.transform(v.getCenter(), "EPSG:3857", "EPSG:4326");
    var LJCenter = LJTransform.wgs84togcj02(Center[0], Center[1]);
    me.bkmap.setView({
        center: new Microsoft.Maps.Location(LJCenter[1], LJCenter[0]),
        zoom: v.getZoom()
    });
};

MapControl.prototype.updateOSMMap = function () {
};

MapControl.prototype.updateGoogleMap = function () {
    var me = this;
    var v = me.olmap.getView();
    var mycenter = v.getCenter();
    mycenter = ol.proj.transform(mycenter, "EPSG:3857", "EPSG:4326");
    me.bkmap.setOptions({
        zoom: v.getZoom(),
        center: {lng: mycenter[0], lat: mycenter[1]}
    });
};

MapControl.prototype.updateQQMaps = function () {
    var me = this;
    var v = me.olmap.getView();
    var Center = ol.proj.transform(v.getCenter(), "EPSG:3857", "EPSG:4326");
    var LJCenter = LJTransform.wgs84togcj02(Center[0], Center[1]);

//    me.bkmap.setCenter(new qq.maps.LatLng(LJCenter[1], LJCenter[0]));
//    me.bkmap.setZoom(v.getZoom());
    me.bkmap.setOptions({
        center: new qq.maps.LatLng(LJCenter[1], LJCenter[0]),
        zoom: v.getZoom()
    });
}

MapControl.prototype.updateTMap = function () {
    var me = this;
    var v = me.olmap.getView();
    var LJCenter = ol.proj.transform(v.getCenter(), "EPSG:3857", "EPSG:4326");
    me.bkmap.centerAndZoom(new T.LngLat(LJCenter[0], LJCenter[1]), v.getZoom());
}

