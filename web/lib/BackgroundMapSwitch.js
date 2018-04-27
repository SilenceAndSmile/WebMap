/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

BackgroundMapSwitch = function (opts) {
    var me = this;
    me.opts = $.extend(true, {
        mapControl: null
    }, opts);
    me._init();
};



BackgroundMapSwitch.prototype._init = function () {
    var me = this;
    me.el = $("#" + me.opts.target).css({
//        "max-width": 250
    });

    var html = ' <div class="input-group mb-3">'
            + '     <div class="input-group-prepend">'
            + '         <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">底图</button>'
            + '         <div class="dropdown-menu">'
            + '             <a value="OSM">OpenStreetMap</a>'
            + '             <div role="separator" class="dropdown-divider"></div>'
            + '             <a value="GOOGLE_ROADMAP">谷歌道路图</a>'
            + '             <a value="GOOGLE_SATELLITE">谷歌卫星图</a>'
            + '             <a value="GOOGLE_HYBRID">谷歌复合图</a>'
            + '             <a value="GOOGLE_TERRAIN">谷歌地形图</a>'
            + '             <div role="separator" class="dropdown-divider"></div>'
            + '             <a value="BING_ROAD">必应道路图</a>'
            + '             <a value="BING_AERIAL">必应卫星图</a>'
            + '             <div role="separator" class="dropdown-divider"></div>'
            + '             <a value="AMAP_ROAD">高德道路图</a>'
            + '             <a value="AMAP_SATELLITE">高德卫星图</a>'
            + '             <div role="separator" class="dropdown-divider"></div>'
            + '             <a value="BMAP_NORMAL">百度道路图</a>'
            + '             <a value="BMAP_SATELLITE">百度卫星图</a>'
            + '             <div role="separator" class="dropdown-divider"></div>'
            + '             <a value="QQMAPS_ROAD">腾讯道路图</a>'
            + '             <a value="QQMAPS_SATELLITE">腾讯卫星图</a>'
            + '             <div role="separator" class="dropdown-divider"></div>'        
            + '             <a value="TMAP_ROAD">天地图道路图</a>'
            + '             <a value="TMAP_SATELLITE">天地图卫星图</a>'
            + '         </div>'
            + '     </div>'
            + '     <input type="text" class="form-control btn-outline-secondary" aria-label="Text input with dropdown button">'
            + ' </div>';
    $(html).appendTo(me.el);
    me.el.find("a").attr({
        "href": "#"
    }).addClass("dropdown-item").click(function (e) {
        if (me.opts.mapControl) {
            me.opts.mapControl.setBackgroundMap($(e.target).attr("value"));
            me.el.find("input").val($(e.target).text());
        }
    });

    if (me.opts.mapControl) {
        me.el.find("input").val(
                me.el.find("a[value='" + me.opts.mapControl.getBackgroundMapName() + "']").text()
                );
    }
};




