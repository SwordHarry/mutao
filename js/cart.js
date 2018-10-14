(function ($) {
    "use strict";

    function Cart($elem,options){

        this.$elem = $elem;
        this.options = options;
        this.$layer = this.$elem.find(".dropdown-layer");
        // 购物车的商品
        this.itemList = [];

        this._init();
    }

    Cart.DEFAULTS = {
        url: "data/cart-itemList.json",
        event: "hover",	// click
        css3: false,
        js: false,
        animation: "fade",
        delay: 0,
        active: "dropdown"
    };

    // 初始化的时候继承 dropdown?
    Cart.prototype._init = function(){
        this.$elem.dropdown(this.options);
        var self = this;
        this.$elem.on("hover",$.proxy(this.getData(),this));

        this.$layer.on("show shown hide hidden",function(e){
            if(self.itemList.length != 0){
                self.$elem.trigger("cart-"+e.type,[self.itemList]);
            }
        });
    };
    Cart.prototype.show = function(){
        var self = this;
        // 延迟展示，节约性能
        if(this.options.delay){

            this.timer = setTimeout(function () {
                this.getData();
                _show();
            },this.options.delay);
        }else{
            this.getData();
            _show();
        }

        // 内部执行函数
        function _show(){
            self.$elem.addClass(self.activeClass);
            self.$layer.showHide("show");
        }
    };

    // 获取购物车资源
    Cart.prototype.getData = function(){
        var self = this;
        $.getJSON(this.options.url,function (data) {

            self.itemList = data;
        });
    }
    // 购物车添加资源
    Cart.prototype.setData = function(item){
        this.itemList.push(item);
    }

    // 生成购物车面板
    Cart.prototype.appendLayer = function(html){

        this.$layer.html(html);
    };
    // 展示提示层
    Cart.prototype.showLayer = function () {
        this.$layer.showHide("show");
    };
    // 隐藏提示层
    Cart.prototype.hideLayer = function () {
        this.$layer.showHide("hide");
    };

    // 插件形式
    $.fn.extend({
        cart:function(option, val){
            // dropdown 为单例模式，防止创建浪费
            // options 最后一个为短路写法，判断传入的是否为一个对象

            var	options = $.extend({},Cart.DEFAULTS,$(this).data(),typeof option === "object" && option);
            return this.each(function(){
                var $this = $(this),
                    cart = $this.data("cart");
                if(!cart){
                    // first time
                    $this.data("cart",cart = new Cart($this,options));
                }

                // 暴露出 show 和 hide 方法，供使用者调用
                if(typeof cart[option] === "function"){
                    cart[option](val);
                }
            });
        }
    });
})(jQuery);