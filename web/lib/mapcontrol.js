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
    var w = me.opts.width;
    w = typeof w === "string" ? w : w + "px";
    var h = me.opts.height;
    h = typeof h === "string"? h : h + "px";

    me.el = $("#" + me.opts.target).css({
        width: w,
        height: h
    }).addClass("map-control");
    
    me.olmapEl = $("<div>").attr("id", uuid()).appendTo(me.el).addClass("map-layer").css({
            "z-index": 100
        });
    
    me.bkmapEl = $("<div>").attr("id", uuid()).appendTo(me.el).addClass("map-layer").css({
            "z-index": 1
        });

    var newcenter = ol.proj.transform(me.opts.center, "EPSG:4326", "EPSG:3857");

    me.olmap = new ol.Map({
        layers: [

        ],
        target: me.olmapEl.attr("id"),
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

    me.olmap.getView().on("change", function () {
        me.updateBackgroundMap();
    });
    me.olmap.on("pointerdrag", function () {
        me.updateBackgroundMap();
    });
        
    me.setBackgroundMap(me.opts.backgroundMapName);
};


MapControl.prototype.setBackgroundMap = function (bkname) {
    var me = this;
    if (me.bkmap && me.opts.backgroundMapName === bkname) {
        return;
    }
   me.destroyBackgroundMap();
   me.opts.backgroundMapName = bkname;

    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.backgroundMap = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        me.olmap.getLayers().push(me.backgroundMap);
    } else if (bkname === "GOOGLE_SATELLITE" || bkname === "GOOGLE_HYBRID" || bkname === "GOOGLE_ROADMAP" || bkname === "GOOGLE_TERRAIN") {
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
        me.bkmapEl = $("<div>").attr("id", uuid()).appendTo(me.el).addClass("map-layer").css({
            "z-index": 1
        });
    }
};


MapControl.prototype.initAMap = function () {
    var me = this;

    var LJCenter = LJTransform.wgs84togcj02(me.opts.center[0], me.opts.center[1]);
    me.bkmap = new AMap.Map(document.getElementById(me.bkmapEl.attr("id")), {
        resizeEnable: true,
        zoom: me.opts.zoom,
        center: LJCenter
    });
};

MapControl.prototype.initBMap = function () {
    var me = this;
    var LJCenter = LJTransform.wgs84tobd09(me.opts.center[0], me.opts.center[1]);
    me.bkmap = new BMap.Map(document.getElementById(me.bkmapEl.attr("id")));
    var point = new BMap.Point(LJCenter[0], LJCenter[1]);
    me.bkmap.centerAndZoom(point, me.opts.zoom);
};

MapControl.prototype.initBingMaps = function () {
    var me = this;
    //经测试发现Bing地图中国国内数据源采用gcj02加密，故需进行转换操作才可正常展示。
    var LJCenter = LJTransform.wgs84togcj02(me.opts.center[0], me.opts.center[1]);
    me.bkmap = new Microsoft.Maps.Map(document.getElementById(me.bkmapEl.attr("id")),
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
    me.bkmap = new google.maps.Map(document.getElementById(me.bkmapEl.attr("id")), {
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
    me.bkmap = new qq.maps.Map(document.getElementById(me.bkmapEl.attr("id")), {
        center: new qq.maps.LatLng(LJCenter[1], LJCenter[0]),
        zoom: me.opts.zoom,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false
    });
}

MapControl.prototype.initTMap = function () {
    var me = this;
    
    me.bkmap = new T.Map(document.getElementById(me.bkmapEl.attr("id")));
    var center = new T.LngLat(me.opts.center[0], me.opts.center[1]);
    me.bkmap.centerAndZoom(center, me.opts.zoom);
//    me.bkmap = new T.Map(document.getElementById(me.bkmapEl.attr("id")), {
//        center: new T.LngLat(me.opts.center[0], me.opts.center[1]),
//        zoom: me.opts.zoom
//    });
}

MapControl.prototype.updateBackgroundMap = function () {
    var me = this;
    var bkname = me.opts.backgroundMapName;
    me.opts.center = ol.proj.transform(me.getCenter(), "EPSG:3857", "EPSG:4326");
    me.opts.zoom = me.getZoom();
    
    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.updateOSMMap();
    } else if (bkname === "GOOGLE_SATELLITE" || bkname === "GOOGLE_HYBID" || bkname === "GOOGLE_ROADMAP" || bkname === "GOOGLE_TERRAIN") {
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

MapControl.prototype.getCenter = function () {
    var me = this;
    return me.olmap.getView().getCenter();
};

MapControl.prototype.getZoom = function () {
    var me = this;
    return me.olmap.getView().getZoom();
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
    var mycenter = me.getCenter();
    mycenter = ol.proj.transform(mycenter, "EPSG:3857", "EPSG:4326");
    me.bkmap.setOptions({
        zoom: me.getZoom(),
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

