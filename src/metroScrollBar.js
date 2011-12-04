(function( jQuery ) {
	$.widget('metro._metroScrollBar', {
		version : '@VERSION',
		
		options : {
			scroll : null
		},

		_create : function() {
			var self = this;
			
			this.element
				.addClass('metro-scrollbar');
				
			$('<span class="metro-scrollbar-handle"></span>')
				.appendTo(this.element)
				.draggable({
					axis : 'x', 
					containment: 'parent', 
					drag : function(event, ui) {
						var percentage =  ui.position.left / (self.element.width() - $(this).width());

						self.element.trigger('scroll', percentage);
					}});
		},

		_getHandle : function() {
			return this.element.children('.metro-scrollbar-handle');
		},

		move : function(percentage) {
			var handle = this._getHandle();
			var position = percentage * (this.element.width() - handle.width());

			handle
				.stop(true, false)
				.animate({ left : position });
		}
	});
})( jQuery );