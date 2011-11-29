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

            $('<button class="metro-navigator forward"></button>').width(params.size + 'px').click(function() { $this.forward(); }).appendTo($this);
            $('<button class="metro-navigator reverse"></button>').width(params.size + 'px').click(function() { $this.reverse(); }).appendTo($this);

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

                    $this.groups(group).data('metro').putTile($tile);
                });
            });
        };

        var move = function(position) {
            var original = $this.container().position().left;
            var diff = Math.abs(original - position);

            $this.container().animate({ left : position + 'px' }, 0.4 * diff);
        };

        var reorderGroups = function() {
            var position = 0;
            var count = 0;

            $this.groups().each(function() {
                $(this).css({
                   left : position * (params.size + params.spacing) + count * params.groupSpacing + 'px',
                   top : '0px'
                });

                position += $(this).data('metro').size();
                count++;
            });
        };

        var addGroup = function(key) {
            var $group = $('<ul></ul>').metroTileGroup($this, { label : key }).appendTo($this.container());

            reorderGroups();

            return $group;
        };

        $this.dimensions = function() {
            return dimensions;
        };

        $this.container = function() {
            return $this.children('.metro-tile-container');
        };

        $this.groups = function(key) {
            var $result = $this.container().children('.metro-tile-group');

            if (key === undefined)
                return $result;

            $result = $result.filter('[data-label="' + key + '"]');

            if ($result.length == 0)
                $result = addGroup(key);

            return $result;
        };

        $this.param = function(key) {
            return params[key];
        };

        $this.forward = function() {
            var size = 0;
            var step = dimensions.width * (params.size + params.spacing);

            $this.groups().each(function() {
                size += $(this).data('metro').size() * (params.size + params.spacing) + params.groupSpacing;
            });

            move(Math.max($this.container().position().left - step, offset.x - size + step));
        };

        $this.reverse = function() {
            move(Math.min($this.container().position().left + dimensions.width * (params.size + params.spacing), offset.x));
        };

        return initialize();
    };
})($);
