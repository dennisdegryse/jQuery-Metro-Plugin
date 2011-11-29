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
