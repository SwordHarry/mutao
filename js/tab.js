(function($){

    function Tab($elem,options){
        this.$elem = $elem;
        this.options = options;

        this.$items = this.$elem.find(".tab-item");
        this.$panels = this.$elem.find(".tab-panel");

        this.itemNum = this.$items.length;
        this.curIndex = this._getCorrectIndex(this.options.activeIndex);

        this._init();
    }

    Tab.DEFAULTS = {
        event: "mouseenter",// click
        css3: false,
        js: false,
        animation: "fade",
        activeIndex: 0,
        interval: 0,
        delay: 500
    };

    Tab.prototype._init = function(){
        // init show
        this.$items.removeClass("tab-item-active");
        this.$items.eq(this.curIndex).addClass("tab-item-active");
        this.$panels.eq(this.curIndex).show();
        this.$elem.trigger("tab-show",[this.curIndex,this.$panels[this.curIndex]])

        // showHide init
        this.$panels.showHide(this.options);

        // bind event
        this.options.event = this.options.event === "click" ? "click":"mouseenter";
        var self = this,
            timer = null;
        this.$elem.on(this.options.event,".tab-item",function(){
            var elem = this;

            // 延迟切换
            if(self.options.delay){
                clearTimeout(timer);
                timer = setTimeout(function(){
                    self.toggle(self.$items.index(elem));
                },self.options.delay);
            }else{
                self.toggle(self.$items.index(this));
            }

        });

        // trigger event
        this.$panels.on("show shown hide hidden",function(e){
            self.$elem.trigger("tab-"+e.type,[self.$panels.index(this),this]);
        });

        // auto
        if(this.options.interval && !isNaN(Number(this.options.interval))){
            this.$elem.hover($.proxy(this.pause(),this),$.proxy(this.auto,this));
            this.auto();
        }
    };

    Tab.prototype._getCorrectIndex = function (index) {
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

    Tab.prototype.toggle = function(index){
        if(this.curIndex === index) return;

        this.$panels.eq(this.curIndex).showHide("hide");
        this.$panels.eq(index).showHide("show");

        this.$items.eq(this.curIndex).removeClass("tab-item-active");
        this.$items.eq(index).addClass("tab-item-active");

        this.curIndex = index;
    };

    // 自动切换
    Tab.prototype.auto = function () {

        var self = this;
        this.intervalId = setInterval(function () {
            self.toggle(self._getCorrectIndex(self.curIndex + 1));
        }, self.options.interval);
    };
    Tab.prototype.pause = function(){
        clearInterval(this.intervalId);
    };

    // 注册插件
    $.fn.extend({
        tab: function (option) {
            var options = $.extend({}, Tab.DEFAULTS, $(this).data(), typeof option === "object" && option);
            return this.each(function () {
                var $this = $(this),
                    tab = $this.data("tab");
                if (!tab) {
                    // first time
                    $this.data("tab", tab = new Tab($this, options));
                }

                // 暴露出 show 和 hide 方法，供使用者调用
                if (typeof tab[option] === "function") {
                    tab[option]();
                }
            });
        }
    });
})(jQuery);