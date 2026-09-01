// initialize Foundation
$(document).foundation();
Foundation.lock_sliders = true;
$.fancybox.defaults.loop = true;

var theme_config = $('head').data('theme');

var globalArrowPrev = '<button class="arrow arrow-prev"><i class="sw-icon-left-arrow" aria-hidden="true"></i></button>',
	globalArrowNext = '<button class="arrow arrow-next"><i class="sw-icon-right-arrow" aria-hidden="true"></i></button>',
	verticalArrowPrev = '<button class="arrow v-prev"><i class="sw-icon-up-arrow" aria-hidden="true"></i></button>',
	verticalArrowNext = '<button class="arrow v-next"><i class="sw-icon-down-arrow" aria-hidden="true"></i></button>';

$(function() {

	// initialize home carousel
	$('.home-carousel').each(function(){
		var carousel_auto = $(this).data('autoplay'),
			carousel_speed = $(this).data('speed');

		$(this).slick({
			autoplay: carousel_auto ? true : false,
			autoplaySpeed: carousel_speed,
			prevArrow: globalArrowPrev,
			nextArrow: globalArrowNext,
			dots: false
		});
	});

	$('.featured-slider').on('setPosition init reInit', function() {
		$('.featured-categories-slider').find('.image-container').trigger('update');
	});

	$(".featured-slider").slick({
		prevArrow: '<button class="arrow arrow-prev"><i class="sw-icon-arrow1" aria-hidden="true"></i></button>',
		nextArrow: '<button class="arrow arrow-next"><i class="sw-icon-arrow" aria-hidden="true"></i></button>'
	});

	// define generic sliders
	var productSlider = $('.quartet-slider');

	// initialize generic sliders
	if(productSlider.length) {
		// initialize carousel
		productSlider.slick({
			autoplay: false,
			slidesToShow: 1,
			prevArrow: false,
			nextArrow: '<button class="arrow arrow-next"><i class="sw-icon-arrow" aria-hidden="true"></i></button>'
		});
	}

	// initialize basket
	initializeBasket();

	// initialize checkout form
	initializeCheckoutForm();

	// initialize product options
	initializeProductOptions($('.product-container'));

	// initialize min/max extension
	orderQty();

	// initialize form validation
	validateForms();

	// initialize quick view product options
	quickView();

	// initialize features
	initFeatures();

});

function productPhotos(container) {

	if(!container){
		return
	}

	// define product page thumbnail slider
	var productGallery = container.find('.product-carousel'),
		modalGallery = container.find('.modal-carousel'),
		mainSlider = container.find('.main-image-slider');

	if(modalGallery.length) {
		modalGallery.slick({
			slidesToShow: 1,
			arrows: true,
			prevArrow: globalArrowPrev,
			nextArrow: globalArrowNext
		});
	}

	// initialize product gallery
	if(productGallery.length) {
		var mainImage = container.find('.product-gallery-main-photo img');

		if(productGallery.find('.slide').length) {

			productGallery.on('init', function(event, slick){
				$(document).find('.slick-cloned a').removeAttr('data-fancybox');
			});

			// initialize carousel
			productGallery.slick({
				autoplay: false,
				slidesToShow: 4,
				infinite: true,
				vertical: false,
				prevArrow: globalArrowPrev,
				nextArrow: globalArrowNext,
				responsive: [
					{
						breakpoint: 640,
						settings: {
							slidesToShow: 4,
							vertical: false,
							prevArrow: globalArrowPrev,
							nextArrow: globalArrowNext
						}
					}
				],
			}).on('init, reInit, afterChange', function(e) {
				$(window).trigger('resize');
				$(document).find('.slick-cloned a').removeAttr('data-fancybox');
			});
		}

		// initialize image switching
		productGallery.on('click', '.js-item-image', function(event) {
			productGallery.find('.js-item-image.active').removeClass('active');
			$(this).addClass('active');
			event.preventDefault();
			var _this_index = parseInt($(this).data('idx'));

			if(modalGallery.length) {
				modalGallery.slick('slickGoTo', _this_index);
			}

			if(mainSlider.length) {
				mainSlider.slick('slickGoTo', _this_index);
			}
		});
	}

	mainSlider.on('setPosition init reInit', function() {
		$('.image-container').imageContainer();
		$(window).trigger('resize');
	});


	mainSlider.on('init', function() {
		var prev_dot = '<button class="arrow v-prev"><i class="sw-icon-up-chevron" aria-hidden="true"></i></button>',
			next_dot = '<button class="arrow v-next"><i class="sw-icon-down-chevron" aria-hidden="true"></i></button>',
			dot_container = $(this).find('.slick-dots');

		// custom forward/back arrows before/after nav dots
		if(dot_container.length) {
			dot_container.wrap('<div class="slick-dots-outer"></div>');
			$(document).find('.slick-dots-outer').append(next_dot);
			$(document).find('.slick-dots-outer').prepend(prev_dot);
		}
	});

	mainSlider.slick({
		dots: true,
		vertical: true,
		verticalSwiping: true
	});

	mainSlider.find('.arrow.v-prev').on('click', function() {
		mainSlider.slick('slickPrev');
	});

	mainSlider.find('.arrow.v-next').on('click', function() {
		mainSlider.slick('slickNext');
	});
}


