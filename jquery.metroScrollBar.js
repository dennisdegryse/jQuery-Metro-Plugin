;(function($) {
    $.fn.metroScrollBar = function(parent, params) {
        var $this = $(this);

        var defaults = {
            scroll : null
        };

        params = $.extend(defaults, params);

        if (this.length > 1) {
            this.each(function() { $(this).metroScrollBar(params); });

            return this;
        }

        var initialize = function() {
            $this.addClass('metro-scrollbar');

            $('<span class="metro-scrollbar-handle"></span>').appendTo($this).draggable({
                axis : 'x', 
                containment: 'parent', 
                drag : function(event, ui){
                    params.scroll(ui.position.left, $this.width() - $(this).width());
                }
            });

            $this.data('metro', $this);

            return $this;
        };

        $this.set = function(x, scale) {
            var $handle = $this.handle();
            var target = x / scale * ($this.width() - $handle.width());

            $handle.animate({ left : target + 'px' });

            return $this;
        };

        $this.handle = function() {
            return $this.children('.metro-scrollbar-handle');
        };

        $this.scroll = function(callback) {
            params.scroll = callback;

            return $this;
        };

        $this.param = function(key) {
            return params[key];
        };

        return initialize();
    };
})($);
