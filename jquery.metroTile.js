;(function($) {
    $.fn.metroTile = function(parent, params) {
        var $this = $(this);

        if (this.length > 1) {
            this.each(function() { $(this).metroTile(parent, params); });

            return this;
        }

        var defaults = {
          record : null,
          width : 1,
          height : 1,
          viewer : parent.param('viewer')
        };

        params = $.extend(defaults, params);
        params = $.extend(params, $this.markupParams(params));

        var initialize = function() {
            $this.addClass('metro-tile').css({
              width : calcDimension(params.width),
              height : calcDimension(params.height)
            });

            if (params.record)
                $this.append(params.viewer(params.record));

            return $this;
        };

        var calcDimension = function(scalar) {
            return scalar * parent.param('size') + (scalar - 1) * parent.param('spacing');
        };

        $this.unitWidth = function() {
            return params.width;
        };

        $this.unitHeight = function() {
            return params.height;
        };

        return initialize();
    };
})($);
