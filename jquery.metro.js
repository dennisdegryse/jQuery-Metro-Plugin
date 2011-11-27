;(function($) {
    $.fn.metro = function(params) {
        params = $.extend({ source: null, formatter: null, viewer: null, size: 150, spacing: 10, chunkSize: 150 }, params);

        if (this.length > 1) {
            this.each(function() { $(this).metro(params); });

            return this;
        }
            
        var $this = $(this);
        var $container = $('<div class="metro-container"></div>');
        var $navigatorForward = $('<button class="metro-navigator forward"></button>');
        var $navigatorReverse = $('<button class="metro-navigator reverse"></button>');
        var tiles = [];
        var pagesCount = 0;
        var pages = {};
        var cursor = 0;
        var pencil = { x : 0, y : 0 };
        var canvas = [];
        var options = {
          offset : { x : 0, y : 0 },
          size : params.size,
          spacing : params.spacing,
          dimensions : { x : 0, y : 0 },
          chunkSize : params.chunkSize
        };

        var initialize = function() {
            $this.empty();
            $this.addClass('metro');
            $this.append($container);
            $this.append($navigatorForward);
            $this.append($navigatorReverse);

            options.dimensions.y = Math.floor(($this.height() - options.size / 2) / (options.size + options.spacing));
            options.dimensions.x = Math.floor(($this.width() - 3 * options.size) / (options.size + options.spacing));
            options.offset.x = Math.floor(($this.width() - options.dimensions.x * (options.size + options.spacing)) / 2); 
            options.offset.y = Math.floor(($this.height() - options.dimensions.y * (options.size + options.spacing)) / 2);

            $container.css({
              left : options.offset.x + 'px',
             'top' : options.offset.y + 'px',
            });

            $navigatorReverse.click($this.reverse);
            $navigatorReverse.css({
              left : '0px',
              width : options.offset.x + 'px',
            });

            $navigatorForward.click($this.forward);
            $navigatorForward.css({
              left : ($this.width() - options.offset.x) + 'px',
              width : options.offset.x + 'px',
            });

            params.source.listeners.push($this);
            clearCanvas();
            loadChunk();

            return $this;
        };

        var drawTile = function(tile) {
            var $tile = $('<div class="metro-tile"></div>');
            var page = null;

            $tile.append(tile.view);
            $tile.data('record', tile.record);

            while (!fitsInCanvas(pencil.x, pencil.y, tile.format.width, tile.format.height)) {
                pencil.y++;

                if (pencil.y == options.dimensions.y) {
                    pencil.y = 0;
                    pencil.x++;
        
                    if (pencil.x % options.dimensions.x == 0)
                        clearCanvas();
                }
            }

            page = Math.floor(pencil.x / options.dimensions.x);

            if (page >= pagesCount) {
                pagesCount++;
                pages[page] = [];
            }

            pages[page].push($tile);

            if (page != cursor)
                $tile.addClass('outsight');

            $tile.css({
              width : (tile.format.width * options.size + (tile.format.width - 1) * options.spacing) + 'px',
              height : (tile.format.height * options.size + (tile.format.height - 1) * options.spacing) + 'px',
              left : (pencil.x * (options.size + options.spacing)) + 'px',
             'top' : (pencil.y * (options.size + options.spacing)) + 'px'
            });
            $tile.appendTo($container);

            occupyCanvas(pencil.x, pencil.y, tile.format.width, tile.format.height);
        };

        var clearCanvas = function() {
            canvas = [];

            for (var i = 0; i < options.dimensions.y; i++)
                for (var j = 0; j < options.dimensions.x; j++)
                    canvas.push(false);
        };

        var occupyCanvas = function(x1, y1, width, height) {
            for (var y = y1; y < y1 + height; y++)
                for (var x = x1; x < x1 + width; x++)
                    canvas[(y * options.dimensions.x + x) % (options.dimensions.x * options.dimensions.y)] = true;
        };

        var fitsInCanvas = function(x1, y1, width, height) {
            if (y1 + height > options.dimensions.y)
                return false;

            if (Math.floor(x1 / options.dimensions.x) < Math.floor((x1 + width - 1) / options.dimensions.x))
                return false;

            for (var y = y1; y < y1 + height; y++)
                for (var x = x1; x < x1 + width; x++)
                    if (canvas[(y * options.dimensions.x + x) % (options.dimensions.x * options.dimensions.y)])
                        return false;

            return true;
        };

        var loadChunk = function() {
            var lastRecord = null;
        
            if (tiles.length > 0)
                lastRecord = tiles[tiles.length - 1].record;
        
            params.source.fetch(lastRecord, options.chunkSize);
        };
        
        var shift = function(newCursor) {
            if (newCursor < 0 || newCursor >= pagesCount)
                return;

            $.each(pages[cursor], function(i, tile) {
                tile.addClass('outsight');
            });

            cursor = newCursor;

            if (!pages[cursor + 5])
                loadChunk();

            $.each(pages[cursor], function(i, tile) {
                tile.removeClass('outsight');
            });

            $container.animate({left : (options.offset.x - cursor * options.dimensions.x * (options.size + options.spacing)) + 'px'});
        };

        $this.getOptions = function() {
            return options;
        };

        $this.getVisibleRecords = function() {
            var records = [];

            $.each(pages[cursor], function(i, tile) {
                records.push(tile.data('record'));
            });

            return records;
        };

        $this.tileAdded = function(record) {
            var format = params.formatter(record);
            var tile = { 
              record : record, 
              format : format, 
              view : params.viewer(record, format, $this)
            };

            tiles.push(tile);
            drawTile(tile);
        };

        $this.forward = function() {
            shift(cursor + 1);
        };

        $this.reverse = function() {
            shift(cursor - 1);
        };

        return initialize();
    };
})($);

var AjaxMetroSource = function(url) {
    var $this = this;

    this.listeners = [];

    this.fetch = function(pivotRecord, count) {
        $.getJSON(url, { count : count, pivot : pivotRecord }, function(data) {
            $.each(data, function(i, record) {
                $.each($this.listeners, function(i, listener) {
                    listener.tileAdded(record);
                });
            });
        });
    };
};