function initFeatures() {

	// set touch classes
	if(('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
		$('body').removeClass('js-no-touch').addClass('js-is-touch');
	} else {
		$('body').removeClass('js-is-touch').addClass('js-no-touch');
	}

	// display platform messages
	$('.shopwired-info-message').infoMessage();

	if($('.product-container').length){
		productPhotos($('.product-container'));
	}

	// initialize collection
	$('.collection-container').productCollection({
		ajaxValue: 'partials/item',
		filterHiddenClass: 'hide',
		containerSelector: '.items-container',
		infinite: false,
		adjacentPageLinks: 3,
		afterLoad: function(data) {
			var result = data.data;

			$('.product-count').text(result.total_products);

			if(result.total_products == 1) {
				$('.product-count-text').text('Product');
			}
			else {
				$('.product-count-text').text('Products');
			}

			Foundation.reInit('equalizer');

			pageLinks();
			$('.image-container').imageContainer();
		}
	});

	$('.basket-item-remove .remove-button').linkWithConfirmation({
		message: 'Are you sure you want to remove this item from your basket?'
	});

	pageLinks();
	CollectionViews();

	// view check
	if (typeof $.cookie('list_view') === 'undefined' && $('.js-grid_view').length){
		$.cookie('list_view', 0, { path: '/' });
		$('.js-grid_view').trigger('click');
	}
	else if ($.cookie('list_view') == 1 && $('.js-list_view').length) {
		$('.js-list_view').trigger('click');
	}

	// age check modal
	var verifyAgeModal = $('#verifyAgeModal');

	if (verifyAgeModal.length && typeof $.cookie('age_verified') === 'undefined' && !theme_config.preview) {
		verifyAgeModal.foundation('open');
		verifyAgeModal.find('.js-confirm').on('click', function(e){
			e.preventDefault();
			$.cookie('age_verified', true, { path: '/' });
			verifyAgeModal.foundation('close');
		});
	}

	// newsletter modal
	var newsletterModal = $('#newsletterModal');

	if (newsletterModal.length && typeof $.cookie('newsletter_modal') === 'undefined' && !theme_config.preview) {
		if ($.cookie('age_verified') || !$('#verifyAgeModal').length) {
			newsletterModal.foundation('open');
			$.cookie('newsletter_modal', true, { path: '/' });
		}
		else {
			verifyAgeModal.on('closed.zf.reveal', function() {
				newsletterModal.foundation('open');
				$.cookie('newsletter_modal', true, { path: '/' });
			});
		}
	}

	// announcement bar
	var announcementBar = $('.announcement-bar'),
		announcementMsg = announcementBar.text();

	if (announcementBar.length) {
		// not dismissed or new message
		if(typeof $.cookie('announcement_dismissed') === 'undefined' || announcementMsg.indexOf($.cookie('announcement_dismissed')) == -1) {
			announcementBar.removeClass('hide');
		}
	}

	$('.announcement-bar-close').on('click', function() {
		$.cookie('announcement_dismissed', announcementMsg, { expires: 14, path: '/' });
	});

	// soft add to basket
	$('.product-soft-add-button').productAddToCanvasBasket({
		countSelector: '.basket-count',
		totalSelector: '.basket-total',
		removeSelector: '.false'
	});
}

// initialize collection view grid / list selection
function CollectionViews(){
	if(!('.collection-controls').length){
		return;
	}
	var control = $('.collection-button'),
		container = $('.items-container'),
		gridClass = container.data('class'),
		a = 'active',
		ww = $(window).width();

	control.on('click', function() {
		var $this = $(this);

		if($this.hasClass('js-list_view') && container.hasClass('list')){
			return;
		}
		if($this.hasClass('js-grid_view') && !container.hasClass('list')){
			return;
		}

		// apply loading state
		container.addClass('loading');
		// highlist active button
		control.removeClass(a);
		$this.addClass(a);

		if($this.hasClass('js-grid_view')){
			container.addClass(gridClass);
			container.removeClass('list');
			initList();
			$.cookie('list_view', 0);
		}

		if($this.hasClass('js-list_view')){
			container.removeClass(gridClass);
			container.addClass('list');
			initList();
			$.cookie('list_view', 1);
		}

		$('.image-container').imageContainer();
	});
	//Set to 0 to enable list view on mobile
	if(ww > 640 && $('.js-grid_view').length) {
		$('.js-grid_view').trigger('click');
	}
}

$(window).resize(CollectionViews);

// apply loading state to AJAX container
function initList() {
	setTimeout(function(){
		$('.items-container').removeClass('loading');
	}, 500);
}

// scroll to top on colection page change
$(document).on('click', '.page-link:not(.current):not(.disabled)', function() {
	$('html, body').animate({ scrollTop: 0 }, 500);
});


function pageLinks(page) {

	$('.image-container').imageContainer();

	if($('.lazy').length) {
		$('.lazy').unveil(0);
	}

	if (!$('.pagination-container').length) {
		return;
	}

	var tPages = $('.collection-container').data('pages'),
		cPage = getParameterByName('page') != null ? getParameterByName('page') : typeof page != 'undefined' ? page : 1;

	$('.pagination .page-link').each(function() {
		var link = $(this);

		if (link.hasClass('hidden')) {
			link.closest('li').hide();
		}
		else {
			link.closest('li').removeAttr('style');
		}
		if(link.data('page') == cPage) {
			link.closest('li').addClass('current-item');
		}
		else {
			link.closest('li').removeClass('current-item');
		}
	});

	// disable prev / next buttons
	if (cPage > 1) {
		$('.pagination-previous a').removeClass('disabled');
	}
	else {
		$('.pagination-previous a').addClass('disabled');
	}
	if (cPage == tPages) {
		$('.pagination-next a').addClass('disabled');
	}
	else {
		$('.pagination-next a').removeClass('disabled');
	}

	$('.image-container').imageContainer();

	initList();
}

function initializeBasket() {
	var form = $('#basket-form'),
		ratesType = form.data('radios'),
		rateSelect = ratesType ? form.find('.rateId') : form.find('select[name="rateId"]'),
		countrySelect = form.find('select[name="countryId"]'),
		postUrl = '/checkout/basket/totals',
		postcodeSelector = 'input.postcode',
		postcodeValidateSelector = '.postcode-validate',
		postcodeContainerSelector = '.postcode-container',
		postcodeContainer = form.find(postcodeContainerSelector),
		postcodeValidate = form.find(postcodeValidateSelector),
		postcode = form.find(postcodeSelector),
		container = form.find('.rates'),
		outerContainer = form.find('.rates-container'),
		deliveryDateSelector = '.delivery-date-outer',
		shipmondoType = form.data('shipmondo'); // set shipmondoType

	if(!countrySelect.length || !rateSelect.length) {
		return;
	}
	else {
		countrySelect.trigger('change');

		var checkPostcode = false,
			showHidePostcode = function(clear) {
				if(!postcodeContainer.length) {
					return;
				}

				if(clear) {
					postcode.val('');
				}

				if(countrySelect.val() == 222) {
					postcodeContainer.show();
				}
				else {
					postcodeContainer.hide();
				}

				if(countrySelect.val() && countrySelect.val() != 222) {
					container.show();
					$(deliveryDateSelector).show();
				}
				else if(postcode.length && rateSelect.val() && postcode.val().length) {
					container.show();
					$(deliveryDateSelector).show();
				}
				else if(countrySelect.val() == 222 && !postcode.val().length) {
					container.hide();
					$(deliveryDateSelector).hide();
				}
				else {
					container.hide();
					$(deliveryDateSelector).hide();
				}
			},
			showMessage = function(message) {
				if(!message) {
					return;
				}

				var infoMessage = $('.shopwired-info-message');
				if(!infoMessage.length) {
					infoMessage = $('<div class="shopwired-info-message"></div>');
					$('body').append(infoMessage);
				}

				infoMessage.text(message).infoMessage();
			};
	}

	var updateTotals = function(data) {
		if(!data) {
			return;
		}

		// set delivery options
		if(data.rates) {
			var html = [];

			for(var i = 0, length = data.rates.length; i < length; i++) {
				if(ratesType) {
					html.push('<div class="row column"><input id="rate-'+ data.rates[i].id +'" type="radio" name="rateId" value="' + data.rates[i].id +'" ' + (data.rates[i].current ? ' checked="checked"' : '') +'><label for="rate-'+ data.rates[i].id +'">'+ data.rates[i].name +' <span>'+ data.rates[i].price +'</span></label></div>');
				}
				else {
					html.push('<option value="' + data.rates[i].id + '"' + (data.rates[i].current ? ' selected="selected"' : '') + '>' + data.rates[i].name + ' ' + data.rates[i].price + '</option>');
				}
			}

			if(html.length) {
				container.show();
				$(deliveryDateSelector).show();
				rateSelect.html(html.join(''));
			}
			else {
				if(ratesType) {
					html.push('<p>Please select...</p>');
				}
				else {
					html.push('<option value="">Please select...</option>');
				}
				container.hide();
				$(deliveryDateSelector).hide();
			}

			if(countrySelect.val() == 222 && postcode.length) {
				showHidePostcode();
			}
		}

		if(checkPostcode) {
			checkPostcode = false;
			showMessage(data.invalidPostcode ? 'The postcode is invalid' : 'Please choose your delivery rate');

			if(data.invalidPostcode){
				container.hide();
				$(deliveryDateSelector).hide();
			} else {
				container.show();
				$(deliveryDateSelector).show();
			}
		}

		// update totals
		form.find('.basket-sub-total').html(data.originalSubTotal);
		form.find('.basket-discounts').html(data.discount);
		form.find('.basket-delivery').html(data.originalShipping);
		form.find('.basket-vat').html(data.vat);
		form.find('.basket-total').html(data.total);
		$('.basket-header-amount.basket-total').html(data.total);
		//show basket-totals
		$(".basket-totals").show();
	};

	countrySelect.on('change', function() {
		// change delivery country
		showHidePostcode(true);
		$.post('/checkout/basket/totals', {
			countryId: countrySelect.val(),
			returnRates: true
		}, updateTotals, 'JSON');

		if($(this).val() == '' && ratesType) {
			// clear radios if no delivery country
			outerContainer.hide();
			$('[name="rateId"]').prop('checked', false).trigger('change');
			rateSelect.html('');
		}
	});
	
	//ShipmondoType
	if (shipmondoType) {

		form.on('click', '.shipmondo-rate-container', function(e) {
			
			var $this = $(this);
			//refrain from doing anything if active
			if ($this.hasClass('active') || e.target.type == 'radio' || $(e.target).hasClass('x-button') ) return;
			var $input = $this.find('input.shipmondo[name="rateId"]');
			var $rateVal = $input.val();
			//slide up all form container
			$('.shipmondo-rate-container.active').removeClass('active').find('.shipmondo-form-container').slideUp(200);
			$this.addClass('active');
			
// 			// change delivery rate
			$.post('/checkout/basket/totals', {
				countryId: countrySelect.val(),
				rateId: $rateVal,
				postcode: postcode.val()
			}, updateTotals, 'JSON');
			//shipmondo request
			var $split = $input.data('ratename').split(',');
			if ($split.length < 2) return;
			var $productCode = $input.data('ratename').split(',')[1].trim();
			
			$this.find('.loader-spinner').slideDown(500);
			var $shipmondoApiBaseUrl = 'https://app.shipmondo.com/api/public/v3';
			//fetch productCode info
// 			$("#button_checkout").addClass('disabled');
			$.ajax({
				headers: {
    				'Authorization': "Basic " + $shipmondoAuth,
					'Accept': 'application/json'
  				},
				type: "GET",
				url: `${$shipmondoApiBaseUrl}/products?product_code=${$productCode}&sender_country_code=DK&receiver_country_code=DK`,
				success: function (data) {
					//check delivery_location_type = private_location
					var $productInfo = data[0];
					if ($productInfo.delivery_location_type != 'private_location') {
						
						//this is not a home location, so check if service_point_available is true
						//remove all shipmondo-form-container to not have multiple basket_comments for postnummber
						$(".service-point-container").remove();
						//remove all company-parcel-form
						$(".company-parcel-form").remove();
						if ($productInfo.service_point_available) {
							
							//load service point search form
							$this.find(".shipmondo-form-container").prepend(`
								<div class="service-point-container">
									<hr/>
									<h4>
										Indtast postnummer i feltet herunder
									</h4>
									<div class="shipmondo-service-point-input insert-error-before">
										<label class="search" for="basket_postnummer">
											<i class="sw-icon-search"></i>
										</label>
										<input id="basket_postnummer"  type="text" name="basket_postnummer" required x-model="postNummerValue" autocomplete="off" class="insert-error-before">
										<span class="clear" forawew="postnummer" @click=" () => {
											$refs.servicePoints.innerHTML = '';
											$refs.recommendedDelivery.click();
											}">
											<i class="sw-icon-plus x-button">
												
											</i>
										</span>
									</div>
									<div class="loader-spinner" style="display: none;">
										<div class="spinner"></div>
									</div>
									<div class="postnummer-service-points" x-ref="servicePoints" style="display: none;">
										
									</div>
								</div>
							`).slideDown(500);
							
							//add event listener
							$this.find("input#basket_postnummer").on("keyup", $.debounce(300, function(e) {
								var $input = $(this);
								
								var $zipCode = $input.val();
								if ($zipCode.length < 1) {
									//clear field and remove servicepoints.
									$this.find('.postnummer-service-points').empty();
									return;
								}
								var $carrierCode = $productInfo.carrier.code;
								//Fetch Service Points
								$this.find('.shipmondo-form-container .loader-spinner').slideDown(200);
								$.ajax({
									headers: {
										'Authorization': "Basic " + $shipmondoAuth,
										'Accept': 'application/json'
									},
									type: "GET",
									url: `${$shipmondoApiBaseUrl}/pickup_points?carrier_code=${$carrierCode}&country_code=DK&zipcode=${$zipCode}`,
									success: function ($data) {
										if($data.length) {
											$this.find('.postnummer-service-points').empty();
										}
										$data.forEach(function($d) {
											var $mapHours = $d.opening_hours.map(function($oh){
												return $oh.split(': ')[1];
											});
											var $uniqueHours = $mapHours.filter((value, index, self) => self.indexOf(value) === index);
											var $openHoursHTML = "";
											for (let $i = 0; $i < $uniqueHours.length; $i++) {
												var $map = $d.opening_hours.filter(function($oh) {
													return $oh.includes($uniqueHours[$i]);
												});
												var $openHour = $map.at(0).replace(': '+$uniqueHours[$i], ' - ') + $map.at(-1);
												$openHoursHTML += `<p style="margin-bottom: 0;">${$openHour}</p>`;
											}
											$this.find('.postnummer-service-points').append(`<div>
													<label class="hide">Service Point ID</label>
													<input type="radio" name="basket_comments[]" class="sp-radio-parent-error" required id="sp${$d.id}" value="Shipmondo Service Point ID: ${$d.id}">
													<label for="sp${$d.id}">
														<h4>${$d.company_name}</h4>
														<p style="margin-bottom: 0;">${$d.address}</p>
														<p style="margin-bottom: 0;">${$d.zipcode} ${$d.city}</p>
														${$openHoursHTML}
													</label>
												</div>`);
										});
										$this.find('.postnummer-service-points').slideDown(300);
										//company_name,
										//address,
										//zipcode,city
										$this.find('.shipmondo-form-container .loader-spinner').slideUp(200);
										$("#button_checkout").removeClass('disabled');
									}
								});
							}));
							
						} else {
							//load the business / company form
							console.log('load the business / company form');
							console.log($productInfo);
							
							$this.find(".shipmondo-form-container").prepend(
							`<div class="company-parcel-form" x-data="{
								companyName: 'Company Name: ',
								company_name: '',
								companyDepartment: 'Company Department: ',
								company_department: '',
								companyAddress: 'Company Address: ',
								company_address: '',
								companyZipcode: 'Company Zipcode: ',
								company_zipcode: '',
								companyCity: 'Company City: ',
								company_city: '',
								receiverName: 'Receiver Name: ',
								receiver_name: '',
								receiverEmail: 'Receiver Email: ',
								receiver_email: '',
								receiverMobile: 'Receiver Mobile: ',
								receiver_mobile: ''
							}">
							<hr>
							<p>
								Modtager
							</p>
							<div>
							<label class="company-address-label">
								<input type="hidden" name="basket_comments[]" x-bind:value="companyName + company_name">
								<input type="text" class="required" placeholder="Firmanavn*" name="company_name" aria-required="true" x-model="company_name">
							</label>
							<label class="company-address-label">
								<input type="hidden" name="basket_comments[]" x-bind:value="companyDepartment + company_department">
								<input type="text"class="required" placeholder="Afdeling*" name="company_department" aria-required="true" x-model="company_department">
							</label>
							<label class="company-address-label">
								<input type="hidden" name="basket_comments[]" x-bind:value="companyAddress + company_address">
								<input type="text" class="required" placeholder="Adresse*" name="company_address" aria-required="true" x-model="company_address">
							</label>
							<label class="company-address-label">
								<input type="hidden" name="basket_comments[]" x-bind:value="companyZipcode + company_zipcode">
								<input type="text" class="required" placeholder="Postnummer*" name="company_zipcode" aria-required="true" x-model="company_zipcode">
							</label>
							<label class="company-address-label">
								<input type="hidden" name="basket_comments[]" x-bind:value="companyCity + company_city">
								<input type="text" class="required" placeholder="By*" name="company_city" aria-required="true" x-model="company_city">
							</label>
							<label class="company-address-label">
								<input type="hidden" name="basket_comments[]" x-bind:value="receiverName + receiver_name">
								<input type="text" class="required" placeholder="Navn*" name="receiver_name" aria-required="true" x-model="receiver_name">
							</label>
							<label class="company-address-label">
								<input type="hidden" name="basket_comments[]" x-bind:value="receiverEmail + receiver_email">
								<input type="email" class="required" placeholder="Email*" name="receiver_email" aria-required="true" x-model="receiver_email">
							</label>
							<label class="company-address-label">
								<input type="hidden" name="basket_comments[]" x-bind:value="receiverMobile + receiver_mobile">
								<input type="text" class="required" placeholder="Mobil*" name="receiver_mobile" aria-required="true" x-model="receiver_mobile">
							</label>
							</div>`
							);
							$this.find(".shipmondo-form-container").slideDown(300);
							$("#button_checkout").removeClass('disabled');
							
						}
					}
					$this.find('.loader-spinner').slideUp(200);
					
				}
			});
			
		});
		//trigger
		var $test = $('.shipmondo-rate-container[current-rate]').trigger("click");
		
	}

	if(ratesType) {
		form.on('click change','input[name="rateId"]', function() {
			var rateVal = $(this).val();
			// change delivery rate
			$.post('/checkout/basket/totals', {
				countryId: countrySelect.val(),
				rateId: rateVal,
				postcode: postcode.val()
			}, updateTotals, 'JSON');
		});
	}
	else {
		rateSelect.on('change', function() {
			// change delivery rate
			$.post('/checkout/basket/totals', {
				countryId: countrySelect.val(),
				rateId: rateSelect.val(),
				postcode: postcode.val()
			}, updateTotals, 'JSON');
		});
	}

	postcodeValidate.on('click', function(event) {
		checkPostcode = true;
		event.preventDefault();
		$.post(postUrl, {
			countryId: countrySelect.val(),
			postcode: postcode.val(),
			returnRates: true
		}, updateTotals, 'JSON');
	});

	if(!rateSelect.val() || (countrySelect.val() == 222 && postcode.length)) {
		container.hide();
		$(deliveryDateSelector).hide();

		if(!postcode.length && countrySelect.val() ){
			countrySelect.trigger('change');
		}
	}

	showHidePostcode();
}

function initializeCheckoutForm() {
	var form = $('#checkout-form');

	if(!form.length) {
		return;
	}

	// initialize province / state fields
	form.find('.checkout-field-country input, .checkout-field-country select').on('change', function() {
		var field = $(this),
			value = field.val(),
			container = field.closest('.checkout-details');

		if(value === 'United States') {
			container.find('.checkout-field-state').show();
			container.find('.checkout-field-province').hide();
		}
		else {
			container.find('.checkout-field-state').hide();
			container.find('.checkout-field-province').show();
		}
	}).trigger('change');

	if ($('#billing-same').is(':checked')) {
		$('.checkout-shipping-details').hide();
	}

	$('#billing-same').on('change', function() {
		if ($(this).is(':checked')) {
			$('.checkout-shipping-details').slideUp(400);
		}
		else {
			$('.checkout-shipping-details').find('input:not([readonly]), select').each(function() {
				$(this).val('').trigger('change');
			});
			$('.checkout-shipping-details').slideDown(400);
		}
	});

	// initialize copy checkbox
	form.find('#billing-same').on('change', function() {
		if(!this.checked) {
			return;
		}
		copyFields();
	});

	function copyFields() {
		var source = form.find('.checkout-billing-details'),
			destination = form.find('.checkout-shipping-details');

		source.find('.checkout-field').each(function() {
			var field = $(this).find('input, select'),
				fieldClass = '.checkout-field-' + field.data('name'),
				billEmail = $('input[name="email"]').val();

			destination.find(fieldClass + ' select, ' + fieldClass + ' input').val(field.val()).trigger('change');
			// populate shipping email field with billing email address
			$('input[name="shipping_email"]').val(billEmail);
		});
	}

	form.on('submit', function(e){
		if ($('#billing-same').is(':checked')) {
			copyFields();
		} else {
			$('input[name="shipping_email"]').val($('input[name="email"]').val());
		}
		return true;
	});
}

function quickView() {
	$(document).on('click', '.quick-view', function(event) {
		event.preventDefault();
		var href = $(this).attr('href') + '?view=partials/product_form&modal=true';

		$.post(href, function(data) {
			$('#ajaxModal').remove();

			if(data) {
				var closeBtn = '<button class="close-button btn-close" data-close aria-label="Close modal" type="button"><span>luk</span></button>',
					modal = '<div class="reveal large" id="ajaxModal" data-reveal data-animate="slide-in-down slide-out-up" data-v-offset="10">' + closeBtn + data + '</div>';

				$('body').append(modal);
				$(document).foundation();
				orderQty();

				var reveal = $(document).find('#ajaxModal'),
					revealContainer = reveal.find('.product-container');

				reveal.foundation('open');
				initializeProductOptions(revealContainer);
				$('.reveal-overlay').scrollTop(0);

				reveal.find('.product-soft-add-button').productAddToCanvasBasket({
					countSelector: '.basket-count',
					totalSelector: '.basket-total',
					removeSelector: '.false'
				});

				productPhotos(revealContainer);
				numberToggle();
				validateForms();
			}
		});
	});

	$(document).ajaxSuccess(function( event, xhr, settings){
		if(xhr.responseJSON && xhr.responseJSON.success && $(document).find('#ajaxModal').length){
			$(document).find('#ajaxModal').foundation('close');
		}
	});
}


function initializeProductOptions(container) {
	if(!container.length) {
		return;
	}

	var form = container.find('.product-form'),
		container = form.closest('.product-container'),
		cache = {},
		productOptionsCache = {},
		sku = container.find('.product-sku'),
		price = container.find('.product-price'),
		salePrice = container.find('.product-sale-price'),
		responsivePrice = container.find('.product-price.responsive'),
		largePrice = container.find('.product-large-price'),
		availability = container.find('.product-availability'),
		rewardPoints = container.find('.product-reward-points'),
		options = form.find('select.product-option'),
		productOptionContainers = container.find('.product-option-container'),
		subscriptionBox = form.find('.product-subscription'),
		subscriptionOptions = form.find('[name="_subscription_option"]'),
		subscriptionHiddenOneOffInput = form.find('[name="one_off_purchase"]'),
		subscriptionIntervalSelect = form.find('[name="subscription_interval"]'),
		formAction = form.prop('action'),
		addButton = form.find('.product-add-button'),
		quantityContainer = container.find('.product-quantity'),
		extras = form.find('[name="alt2_attribute_id[]"], [name="product_extras[]"], [name="subscription_interval"]'),
		groupId = 100,
		showSku = false,
		updateData = function(data) {
			// update data
			container.data('sku', data.sku);
			container.data('price', data.price);
			container.data('isInStock', data.inStock);
			container.data('salePrice', data.salePrice);
			container.data('canBeAdded', data.canBeAdded);
			container.data('hasSalePrice', data.hasSalePrice);
			container.data('rewardPoints', data.rewardPoints);

			// update prices
			price.html( container.data('price') );
			salePrice.html( container.data('salePrice') );
			largePrice.html( data.hasSalePrice ? data.salePrice : data.price);
			responsivePrice.html( data.hasSalePrice ? data.salePrice : data.price);

			if(data.canBeAdded) {
				// enable button
				addButton.prop('disabled', false).removeClass('disabled').attr('data-name', 'button_add_to_basket').text(addButton.data('text'));
				quantityContainer.removeClass('hide');
			}
			else {
				// disable button
				addButton.prop('disabled', true).addClass('disabled').attr('data-name', 'button_out_of_stock').text(addButton.data('nostock'));
				quantityContainer.addClass('hide');
			}

			if(data.inStock) {
				container.addClass('in-stock');
				availability.text('In Stock');
			}
			else {
				container.removeClass('in-stock');
				availability.text('Out Of Stock');
			}

			if(data.hasSalePrice) {
				container.addClass('has-sale-price');
			}
			else {
				container.removeClass('has-sale-price');
			}

			if(data.rewardPoints > 0) {
				container.addClass('has-reward-points');
				rewardPoints.text(data.rewardPoints).parent().removeClass('hide');
			}
			else {
				container.removeClass('has-reward-points');
				rewardPoints.parent().addClass('hide');
			}

			if(data.photo != -1) {
				$('.product-carousel').find('.p' + data.photo).trigger('click');
			}

			if(data.sku) {
				//productContainer.find('.sku-container').removeClass('hidden');
				sku.text(data.sku).parent().removeClass('hide');
			}
			else {
				sku.parent().addClass('hide');
			}

			if(data.quantityAvailable > 0) {
				container.addClass('has-quantity');
				container.find('.product-stock-available').text(data.quantityAvailable);
			}
			else {
				container.removeClass('has-quantity');
			}

			//quantityContainer.html(data.quantityAvailable);
		},
		updateProduct = function(data) {
			// dropdowns
			if(data) {
				// update drop downs
				var optionIndex = data.nextOptionIndex;
				if(optionIndex) {
					var html = ['<option value="">Please select...</option>'],
						option;

					for(var i = 0, length = data.nextOptionValues.length; i < length; i++) {
						html.push('<option value="' + data.nextOptionValues[i].id + '">' + data.nextOptionValues[i].name + '</option>');
					}

					option = options.eq(optionIndex);
					option.html(html.join(''));

					availability.parent().addClass('hide');
				}
				else {
					availability.parent().removeClass('hide');
				}

				// update data
				updateData(data);
			}
		},
		onOptionChange = function(data) {
			// variant buttons
			groupId++;

			var optionIndex = data.nextOptionIndex;
			if(optionIndex) {
				var html = [],
					is_color, style, name, parts;

				if(data.nextOptionValues.length) {
					for(var i = 0, length = data.nextOptionValues.length; i < length; i++) {
						is_color = data.nextOptionValues[i].name.indexOf(':#') > 0;
						parts = data.nextOptionValues[i].name.split(':');
						name = is_color && parts[0] ? parts[0] : data.nextOptionValues[i].name;
						style = is_color ? (' style="background-color:' + parts[1] + ';"') : '';
						tooDark = is_color ? isTooDark(parts[1]) : false;
						html.push('<label class="rectangle' + (is_color ? ' color' : '') + (tooDark ? ' dark' : '') + '"><input type="radio" name="group' + groupId + '" value="' + data.nextOptionValues[i].id + '" class="product-option-input"><span class="inner"' + style + '>' + name + '</span></label>');
					}
				}
				else {
					html.push('<div class="note">Choose an option from the list above...</div><input type="hidden" name="group' + groupId + '" value="" class="product-option-input">');
				}

				var c = productOptionContainers.eq(optionIndex);
				c.html(html.join(''));
			}

			// update data
			updateData(data);
		};

	// initialize options
	options.on('change', function() {
		// reset other drop downs
		options.slice(options.index(this) + 1).html('<option value="">Please select...</option>').val('');

		var form = $(this).closest('form'),
			postData = form.serialize() + '&get_info=1';

		// send request
		if(cache[postData]) {
			updateProduct(cache[postData]);
		}
		else {
			$.post(formAction, postData, function(data) {
				cache[postData] = data;
				updateProduct(data);
			}, 'JSON');
		}
	});

	// initialize extras and choices
	extras.on('change', function() {
		if(options.length){
			container.find(options).last().trigger('change');
		}
		else if(productOptionContainers.length){
			$(document).find('.product-option-input').last().trigger('change');
		}
		else {
			var postData = $(this).closest('form').serialize() + '&get_info=1';
			$.post(formAction, postData, function(data) {
				cache[postData] = data;
				updateData(data);
			}, 'JSON');
		}
	});

	if(options){
		updateProduct();
	}

	// initialize variant buttons
	container.on('change', '.product-option-input', function() {

		var productOptionContainer = $(this).closest('.product-option-container'),
			index = productOptionContainers.index(productOptionContainer);

		productOptionContainers.slice(index + 1).each(function() {
			var innerContainer = $(this);

			groupId++;
			innerContainer.html('<div class="note">Choose an option from the list above...</div><input type="radio" name="group' + groupId + '" value="" class="product-option-input" checked="checked">');
			innerContainer.parent().find('.product-option-value').val('');
		});

		productOptionContainer.parent().find('.product-option-value').val(productOptionContainer.find('.product-option-input:checked').val());

		var post = form.serialize() + '&get_info=1',
			values = container.find('.product-option-value'),
			selected = 0;

		for(var i = 0, length = values.length; i < length; i++) {
			if(values.eq(i).val()) {
				selected++;
			}
		}

		container.find('.sku-container').addClass('hidden');
		showSku = selected >= values.length;

		if(productOptionsCache[post]) {
			onOptionChange(productOptionsCache[post]);
		}
		else {
			$.post(formAction, post, function(data) {
				if(data) {
					productOptionsCache[post] = data;
					onOptionChange(data);
				}
			}, 'JSON');
		}
	});

	$(document).on('click', '.product-option-container .rectangle',function(){
		$(this).closest('.product-option-container').find('.active').removeClass('active');
		$(this).addClass('active');
	});

	productOptionContainers.find('.rectangle.color').each(function() {
		var hex = $(this).find('.inner').attr('style').replace('background-color:', '');

		if( isTooDark(hex) ){
			$(this).css('color', '#fff');
		}
	});

	var file_names = form.find('input[name="file_names[]"]'),
		files = form.find('input[name="files[]"]');

	if(file_names.length) {
		files.on('change', function() {
			file_names.each(function(i) {
				var uploaded_name = form.find('input[name="files[]"]').eq(i).val(),
					uploaded_ext = uploaded_name.split('.').pop(),
					name = $(this).val();

				if(!name.endsWith(uploaded_ext)){
					$(this).val(name + '.' + uploaded_ext);
				}
			});
		});
	}
	if(subscriptionOptions){
		subscriptionOptions.on('change', (function checkSubscriptionSelection(setup) {
			let one_time_charge = subscriptionOptions.filter(':checked').val() == '0';
			subscriptionBox.toggleClass('hide', one_time_charge);
			subscriptionHiddenOneOffInput.prop('checked', one_time_charge);
			if(one_time_charge) subscriptionIntervalSelect.val("");
			if(setup.onload || one_time_charge) subscriptionIntervalSelect.trigger('change');
			return checkSubscriptionSelection;
		})({ onload: 1 }));
	}
	return this;
}


// prevent FOUC - wikipedia.org/wiki/Flash_of_unstyled_content
$(window).on('load',function() {
	$('html').removeClass('no-js').removeClass('loading').addClass('js');
	$('.image-container').imageContainer();
});

$(function(){

	if(theme_config.nav_style) {
		var catsWithSub = $('.parent-with-sub');

		// large screen subnavigation
		catsWithSub.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var $this = $(this),
				sectionId = $this.data('id'),
				subContainer = $('.sub-nav-container'),
				subMenu = $('ul[data-id="' + sectionId + '"]'),
				children = $(this).find('ul'),
				activeClass = 'item-active',
				triangle = $('.selection-triangle');

			// hide last opened sub
			subContainer.find('ul:not([data-id="' + sectionId + '"])').hide();

			// unmark last opened, mark/unmark parent
			$this.toggleClass(activeClass).siblings('li').removeClass(activeClass);

			// place and show triangle
			placeTriangle();

			// show/hide sub
			subMenu.toggle(0, function() {
				if ($(this).is(':hidden')) {
					triangle.addClass('hide');
				}
				else {
					triangle.removeClass('hide');
				}
			});

			// stop bubble
			subMenu.add(children).click(function(e) {
				e.stopPropagation();
			});

			$('html').click(function() {
				//Hide the menus if visible
				$this.removeClass(activeClass);
				triangle.addClass('hide');
				$('.sub-nav-container ul').hide();
			});

			function placeTriangle() {
				var anchor_width = $this.children('a').outerWidth(),
					anchor_pos = Math.round($this.children('a').offset().left) + (anchor_width / 2) - 5;
				triangle.css('left', anchor_pos + 'px');
			}

			$(window).on('resize', function() {
				placeTriangle();
			});
		});
	}

	// header search
	$('#header-search').on('off.zf.toggler', function() {
		// place cursor in search input on show
		$(this).find('.header-search-input').focus();
		$('body').addClass('search-open');
	}).on('on.zf.toggler', function() {
		$('body').removeClass('search-open');
	});

	// toggle module
	$('.toggle-control > button').on('click', function() {
		var group = $(this).closest('.toggle-group'),
			control = $(group).find('.toggle-control'),
			content = $(group).find('.toggle-content');
		$(control).toggleClass('open');
		$(content).toggleClass('open');
	});

	$('.image-container').imageContainer();

	$('.lazy').unveil(0);

	$(window).resize(function() {
		$('.image-container').imageContainer();
		footerMargin();
		Foundation.reInit('equalizer');
	});

	// basket voucher
	$('.basket-voucher-toggle').on('click', function() {
		$(this).hide();
		$(this).parent().find('form').removeClass('hide');
	});

	// input with increment buttons
	numberToggle();

	// prevent floating footer
	$(window).on('load resize orientationchange', footerMargin);
});

