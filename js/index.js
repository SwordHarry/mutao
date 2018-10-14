(function ($) {
    "use strict";

    // menu
    var dropdown = {};
    // 按需加载
    $(".menu").dropdown({
        css3: true,
        js: true,
    }).on("dropdown-show", function (e) {
        dropdown.loadOnce($(this), dropdown.buildMenuItem);
    });

    dropdown.buildMenuItem = function ($elem, data) {
        var html = "";
        if (data.length === 0) return;

        for (var i = 0; i < data.length; i++) {
            html += '<li><a href="' + data[i].url + '" target="_blank" class="menu-item">' + data[i].name + '</a></li>';
        }
        $elem.find(".dropdown-layer").html(html);
    };

    //header-search
    var search = {};
    search.$headerSearch = $("#header-search");
    search.$headerSearch.search({
        autocomplete: true,
        css3: false,
        js: false,
        animation: "fade",
        getDataInterval: 200
    });
    search.$headerSearch.html = "",
        search.$headerSearch.maxNum = 10;
    search.$headerSearch.on("search-getData", function (e, data) {

        // maxNum 为显示的最大条数
        search.$headerSearch.html = search.createHeaderSearchLayer(data, search.$headerSearch.maxNum);
        var $this = $(this);
        $this.search("appendLayer", html);
        // $layer.html(html);
        if (search.$headerSearch.html) {
            $this.search("showLayer");
        } else {
            $this.search("hideLayer");
        }

    }).on("search-noData", function (e) {
        $(this).search("hideLayer").search("appendLayer", "");
        // $layer.html("");
    }).on("click", ".search-layer-item", function () {
        search.$headerSearch.search("setInputVal", $(this).html());
        search.$headerSearch.search("submit", $(this).html());
    });


    search.createHeaderSearchLayer = function (data, maxNum) {
        var html = "",
            dataLength = data.result.length;
        if (dataLength === 0) {


        } else {
            for (var i = 0; i < dataLength; i++) {
                if (i >= maxNum) break;
                html += "<li class=\"search-layer-item text-ellipsis\">"
                    + data.result[i][0] +
                    "</li>";

            }

        }
        return html;
    }

    dropdown.createCartItemListLayer = function (data) {
        var html = "",
            dataLength = data.length;
        if (dataLength === 0) {
            return;
        } else {
            html = "<div class=\"cart-title\">\n" +
                "最近添加的商品\n" +
                "</div>";
            for (var i = 0; i < dataLength; i++) {
                html += "<li class=\"cart-item\">\n" +
                    "<img src=\"" + data[i].img + "\" alt=\"\" class=\"cart-item-img fl\">\n" +
                    "<div class=\"cart-item-info fl\">\n" +
                    "<div class=\"cart-item-title\">\n" +
                    data[i].title +
                    "</div>\n" +
                    "<div class=\"cart-item-count fl\">\n" +
                    "<strong>￥" + data[i].price + " X 1</strong>\n" +
                    "</div>\n" +
                    "</div>\n" +
                    "<div class=\"cart-item-remove fr\">\n" +
                    "x\n" +
                    "</div>\n" +
                    "</li>";
            }
            html += "<div class=\"cart-info\">\n" +
                "<div class=\"fl\">\n" +
                " 共 <strong>0</strong> 件商品，总计 <strong>￥0.00</strong>\n" +
                "</div>\n" +
                "<button class=\"cart-info-btn fr\">去购物车</button>\n" +
                "</div>";
        }
        return html;
    }

    // cart
    var $cart = $(".cart");
    $cart.cart({
        css3: true,
        js: false,
        animation: "fade"
    });
    // 加载ajax
    $cart.on("cart-show", function (e, data) {

        var $this = $(this),
            html = dropdown.createCartItemListLayer(data);

        $this.cart("appendLayer", html);
        if (html) {
            $this.cart("showLayer");
        } else {
            $this.cart("hideLayer");
        }
    });


    // category
    $("#focus-category").find(".dropdown").dropdown({
        css3: false,
        js: false,
        animation: "fadeSlideLeftRight"
    }).on("dropdown-show", function () {
        dropdown.loadOnce($(this), dropdown.createCategoryDatails);
    });

    dropdown.createCategoryDatails = function ($elem, data) {
        var html = "";

        for (var i = 0; i < data.length; i++) {
            html += "<dl class=\"category-details cf\">\n" +
                "<dt class=\"category-details-title fl\"><a href=\"#\" class=\"category-details-title-link\">" + data[i].title + "</a></dt>\n" +
                "<dd class=\"category-details-item fl\">\n";
            for (var j = 0; j < data[i].items.length; j++) {
                html += "<a href=\"#\" class=\"link\">" + data[i].items[j] + "</a>\n";

            }
            html += "</dd>\n</dl>";
        }

        $elem.find(".dropdown-layer").html(html);
    };


    // 加载一次
    dropdown.loadOnce = function ($elem, success) {
        var dataLoad = $elem.data("load");

        if (!dataLoad) return;

        if (!$elem.data("loaded")) {
            // 获取json文件内容
            $elem.data("loaded", true);
            $.getJSON(dataLoad).done(function (data) {
                if (typeof success === "function") success($elem, data);
            }).fail(function () {
                $elem.data("loaded", false);
            });
        }
    };

    // floor
    var floor = {};
    floor.$window = $(window);
    floor.$doc = $(document);
    floor.$floor = $(".floor");

    // 图片加载器
    var imgLoader = {};
    // 加载单张图片
    imgLoader.loadImg = function (url, imgLoaded, imgFailed) {
        var image = new Image();
        image.onerror = function () {
            if (typeof imgFailed === "function") {
                imgFailed(url);
            }
        };
        image.onload = function () {
            if (typeof imgLoaded === "function") {
                imgLoaded(url);
            }
        };
        image.src = url;
    };
    // 加载多张图片
    imgLoader.loadImgs = function ($imgs, success, fail) {

        $imgs.each(function (_, elem) {
            var $img = $(elem);

            imgLoader.loadImg($img.data("src"), function (url) {

                $img.attr("src", url);
                success();
            }, function (url) {
                console.log("从" + url + "加载图片失败");
                fail($img, url);
            });
        });

    };

    // 懒加载
    var lazyLoad = {};
    lazyLoad.isVisible = function (floorData) {
        var $window = floor.$window;
        return ((($window.height() + $window.scrollTop()) > floorData.offsetTop)
            && ($window.scrollTop() < (floorData.offsetTop + floorData.height)));

    };
    lazyLoad.loadUntil = function (options) {
        // 不要暴露太多全局变量
        var items = {},
            loadedItemNum = 0,
            loadItemFn = null;

        // 按需加载
        options.$elem.on(options.triggerEvent, loadItemFn = function (e, index, elem) {
            if (items[index] !== "loaded") {

                options.$elem.trigger(options.id + "-loadItems", [index, elem, function () {
                    // 按需加载
                    items[index] = "loaded";
                    loadedItemNum++;
                    if (loadedItemNum === options.totalItemNum) {
                        // 全部加载完毕
                        floor.$doc.trigger(options.id + "-itemsLoaded");
                    }
                }]);
            }
        });

        options.$elem.on(options.id + "-itemsLoaded", function () {
            // 清除事件，防止 全部加载完又进入判断是否加载
            // console.log("itemsLoaded")
            options.$elem.off(options.triggerEvent, loadItemFn);
            // $window.off("scroll resize",timeToShow);
        });

    };
    // 开启延迟加载
    lazyLoad.loadUntil({
        $elem: floor.$doc,
        totalItemNum: floor.$floor.length,
        triggerEvent: "floor-show",
        id: "floors"
    });

    var slider = {};
    // 私下加载img，防止loading.gif卡死
    slider.lazyLoad = function ($elem) {
        // 不要暴露太多全局变量
        $elem.items = {};
        $elem.loadedItemNum = 0;
        $elem.totalItemNum = $elem.find(".slider-img").length;

        // 按需加载
        $elem.on("slider-show", $elem.loadItem = function (e, index, elem) {
            if ($elem.items[index] !== "loaded") {

                $elem.trigger("slider-loadItem", [index, elem]);
            }
        });

        $elem.on("slider-loadItem", function (e, index, elem) {
            // 按需加载
            var $imgs = $(elem).find(".slider-img");

            // 第一个参数为，意思是无用参数，占位
            $imgs.each(function (_, elem) {

                var $img = $(elem);

                imgLoader.loadImg($img.data("src"), function (url) {
                    $img.attr("src", url);
                    $elem.items[index] = "loaded";
                    $elem.loadedItemNum++;
                    if ($elem.loadedItemNum === $elem.totalItemNum) {
                        // 全部加载完毕
                        $elem.trigger("slider-itemsLoaded");
                    }
                }, function (url) {
                    console.log("从" + url + "加载图片失败");
                    // 显示备用图片
                    $img.attr("src", "../img/focus-slider/placeholder.png");
                });
            });

        });

        $elem.on("slider-itemsLoaded", function () {
            // 清除事件，防止图片全部加载完又进入判断是否加载
            // console.log("itemsLoaded")
            $elem.off("slider-show", $elem.loadItem);
        });

    };

    // focus-slider
    slider.$focusSlider = $("#focus-slider");
    slider.$focusSlider.slider({
        css3: true,
        js: false,
        animation: "fade", // slide
        activeIndex: 0,
        interval: 3000
    });
    slider.$focusSlider.on("focus-loadItems", function (e, index, elem, success) {

        imgLoader.loadImgs($(elem).find(".slider-img"), success, function ($img, url) {
            $img.attr("src", "img/focus-slider/placeholder.png");
        });
    });
    lazyLoad.loadUntil({
        $elem: slider.$focusSlider,
        totalItemNum: slider.$focusSlider.find(".slider-img").length,
        triggerEvent: "slider-show",
        id: "focus"

    });

    // todays-slider
    slider.$todaysSlider = $("#todays-slider");
    slider.$todaysSlider.slider({
        css3: true,
        js: false,
        animation: "slide", // slide
        activeIndex: 0,
        interval: 3000
    });
    slider.$todaysSlider.on("todays-loadItems", function (e, index, elem, success) {

        imgLoader.loadImgs($(elem).find(".slider-img"), success, function ($img, url) {
            $img.attr("src", "img/todays-slider/placeholder.png");
        });
    });
    lazyLoad.loadUntil({
        $elem: slider.$todaysSlider,
        totalItemNum: slider.$todaysSlider.find(".slider-img").length,
        triggerEvent: "slider-show",
        id: "todays"

    });


    floor.floorData = [
        {
            num: '1',
            text: '服装鞋包',
            tabs: ['大牌', '男装', '女装'],
            offsetTop: floor.$floor.eq(0).offset().top,
            height: floor.$floor.eq(0).height(),
            items: [
                [
                    {
                        name: '匡威男棒球开衫外套2015',
                        price: 479
                    }, {
                    name: 'adidas 阿迪达斯 训练 男子',
                    price: 335
                }, {
                    name: '必迈BMAI一体织跑步短袖T恤',
                    price: 159
                }, {
                    name: 'NBA袜子半毛圈运动高邦棉袜',
                    price: 65
                }, {
                    name: '特步官方运动帽男女帽子2016',
                    price: 69
                }, {
                    name: 'KELME足球训练防寒防风手套',
                    price: 4999
                }, {
                    name: '战地吉普三合一冲锋衣',
                    price: 289
                }, {
                    name: '探路者户外男士徒步鞋',
                    price: 369
                }, {
                    name: '羽绒服2015秋冬新款轻薄男士',
                    price: 399
                }, {
                    name: '溯溪鞋涉水鞋户外鞋',
                    price: 689
                }, {
                    name: '旅行背包多功能双肩背包',
                    price: 269
                }, {
                    name: '户外旅行双肩背包OS0099',
                    price: 99
                }
                ], [
                    {
                        name: '匡威男棒球开衫外套2015',
                        price: 479
                    }, {
                        name: 'adidas 阿迪达斯 训练 男子',
                        price: 335
                    }, {
                        name: '必迈BMAI一体织跑步短袖T恤',
                        price: 159
                    }, {
                        name: 'NBA袜子半毛圈运动高邦棉袜',
                        price: 65
                    }, {
                        name: '特步官方运动帽男女帽子2016',
                        price: 69
                    }, {
                        name: 'KELME足球训练防寒防风手套',
                        price: 4999
                    }, {
                        name: '战地吉普三合一冲锋衣',
                        price: 289
                    }, {
                        name: '探路者户外男士徒步鞋',
                        price: 369
                    }, {
                        name: '羽绒服2015秋冬新款轻薄男士',
                        price: 399
                    }, {
                        name: '溯溪鞋涉水鞋户外鞋',
                        price: 689
                    }, {
                        name: '旅行背包多功能双肩背包',
                        price: 269
                    }, {
                        name: '户外旅行双肩背包OS0099',
                        price: 99
                    }
                ], [
                    {
                        name: '匡威男棒球开衫外套2015',
                        price: 479
                    }, {
                        name: 'adidas 阿迪达斯 训练 男子',
                        price: 335
                    }, {
                        name: '必迈BMAI一体织跑步短袖T恤',
                        price: 159
                    }, {
                        name: 'NBA袜子半毛圈运动高邦棉袜',
                        price: 65
                    }, {
                        name: '特步官方运动帽男女帽子2016',
                        price: 69
                    }, {
                        name: 'KELME足球训练防寒防风手套',
                        price: 4999
                    }, {
                        name: '战地吉普三合一冲锋衣',
                        price: 289
                    }, {
                        name: '探路者户外男士徒步鞋',
                        price: 369
                    }, {
                        name: '羽绒服2015秋冬新款轻薄男士',
                        price: 399
                    }, {
                        name: '溯溪鞋涉水鞋户外鞋',
                        price: 689
                    }, {
                        name: '旅行背包多功能双肩背包',
                        price: 269
                    }, {
                        name: '户外旅行双肩背包OS0099',
                        price: 99
                    }
                ]
            ]
        }, {
            num: '2',
            text: '个护美妆',
            tabs: ['热门', '国际大牌', '国际名品'],
            offsetTop: floor.$floor.eq(1).offset().top,
            height: floor.$floor.eq(1).height(),
            items: [
                [
                    {
                        name: '韩束红石榴鲜活水盈七件套装',
                        price: 169
                    }, {
                    name: '温碧泉八杯水亲亲水润五件套装',
                    price: 198
                }, {
                    name: '御泥坊红酒透亮矿物蚕丝面膜贴',
                    price: 79.9
                }, {
                    name: '吉列手动剃须刀锋隐致护',
                    price: 228
                }, {
                    name: 'Mediheal水润保湿面膜',
                    price: 119
                }, {
                    name: '纳益其尔芦荟舒缓保湿凝胶',
                    price: 39
                }, {
                    name: '宝拉珍选基础护肤旅行四件套',
                    price: 299
                }, {
                    name: '温碧泉透芯润五件套装',
                    price: 257
                }, {
                    name: '玉兰油多效修护三部曲套装',
                    price: 199
                }, {
                    name: 'LOREAL火山岩控油清痘洁面膏',
                    price: 36
                }, {
                    name: '百雀羚水嫩倍现盈透精华水',
                    price: 139
                }, {
                    name: '珀莱雅新柔皙莹润三件套',
                    price: 99
                }
                ], [
                    {
                        name: '韩束红石榴鲜活水盈七件套装',
                        price: 169
                    }, {
                        name: '温碧泉八杯水亲亲水润五件套装',
                        price: 198
                    }, {
                        name: '御泥坊红酒透亮矿物蚕丝面膜贴',
                        price: 79.9
                    }, {
                        name: '吉列手动剃须刀锋隐致护',
                        price: 228
                    }, {
                        name: 'Mediheal水润保湿面膜',
                        price: 119
                    }, {
                        name: '纳益其尔芦荟舒缓保湿凝胶',
                        price: 39
                    }, {
                        name: '宝拉珍选基础护肤旅行四件套',
                        price: 299
                    }, {
                        name: '温碧泉透芯润五件套装',
                        price: 257
                    }, {
                        name: '玉兰油多效修护三部曲套装',
                        price: 199
                    }, {
                        name: 'LOREAL火山岩控油清痘洁面膏',
                        price: 36
                    }, {
                        name: '百雀羚水嫩倍现盈透精华水',
                        price: 139
                    }, {
                        name: '珀莱雅新柔皙莹润三件套',
                        price: 99
                    }
                ], [
                    {
                        name: '韩束红石榴鲜活水盈七件套装',
                        price: 169
                    }, {
                        name: '温碧泉八杯水亲亲水润五件套装',
                        price: 198
                    }, {
                        name: '御泥坊红酒透亮矿物蚕丝面膜贴',
                        price: 79.9
                    }, {
                        name: '吉列手动剃须刀锋隐致护',
                        price: 228
                    }, {
                        name: 'Mediheal水润保湿面膜',
                        price: 119
                    }, {
                        name: '纳益其尔芦荟舒缓保湿凝胶',
                        price: 39
                    }, {
                        name: '宝拉珍选基础护肤旅行四件套',
                        price: 299
                    }, {
                        name: '温碧泉透芯润五件套装',
                        price: 257
                    }, {
                        name: '玉兰油多效修护三部曲套装',
                        price: 199
                    }, {
                        name: 'LOREAL火山岩控油清痘洁面膏',
                        price: 36
                    }, {
                        name: '百雀羚水嫩倍现盈透精华水',
                        price: 139
                    }, {
                        name: '珀莱雅新柔皙莹润三件套',
                        price: 99
                    }
                ]
            ]
        }, {
            num: '3',
            text: '手机通讯',
            tabs: ['热门', '品质优选', '新机尝鲜'],
            offsetTop: floor.$floor.eq(2).offset().top,
            height: floor.$floor.eq(2).height(),
            items: [
                [
                    {
                        name: '摩托罗拉 Moto Z Play',
                        price: 3999
                    }, {
                    name: 'Apple iPhone 7 (A1660)',
                    price: 6188
                }, {
                    name: '小米 Note 全网通 白色',
                    price: 999
                }, {
                    name: '小米5 全网通 标准版 3GB内存',
                    price: 1999
                }, {
                    name: '荣耀7i 海岛蓝 移动联通4G手机',
                    price: 1099
                }, {
                    name: '乐视（Le）乐2（X620）32GB',
                    price: 1099
                }, {
                    name: 'OPPO R9 4GB+64GB内存版',
                    price: 2499
                }, {
                    name: '魅蓝note3 全网通公开版',
                    price: 899
                }, {
                    name: '飞利浦 X818 香槟金 全网通4G',
                    price: 1998
                }, {
                    name: '三星 Galaxy S7（G9300）',
                    price: 4088
                }, {
                    name: '华为 荣耀7 双卡双待双通',
                    price: 1128
                }, {
                    name: '努比亚(nubia)Z7Max(NX505J)',
                    price: 728
                }
                ], [
                    {
                        name: '摩托罗拉 Moto Z Play',
                        price: 3999
                    }, {
                        name: 'Apple iPhone 7 (A1660)',
                        price: 6188
                    }, {
                        name: '小米 Note 全网通 白色',
                        price: 999
                    }, {
                        name: '小米5 全网通 标准版 3GB内存',
                        price: 1999
                    }, {
                        name: '荣耀7i 海岛蓝 移动联通4G手机',
                        price: 1099
                    }, {
                        name: '乐视（Le）乐2（X620）32GB',
                        price: 1099
                    }, {
                        name: 'OPPO R9 4GB+64GB内存版',
                        price: 2499
                    }, {
                        name: '魅蓝note3 全网通公开版',
                        price: 899
                    }, {
                        name: '飞利浦 X818 香槟金 全网通4G',
                        price: 1998
                    }, {
                        name: '三星 Galaxy S7（G9300）',
                        price: 4088
                    }, {
                        name: '华为 荣耀7 双卡双待双通',
                        price: 1128
                    }, {
                        name: '努比亚(nubia)Z7Max(NX505J)',
                        price: 728
                    }
                ], [
                    {
                        name: '摩托罗拉 Moto Z Play',
                        price: 3999
                    }, {
                        name: 'Apple iPhone 7 (A1660)',
                        price: 6188
                    }, {
                        name: '小米 Note 全网通 白色',
                        price: 999
                    }, {
                        name: '小米5 全网通 标准版 3GB内存',
                        price: 1999
                    }, {
                        name: '荣耀7i 海岛蓝 移动联通4G手机',
                        price: 1099
                    }, {
                        name: '乐视（Le）乐2（X620）32GB',
                        price: 1099
                    }, {
                        name: 'OPPO R9 4GB+64GB内存版',
                        price: 2499
                    }, {
                        name: '魅蓝note3 全网通公开版',
                        price: 899
                    }, {
                        name: '飞利浦 X818 香槟金 全网通4G',
                        price: 1998
                    }, {
                        name: '三星 Galaxy S7（G9300）',
                        price: 4088
                    }, {
                        name: '华为 荣耀7 双卡双待双通',
                        price: 1128
                    }, {
                        name: '努比亚(nubia)Z7Max(NX505J)',
                        price: 728
                    }
                ]
            ]
        }, {
            num: '4',
            text: '家用电器',
            tabs: ['热门', '大家电', '生活电器'],
            offsetTop: floor.$floor.eq(3).offset().top,
            height: floor.$floor.eq(3).height(),
            items: [
                [
                    {
                        name: '暴风TV 超体电视 40X 40英寸',
                        price: 1299
                    }, {
                    name: '小米（MI）L55M5-AA 55英寸',
                    price: 3699
                }, {
                    name: '飞利浦HTD5580/93 音响',
                    price: 2999
                }, {
                    name: '金门子H108 5.1套装音响组合',
                    price: 1198
                }, {
                    name: '方太ENJOY云魔方抽油烟机',
                    price: 4390
                }, {
                    name: '美的60升预约洗浴电热水器',
                    price: 1099
                }, {
                    name: '九阳电饭煲多功能智能电饭锅',
                    price: 159
                }, {
                    name: '美的电烤箱家用大容量',
                    price: 329
                }, {
                    name: '奥克斯(AUX)936破壁料理机',
                    price: 1599
                }, {
                    name: '飞利浦面条机 HR2356/31',
                    price: 665
                }, {
                    name: '松下NU-JA100W 家用蒸烤箱',
                    price: 1799
                }, {
                    name: '飞利浦咖啡机 HD7751/00',
                    price: 1299
                }
                ], [
                    {
                        name: '暴风TV 超体电视 40X 40英寸',
                        price: 1299
                    }, {
                        name: '小米（MI）L55M5-AA 55英寸',
                        price: 3699
                    }, {
                        name: '飞利浦HTD5580/93 音响',
                        price: 2999
                    }, {
                        name: '金门子H108 5.1套装音响组合',
                        price: 1198
                    }, {
                        name: '方太ENJOY云魔方抽油烟机',
                        price: 4390
                    }, {
                        name: '美的60升预约洗浴电热水器',
                        price: 1099
                    }, {
                        name: '九阳电饭煲多功能智能电饭锅',
                        price: 159
                    }, {
                        name: '美的电烤箱家用大容量',
                        price: 329
                    }, {
                        name: '奥克斯(AUX)936破壁料理机',
                        price: 1599
                    }, {
                        name: '飞利浦面条机 HR2356/31',
                        price: 665
                    }, {
                        name: '松下NU-JA100W 家用蒸烤箱',
                        price: 1799
                    }, {
                        name: '飞利浦咖啡机 HD7751/00',
                        price: 1299
                    }
                ], [
                    {
                        name: '暴风TV 超体电视 40X 40英寸',
                        price: 1299
                    }, {
                        name: '小米（MI）L55M5-AA 55英寸',
                        price: 3699
                    }, {
                        name: '飞利浦HTD5580/93 音响',
                        price: 2999
                    }, {
                        name: '金门子H108 5.1套装音响组合',
                        price: 1198
                    }, {
                        name: '方太ENJOY云魔方抽油烟机',
                        price: 4390
                    }, {
                        name: '美的60升预约洗浴电热水器',
                        price: 1099
                    }, {
                        name: '九阳电饭煲多功能智能电饭锅',
                        price: 159
                    }, {
                        name: '美的电烤箱家用大容量',
                        price: 329
                    }, {
                        name: '奥克斯(AUX)936破壁料理机',
                        price: 1599
                    }, {
                        name: '飞利浦面条机 HR2356/31',
                        price: 665
                    }, {
                        name: '松下NU-JA100W 家用蒸烤箱',
                        price: 1799
                    }, {
                        name: '飞利浦咖啡机 HD7751/00',
                        price: 1299
                    }
                ]
            ]
        }, {
            num: '5',
            text: '电脑数码',
            tabs: ['热门', '电脑/平板', '潮流影音'],
            offsetTop: floor.$floor.eq(4).offset().top,
            height: floor.$floor.eq(4).height(),
            items: [
                [
                    {
                        name: '戴尔成就Vostro 3800-R6308',
                        price: 2999
                    }, {
                    name: '联想IdeaCentre C560',
                    price: 5399
                }, {
                    name: '惠普260-p039cn台式电脑',
                    price: 3099
                }, {
                    name: '华硕飞行堡垒旗舰版FX-PRO',
                    price: 6599
                }, {
                    name: '惠普(HP)暗影精灵II代PLUS',
                    price: 12999
                }, {
                    name: '联想(Lenovo)小新700电竞版',
                    price: 5999
                }, {
                    name: '游戏背光牧马人机械手感键盘',
                    price: 499
                }, {
                    name: '罗技iK1200背光键盘保护套',
                    price: 799
                }, {
                    name: '西部数据2.5英寸移动硬盘1TB',
                    price: 419
                }, {
                    name: '新睿翼3TB 2.5英寸 移动硬盘',
                    price: 849
                }, {
                    name: 'Rii mini i28无线迷你键盘鼠标',
                    price: 349
                }, {
                    name: '罗技G29 力反馈游戏方向盘',
                    price: 2999
                }
                ], [
                    {
                        name: '戴尔成就Vostro 3800-R6308',
                        price: 2999
                    }, {
                        name: '联想IdeaCentre C560',
                        price: 5399
                    }, {
                        name: '惠普260-p039cn台式电脑',
                        price: 3099
                    }, {
                        name: '华硕飞行堡垒旗舰版FX-PRO',
                        price: 6599
                    }, {
                        name: '惠普(HP)暗影精灵II代PLUS',
                        price: 12999
                    }, {
                        name: '联想(Lenovo)小新700电竞版',
                        price: 5999
                    }, {
                        name: '游戏背光牧马人机械手感键盘',
                        price: 499
                    }, {
                        name: '罗技iK1200背光键盘保护套',
                        price: 799
                    }, {
                        name: '西部数据2.5英寸移动硬盘1TB',
                        price: 419
                    }, {
                        name: '新睿翼3TB 2.5英寸 移动硬盘',
                        price: 849
                    }, {
                        name: 'Rii mini i28无线迷你键盘鼠标',
                        price: 349
                    }, {
                        name: '罗技G29 力反馈游戏方向盘',
                        price: 2999
                    }
                ], [
                    {
                        name: '戴尔成就Vostro 3800-R6308',
                        price: 2999
                    }, {
                        name: '联想IdeaCentre C560',
                        price: 5399
                    }, {
                        name: '惠普260-p039cn台式电脑',
                        price: 3099
                    }, {
                        name: '华硕飞行堡垒旗舰版FX-PRO',
                        price: 6599
                    }, {
                        name: '惠普(HP)暗影精灵II代PLUS',
                        price: 12999
                    }, {
                        name: '联想(Lenovo)小新700电竞版',
                        price: 5999
                    }, {
                        name: '游戏背光牧马人机械手感键盘',
                        price: 499
                    }, {
                        name: '罗技iK1200背光键盘保护套',
                        price: 799
                    }, {
                        name: '西部数据2.5英寸移动硬盘1TB',
                        price: 419
                    }, {
                        name: '新睿翼3TB 2.5英寸 移动硬盘',
                        price: 849
                    }, {
                        name: 'Rii mini i28无线迷你键盘鼠标',
                        price: 349
                    }, {
                        name: '罗技G29 力反馈游戏方向盘',
                        price: 2999
                    }
                ]
            ]
        }
    ];
    floor.buildFloor = function (floorData) {
        var html = "";

        html += "<div class=\"container\">";
        html += floor.buildFloorHead(floorData);
        html += floor.bulidFloorBody(floorData);
        html += "</div>";

        return html;
    };

    // 楼层头部 floor-head
    floor.buildFloorHead = function (floorData) {
        var html = "";
        html +=
            "<div class=\"floor-head\">\n" +
            "<h2 class=\"floor-title fl\"><span class=\"floor-title-num\">"
            + floorData.num +
            "F</span><span class=\"floor-title-text\">"
            + floorData.text +
            "</span></h2>\n" +
            "<ul class=\"tab-item-wrap fr\">\n";

        for (var i = 0; i < floorData.tabs.length; i++) {
            html +=
                "<li class=\"fl\"><a href=\"javascript:;\" class=\"tab-item\">" + floorData.tabs[i] + "</a></li>\n";
            if (i !== floorData.tabs.length - 1) {
                "<li class=\"floor-divider fl text-hidden\">分隔线</li>\n";
            }

        }


        html +=
            "</ul>\n" +
            "</div>";

        return html;
    };

    // 楼层体 floor-body
    floor.bulidFloorBody = function (floorData) {
        var html = "<div class=\"floor-body\">\n";
        for (var i = 0; i < floorData.items.length; i++) {
            html += "<ul class=\"tab-panel\">\n";

            for (var j = 0; j < floorData.items[i].length; j++) {
                html +=
                    "<li class=\"floor-item fl\">\n" +
                    "<p class=\"floor-item-pic\">" +
                    "<a href=\"###\" target=\"_blank\">" +
                    "<img src=\"img/floor/loading.gif\" class=\"floor-img\" data-src=\"img/floor/" + floorData.num + "/" + (i + 1) + "/" + (j + 1) + ".png\" alt=\"\" />" +
                    "</a>" +
                    "</p>\n" +
                    "<p class=\"floor-item-name\">" +
                    "<a href=\"###\" target=\"_blank\" class=\"link\">" + floorData.items[i][j].name + "</a>" +
                    "</p>\n" +
                    "<p class=\"floor-item-price\">" + floorData.items[i][j].price + "</p>\n" +
                    "</li>\n";

            }

            html += "</ul>\n";
        }

        html += "</div>";

        return html;
    };

    floor.timeToShow = function () {
        // console.log("time to show");
        floor.$floor.each(function (index, elem) {

            if (lazyLoad.isVisible(floor.floorData[index])) {
                // console.log("the " + (index+1) + " floor is visible");
                floor.$doc.trigger("floor-show", [index, elem]);

            }
        });
    };

    // scroll 滚动 resize 改变可视区域大小
    // 频繁触发事件需要 稀释事件流
    floor.$window.on("scroll resize", floor.showFloor = function() {
        clearTimeout(floor.floorTimer);
        floor.floorTimer = setTimeout(floor.timeToShow,250);
    });

    floor.$floor.on("floor-loadItems", function (e, index, elem, success) {

        imgLoader.loadImgs($(elem).find(".floor-img"), success, function ($img, url) {
            $img.attr("src", "img/floor/placeholder.png");
        });
    });
    floor.$doc.on("floors-loadItems", function (e, index, elem, success) {
        var html = floor.buildFloor(floor.floorData[index]),
            $elem = $(elem);

        // 按需加载
        success();

        $elem.html(html);
        // id 和 $elem 一定要对应
        lazyLoad.loadUntil({
            $elem: $(elem),
            totalItemNum: $elem.find(".floor-img").length,
            triggerEvent: "tab-show",
            id: "floor"
        });

        $elem.tab({
            event: "mouseenter",// click
            css3: false,
            js: false,
            animation: "fade",
            activeIndex: 0,
            interval: 0,
            delay: 200
        });
    });
    floor.$doc.on("floors-itemsLoaded", function () {
        floor.$window.off("scroll resize", floor.showFloor);
    });

    floor.timeToShow();


    // elevator
    floor.$elevator = $("#elevator");
    floor.$elevator.$items = floor.$elevator.find(".elevator-item");
    floor.whichFloor = function(){
        var num = -1;
        floor.$floor.each(function(index,elem){
            var floorData = floor.floorData[index];

            num = index;
            if(floor.$window.scrollTop() < floorData.offsetTop - floor.$window.height()/2){
                num = index - 1;
                return false;
            }
        });

        return num;
    };
    floor.setElevator = function(){
        var num = floor.whichFloor();
        if(num === -1){
            // hide
            floor.$elevator.fadeOut();
        }else{
            // show
            floor.$elevator.fadeIn();
            floor.$elevator.$items.removeClass("elevator-active");
            floor.$elevator.$items.eq(num).addClass("elevator-active");
        }
    };
    floor.setElevator();
    floor.$window.on("scroll resize", function() {
        clearTimeout(floor.elevatorTimer);
        floor.elevatorTimer = setTimeout(floor.setElevator,250);
    });

    // 点击快速抵达
    floor.$elevator.on("click",".elevator-item",function(){

        // 页面电梯功能
        $("html").animate({
            scrollTop: floor.floorData[$(this).index()].offsetTop
        });
    });
    console.log(floor.whichFloor())


    $("#backToTop").on("click" ,function(){

        // 页面电梯功能
        $("html").animate({
            scrollTop: 0
        });
    });
})(jQuery);