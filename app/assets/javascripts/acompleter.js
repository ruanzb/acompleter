
// plugin
//
(function( $ ) {

	$.fn.acompleter = function( options ) {
		var opts = $.extend($.fn.acompleter.defaults, options);
		
		return this.each( function() {
			/**
			 * Skip non-inputs
			 */
			if ( !this.tagName || this.tagName.toUpperCase() !== 'INPUT' ) {
				return true;
			}
			var $this = $(this);
			var acompleter = new Acompleter($this, opts);
			
			/**
			 * Attach keyboard monitoring to input
			 */
			$this.keydown(function(e) {
				switch(e.keyCode) {
			        case 40: // down arrow
			        case 38: // up arrow
						e.preventDefault();
						console.log('up|down arrow');
			            /*
						if (!this.scroll_timeout) {
			                this.scroll_timeout = setTimeout(function() {p.scroll_timeout = null;}, p.scroll_delay);
			                this.moveHighlight( key == 40 ? 1 : -1 );
			                return true;
			            }
						*/
						// TODO: wait for scroll delay and start scrolling
			            break;

			        // enter
			        case 13:
						console.log('enter');
			            //return !this.selectHighlighted();
			            break;

			        // escape
			        case 27:
						console.log('escape');
						// TODO: hide list
		                //this.hideList();
		                //return false;
			            break;

					// ignore navigational and special keys
					//
			        case 37: case 39:    // left, right arrows
			        case 34: case 33:    // pg up, pg down
			        case 35: case 36:    // home, end
					case 91: case 93:            // left command, right command
			        case 16: case 17: case 18:   // shift, ctrl, alt
			        case 9: case 20:    // tab, capslock
			        	// no reaction
						console.log('no reaction');
			            break;


			        default:
						acompleter.activate();
						console.log('default', e.keyCode);
			            break;            
			    } // switch
			}); // $this.keydown
		}); // this.each
	} // fn.acompleter 
		
	$.fn.acompleter.defaults =  {
		delay: 400, // specifies the amount of time to wait for displaying data between each key press
        url: '/kladr/list.json?query=',
        remoteDataType: 'json',
        loadingClass: 'loading',
        resultsClass: 'results',
        onError: undefined,

		_dummy: 'just to be last item'
	};
		
	var Acompleter = function($elem, options) {
		var self = this;
		
		this.$elem = $elem;
        this.$results = null;
		this.options = options;
		this.keyTimeout_ = null;


		this.activate = function() {
			if (this.keyTimeout_) {
				clearTimeout(this.keyTimeout_);
			}
			this.keyTimeout_ = setTimeout(function() {
				self.activateNow();
			}, this.options.delay);
		}; // this.activate

		this.activateNow = function() {
			// TODO: prepare value, check necessary to update
			var value = this.$elem.val();
			this.fetchData(value);
		}; // this.activateNow
		
		this.fetchData = function(value) {
			var data = this.cacheRead(value);
			if (data) {
				this.processResults(value, data);
			} else {
				var self = this;
				var ajaxCallback = function(data) {
	                if (data !== false) {
	                    self.cacheWrite(value, data);
	                }
                    self.$elem.removeClass(self.options.loadingClass);
                    self.processResults(value, data);
                };

				this.$elem.addClass(this.options.loadingClass);
				$.ajax({
					url: this.makeUrl(value),
					success: ajaxCallback,
					error: function(jqXHR, textStatus, errorThrown) {
						if ($.isFunction(self.options.onError)) {
							self.options.onError(jqXHR, textStatus, errorThrown);
						} else {
							ajaxCallback(false);
						}
					},
					dataType: self.options.remoteDataType
				});
			}
		}; // fetchData
		
        this.makeUrl = function(value) {
            return this.options.url + value;
        }; // makeUrl
        
        this.processResults = function(value, data) {
             // save processed value
             // save loaded data
             // call showResults
             this.lastProcessedValue_ = value;
             this.results = data;
             if (data.length) {
                 this.showResults();
             } else {
                 this.hideResults();
             }
        }; // processResults

		this.showResults = function() {
            if (!this.$results) {
                this.createList();
            } else {
                this.rebuildList();
            }
            this.showList();
		}; // showResults

        this.hideResults = function() {
            console.log('hideResults');
        };

        this.createList = function() {
            this.$results = $('<div></div>').hide().addClass(options.resultsClass).css({ position: 'absolute' });

            (function(self) {
                var $ul = $('<ul></ul>');
                for(var i=0; i < self.results.length; i++) {
                    var item = self.createListItem(self.results[i]);
                    $ul.append(item);
                }
                self.$results.append($ul);
            })(this);

            $('body').append(this.$results);
        }; // createList
        
        this.createListItem = function(result) {
            return $('<li></li>', {
                text: result.name
            });
        }; // createListItem

        this.rebuildList = function() {
            console.log('rebuildList');
        }; // rebuildList

        this.showList = function() {
            // Always recalculate position since window size or
            // input element location may have changed.
            var position = this.$elem.offset();
            position.top += this.$elem.outerHeight();
            position.minWidth = this.$elem.outerWidth() - (this.$results.outerWidth() - this.$results.width());

            this.$results
                .css(position)
                .show();
        }; // showList



        
        this.cacheRead = function(value) {
            return false;
        }; // cacheRead

        this.cacheWrite = function(value, data) {
            return false;
        }; // cacheWrite



	}; // var Acompleter

})(jQuery);
