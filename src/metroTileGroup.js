(function( jQuery ) {
    $.widget('metro._metroTileGroup', {
        options : {
        	label : null,
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
            	.addClass('metro-tile-group')
            	.attr('data-label', this.options.label);
            
            this.element.children().each(function() {
            	var tile = $(this)
            		._metroTile({
						size : self.options.size,
						spacing : self.options.spacing });
            		
            	self.putTile(tile);
            });

            $('<li class="metro-tile-group-label"></li>')
            	.prependTo(this.element)
            	.text(this.options.label);
        },
        
        destroy : function() {
        	// TODO
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
        
        _getSection : function() {
        	return this.element.parents('.metro-section').first();
        },

        _expandCanvas : function() {
            for (var i = 0; i < this._getSection()._metroSection('getHeight'); i++)
                this._canvas.push(false);
        },

        size : function() {
            return this._canvas.length / this._getSection()._metroSection('getHeight');
        },

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