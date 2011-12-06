(function( jQuery ) {
    $.widget('dede._metroTile', {
    	options : {
          record : null,
          width : 1,
          height : 1,
          viewer : null,
          size : null,
          spacing : null
        },

        _create : function() {
            this.options = $.extend(this.options, this.element.markupParams(this.options));
            
            var o = this.options;
            
            this.element
            	.addClass('dede-metro-tile')
            	.css({
            		width : this._calcDimension(o.width),
            		height : this._calcDimension(o.height)
            	});

            if (o.record)
                this.element.append(o.viewer(o.record));
        },

        destroy : function() {
        	// TODO
        },
        
        _getSection : function() {
			return this.element.parents('.dede-metro-section').first();
        },
        
        _calcDimension : function(scalar) {
            return scalar * this.options.size + (scalar - 1) * this.options.spacing;
        }
    });
})( jQuery );