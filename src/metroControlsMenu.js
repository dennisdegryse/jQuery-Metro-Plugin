(function( jQuery ) {
	$.widget('dede._metroControlsMenu', {
		version : '@VERSION',
		
		options : {
		},

		_create : function() {
			var self = this;
			
			this.element.addClass('dede-metro-menu');

			$('<li class="dede-metro-menu-head"></li>')
				.appendTo(this.element)
				.click(function(event) {
					self.element.parent().metro('pos', 'head');
				});

			$('<li class="dede-metro-menu-reverse"></li>')
				.appendTo(this.element)
				.click(function(event) {
					self.element.parent().metro('reverse');
				});

			$('<li class="dede-metro-menu-scroll"></li>')
				.labeledScrollbar({})
				.appendTo(this.element)
				.bind('scroll', function(event, x) {
					self._getMetro().metro('pos', x);
				});

			$('<li class="dede-metro-menu-forward"></li>')
				.appendTo(this.element)
				.click(function(event) {
					self.element.parent().metro('forward');
				});

			$('<li class="dede-metro-menu-tail"></li>')
				.appendTo(this.element)
				.click(function(event) {
					self.element.parent().metro('pos', 'tail');
				});
		},
		
		destroy : {
			/* TODO */
		},
		
		_getMetro : function() {
			return this.element.parents('.dede-metro').first();
		},
		
		_getScrollBar : function() {
			return this.element.children('.dede-metro-menu-scroll');
		},

		/**
		 * Get or set the state of the control menu
		 * 
		 * @param state	The state to set (if supplied)
		 * @returns 	The current state (if no parameter is supplied)
		 */
		state : function(state) {
			var scrollBar = this._getScrollBar();
			
			// GET
			if (state === undefined)
				return {
					x: scrollBar.labeledScrollbar('pos'),
					label: scrollBar.labeledScrollbar('label')};

			// SET
			scrollBar.labeledScrollbar('pos', state.x);
			scrollBar.labeledScrollbar('label', state.label);
		}
	});
})( jQuery );