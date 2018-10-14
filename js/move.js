(function ($) {
    "use strict";

    var transition = window.mt.transition;

    // 封装公共代码
    var init = function ($elem) {
        this.$elem = $elem;
        this.curX = parseFloat(this.$elem.css("left"));
        this.curY = parseFloat(this.$elem.css("top"));
    };
    var to = function (x, y, callback) {
        y = (typeof y === "number") ? y : this.curY;
        x = (typeof x === "number") ? x : this.curX;
        if (this.curX === x && this.curY === y) {
            return;
        }

        this.$elem.trigger("move", [this.$elem]);

        if (typeof callback === "function") {
            callback();
        }

        // update currentIndex
        this.curX = x;
        this.curY = y;

    };

    // silent
    var Silent = function ($elem) {
        init.call(this, $elem);
        this.$elem.removeClass("transition");

    };
    Silent.prototype.to = function (x, y) {

        var self = this;
        to.call(this, x, y, function () {
            self.$elem.css({
                left: x,
                top: y
            });
            self.$elem.trigger("moved", [self.$elem]);
        });
    };
    Silent.prototype.toX = function (x) {
        this.to(x);
    };
    Silent.prototype.toY = function (y) {
        this.to(null, y);
    };

    // css
    var Css3 = function ($elem) {
        init.call(this, $elem);
        this.$elem.addClass("transition");

        // 防止没有定义 left,top
        this.$elem.css({
            left: this.curX,
            top: this.curY
        });
    };
    Css3.prototype.to = function (x, y) {

        var self = this;
        to.call(this, x, y, function () {
            // one 只绑定一次，off 解绑定，防止中途折返情况
            self.$elem.off(transition.end).one(transition.end, function () {
                self.$elem.trigger("moved", [self.$elem]);
            });
            self.$elem.css({
                left: x,
                top: y
            });
        });

    };
    Css3.prototype.toX = function (x) {
        this.to(x);
    };
    Css3.prototype.toY = function (x) {
        this.to(null, y);
    };

    // js
    var Js = function ($elem) {
        init.call(this, $elem);
        this.$elem.removeClass("transition");

    };
    Js.prototype.to = function (x, y) {

        var self = this;
        to.call(this,x,y,function(){
            self.$elem.stop().animate({
                left: x,
                top: y
            }, function () {
                self.$elem.trigger("moved", [self.$elem]);
            });
        });

    };
    Js.prototype.toX = function (x) {
        this.to(x);
    };
    Js.prototype.toY = function (x) {
        this.to(null, y);
    };

    var defaults = {
        css3: false,
        js: false
    };
    var move = function($elem,options){
        var mode = null;

        if(options.css3 && transition.isSupport){
            mode = new Css3($elem);
        }else if(options.js){
            mode = new Js($elem);
        }else{
            mode = new Silent($elem);
        }

        // 返回三个方法
        return {
            to: $.proxy(mode.to,mode),
            toX: $.proxy(mode.toX,mode),
            toY: $.proxy(mode.toY,mode)
        };
    };

    $.fn.extend({
        move: function (option,x,y) {
            var	options = $.extend({},defaults,typeof option === "object" && option);
            return this.each(function(){
                var $this = $(this),
                    mode = $this.data("move");
                if(!mode){
                    // first time
                    $this.data("move",mode = move($this,options));
                }

                // 暴露出 方法，供使用者调用
                if(typeof mode[option] === "function"){
                    mode[option](x,y);
                }
            });
        }
    });

})(jQuery);