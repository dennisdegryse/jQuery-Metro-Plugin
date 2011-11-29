;(function($) {
    $.fn.metro = function(params) {
        var $this = $(this);

        var defaults = {
          viewer : null,
          formatter : null,
          grouper : null,
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
            $this.gotoSection($sections.first().attr('data-label'));

            return $this;
        };

        $this.param = function(key) {
            return params[key];
        };

        $this.sections = function() {
            return $this.children('.metro-section');
        };

        $this.gotoSection = function(label) {
            var $sections = $this.sections();
            var $activeSection = $sections.filter('.active');
            var $section = $sections.filter('[data-label="' + label + '"]');
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
        };

        $this.forward = function() {
            $this.sections().filter('.active').data('metro').forward();
        };

        $this.reverse = function() {
            $this.sections().filter('.active').data('metro').reverse();
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