function numberToggle() {
	$(document).find('.number-toggle').each(function() {
		var valueElement = $(this).find('input'),
			plus = $(this).find('.toggle-up'),
			minus = $(this).find('.toggle-down');

		function incrementValue(e){
			e.preventDefault();
			valueElement.val(Math.max(parseInt(valueElement.val()) + e.data.increment, 0));
			return false;
		}

		plus.bind('click', {increment: 1}, incrementValue);
		minus.bind('click', {increment: -1}, incrementValue);
	});
}

function footerMargin() {
	var docHeight = $(window).height(),
		footer = $('.footer'),
		footerHeight = footer.height(),
		footerTop = footer.position().top + footerHeight,
		split_bg = $('.content.split');

	if (footerTop < docHeight && footer.length) {
		if(split_bg.length) {
			split_bg.css('padding-bottom', 10+ (docHeight - footerTop) + 'px');
		}
		else {
			footer.css('margin-top', 10+ (docHeight - footerTop) + 'px');
		}
	}
}

$(document).on('opened.zf.offcanvas', function() {
	$('.image-container').imageContainer();
	if ($('#quickView').length) {
		$('#quickView').foundation('close');
	}
});

$(document).on('open.zf.reveal', function() {
	$('.image-container').imageContainer();
});


// initialize price filter slider
if($('.price-range-container').length) {
	$(document).on('changed.zf.slider', '.slider', function() {
		var range_string = Math.floor($('#sliderOutputMin').val()) + '-' + Math.ceil($('#sliderOutputMax').val()),
			range_element = $('input.price-range.hide');

		if (Foundation.lock_sliders === true) {
			Foundation.lock_sliders = false;
		}
		else {
			range_element.val(range_string).data('value', range_string).prop('checked', true).trigger('change');
		}
	}).on('moved.zf.slider', function() {
		$('.range-min').text(Math.floor($('#sliderOutputMin').val()));
		$('.range-max').text(Math.floor($('#sliderOutputMax').val()));
	});
}

