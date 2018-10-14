// 针对slider 中的 slide 方式作出修改
// 将轮播图中的图片成队列排列，操控 容器的坐标
(function ($) {
    "use strict";

    var LEFT= -1;
    var RIGHT = 1;

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

    Slider.DEAFAULTS = {
        css3: false,
        js: false,
        animation: "fade", // slide
        activeIndex: 0,
        interval: 0,
        loop: false
    };

    Slider.prototype._init = function () {
        // init show
        this.$indicators.removeClass("slider-indicator-active");
        this.$indicators.eq(this.curIndex).addClass("slider-indicator-active");

        // 切换到
        if (this.options.animation === "slide") {
            // slide
            this.$elem.addClass("slider-slide");

            this.to = this._slide;
            this.$container = this.$elem.find(".slider-container");
            this.itemWidth = this.$items.eq(0).width();
            this.$container.css("left", -1 * this.curIndex * this.itemWidth);
            // move init
            this.$container.move(this.options);

            // 若开启首尾相连
            if(this.options.loop){
                this.$container.append(this.$items.eq(0).clone());
                this.transitionClass = this.$container.hasClass("transition")?"transition":"";
                this.itemNum ++;
            }
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
            self.to(self._getCorrectIndex(self.curIndex - 1),RIGHT);
        }).on("click", ".slider-control-right", function () {
            self.to(self._getCorrectIndex(self.curIndex + 1),LEFT);
        }).on("click", ".slider-indicator", function () {
            self.to(self._getCorrectIndex(self.$indicators.index(this)));
        });

        // auto
        if (this.options.interval && !isNaN(Number(this.options.interval))) {
            this.$elem.hover($.proxy(this.pause, this), $.proxy(this.auto, this))
            this.auto();
        }


    };

    Slider.prototype._getCorrectIndex = function (index,maxNum) {
        maxNum = maxNum || this.itemNum;
        if (isNaN(Number(index))) {
            return 0;
        }
        if (index < 0) {
            return maxNum - 1;
        } else if (index > maxNum - 1) {
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
        this.$container.move("toX", -1 * index * this.itemWidth);
        this.curIndex = index;

        var self = this;
        if(this.options.loop && direction){
            if(direction < 0){
                // 向右 right
                if(index === 0){
                    this.$container.removeClass(this.transitionClass).css("left",0);
                    this.curIndex = index = 1;

                    setTimeout(function () {

                        self.$container.addClass(self.transitionClass).move("toX", -1 * index * self.itemWidth);
                    },20);
                }
            }else{
                // 向左 left
                // 向右 right
                if(index === this.itemNum - 1){
                    this.$container.removeClass(this.transitionClass).css("left",self.itemWidth * index * -1);
                    this.curIndex = index = this.itemNum - 2;

                    setTimeout(function () {

                        self.$container.addClass(self.transitionClass).move("toX", -1 * index * self.itemWidth);
                    },20);
                }
            }
            index = this._getCorrectIndex(index,this.itemNum - 1);
        }
        //激活indicator
        this._activateIndicators(index);


    };
    // 自动切换
    Slider.prototype.auto = function () {

        var self = this;
        this.intervalId = setInterval(function () {
            self.to(self._getCorrectIndex(self.curIndex + 1),LEFT);
        }, self.options.interval);
    };
    Slider.prototype.pause = function () {
        clearInterval(this.intervalId);
    };
    //激活indicator
    Slider.prototype._activateIndicators = function (index) {
        // this.$indicators.eq(this.curIndex).removeClass("slider-indicator-active");
        this.$indicators.removeClass("slider-indicator-active");
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