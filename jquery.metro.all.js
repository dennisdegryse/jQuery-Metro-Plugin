;(function($) {
    $.fn.markupParams = function(params) {
        var $this = $(this);
        var result = {};

        if (this.length > 1) {
            this.each(function() { $this.markupParams(params); });

            return this;
        }

        $.each(params, function(key, v) {
            var value = $this.attr('data-' + key);
            var intValue = null;

            if (value) {
                intValue = parseInt(value, 10);

                if (isNaN(intValue))
                    result[key] = value;
                else
                    result[key] = intValue;
            }
        });

        return result;
    };
})($);
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
;(function($) {
    $.fn.metroSection = function(parent, params) {
        var $this = $(this);

        if (this.length > 1) {
            this.each(function() { $(this).metroSection(parent, params); });

            return this;
        }

        var defaults = {
          size: 150,
          spacing: 10,
          groupSpacing: 100,
          source : null,
          formatter : parent.param('formatter'),
          grouper : parent.param('grouper'),
          viewer : parent.param('viewer')
        };

        params = $.extend(defaults, params);
        params = $.extend(params, $this.markupParams(params));

        var dimensions = {
          width : Math.floor((parent.width() - 2 * params.size) / (params.size + params.spacing)),
          height : Math.floor((parent.height() - params.size) / (params.size + params.spacing))
        };

        var offset = {
          x : (parent.width() - dimensions.width * (params.size + params.spacing)) / 2,
          y : (parent.height() - dimensions.height * (params.size + params.spacing)) / 2,
        };

        var initialize = function() {
            $this.addClass('metro-section');

            var $container = $('<div class="metro-tile-container"></div>').css({
              left : offset.x + 'px',
              top : offset.y + 'px'
            }).appendTo($this);

            $this.children('ul').metroTileGroup($this, {}).appendTo($container);

            if (params.source)
                fetchData();

            $this.data('metro', $this);

            return $this;
        };

        var fetchData = function() {
            $.getJSON(params.source, function(data) {
                $.each(data, function(i, record) {
                    var size = params.formatter(record);
                    var group = params.grouper(record);
                    var $tile = $('<li></li>').metroTile($this, { record : record, width : size.width, height : size.height });

                    $this.groups(group).putTile($tile);
                });
            });
        };

        var move = function(position) {
            var original = $this.container().position().left;
            var diff = Math.abs(original - position);

            $this.container().stop(true, false);

            if (diff > 200)
                $this.container().animate({ left : position + 'px' }, Math.min(0.4 * diff, 1200));
            else
                $this.container().css({ left : position + 'px' });
        };

        var reorderGroups = function() {
            var position = 0;
            var count = 0;

            $.each($this.groups(), function(i, $group) {
                $group.css({
                   left : position * (params.size + params.spacing) + count * params.groupSpacing + 'px',
                   top : '0px'
                });

                position += $group.size();
                count++;
            });
        };

        var addGroup = function(key) {
            var $group = $('<ul></ul>').metroTileGroup($this, { label : key }).appendTo($this.container());

            reorderGroups();

            return $group;
        };

        var calcSize = function() {
            var size = 0;

            $.each($this.groups(), function(i, $group) {
                size += $group.size() * (params.size + params.spacing) + params.groupSpacing;
            });

            return size;
        };

        var calcColumns = function() {
            var count = 0;

            $.each($this.groups(), function(i, $group) {
                count += $group.size();
            });

            return count;
        };

        var calcColumnPosition = function(index) {
            var position = 0;
            var groups = 0;

            $.each($this.groups(), function(i, $group) {
                position += $group.size();

                if (position < index)
                    groups++;
            });

            return (index - 1) * (params.size + params.spacing) + groups * params.groupSpacing;
        };

        var calcScale = function() {
            return calcSize() - dimensions.width * (params.size + params.spacing);
        };

        $this.dimensions = function() {
            return dimensions;
        };

        $this.container = function() {
            return $this.children('.metro-tile-container');
        };

        $this.groups = function(key) {
            var $groups = $this.container().children('.metro-tile-group');
            var $result = [];

            if (key === undefined)
                $groups.each(function() {
                    $result.push($(this).data('metro'));
                });
            else {
                $result = $groups.filter('[data-label="' + key + '"]').data('metro');

                if (!$result)
                    $result = addGroup(key).data('metro');
            }

            return $result;
        };

        $this.scrollPosition = function() {
            return {
              scale : calcScale(),
              x : offset.x - $this.container().position().left
            };
        };

        $this.param = function(key) {
            return params[key];
        };

        $this.forward = function() {
            var size = calcSize();
            var target = Math.max($this.container().position().left - dimensions.width * (params.size + params.spacing), offset.x - size + dimensions.width * (params.size + params.spacing));

            move(target);
            parent.menu().scrollBar().set(offset.x - target, calcScale());
        };

        $this.reverse = function() {
            var target = Math.min($this.container().position().left + dimensions.width * (params.size + params.spacing), offset.x);

            move(target);
            parent.menu().scrollBar().set(offset.x - target, calcScale());
        };

        $this.gotoPosition = function(position, scale) {
            var size = calcSize() - dimensions.width * (params.size + params.spacing);

            move(offset.x - size/scale*position);
        };

        return initialize();
    };
})($);
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
;(function($) {
    $.fn.metro = function(params) {
        var $this = $(this);

        var defaults = {
          viewer : null,
          formatter : null,
          grouper : null,
          controls : true,
          size: 150,
          spacing: 10,
        };

        params = $.extend(defaults, params);

        if (this.length > 1) {
            this.each(function() { $(this).metro(params); });

            return this;
        }

        var initialize = function() {
            var $sections = $this.children('section');

            $this.addClass('metro');
            $sections.metroSection($this, {}).css('left', $this.width() + 'px');

            if (params.controls)
                $('<menu></menu>').metroMenu($this, {}).appendTo($this);

            $this.gotoSection($sections.first().attr('data-label'));
            $this.data('metro', $this);

            return $this;
        };

        $this.param = function(key) {
            return params[key];
        };

        $this.sections = function(key) {
            var $sections = $this.children('.metro-section');

            if (key !== undefined)
                $sections = $sections.filter('[data-label="' + key + '"]');

            return $sections;
        };

        $this.menu = function() {
            return $this.children('.metro-menu').data('metro');
        };

        $this.activeSection = function() {
            return $this.sections().filter('.active').data('metro');
        };

        $this.gotoSection = function(label) {
            var $activeSection = $this.activeSection();
            var $section = $this.sections(label);
            var position = $this.width();
            var speed = position * 0.3;

            if ($activeSection) {
                if ($activeSection.is($section))
                    return;

                if ($activeSection.index() < $section.index())
                    position *= -1;

                $activeSection.removeClass('active').animate({ left : position + 'px' }, speed);
            }

            $section.addClass('active').css('left', -position + 'px').animate({ left : '0px'}, speed);

            $this.menu().update($section);
        };

        $this.gotoPosition = function(position, scale) {
            $this.activeSection().gotoPosition(position, scale);
        };

        $this.forward = function() {
            $this.activeSection().forward();
        };

        $this.reverse = function() {
            $this.activeSection().reverse();
        };

        return initialize();
    };
})($);
