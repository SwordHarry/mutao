(function ($) {
    'use strict';
    var transition = window.mt.transition;

    // 第一层封装
    function init($elem, hiddenCallback) {
        // 初始化
        if ($elem.is(":hidden")) {
            $elem.data("status", "hidden");
            if (typeof hiddenCallback === 'function') {
                hiddenCallback();
            }

        } else {
            $elem.data("status", "shown");
        }

    }

    function show($elem, callback) {
        if ($elem.data("status") === "show") return;
        if ($elem.data("status") === "shown") return;
        // trigger 订阅和注册，消息传递机制
        $elem.data('status', 'show').trigger("show");
        callback();
    }

    function hide($elem, callback) {
        if ($elem.data("status") === "hide") return;
        if ($elem.data("status") === "hidden") return;

        $elem.data('status', 'hide').trigger("hide");
        callback();
    }

    // 普通的显示隐藏
    var silent = {
        init: function ($elem) {
            init($elem);
        },
        show: function ($elem) {
            show($elem, function () {
                $elem.show();
                $elem.data('status', 'shown').trigger("shown");
            });

        },
        hide: function ($elem) {
            hide($elem, function () {
                $elem.hide();
                $elem.data('status', 'hidden').trigger("hidden");
            });

        }
    };

    // css3方式的显示隐藏
    var css3 = {
        fade: {
            init: function ($elem) {
                // 初始化
                css3._init($elem, "fadeOut");

            },
            show: function ($elem) {

                css3._show($elem, "fadeOut");

            },
            hide: function ($elem) {
                css3._hide($elem, "fadeOut");

            }
        },
        slideUpDown: {
            init: function ($elem) {
                $elem.height($elem.height());
                // 初始化
                css3._init($elem, "slideUpDownCollapse");

            },
            show: function ($elem) {
                css3._show($elem, "slideUpDownCollapse");

            },
            hide: function ($elem) {
                css3._hide($elem, "slideUpDownCollapse");

            }
        },
        slideLeftRight: {
            init: function ($elem) {
                $elem.width($elem.width());
                // 初始化
                css3._init($elem, "slideLeftRightCollapse");

            },
            show: function ($elem) {
                css3._show($elem, "slideLeftRightCollapse");

            },
            hide: function ($elem) {
                css3._hide($elem, "slideLeftRightCollapse");

            }
        },
        fadeSlideUpDown: {
            init: function ($elem) {
                $elem.height($elem.height());
                // 初始化
                css3._init($elem, "fadeOut slideUpDownCollapse");

            },
            show: function ($elem) {
                css3._show($elem, "fadeOut slideUpDownCollapse");

            },
            hide: function ($elem) {
                css3._hide($elem, "fadeOut slideUpDownCollapse");

            }
        },
        fadeSlideLeftRight: {
            init: function ($elem) {
                $elem.height($elem.height());
                // 初始化
                css3._init($elem, "fadeOut slideLeftRightCollapse");

            },
            show: function ($elem) {
                css3._show($elem, "fadeOut slideLeftRightCollapse");

            },
            hide: function ($elem) {
                css3._hide($elem, "fadeOut slideLeftRightCollapse");

            }
        }
    };
    // 添加下划线表示为内部使用函数
    // 封装代码
    css3._init = function ($elem, className) {
        $elem.addClass("transition");
        init($elem, function () {
            $elem.addClass(className);
        });
    };
    css3._show = function ($elem, className) {
        show($elem, function () {
            // one 指只绑定一次，添加off是为了防止显示隐藏点击过快的情况
            $elem.off(transition.end).one(transition.end, function () {
                $elem.data('status', 'shown').trigger("shown");
            });
            $elem.show();
            setTimeout(function () {
                $elem.removeClass(className);
            }, 20);
        });

    };
    css3._hide = function ($elem, className) {
        hide($elem, function () {
            $elem.off(transition.end).one(transition.end, function () {
                $elem.hide();
                $elem.data('status', 'hidden').trigger("hidden");
            });
            $elem.addClass(className);
        });

    };

    // js的显示隐藏
    var js = {
        fade: {
            init: function ($elem) {
                js._init($elem);
            },
            show: function ($elem) {
                js._show($elem, "fadeIn");


            },
            hide: function ($elem) {
                js._hide($elem, "fadeOut");
            }
        },
        slideUpDown: {
            init: function ($elem) {
                js._init($elem);
            },
            show: function ($elem) {
                js._show($elem, "slideDown")

            },
            hide: function ($elem) {
                js._hide($elem, "slideUp");
            }
        },
        slideLeftRight: {
            init: function ($elem) {
                js._customInit($elem, {
                    "width": 0,
                    "padding-left": 0,
                    "padding-right": 0
                });

            },
            show: function ($elem) {

                js._customShow($elem)


            },
            hide: function ($elem) {
                js._customHide($elem, {
                    "width": 0,
                    "padding-left": 0,
                    "padding-right": 0
                });
            }
        },
        fadeSlideUpDown: {
            init: function ($elem) {

                js._customInit($elem, {
                    "opacity": 0,
                    "height": 0,
                    "padding-top": 0,
                    "padding-bottom": 0
                });

            },
            show: function ($elem) {
                js._customShow($elem);

            },
            hide: function ($elem) {
                js._customHide($elem, {
                    "opacity": 0,
                    "height": 0,
                    "padding-top": 0,
                    "padding-bottom": 0
                });

            }
        },
        fadeSlideLeftRight: {
            init: function ($elem) {
                js._customInit($elem, {
                    "opacity": 0,
                    "width": 0,
                    "padding-left": 0,
                    "padding-right": 0
                });

            },
            show: function ($elem) {
                js._customShow($elem);

            },
            hide: function ($elem) {
                js._customHide($elem, {
                    "opacity": 0,
                    "width": 0,
                    "padding-left": 0,
                    "padding-right": 0
                });
            }
        }
    };
    // js 的第二层封装
    js._init = function ($elem, hiddenCallback) {
        // 清除 transition 类
        $elem.removeClass("transition");
        init($elem);

        if (typeof hiddenCallback === "function") {
            hiddenCallback();
        }
    };
    js._show = function ($elem, mode) {
        show($elem, function () {
            // 因为 mode 是字符串，所以必须使用[]的形式
            $elem.stop()[mode](function () {
                $elem.data('status', 'shown').trigger("shown");
            });
        });
    };
    js._hide = function ($elem, mode) {
        hide($elem, function () {
            // 因为 mode 是字符串，所以必须使用[]的形式
            $elem.stop()[mode](function () {
                $elem.data('status', 'hidden').trigger("hidden");
            });
        });
    };
    // 自定义动画的封装
    js._customInit = function ($elem, options) {
        var styles = {};

        for (var p in options) {
            styles[p] = $elem.css(p);
        }
        // 保存styles
        $elem.data("styles", styles);

        js._init($elem, function () {
            $elem.css(options);
        });

    };
    js._customShow = function ($elem) {
        show($elem, function () {

            $elem.show();
            $elem.stop().animate($elem.data("styles"), function () {
                $elem.data("status", "shown").trigger("shown");
            });
        });
    };
    js._customHide = function ($elem, options) {
        hide($elem, function () {
            $elem.stop().animate(options, function () {
                $elem.hide();
                $elem.data("status", "hidden").trigger("hidden");
            });
        });
    };

    // 默认配置
    var defaults = {
        css3: false,
        js: false,
        animation: "fade"
    };

    function showHide($elem, options) {
        var mode = null;

        if (options.css3 && transition.isSupport) {
            // css3 transition
            mode = css3[options.animation] || css3[defaults.animation];

        } else if (options.js) {
            //js animation
            mode = js[options.animation] || js[defaults.animation];
        } else {
            // silent no-animation
            mode = silent;
        }

        // 返回mode 的对象供内部调用
        mode.init($elem);
        return {
            show: $.proxy(mode.show, this, $elem),
            hide: $.proxy(mode.hide, this, $elem)
        }
    }

    $.fn.extend({
        showHide: function (option) {
            return this.each(function () {
                var $this = $(this),
                    // 合并对象
                    options = $.extend({}, defaults, typeof option === "object" && option),
                    mode = $this.data("showHide");
                if (!mode) {
                    $this.data("showHide", mode = showHide($this, options));
                }

                if (typeof mode[option] === "function") {
                    mode[option]();
                }
            });
        }
    });
})(jQuery);