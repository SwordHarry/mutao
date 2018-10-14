// (function ($) {
//     "use strict";
//     var $search = $(".search"),
//         $form = $(".search-form"),
//         $input = $search.find(".search-inputbox"),
//         $btn = $search.find(".search-btn"),
//         $layer = $search.find(".search-layer");
//
//     // 验证
//     $form.on("submit", function () {
//         if ($input.val().trim().length === 0) {
//             // 阻止提交行为
//             return false;
//         }
//     })
//
//     // 自动完成
//     // IE 6 7 8 不兼容input事件
//     $input.on("input", function () {
//         // 提交encodeURIComponent 进行编码
//         var url = "https://suggest.taobao.com/sug?" +
//             "code=utf-8&_ksTS=1538529809038_273&callback=jsonp274&k=1&area=c2c&bucketid=4&" +
//             "q=" + encodeURIComponent($input.val().trim());
//
//         $.ajax({
//             url: url,
//             dataType: "jsonp"
//         }).done(function (data) {
//             // maxNum 为显示的最大条数
//             var html = "",
//                 maxNum = 10,
//                 dataLength = data.result.length;
//             if (dataLength === 0) {
//                 $layer.hide().html("");
//                 return;
//             } else {
//                 for (var i = 0; i < dataLength; i++) {
//                     if (i >= maxNum) break;
//                     html += "<li class=\"search-layer-item text-ellipsis\">"
//                         + data.result[i][0] +
//                         "</li>";
//
//                 }
//                 $layer.html(html).show();
//             }
//         }).fail(function () {
//             $layer.hide().html("");
//         }).always(function () {
//
//         });
//     });
//
//     // jQuery 事件代理机制
//     // 能够代理的就是能够冒泡
//     // focus blur 无法代理
//     $layer.on("click", ".search-layer-item", function () {
//
//         $input.val(removeHtmlTags($(this).html()));
//         $form.submit();
//     });
//
//     // 显示和隐藏下拉层
//     $input.on("focus", function () {
//         if ($input.val().trim().length > 0) {
//             $layer.show();
//         }
//     }).on("click", function (e) {
//         // 阻止冒泡
//         e.stopPropagation();
//     });
//     // 点击空白地方将下拉层隐藏
//     $(document).on("click", function () {
//         $layer.hide();
//     });
//
//     // 去除字符串中的html标签
//     function removeHtmlTags(str) {
//         return str.replace(/<(?:[^>'"]|"[^"]*"|'[^']*')*>/g, "");
//     }
//
// })(jQuery);

// 搜索框模块
(function ($) {
    "use strict";

    // 缓存
    var cache = {
        data: {},
        count: 0,
        addData: function(key,value){
            if(!this.data[key]){
                this.data[key] = value;
                this.count++;
            }
        },
        readData:function(key){
            return this.data[key];
        },
        deleteDataByKey:function(key){
            delete this.data[key];
            this.count--;
        },
        deleteDataByOrder:function(num){
            var count = 0;
            for(var p in this.data){
                if(count >= num){
                    break;
                }
                count++;
                this.deleteDataByKey(p);
            }
        }
    };
    // 构造函数
    function Search($elem, options) {
        this.$elem = $elem;
        this.options = options;

        this.$form = this.$elem.find(".search-form");
        this.$input = this.$elem.find(".search-inputbox");
        this.$layer = this.$elem.find(".search-layer");

        this.loaded = false;

        this.$elem.on("click", ".search-btn", $.proxy(this.submit, this));
        if (this.options.autocomplete) {
            this.autocomplete();
        }
    }

    // 默认配置
    Search.DEFAULTS = {
        autocomplete: true,
        url: "https://suggest.taobao.com/sug?code=utf-8&" +
        "_ksTS=1538529809038_273&callback=jsonp274&k=1&" +
        "area=c2c&bucketid=4&q=",
        css3: false,
        js: false,
        animation: "fade",
        getDataInterval: 200
    };
    // 搜索提交
    Search.prototype.submit = function () {

        if (this.getInputVal().length === 0) {
            // 阻止提交行为
            return false;
        }
        this.$form.submit();
    };
    // 自动完成
    Search.prototype.autocomplete = function () {
        // 请求定时器，避免频繁发送请求
        var timer = null,
            self = this,
            getDataInterval = this.options.getDataInterval;

        this.$layer.showHide(this.options);
        // 自动完成
        // IE 6 7 8 不兼容input事件
        this.$input
            .on("input", function(){

                if(getDataInterval > 0){
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        self.getData();
                    },getDataInterval);
                }else{
                    self.getData();
                }

            })
            // 显示和隐藏下拉层
            .on("focus", $.proxy(this.showLayer, this))
            .on("click", function (e) {
                // 阻止冒泡
                e.stopPropagation();
            });

        // 点击空白地方将下拉层隐藏
        $(document).on("click", $.proxy(this.hideLayer, this));
    };
    // 获取数据
    Search.prototype.getData = function () {
        var self = this;
        var inputVal = this.getInputVal()
        if(inputVal){
            // 若缓存中有数据则将缓存中的数据给出，不进行ajax请求
            if(cache.readData(inputVal)){
                return self.$elem.trigger("search-getData", [cache.readData(inputVal)]);
            }

            // 终止前一次ajax请求
            if(this.jqXHR) this.jqXHR.abort();

            this.jqXHR = $.ajax({
                url: this.options.url + inputVal,
                dataType: "jsonp"
            }).done(function (data) {
                // 传递 数据，写入缓存
                cache.addData(inputVal,data);

                self.$elem.trigger("search-getData", [data]);
            }).fail(function () {
                self.$elem.trigger("search-noData");
            }).always(function () {
                // 表示请求执行完了
                self.jqXHR = null;
            });
        }else{
            self.$elem.trigger("search-noData");
        }

    };
    // 展示提示层
    Search.prototype.showLayer = function () {
        // 操作dom很消耗性能
        if (!this.loaded) return;
        this.$layer.showHide("show");
    };
    // 隐藏提示层
    Search.prototype.hideLayer = function () {
        this.$layer.showHide("hide");
    };
    // 获取搜索框中的值
    Search.prototype.getInputVal = function () {
        return this.$input.val().trim();
    };
    // 设置搜索框中的值
    Search.prototype.setInputVal = function (val) {
        this.$input.val(removeHtmlTags(val));
    };
    // 提高性能，使用loaded代替 $layer下是否有元素
    Search.prototype.appendLayer = function (html){
        this.$layer.html(html);
        // 字符串前加 两个! 可以使其变成布尔值
        this.loaded = !!html;
    };

    // 插件形式
    $.fn.extend({
        search: function (option, val) {
            // dropdown 为单例模式，防止创建浪费
            // options 最后一个为短路写法，判断传入的是否为一个对象

            var options = $.extend({}, Search.DEFAULTS, $(this).data(), typeof option === "object" && option);
            return this.each(function () {
                var $this = $(this),
                    search = $this.data("search");
                if (!search) {
                    // first time
                    $this.data("search", search = new Search($this, options));
                }

                // 暴露出 show 和 hide 方法，供使用者调用
                if (typeof search[option] === "function") {
                    search[option](val);
                }
            });
        }
    });

    // 去除字符串中的html标签
    function removeHtmlTags(str) {
        return str.replace(/<(?:[^>'"]|"[^"]*"|'[^']*')*>/g, "");
    }

})(jQuery);