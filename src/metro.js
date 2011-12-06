(function( jQuery ) {
	$.widget('metro.metro', {
		version : "@VERSION",
	
		options : {
			viewer : null,
			formatter : null,
			grouper : null,
			controlsMenu : true,
			size : 150,
			spacing : 10
		},

		_create : function() {
			var o = this.options;
			var self = this;
			var sections = this.element.children('section');
	
			this.element
				.addClass('metro');

			if (o.controlsMenu)
				$('<menu></menu>')
					._metroControlsMenu({})
					.appendTo(this.element);
			
			sections
				._metroSection({
					  formatter : o.formatter,
					  grouper : o.grouper,
					  viewer : o.viewer })
				.css('left', this.element.width())
				.on('moved', function(event, position) {
					self._getControlsMenu()
						._metroControlsMenu('update', position.x, position.label);
				});

			this.gotoSection(sections.first().attr('data-label'));
		},
	
		destroy : function() {
			// TODO
		},

		_getSections : function(label) {
			var sections = this.element.children('.metro-section');
	
			if (label !== undefined)
				return sections.filter('[data-label="' + label + '"]');
	
			return sections;
		},			

		_getControlsMenu : function() {
			return this.element.children('.metro-menu');
		},

		_getActiveSection : function() {
			return this._getSections().filter('.active');
		},

		gotoSection : function(label) {
			var activeSection = this._getActiveSection();
			var section = this._getSections(label);
			var position = this.element.width();
			var speed = position * 0.3;

			if (activeSection) {
				if (activeSection.is(section))
					return;

				if (activeSection.index() < section.index())
					position *= -1;

				activeSection.removeClass('active').animate({
					left : position
				}, speed);
			}

			section.addClass('active').css('left', -position).animate({
				left : 0
			}, speed);
	
			this._getControlsMenu()
				._metroControlsMenu('update', section._metroSection('getPosition'));
		},

		gotoPosition : function(position, scale) {
			this._getActiveSection()._metroSection('gotoPosition', position);
		},

		gotoHead : function() {
			this._getActiveSection()._metroSection('gotoPosition', 0);
		},

		gotoTail : function() {
			this._getActiveSection()._metroSection('gotoPosition', 1);
		},

		forward : function() {
			this._getActiveSection()._metroSection('shiftPage', 1);
		},

		reverse : function() {
			this._getActiveSection()._metroSection('shiftPage', -1);
		}
	});
})( jQuery );