// Min & Max Order Quantity extension
function orderQty() {
	var form = $('.product-form'),
		addBtn = $('button[name="cart_button"]');

	form.keypress(function (e) {
		if (e.keyCode === 10 || e.keyCode === 13) {
			e.preventDefault();
		}
	});

	addBtn.on('touchstart mousedown', function(event) {
		var qty = $('.quantity-input').val(),
			min_qty = parseInt(form.data('min-quantity'), 10),
			max_qty = parseInt(form.data('max-quantity'), 10);

		if($(this).hasClass('disabled')) {
			return
		}
		if( (qty > max_qty && max_qty != 0) || qty < min_qty ) {

			event.preventDefault();
			var msg = [];
			if(max_qty > 0 && qty > max_qty){
				msg.push('This product has a maximum order quantity of '+max_qty+', please change your quantity selection.');
			}
			if(qty < min_qty){
				msg.push('This product has a minimum order quantity of '+min_qty+', please change your quantity selection.');
			}
			alert(msg.join(' '));
		} else {

			if($(this).hasClass('product-soft-add-button')){
				return;
				// bypass mousedown event
				$(this).trigger('click');
			}

			$(document).ajaxSuccess(function(event, xhr, settings) {
				try {
					$.parseJSON(response);
				} catch(error) {
					// its not json
					return
				}

				if(xhr.responseJSON.success.length) {
					// open canvas basket if product added
					$('.off-canvas-basket').foundation('open');
				}
			});

			if( $('.back-stock-message').length ){
				$('.back-stock-message').removeClass('hide');
			}
		}
	});

	$('.basket-form').on('submit', function(e) {
		var basket_items = $(this).find('.basket-item'),
			errors = [];

		basket_items.each(function(i) {
			var item_min = parseInt($(this).data('min-quantity'), 10),
				item_max = parseInt($(this).data('max-quantity'), 10),
				item_qty = $(this).find('.basket-qty').val(),
				item_id = $(this).find('.basket-qty').attr('name');

			if( (item_qty > item_max && item_max != 0) && item_qty != 0 || item_qty < item_min && item_qty != 0 ) {
				errors.push(item_id);
			}
		});

		if(errors.length){
			e.preventDefault();
			alert('Please check the quantity ordered for products in the basket are within the minimum and maximum order quantity thresholds');
		}
	});
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function isTooDark(hexcolor){
	var r = parseInt(hexcolor.substr(1,2),16),
		g = parseInt(hexcolor.substr(3,2),16),
		b = parseInt(hexcolor.substr(4,2),16),
		yiq = ((r*299)+(g*587)+(b*114))/1000;
	// Return new color if to dark, else return the original
	//return (yiq < 40) ? '#2980b9' : hexcolor;
	return (yiq < 140);
}

function validateForms() {
	$.validator.addMethod('email_strict', function(value, element, param) {
		return value.match(/^[a-zA-Z0-9_\.%\+\-]+@[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,}$/);
	},'Please enter a valid email');
	$.validator.addMethod('num_spaces', function(value, element, param) {
		return !value.length ? true : value.match(/^[\d\s]+$/);
	},'Please enter digits or space characters only');
	$.validator.addMethod('include_num', function(value, element, param) {
		return !value.length ? true : value.match(/^(?=.*\d).*$/);
	},'Please enter at least one number.');
	// email
	$.validator.addClassRules('jsv_email', {
		email_strict: true
	});
	// decimal number
	$.validator.addClassRules('jsv_number', {
		number: true
	});
	// digits only
	$.validator.addClassRules('jsv_digits', {
		num_spaces: true
	});
	// at least 1 digit password
	$.validator.addClassRules('jsv_password', {
		include_num: true
	});
	// initialize form validation
	$('.form-with-validation').each(function() {
		$(this).validate({
			errorElement: 'span',
			errorClass: 'validation-error',
			errorPlacement: function(error, element) {
				if(element.hasClass('input-group-field')){
					error.insertBefore(element.closest('.input-group'));
				}
				else if(element.hasClass('product-option-input')) {
					error.insertBefore(element.closest('.product-option'));
				}
				else if(element.hasClass('insert-error-before')) {
					error.insertBefore(element.parents('.insert-error-before'));
				}
				else {
					error.insertBefore(element);
				}
			},
			ignore: ":hidden:not(.product-option-input)",
			highlight: function (element, errorClass, validClass) {
				$(element).addClass(errorClass);
			},
			unhighlight: function (element, errorClass, validClass) {
				$(element).removeClass(errorClass);
			},
			rules : {
				new_password : {
					required: true,
					minlength: 6
				},
				password_confirm : {
					equalTo : "#password1"
				},
				company_zipcode: {
					digits: true
				}
			},
			messages: {
				password_confirm : "Passwords don’t match.",
				minlength : jQuery.validator.format("Please enter at least {0} characters"),
				basket_postnummer: "Postnummer er påkrævet.",
				receiver_email: "Indtast venligst en gyldig e-mailadresse.",
				company_name: "Firmanavn er påkrævet.",
				company_department: "Afdeling er påkrævet.",
				company_address: "Adresse er påkrævet.",
				company_zipcode: "Postnummer er påkrævet.",
				company_city: "By er påkrævet.",
				receiver_name: "Navn er påkrævet.",
				receiver_mobile: "Mobil er påkrævet.",
				company_zipcode: {
					digits: "Kun tal er tilladt."
				}
			}
		});
	});
	// trap validator if soft add
	$(this).find(':input').on('change', function() {
		var form = $(this).closest('form'),
			softBtn = form.find('.product-soft-add-button');
		if(form.valid()) {
			softBtn.data('busy', false);
		} else {
			softBtn.data('busy', true);
		}
	});
}

// ajax wishlist button
$(document).on('click','.js-wishlist-button', function(e) {
	var $this = $(this),
		active = $this.hasClass('on') ? true : false,
		view = $this.closest('.js-wish-list-view').length,
		message = active ? 'removed from' : 'added to';
	post_url = $this.attr('href'),
		title = $(this).closest('.item-box').find('h3').text() || 'Item',
		icons = 'sw-icon-heart-1 sw-icon-heart',
		text_container = $this.find('span'),
		text = [$this.data('remove'), $this.data('add')];

	e.preventDefault();
	$.post(post_url, function() {
		// swap class names
		$this.toggleClass('on').find('i').toggleClass(icons);
		// swap text
		if(text_container.text() == text[0]) {
			text_container.text(text[1]);
		} else {
			text_container.text(text[0]);
		}
		// prep message container
		var infoMessage = $('.shopwired-info-message');
		if(!infoMessage.length) {
			infoMessage = $('<div class="shopwired-info-message"></div>');
			$('body').append(infoMessage);
		}
		// output message
		infoMessage.text(title + ' ' + message + ' your wishlist').infoMessage();
		// wishlist page ?
		if(view){
			// remove product box
			$this.closest('.item-box').closest('.column').slideToggle('slow').remove();
		}
	});
});

// off canvas basket item removal
$(document).on('click', '.off-canvas-basket .remove-button', function(event) {
	event.preventDefault();

	if(confirm('Are you sure you want to remove this item from your basket?')){
		$.ajax({
			type: 'POST',
			url: this.href,
			success: function(data) {

				setTimeout(function() {
					$.ajax({
						url: '/checkout/basket',
						type: 'GET',
						success: function(data) {
							var basketTotal = $(data).find('.basket-total').html(),
								basketCount = $(data).find('.basket-count').first().text();

							if(data && basketTotal) {
								$(document).find('.off-canvas-basket__total-value').text(basketTotal);
								$('.shopwired-basket-total-value').html(basketTotal || 0);
							}
							if(data) {
								$('.basket-count').html(basketCount || 0);
							}
						}
					});
				}, 200);
			}
		});

		$(this).closest('.item').slideUp(300, function() {
			this.remove()
		});
	}
});

// basket discount removal button
$('.js-remove-discount').on('click', function(e) {
	var discount_rewards = $(this).data('rewards'),
		discount_voucher = $(this).data('voucher');

	e.preventDefault();

	if(discount_rewards + discount_voucher == 2) {
		var discount_removed = 0;

		$.ajax({url: '/checkout/basket/clear-vouchers', success: function(result){
			discount_removed = discount_removed + 1;
			reload();
		}});

		$.ajax({url: '/checkout/basket/unconvert-reward-points', success: function(result){
			discount_removed = discount_removed + 1;
			reload();
		}});
	}
	else if (discount_rewards) {
		window.location.href = '/checkout/basket/unconvert-reward-points';
	}
	else if (discount_voucher) {
		window.location.href = '/checkout/basket/clear-vouchers';
	}

	function reload() {
		if(discount_removed == 2) {
			window.location.reload(true);
		}
	}
});

$('.off-canvas-mobile-menu').on('open.zf.drilldown', function() {
	$(this).closest('.off-canvas-mobile').scrollTop(0);
});

$('.js-scroll-to').each(function() {
	$(this).on('click', function(e){
		e.preventDefault();
		var target = $(this).attr('href'),
			location = $(target).offset().top,
			secs = $(this).data('secs') ? $(this).data('secs') : 500;

		$('html, body').animate({ scrollTop: location }, secs);
	});
});



$( document ).ready(function() {
    window.onscroll = function() {scroll()};

	let navbar = document.getElementById("header-top");
	let navbarinner = document.getElementById("header-inner");
	let announcementbar = document.getElementById("announcement-bar");
	let body = document.querySelector("body");
	let contentDiv = document.querySelector("#content.content");
	let contentDiv2 = document.querySelector("#content");
	let sticky = navbar.offsetTop;
	let navbarHeight = navbar.offsetHeight;
	let aBarHeight = announcementbar.offsetHeight;
	let styleValue = `padding-top: ${aBarHeight + navbarinner.offsetHeight}px !important`;
	let styleValue2 = `padding-top: ${announcementbar.offsetHeight + navbarinner.offsetHeight}px !important`;
	let brandDiv = document.getElementById("brand");

	function scroll() {
	  if (window.pageYOffset - aBarHeight  >= sticky) {
			navbar.classList.add("sticky-menu");
			body.classList.add("sticky-header");
			
			if (contentDiv) {
				contentDiv.setAttribute("style", styleValue);
			}
			if (contentDiv2) {
				contentDiv2.setAttribute("style", styleValue2);
			}
			if(brandDiv) {
				 brandDiv.setAttribute("style", styleValue);
			}


	  } else {
			navbar.classList.remove("sticky-menu");
			body.classList.remove("sticky-header");
			
			if (contentDiv) {
				contentDiv.setAttribute("style", 'padding-top: 0px;');
			}
		  
		    if (contentDiv2) {
				contentDiv2.setAttribute("style", 'padding-top: 0px;');
			}
		  
		  	if(brandDiv) {
				 brandDiv.setAttribute("style", 'padding-top: 0px;');
			}

	  }
	}
});


//Cookie Consent Text
$( document ).ready(function() {
    $("#__shopwired_cookie_consent_close + div").html(`
	<div class="cookie-text">
	Denne hjemmeside bruger cookies for at sikre, at du får den bedste oplevelse på vores hjemmeside. 
	Læs vores <a href="/privacy-policy" style="color: #fff;">privatlivspolitik</a>.
	</div>
	`);
	
	$("#__shopwired_cookie_consent_accept").text('Jeg accepterer');
});