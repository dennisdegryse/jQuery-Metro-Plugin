(function( jQuery ) {
    $.widget('dede._metroTileGroup', {
        options : {
        	size: 150,
        	spacing: 10
        },

        _create : function() {
        	var self = this;
        	
        	this.options = $.extend(this.options, this.element.markupParams(this.options));
        	this._canvas = [];
        	this._pencil = {
        		x : 0,
        		y : 0
        	};
        	
            this.element
            	.addClass('dede-metro-tile-group')
            	.attr('data-label', this.options.label);
            
            this.element.children().each(function() {
            	var tile = $(this)
            		._metroTile({
						size : self.options.size,
						spacing : self.options.spacing });
            		
            	self.putTile(tile);
            });

            $('<li class="dede-metro-tile-group-label"></li>')
            	.prependTo(this.element);
            
            // UGLY!
            this.label(this.label());
        },
        
        destroy : function() {
        	// TODO
        },
        
        _getSection : function() {
        	return this.element.parents('.dede-metro-section').first();
        },
        
        _getLabel : function() {
        	return this.element.children('.dede-metro-tile-group-label');
        },
        
        _advancePencil : function() {
            this._pencil.y++;

            if (this._pencil.y == this._getSection()._metroSection('getHeight')) {
            	this._pencil.y = 0;
                this._pencil.x++;
            }
        },

        _tryFitTile : function(tile) {
        	var sectionHeight = this._getSection()._metroSection('getHeight');
        	var tileDimensions = {
        		width : tile._metroTile('option', 'width'),
        		height : tile._metroTile('option', 'height')
        	};
        	
            if (this._pencil.y + tileDimensions.height > sectionHeight)
                return false;

            while (this._canvas.length < (this._pencil.x + tileDimensions.width) * sectionHeight)
                this._expandCanvas();

            for (var x = 0; x < tileDimensions.width; x++)
                for (var y = 0; y < tileDimensions.height; y++)
                    if (this._canvas[(this._pencil.x + x) * sectionHeight + this._pencil.y + y])
                        return false;

            for (var x = 0; x < tileDimensions.width; x++)
                for (var y = 0; y < tileDimensions.height; y++)
                    this._canvas[(this._pencil.x + x) * sectionHeight + this._pencil.y + y] = true;

            return true;
        },

        _expandCanvas : function() {
            for (var i = 0; i < this._getSection()._metroSection('getHeight'); i++)
                this._canvas.push(false);
        },

		/**
		 * Get or set the label of the group
		 * 
		 * @param text		The label text to set (if specified)
		 * @param return 	The label text (if no parameter is specified)
		 */
		label : function(text) {
			// GET
			if (text === undefined)
				return this.element.attr('data-label');
			
			// SET
			this.element.attr('data-label', text);
			this._getLabel().text(text);
		},
		
		/**
		 * Get the size (number of horizontal tile units) of the tile group 
		 * 
		 * @returns		The number of horizontal tile units
		 */
        size : function() {
            return this._canvas.length / this._getSection()._metroSection('getHeight');
        },

        /**
         * Put a new tile
         * 
         * @param tile	The tile to put
         */
        putTile : function(tile) {
            var position = null;
            var o = this.options;

            if (position = tile.attr('data-x'))
                this._pencil.x = parseInt(position, 10);

            if (position = tile.attr('data-y'))
                this._pencil.y = parseInt(position, 10);

            while (!this._tryFitTile(tile))
                this._advancePencil();
        	
            tile
            	.appendTo(this.element)
            	.css({
            		left : this._pencil.x * (o.size + o.spacing),
            		top : this._pencil.y * (o.size + o.spacing)});
        }
    });
})( jQuery );