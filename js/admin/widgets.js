jQuery( document ).ready( function( $ ) {
	"use strict";
	var $body = $( 'body' );


	var vidiho_pro_initialize_widget = function ( widget_el ) {
		vidiho_pro_repeating_sortable_init( widget_el );
		vidiho_pro_colorpicker_init( widget_el );
		vidiho_pro_alpha_colorpicker_init( widget_el );
		vidiho_pro_collapsible_init( widget_el );
	};

	vidiho_pro_initialize_widget();

	function vidiho_pro_on_customizer_widget_form_update( e, widget_el ) {
		vidiho_pro_initialize_widget( widget_el );
	}
	// Widget init doesn't occur for some reason, when added through the customizer. Therefore the event handler below is needed.
	// https://make.wordpress.org/core/2014/04/17/live-widget-previews-widget-management-in-the-customizer-in-wordpress-3-9/
	// 'widget-added' is complemented by 'widget-updated'. However, alpha-color-picker shows multiple alpha channel
	// pickers if called on 'widget-updated'
	// $( document ).on( 'widget-updated', vidiho_pro_on_customizer_widget_form_update );
	$( document ).on( 'widget-added', vidiho_pro_on_customizer_widget_form_update );


	// Widget Actions on Save
	$( document ).ajaxSuccess( function( e, xhr, options ) {
		if ( options.data.search( 'action=save-widget' ) != -1 ) {
			var widget_id;

			if ( ( widget_id = options.data.match( /widget-id=(ci-.*?-\d+)\b/ ) ) !== null ) {
				var widget = $( "input[name='widget-id'][value='" + widget_id[1] + "']" ).parent();
				vidiho_pro_initialize_widget( widget );
			}
		}
	} );


	$body.on( 'click', '.ci-collapsible legend', function() {
		var arrow = $( this ).find( 'i' );
		if ( arrow.hasClass( 'dashicons-arrow-down' ) ) {
			arrow.removeClass( 'dashicons-arrow-down' ).addClass( 'dashicons-arrow-right' );
			$( this ).siblings( '.elements' ).slideUp();
		} else {
			arrow.removeClass( 'dashicons-arrow-right' ).addClass( 'dashicons-arrow-down' );
			$( this ).siblings( '.elements' ).slideDown();
		}
	} );


	// CI Home Post Type Items widget
	$body.on( 'change', '.ci-repeating-fields .posts_dropdown', function() {
		$( this ).parent().data( 'value', $( this ).val() );
	} );

	$body.on( 'change', ':has(input.id_base[value="ci-home-post-type-items"]) .vidiho-pro-post-type-select', function() {
		var widget = $( this ).parent().parent();
		var field_post_type = $( this );
		var ajax_posts = field_post_type.parent().data( 'ajaxposts' );

		$.ajax({
			type: 'post',
			url: ThemeWidget.ajaxurl,
			data: {
				action        : ajax_posts,
				post_type_name: field_post_type.val(),
				name_field    : field_post_type.attr( 'name' )
			},
			dataType: 'text',
			beforeSend: function() {
				widget.find( '.post-field' ).addClass( 'loading' );
				widget.find( '.ci-repeating-fields .posts_dropdown' ).prop( 'disabled', 'disabled' ).css( 'opacity', '0.5' );
			},
			success: function( response ) {
				var selects = widget.find( '.ci-repeating-fields .posts_dropdown' );
				if ( response != '' ) {
					selects.html( response );
					selects.each( function(){
						$( this ).val( $( this ).parent().data( 'value' ) );
					} );
					selects.removeAttr( 'disabled' ).css( 'opacity', '1' );
				} else {
					selects.html( '' ).prop( 'disabled', 'disabled' ).css( 'opacity', '0.5' );
				}

				widget.find( '.post-field' ).removeClass( 'loading' );
			}
		});

	});

});

var vidiho_pro_collapsible_init = function( selector ) {
	if ( selector === undefined ) {
		jQuery( '.ci-collapsible .elements' ).hide();
		jQuery( '.ci-collapsible legend i' ).removeClass( 'dashicons-arrow-down' ).addClass( 'dashicons-arrow-right' );
	} else {
		jQuery( '.ci-collapsible .elements', selector ).hide();
		jQuery( '.ci-collapsible legend i', selector ).removeClass( 'dashicons-arrow-down' ).addClass( 'dashicons-arrow-right' );
	}
};

var vidiho_pro_alpha_colorpicker_init = function( selector ) {
	if ( selector === undefined ) {
		var vidiho_pro_AlphaColorPicker = jQuery( '#widgets-right .vidiho-pro-alpha-color-picker, #wp_inactive_widgets .vidiho-pro-alpha-color-picker' ).filter( function() {
			return !jQuery( this ).parents( '.field-prototype' ).length;
		} );

		vidiho_pro_AlphaColorPicker.alphaColorPicker();
	} else {
		jQuery( '.vidiho-pro-alpha-color-picker', selector ).alphaColorPicker();
	}
};

var vidiho_pro_colorpicker_init = function( selector ) {
	if ( selector === undefined ) {
		var vidiho_pro_ColorPicker = jQuery( '#widgets-right .vidiho-pro-color-picker, #wp_inactive_widgets .vidiho-pro-color-picker' ).filter( function() {
			return !jQuery( this ).parents( '.field-prototype' ).length;
		} );

		// The use of throttle was taken by: https://wordpress.stackexchange.com/questions/5515/update-widget-form-after-drag-and-drop-wp-save-bug/212676#212676
		vidiho_pro_ColorPicker.each( function() {
			jQuery( this ).wpColorPicker( {
				change: _.throttle( function () {
					jQuery( this ).trigger( 'change' );
				}, 1000, { leading: false } )
			} );
		} );
	} else {
		jQuery( '.vidiho-pro-color-picker', selector ).each( function() {
			jQuery( this ).wpColorPicker( {
				change: _.throttle( function () {
					jQuery( this ).trigger( 'change' );
				}, 1000, { leading: false } )
			} );
		} );
	}
};
