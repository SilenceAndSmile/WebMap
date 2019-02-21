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
        backgroundMapName: "NOTHING",
        keys: {
            alibaba: "Your AMap JS Key",
            google: "Your Google Map JS Key",
            baidu: "Your BMap JS Key",
            bing: "Your Bing Map JS Key",
            qq: "Your QQ Map JS Key",
            tdt: "Your TianDiTu JS Key"
        }
    }, opts);

    me._init();

};


MapControl.prototype._init = function () {
    var me = this;
    var w = me.opts.width;
    w = typeof w === "string" ? w : w + "px";
    var h = me.opts.height;
    h = typeof h === "string" ? h : h + "px";

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

    me.draftSource = new ol.source.Vector();
    me.draftVector = new ol.layer.Vector({
        source: me.draftSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });

    me.olmap = new ol.Map({
        layers: [
            me.draftVector
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
        }),
        interactions: [
            new ol.interaction.MouseWheelZoom({
                //当使用触控板或者magic mouse时，在滚动事件结束后缩放至最近的整数级别，这个选项默认是关闭的
                constrainResolution: true
            }),
            new ol.interaction.DragPan({
                kinetic: new ol.Kinetic(0, 100000, 1000)
//                        // 函数原型new ol.Kinetic(decay, minVelocity, delay)
//                        //   decay: Rate of decay (must be negative). 衰减率，必须为负值，
//                        //   minVelocity: 最小速度 (像素/毫秒),
//                        //   delay: 延迟考虑计算动力学初始值（毫秒).
            }),
//            new ol.interaction.DragZoom()
        ]
    });

    $(".ol-attribution").remove();

    me.modifyInteraction = new ol.interaction.Modify({source: me.draftSource});
    me.olmap.addInteraction(me.modifyInteraction);

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
//        me.olmap.getLayers().push(me.backgroundMap);
        me.olmap.getLayers().insertAt(0, me.backgroundMap);
    } else if (bkname === "GOOGLE_SATELLITE" || bkname === "GOOGLE_HYBRID" || bkname === "GOOGLE_ROADMAP" || bkname === "GOOGLE_TERRAIN") {
        if (me._googleJSReady) {
            me.initGoogleMap();
        } else {
            $.getScript("https://maps.googleapis.com/maps/api/js?key=" + me.opts.keys.google, function () {
                me.initGoogleMap();
                me._googleJSReady = true;
            });
        }
    } else if (bkname === "AMAP_ROAD" || bkname === "AMAP_SATELLITE") {
        if (me._AMapJSReady) {
            me.initAMap();
        } else {
            $.getScript("http://webapi.amap.com/maps?v=1.4.4&" + me.opts.keys.alibaba, function () {
                me.initAMap();
                me._AMapJSReady = true;
            });
        }
    } else if (bkname === "BMAP_NORMAL" || bkname === "BMAP_SATELLITE") {
        if (me._BMapJSReady) {
            me.initBMap();
        } else {
            $.getScript("http://api.map.baidu.com/api?v=3.0&ak=" + me.opts.keys.baidu + "&callback=__initBMap");
            me._BMapJSReady = true;
        }

        window.__initBMap = function () {
            me.initBMap();
        };
    } else if (bkname === "BING_AERIAL" || bkname === "BING_ROAD") {
        if (me._BingMapJSReady) {
            me.initBingMaps();
        } else {
            $.getScript("https://www.bing.com/api/maps/mapcontrol?callback=__initBingMaps");
            me._BingMapJSReady = true;
        }
        window.__initBingMaps = function () {
            me.initBingMaps();
        };
    } else if (bkname === "QQMAPS_ROAD" || bkname === "QQMAPS_SATELLITE") {
        if (me._QQMapJSReady) {
            me.initQQMaps();
        } else {
            $.getScript("http://map.qq.com/api/js?v=2.exp&callback=__initQQMaps&key=" + me.opts.keys.qq);
            me._QQMapJSReady = true;
        }

        window.__initQQMaps = function () {
            me.initQQMaps();
        };
    } else if (bkname === "TMAP_ROAD" || bkname === "TMAP_SATELLITE") {
        if(me._TMapJSReady){
            me.initTMap();
        } else {
            $.getScript("http://api.tianditu.com/api?v=4.0&tk=" + me.opts.keys.tdt, function () {
                me.initTMap();
            });
            me._TMapJSReady = true;
        }      
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
    var bktype = new AMap.TileLayer();
    if(me.opts.backgroundMapName === "AMAP_SATELLITE"){
        bktype = new AMap.TileLayer.Satellite();
    }
    me.bkmap = new AMap.Map(document.getElementById(me.bkmapEl.attr("id")), {
        resizeEnable: true,
        zoom: me.opts.zoom,
        center: LJCenter,
        layers: [bktype]
    });
};

MapControl.prototype.initBMap = function () {
    var me = this;
    var LJCenter = LJTransform.wgs84tobd09(me.opts.center[0], me.opts.center[1]);
    me.bkmap = new BMap.Map(document.getElementById(me.bkmapEl.attr("id")));
    var point = new BMap.Point(LJCenter[0], LJCenter[1]);
    me.bkmap.centerAndZoom(point, me.opts.zoom);
    var bktype = BMAP_NORMAL_MAP;
    if(me.opts.backgroundMapName === "BMAP_SATELLITE"){
        bktype = BMAP_SATELLITE_MAP;
    }        
    me.bkmap.setMapType(bktype);
};

