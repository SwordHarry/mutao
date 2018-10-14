// slider 1.0
// 分别操控图片的坐标
(function ($) {
    "use strict";

    function Slider($elem, options) {

        this.$elem = $elem;
        this.options = options;

        this.$items = this.$elem.find(".slider-item");
        this.$indicators = this.$elem.find(".slider-indicator");

        this.$controls = this.$elem.find(".slider-control");

        this.itemNum = this.$items.length;
        this.curIndex = this._getCorrectIndex(this.options.activeIndex);
        this._init();
    }

    var LEFT = 1;
    var RIGHT = -1;

    Slider.DEAFAULTS = {
        css3: false,
        js: false,
        animation: "fade", // slide
        activeIndex: 0,
        interval: 0
    };

    Slider.prototype._init = function () {
        // init show
        this.$indicators.removeClass("slider-indicator-active");
        this.$indicators.eq(this.curIndex).addClass("slider-indicator-active");
        this.$elem.trigger("slider-show",[this.curIndex,this.$items[this.curIndex]]);

        // 切换到
        if (this.options.animation === "slide") {
            // slide
            // send message : slider
            this.$items.on("move moved", function (e) {
                var index = self.$items.index(this);

                if (e.type === "move") {
                    if (index === self.curIndex) {
                        self.$elem.trigger("slider-hide", [index, this]);
                    } else {
                        self.$elem.trigger("slider-show", [index, this]);
                    }
                } else {
                    // moved
                    // 指定的
                    if (index === self.curIndex) {
                        self.$elem.trigger("slider-shown", [index, this]);
                    } else {
                        self.$elem.trigger("slider-hidden", [index, this]);
                    }
                }
                self.$elem.trigger("slider-" + e.type, [self.$items.index(this), this])
            });

            this.$elem.addClass("slider-slide");
            this.$items.eq(this.curIndex).css("left", 0);

            this.itemWidth = this.$items.eq(0).width();

            // move init
            this.$items.move(this.options);
            this.transitionClass = this.$items.eq(0).hasClass("transition") ? "transition" : "";
            this.to = this._slide;
        } else {
            //fade
            // send message : fade
            this.$items.on("show shown hide hidden", function (e) {
                self.$elem.trigger("slider-" + e.type, [self.$items.index(this), this]);
            });

            this.$elem.addClass("slider-fade");
            this.$items.eq(this.curIndex).show();

            // showHide init
            this.$items.showHide(this.options);
            this.to = this._fade;
        }

        var self = this;
        // bind event
        this.$elem.hover(function () {
            self.$controls.show();
        }, function () {
            self.$controls.hide();
        }).on("click", ".slider-control-left", function () {
            self.to(self._getCorrectIndex(self.curIndex - 1), LEFT);
        }).on("click", ".slider-control-right", function () {
            self.to(self._getCorrectIndex(self.curIndex + 1), RIGHT);
        }).on("click", ".slider-indicator", function () {
            self.to(self._getCorrectIndex(self.$indicators.index(this)));
        });

        // auto
        if (this.options.interval && !isNaN(Number(this.options.interval))) {
            this.$elem.hover($.proxy(this.pause, this), $.proxy(this.auto, this))
            this.auto();
        }


    };

    Slider.prototype._getCorrectIndex = function (index) {
        if (isNaN(Number(index))) {
            return 0;
        }
        if (index < 0) {
            return this.itemNum - 1;
        } else if (index > this.itemNum - 1) {
            return 0;
        } else {
            return index;
        }

    };

    // 切换方式
    Slider.prototype._fade = function (index) {
        if (this.curIndex === index)
            return;

        this.$items.eq(this.curIndex).showHide("hide");
        this.$items.eq(index).showHide("show");

        this._activateIndicators(index);


        this.curIndex = index;

    };
    Slider.prototype._slide = function (index, direction) {
        if (this.curIndex === index)
            return;

        // 1.确定滑入滑出的方向
        if (!direction) {
            // click indicators
            if (this.curIndex < index) {
                direction = RIGHT;
            } else if (this.curIndex > index) {
                direction = LEFT;
            }
        }

        // 2.设置指定滑入幻灯片的初始位置
        this.$items.eq(index).removeClass(this.transitionClass).css("left", -1 * direction * this.itemWidth);

        // 3.当前幻灯片滑出可视区域，指定幻灯片划入可视区域
        var self = this;
        setTimeout(function () {
            self.$items.eq(self.curIndex).move("toX", direction * self.itemWidth);
            self.$items.eq(index).addClass(self.transitionClass).move("toX", 0);
            self.curIndex = index;
        }, 20);


        //激活indicator
        this._activateIndicators(index);

    };
    // 自动切换
    Slider.prototype.auto = function () {

        var self = this;
        this.intervalId = setInterval(function () {
            self.to(self._getCorrectIndex(self.curIndex + 1), RIGHT);
        }, self.options.interval);
    };
    Slider.prototype.pause = function () {
        clearInterval(this.intervalId);
    };
    //激活indicator
    Slider.prototype._activateIndicators = function(index){
        this.$indicators.eq(this.curIndex).removeClass("slider-indicator-active");
        this.$indicators.eq(index).addClass("slider-indicator-active");
    };

    // 注册插件
    $.fn.extend({
        slider: function (option) {
            var options = $.extend({}, Slider.DEFAULTS, $(this).data(), typeof option === "object" && option);
            return this.each(function () {
                var $this = $(this),
                    slider = $this.data("slider");
                if (!slider) {
                    // first time
                    $this.data("slider", slider = new Slider($this, options));
                }

                // 暴露出 show 和 hide 方法，供使用者调用
                if (typeof slider[option] === "function") {
                    slider[option]();
                }
            });
        }
    });

})(jQuery);