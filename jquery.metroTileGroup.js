;(function($) {
    $.fn.metroTileGroup = function(parent, params) {
        var $this = $(this);

        if (this.length > 1) {
            this.each(function() { $(this).metroTileGroup(parent, params); });

            return this;
        }

        var defaults = {
          label : null,
          size: parent.param('size'),
          spacing: parent.param('spacing'),
        };

        params = $.extend(defaults, params);
        params = $.extend(params, $this.markupParams(params));

        var canvas = [];
        var pencil = {
          x : 0,
          y : 0
        };

        var initialize = function() {
            $this.addClass('metro-tile-group').attr('data-label', params.label);
            $this.children().each(function() {
                $tile = $(this).metroTile($this, {});
                $this.putTile($tile);
            });

            $('<li class="metro-tile-group-label"></li>').prependTo($this).text(params.label);
            $this.data('metro', $this);

            return $this;
        };

        var fetchData = function() {
            var requestParams = {
                pivot : null,
                count : params.chunkSize
            };

            $.getJSON(params.source, requestParams, function(data) {
                $.each(data, function(i, record) {
                    var size = params.formatter(record);
                    var $tile = $('<li></li>').metroTile($this, { record : record, width : size.width, height : size.height });

                    putTile($tile);
                });
            });
        };

        var advancePencil = function() {
            pencil.y++;

            if (pencil.y == parent.dimensions().height) {
                pencil.y = 0;
                pencil.x++;
            }
        };

        var tryFitTile = function($tile) {
            if (pencil.y + $tile.unitHeight() > parent.dimensions().height)
                return false;

            while (canvas.length < (pencil.x + $tile.unitWidth()) * parent.dimensions().height)
                expandCanvas();

            for (var x = 0; x < $tile.unitWidth(); x++)
                for (var y = 0; y < $tile.unitHeight(); y++)
                    if (canvas[(pencil.x + x) * parent.dimensions().height + pencil.y + y])
                        return false;

            for (var x = 0; x < $tile.unitWidth(); x++)
                for (var y = 0; y < $tile.unitHeight(); y++)
                    canvas[(pencil.x + x) * parent.dimensions().height + pencil.y + y] = true;

            return true;
        };

        var expandCanvas = function() {
            for (var i = 0; i < parent.dimensions().height; i++)
                canvas.push(false);
        };

        $this.size = function() {
            return canvas.length / parent.dimensions().height;
        };

        $this.putTile = function($tile) {
            var position = null;

            if (position = $tile.attr('data-x'))
                pencil.x = parseInt(position, 10);

            if (position = $tile.attr('data-y'))
                pencil.y = parseInt(position, 10);

            while (!tryFitTile($tile))
                advancePencil();

            $tile.css({
              left : pencil.x * (params.size + params.spacing),
              top : pencil.y * (params.size + params.spacing)
            });

            $tile.appendTo($this);
        };

        $this.param = function(key) {
            return params[key];
        };

        return initialize();
    };
})($);
