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

            alert(options.dimensions.x + ', ' + options.dimensions.y);

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

        var drawTile = function(record, format, $view) {
            var $tile = $('<div class="metro-tile"></div>');
            var page = null;

            $tile.append($view);

            while (!fitsInCanvas(pencil.x, pencil.y, format.width, format.height)) {
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
              width : (format.width * options.size + (format.width - 1) * options.spacing) + 'px',
              height : (format.height * options.size + (format.height - 1) * options.spacing) + 'px',
              left : (pencil.x * (options.size + options.spacing)) + 'px',
              'top' : (pencil.y * (options.size + options.spacing)) + 'px'
            });

            $tile.appendTo($container);
            $tile.data('record', record);

            occupyCanvas(pencil.x, pencil.y, format.width, format.height);
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
            var lastPage = null;
            var lastRecord = null;
        
            if (pagesCount > 0) {
                lastPage = pages[pagesCount - 1];
                lastRecord = lastPage[lastPage.length - 1].data('record');
            }

            params.source.fetch(lastRecord, options.chunkSize);
        };
        
        var shift = function(newCursor) {
            if (newCursor < 0 || newCursor >= pagesCount)
                return;

            $.each(pages[cursor], function(i, $tile) {
                $tile.addClass('outsight');
            });

            cursor = newCursor;

            if (!pages[cursor + 5])
                loadChunk();

            $.each(pages[cursor], function(i, $tile) {
                $tile.removeClass('outsight');
            });

            $container.animate({left : (options.offset.x - cursor * options.dimensions.x * (options.size + options.spacing)) + 'px'});
        };

        $this.getOptions = function() {
            return options;
        };

        $this.getVisibleRecords = function() {
            var records = [];

            $.each(pages[cursor], function(i, $tile) {
                records.push($tile.data('record'));
            });

            return records;
        };

        $this.tileAdded = function(record) {
            var format = params.formatter(record);
            var $view = params.viewer(record, format, $this);

            drawTile(record, format, $view);
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
                $.each($this.listeners, function(j, listener) {
                    listener.tileAdded(record);
                });
            });
        });
    };
};
