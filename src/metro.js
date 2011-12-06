(function( jQuery ) {
	$.widget('dede.metro', {
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
				.addClass('dede-metro');

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
						._metroControlsMenu('state', position);
				});

			this.section(sections.first()._metroSection('label'));
		},
	
		destroy : function() {
			// TODO
		},

		_getSections : function(label) {
			var sections = this.element.children('.dede-metro-section');
	
			if (label !== undefined)
				return sections.filter('[data-label="' + label + '"]');
	
			return sections;
		},			

		_getControlsMenu : function() {
			return this.element.children('.dede-metro-menu');
		},

		_getActiveSection : function() {
			return this._getSections().filter('.active');
		},

		/**
		 * Get or set the active section (by label)
		 * 
		 * @param label	The label of the section to navigate to (if specified)
		 * @returns 	The label of the active section (if no parameter is specified)
		 */
		section : function(label) {
			var activeSection = this._getActiveSection();
			
			// GET
			if (label === undefined)
				return activeSection._metroSection('label');
			
			// SET
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
				._metroControlsMenu('state', { x : section._metroSection('pos'), label: label} );
		},

		/**
		 * Get or set the position of the active section
		 * 
		 * @param position		The position (in %|head|tail) to set (if supplied)
		 * @returns				The current position in % (if no parameter is supplied)
		 */
		pos : function(position) {
			// GET
			if (position === undefined)
				return this._getActiveSection()._metroSection('pos');
			
			// SET
			if (position == 'head')
				position = 0;
			
			if (position == 'tail')
				position = 1;
			
			this._getActiveSection()._metroSection('pos', position);
		},

		/**
		 * Move one page forward in the active section
		 */
		forward : function() {
			this._getActiveSection()._metroSection('shiftPage', 1);
		},

		/**
		 * Move one page backward in the active section
		 */
		reverse : function() {
			this._getActiveSection()._metroSection('shiftPage', -1);
		}
	});
})( jQuery );