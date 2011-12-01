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
            $this.addClass('metro-section')

            var $container = $('<div class="metro-tile-container"></div>').css({
              left : '0px',
              top : offset.y + 'px',
              width: '1px'
            }).draggable({
              axis: 'x',
            }).appendTo($this).on('drag', function() { updateScrollBar(); });

            $this.children('ul').metroTileGroup($this, {}).appendTo($container);
            reorderGroups();

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

                    reorderGroups();
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
                   left : offset.x + position * (params.size + params.spacing) + count * params.groupSpacing + 'px',
                   top : '0px'
                });

                position += $group.size();
                count++;
            });

            $this.container().width(calcSize()).draggable('option', 'containment', [ -calcScale(), 0, 0, 0 ]);
        };

        var addGroup = function(key) {
            var $group = $('<ul></ul>').metroTileGroup($this, { label : key }).appendTo($this.container());

            return $group;
        };

        var calcSize = function() {
            var size = 2 * offset.x;
            var $groups = $this.groups();

            $.each($groups, function(i, $group) {
                size += $group.size() * (params.size + params.spacing);
            });

            size += params.groupSpacing * ($groups.length - 1);

            return size;
        };

        var calcScale = function() {
            return calcSize() - parent.width();
        };

        var updateScrollBar = function(position) {
            if (position === undefined)
                position = -$this.container().position().left;

            parent.menu().scrollBar().set(position, calcScale());
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
              x : - $this.container().position().left
            };
        };

        $this.param = function(key) {
            return params[key];
        };

        $this.forward = function() {
            var size = calcScale();
            var target = Math.max($this.container().position().left - dimensions.width * (params.size + params.spacing), -size);

            move(target);
            updateScrollBar(-target);
        };

        $this.reverse = function() {
            var target = Math.min($this.container().position().left + dimensions.width * (params.size + params.spacing), 0);

            move(target);
            updateScrollBar(-target);
        };

        $this.gotoPosition = function(position, scale) {
            var size = calcScale();

            move(- size / scale * position);
        };

        return initialize();
    };
})($);
