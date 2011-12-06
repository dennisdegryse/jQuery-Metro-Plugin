(function( jQuery ) {
	$.widget('dede._metroSection', {
		options : {
		  size: 150,
		  spacing: 10,
		  groupSpacing: 100,
		  source : null,
		  formatter : null,
		  grouper : null,
		  viewer : null
		},

		_create : function() {
			this.options = $.extend(this.options, this.element.markupParams(this.options));
			
			var o = this.options;
			var self = this;
			var metro = this._getMetro();
			
			this._dimensions = {
				width : Math.floor((metro.width() - 2 * o.size) / (o.size + o.spacing)),
				height : Math.floor((metro.height() - o.size) / (o.size + o.spacing))
			};
			
			this._offset = {
				x : (metro.width() - this._dimensions.width * (o.size + o.spacing)) / 2,
				y : (metro.height() - this._dimensions.height * (o.size + o.spacing)) / 2
			};
				  
			this.element
				.addClass('dede-metro-section');

			var container = $('<div class="dede-metro-tile-container"></div>')
				.appendTo(this.element)
				.draggable({ axis : 'x' })
				.css({
					left : 0,
					top : this._offset.y,
					width : 1 })
				.on('drag', 
					function(event) {
						var x = -self._getContainer().position().left / self._calcScale();
						
						self.element.trigger('moved', { x : x, label : self.getActiveGroup(x)._metroTileGroup('label') });
					});

			this.element.children('ul').each(function(){
				$(this)
					.appendTo(container)
					._metroTileGroup({ 
						label : $(this).attr('data-label'),
						size : o.size,
						spacing : o.spacing });
			});
			
			this._reorderGroups();

			if (o.source)
				this._fetchData();
		},

		_getMetro : function() {
			return this.element.parents('.dede-metro').first();
		},

		_getContainer : function() {
			return this.element.children('.dede-metro-tile-container');
		},
		
		_getGroups : function(label) {
			var groups = this._getContainer().children('.dede-metro-tile-group');

			if (label !== undefined) {
				groups = groups.filter('[data-label="' + label + '"]');
			
				if (groups.length == 0)
					groups = this._addGroup(label);
			}

			return groups;
		},

		_fetchData : function() {
			var self = this;
			
			$.getJSON(this.options.source, function(data) {
				$.each(data, function(i, record) {
					var size = self.options.formatter(record);
					var group = self.options.grouper(record);
					var tile = $('<li></li>')
						._metroTile({ 
							record : record, 
							width : size.width, 
							height : size.height,
							viewer : self.options.viewer,
							size : self.options.size,
							spacing : self.options.spacing });

					self._getGroups(group)
						._metroTileGroup('putTile', tile);

					self._reorderGroups();
				});
			});
		},

		_move : function(position) {
			var x = -position / this._calcScale();
			var container = this._getContainer();
			var original = container.position().left;
			var diff = Math.abs(original - position);

			if (diff > 100)
				container
					.stop(true, false)
					.animate({ left : position }, Math.min(0.4 * diff, 1200));
			else
				container
					.css({ left : position });
			
			this.element.trigger('moved', { x : x, label : this.getActiveGroup(x)._metroTileGroup('label') } );
		},

		_reorderGroups : function() {
			var self = this;
			var position = 0;
			var count = 0;

			this._getGroups().each(function() {
				$(this).css({
				   left : self._offset.x + position * (self.options.size + self.options.spacing) + count * self.options.groupSpacing,
				   top : 0
				});

				position += $(this)._metroTileGroup('size');
				count++;
			});

			this._getContainer()
				.width(this._calcSize())
				.draggable('option', 'containment', [ - this._calcScale(), 0, 0, 0 ]);
		},

		_addGroup : function(label) {
			return $('<ul></ul>')
				.appendTo(this._getContainer())
				._metroTileGroup({ 
					label : label,
					size : this.options.size,
					spacing : this.options.spacing });
		},

		_calcSize : function() {
			var self = this;
			var size = 2 * this._offset.x;
			var groups = this._getGroups();

			groups.each(function() {
				size += $(this)._metroTileGroup('size') * (self.options.size + self.options.spacing);
			});

			size += this.options.groupSpacing * (groups.length - 1);

			return size;
		},

		_calcScale : function() {
			return this._calcSize() - this._getMetro().width();
		},
		
		/**
		 * Get or set the label of the section
		 * 
		 * @param text		The label text to set (if specified)
		 * @param return 	The label text (if no parameter is specified)
		 */
		label : function(text) {
			if (text === undefined)
				return this.element.attr('data-label');
			
			this.element.attr('data-label', text);
		},
		
		/**
		 * Get the group that is currently visible to the user or the group that would be visible given a position.
		 * 
		 * @param position	The position (optional)
		 * @returns			The group that is visible to the user
		 */
		getActiveGroup : function(position) {
			var group = null;
			var self = this;
			
			if (position === undefined)
				position = -this.position().left;
			else 
				position *= this._calcScale();
			
			this._getGroups().each(function() {
				var left = $(this).position().left;
				
				if (group === null || left - self._offset.x < position)
					group = $(this);
			});
			
			return group;
		},
		
		/**
		 * Get the number of tile units in the vertical direction
		 * 
		 * @returns	The number of tile units
		 */
		getHeight : function() {
			return this._dimensions.height;
		},

		/**
		 * Get or set the position
		 * 
		 * @param percentage	The position in % to set (if supplied)
		 * @returns				The current position in % (if no parameter is supplied)
		 */
		pos : function(position) {
			// GET
			if (position === undefined)
				return - this._getContainer().position().left / this._calcScale();
			
			// SET
			this._move(- this._calcScale() * position);
		},
		
		/**
		 * Shift an amount of pages in a certain direction (forward: positive, reverse: negative)
		 * 
		 * @param delta	The amount of pages to shift
		 */
		shiftPage : function(delta) {
			var size = this._calcScale();
			var target = Math.min(0, Math.max(this._getContainer().position().left - delta * this._dimensions.width * (this.options.size + this.options.spacing), -size));

			this._move(target);
		}
	});
})( jQuery );