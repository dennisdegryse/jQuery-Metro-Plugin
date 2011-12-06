(function( jQuery ) {
	$.widget('metro._metroScrollBar', {
		version : '@VERSION',
		
		options : {
			scroll : null
		},

		_create : function() {
			var self = this;
			
			this._lockMove = false;
			this.element
				.addClass('metro-scrollbar');
				
			$('<span class="metro-scrollbar-handle"></span>')
				.appendTo(this.element)
				.draggable({
					axis : 'x', 
					containment: 'parent', 
					drag : function(event, ui) {
						var percentage =  ui.position.left / (self.element.width() - $(this).width());

						self._getLabel().css({ left : ui.position.left });
						self.element.trigger('scroll', percentage);
					},
					start : function(event, ui) {
						self._lockMove = true;
						self._getLabel().fadeIn();
					},
					stop : function(event, ui) {
						self._getLabel().fadeOut();
						self._lockMove = false;
					}});
			
			$('<span class="metro-scrollbar-label"></span>')
				.appendTo(this.element)
				.hide();
		},

		_getHandle : function() {
			return this.element.children('.metro-scrollbar-handle');
		},

		_getLabel : function() {
			return this.element.children('.metro-scrollbar-label');
		},

		move : function(percentage) {
			if (this._lockMove === true)
				return;
			
			var handle = this._getHandle();
			var position = percentage * (this.element.width() - handle.width());

			handle
				.stop(true, false)
				.animate({ left : position });
		},
		
		label : function(text) {
			if (text === undefined)
				return this._getLabel().text();
			
			this._getLabel().text(text);
		}
	});
})( jQuery );