MapControl.prototype.initBingMaps = function () {
    var me = this;
    //经测试发现Bing地图中国国内数据源采用gcj02加密，故需进行转换操作才可正常展示。
    var LJCenter = LJTransform.wgs84togcj02(me.opts.center[0], me.opts.center[1]);

    var bktype = Microsoft.Maps.MapTypeId.aerial;
    if (me.opts.backgroundMapName === "BING_ROAD") {
        bktype = Microsoft.Maps.MapTypeId.road;
    }

    me.bkmap = new Microsoft.Maps.Map(document.getElementById(me.bkmapEl.attr("id")),
            {
                credentials: me.opts.keys.bing,
                center: new Microsoft.Maps.Location(LJCenter[1], LJCenter[0]),
                mapTypeId: bktype,
                zoom: me.opts.zoom,
                showMapTypeSelector: false,
                showDashboard: false,
                showTermsLink: false
            });
    me.bkmap.setView({
        labelOverlay: Microsoft.Maps.LabelOverlay.hidden
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
        mapTypeId: me.opts.backgroundMapName === "QQMAPS_ROAD" ? qq.maps.MapTypeId.ROADMAP : qq.maps.MapTypeId.SATELLITE,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false
    });
};

MapControl.prototype.initTMap = function () {
    var me = this;

    me.bkmap = new T.Map(document.getElementById(me.bkmapEl.attr("id")));
    var center = new T.LngLat(me.opts.center[0], me.opts.center[1]);
    me.bkmap.centerAndZoom(center, me.opts.zoom);
//    me.bkmap = new T.Map(document.getElementById(me.bkmapEl.attr("id")), {
//        center: new T.LngLat(me.opts.center[0], me.opts.center[1]),
//        zoom: me.opts.zoom
//    });
    if(me.opts.backgroundMapName === "TMAP_SATELLITE"){
        me.bkmap.setMapType(TMAP_SATELLITE_MAP);
    }
};

MapControl.prototype.updateBackgroundMap = function () {
    var me = this;
    var bkname = me.opts.backgroundMapName;
    me.opts.center = ol.proj.transform(me.getCenter(), "EPSG:3857", "EPSG:4326");
    me.opts.zoom = me.getZoom();
    if (me.opts.zoom % 1 !== 0) {
        return;
    }

    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.updateOSMMap();
    } else if (bkname === "GOOGLE_SATELLITE" || bkname === "GOOGLE_HYBRID" || bkname === "GOOGLE_ROADMAP" || bkname === "GOOGLE_TERRAIN") {
        me.updateGoogleMap();
    } else if (bkname === "AMAP_ROAD" || bkname === "AMAP_SATELLITE") {
        me.updateAMap();
    } else if (bkname === "BMAP_NORMAL" || bkname === "BMAP_SATELLITE") {
        me.updateBMap();
    } else if (bkname === "BING_AERIAL" || bkname === "BING_ROAD") {
        me.updateBingMaps();
    } else if (bkname === "QQMAPS_ROAD" || bkname === "QQMAPS_SATELLITE") {
        me.updateQQMaps();
    } else if (bkname === "TMAP_ROAD" || bkname === "TMAP_SATELLITE") {
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
        labelOverlay: Microsoft.Maps.LabelOverlay.hidden,
        center: new Microsoft.Maps.Location(LJCenter[1], LJCenter[0]),
        zoom: v.getZoom()
    });
};

MapControl.prototype.updateOSMMap = function () {
};

MapControl.prototype.updateGoogleMap = function () {
    var me = this;
    var z = me.getZoom();

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
};

MapControl.prototype.updateTMap = function () {
    var me = this;
    var v = me.olmap.getView();
    var LJCenter = ol.proj.transform(v.getCenter(), "EPSG:3857", "EPSG:4326");
    me.bkmap.centerAndZoom(new T.LngLat(LJCenter[0], LJCenter[1]), v.getZoom());
};

MapControl.prototype.getBackgroundMapName = function () {
    var me = this;
    return me.opts.backgroundMapName;
};

MapControl.prototype.setDrawOperation = function (drawtype) {
    var me = this;

    me.removeDrawInteraction();
    me.currentDrawInteraction = new ol.interaction.Draw({
        source: me.draftSource,
        type: drawtype
    });
    me.olmap.addInteraction(me.currentDrawInteraction);
    me.snapInteraction = new ol.interaction.Snap({source: me.draftSource});
    me.olmap.addInteraction(me.snapInteraction);
    
    $("#stopdraw").show();
};

MapControl.prototype.removeDrawInteraction = function () {
    var me = this;
    if (me.currentDrawInteraction) {
        me.olmap.removeInteraction(me.currentDrawInteraction);
    }
    if (me.snapInteraction) {
        me.olmap.removeInteraction(me.snapInteraction);
    }
};

MapControl.prototype.stopDraw = function () {
    let me = this;
    
    me.removeDrawInteraction();
    $("#stopdraw").hide();
};