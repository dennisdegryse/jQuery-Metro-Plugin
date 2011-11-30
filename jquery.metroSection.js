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
