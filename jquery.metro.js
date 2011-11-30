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
