;(function($) {
    $.fn.metroMenu = function(parent, params) {
        var $this = $(this);

        var defaults = {
        };

        params = $.extend(defaults, params);

        if (this.length > 1) {
            this.each(function() { $(this).metroMenu(params); });

            return this;
        }

        var initialize = function() {
            $this.addClass('metro-menu');

            $('<li class="metro-menu-reverse"></li>').appendTo($this).click(function() {
                parent.data('metro').reverse();
            });

            $('<li class="metro-menu-scroll"></li>').metroScrollBar($this, {}).appendTo($this).scroll(function(x, scale) {
                parent.data('metro').gotoPosition(x, scale);
            });

            $('<li class="metro-menu-forward"></li>').appendTo($this).click(function() {
                parent.data('metro').forward();
            });

            $this.data('metro', $this);

            return $this;
        };

        $this.scrollBar = function() {
            return $this.children('.metro-menu-scroll').data('metro');
        };

        $this.param = function(key) {
            return params[key];
        };

        $this.update = function($section) {
            var position = $section.data('metro').scrollPosition();

            $this.scrollBar().set(position.x, position.scale);
        };

        return initialize();
    };
})($);
