(function($){
	'use strict';

	// 面向对象，构造函数形式
	function Dropdown($elem,options){

        this.$elem = $elem;
		this.options = options;
		this.$layer = this.$elem.find(".dropdown-layer");
        this.activeClass = options.active + "-active";

		this._init();
	}

    Dropdown.DEFAULTS = {
        event: "hover",	// click
        css3: false,
        js: false,
        animation: "fade",
        delay: 0,
        active: "dropdown"
    };
	// 内部初始化方法
	Dropdown.prototype._init = function(){
        this.$layer.showHide(this.options);
        var self = this;
        this.$layer.on("show shown hide hidden",function(e){
            self.$elem.trigger("dropdown-"+e.type);
        });


        if(this.options.event === "click"){
            this.$elem.on("click",function(e){
                self.show();
                // 阻止冒泡
                e.stopPropagation();
            });
            $(document).on("click",$.proxy(this.hide,this));
        }else{
            this.$elem.hover($.proxy(this.show,this),$.proxy(this.hide,this));

        }
	};
	// 两个行为方法
	Dropdown.prototype.show = function(){
		var self = this;
		// 延迟展示，节约性能
		if(this.options.delay){

            this.timer = setTimeout(function () {
                _show();
            },this.options.delay);
		}else{
            _show();
		}

		// 内部执行函数
		function _show(){
            self.$elem.addClass(self.activeClass);
            self.$layer.showHide("show");
		}

	};
	Dropdown.prototype.hide = function(){
		// 清除定时器
        if(this.options.delay){
        	clearTimeout(this.timer);
		}

        this.$elem.removeClass(this.activeClass);
        this.$layer.showHide("hide");
	};

	// 插件形式
	$.fn.extend({
		dropdown:function(option){
			// dropdown 为单例模式，防止创建浪费
			// options 最后一个为短路写法，判断传入的是否为一个对象

			var	options = $.extend({},Dropdown.DEFAULTS,$(this).data(),typeof option === "object" && option);
			return this.each(function(){
                var $this = $(this),
                    dropdown = $this.data("dropdown");
				if(!dropdown){
					// first time
                    $this.data("dropdown",dropdown = new Dropdown($this,options));
				}

				// 暴露出 show 和 hide 方法，供使用者调用
				if(typeof dropdown[option] === "function"){
                    dropdown[option]();
				}
			});
		}
	});
})(jQuery);