//= require application
//= require_tree .
//= require_self

/*
 * GLOBALS
 */
var LiveReload;

var remoteData,
    resultsClassSelector = "." + $.Acompleter._defaults.resultsClass,
    resultsIdSelector = "#" + $.Acompleter._defaults.resultsId,
	remoteUrl = "data.json",
    localData = [ "c++", "Java", "Php", "Coldfusion", "Javascript", "Asp",
                "Ruby", "Python", "C", "Scala", "Groovy", "Haskell", "Perl" ];

$.ajax( remoteUrl, {
    success: function( data ) { remoteData = data; },
    async: false
});


/*
 * Experimental assertion for comparing DOM objects.
 *
 * Serializes an element and some properties and attributes and it's children if any, otherwise the text.
 * Then compares the result using deepEqual.
 */
window.domEqual = function( selector, modifier, message ) {
	var expected, actual,
		properties = [
			"disabled",
			"readOnly"
		],
		attributes = [
			"plugin_acomplete", // acompleter attribute
			"class",
			"href",
			"id",
			"nodeName",
			"role",
			"tabIndex",
			"title"
		];

	function getElementStyles( elem ) {
		var key, len,
			style = elem.ownerDocument.defaultView ?
				elem.ownerDocument.defaultView.getComputedStyle( elem, null ) :
				elem.currentStyle,
			styles = {};

		if ( style && style.length && style[ 0 ] && style[ style[ 0 ] ] ) {
			len = style.length;
			while ( len-- ) {
				key = style[ len ];
				if ( typeof style[ key ] === "string" ) {
					styles[ $.camelCase( key ) ] = style[ key ];
				}
			}
		// support: Opera, IE <9
		} else {
			for ( key in style ) {
				if ( typeof style[ key ] === "string" ) {
					styles[ key ] = style[ key ];
				}
			}
		}

		return styles;
	}

	function extract( elem ) {
		if ( !elem || !elem.length ) {
			QUnit.push( false, actual, expected,
				"domEqual failed, can't extract " + selector + ", message was: " + message );
			return;
		}

		var children,
			result = {};
		$.each( properties, function( index, attr ) {
			var value = elem.prop( attr );
			result[ attr ] = value !== undefined ? value : "";
		});
		$.each( attributes, function( index, attr ) {
			var value = elem.attr( attr );
			result[ attr ] = value !== undefined ? value : "";
		});
		result.style = getElementStyles( elem[ 0 ] );
		result.events = $._data( elem[ 0 ], "events" );
		result.data = $.extend( {}, elem.data() );
		delete result.data[ $.expando ];
		children = elem.children();
		if ( children.length ) {
			result.children = elem.children().map(function() {
				return extract( $( this ) );
			}).get();
		} else {
			result.text = elem.text();
		}
		return result;
	}

	function done() {
		actual = extract( $( selector ) );
		QUnit.push( QUnit.equiv(actual, expected), actual, expected, message );
	}

	// Get current state prior to modifier
	expected = extract( $( selector ) );

	// Run modifier (async or sync), then compare state via done()
	if ( modifier.length ) {
		modifier( done );
	} else {
		modifier();
		done();
	}
};
