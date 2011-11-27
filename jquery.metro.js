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
        var items = [];
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

        var drawItem = function(item) {
            var $item = $('<div class="metro-item"></div>');
            var page = null;

            $item.append(item.view);
            $item.data('record', item.record);

            while (!fitsInCanvas(pencil.x, pencil.y, item.format.width, item.format.height)) {
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

            pages[page].push($item);

            if (page != cursor)
                $item.addClass('outside');
            else
                $item.addClass('inside');

            $item.css({
              width : (item.format.width * options.size + (item.format.width - 1) * options.spacing) + 'px',
              height : (item.format.height * options.size + (item.format.height - 1) * options.spacing) + 'px',
              left : (pencil.x * (options.size + options.spacing)) + 'px',
             'top' : (pencil.y * (options.size + options.spacing)) + 'px'
            });
            $item.hide().appendTo($container).fadeIn(1500);

            occupyCanvas(pencil.x, pencil.y, item.format.width, item.format.height);
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
            var lastItem = null;
        
            if (items.length > 0)
                lastItem = items[items.length - 1].record;
        
            params.source.fetch(lastItem, options.chunkSize);
        };
        
        var shift = function(newCursor) {
            if (newCursor < 0 || newCursor >= pagesCount)
                return;

            $.each(pages[cursor], function(i, item) {
                item.addClass('outside');
            });

            cursor = newCursor;

            if (!pages[cursor + 5])
                loadChunk();

            $.each(pages[cursor], function(i, item) {
                item.removeClass('outside');
            });

            $container.animate({left : (options.offset.x - cursor * options.dimensions.x * (options.size + options.spacing)) + 'px'});
        };

        $this.getOptions = function() {
            return options;
        };

        $this.getVisibleRecords = function() {
            var records = [];

            $.each(pages[cursor], function(i, item) {
                records.push(item.data('record'));
            });

            return records;
        };

        $this.itemAdded = function(record) {
            var format = params.formatter(record);
            var item = { 
              record : record, 
              format : format, 
              view : params.viewer(record, format, $this)
            };

            items.push(item);
            drawItem(item);
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

    this.fetch = function(pivotItem, count) {
        $.getJSON(url.replace('{count}', count), { pivot : pivotItem }, function(data) {
            $.each(data, function(i, record) {
                $.each($this.listeners, function(i, listener) {
                    listener.itemAdded(record);
                });
            });
        });
    };
};
