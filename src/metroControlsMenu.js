(function( jQuery ) {
	$.widget('metro._metroControlsMenu', {
		version : '@VERSION',
		
		options : {
		},

		_create : function() {
			var self = this;
			
			this.element.addClass('metro-menu');

			$('<li class="metro-menu-reverse"></li>')
				.appendTo(this.element)
				.click(function(event) {
					self.element.parent().metro('reverse');
				});

			$('<li class="metro-menu-scroll"></li>')
				._metroScrollBar({})
				.appendTo(this.element)
				.bind('scroll', function(event, x) {
					self._getMetro().metro('gotoPosition', x);
				});

			$('<li class="metro-menu-forward"></li>')
				.appendTo(this.element)
				.click(function(event) {
					self.element.parent().metro('forward');
				});
		},
		
		destroy : {
			/* TODO */
		},
		
		_getMetro : function() {
			return this.element.parents('.metro').first();
		},
		
		_getScrollBar : function() {
			return this.element.children('.metro-menu-scroll');
		},

		update : function(position) {
			this._getScrollBar()._metroScrollBar('move', position);
		}
	});
})( jQuery );