(function($) {

	var $window = $(window),
		$head = $('head'),
		$body = $('body');

	/* Breakpoints. */

breakpoints ({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
			small: ['481px', '736px'],
		xsmall: ['361px', '80px'],
			xxsmall: [ null, '360px'  ],
			'xlarge-to-max': '(min-width: 1681px)',
				'small-to-xlarge': '(min-width: 481px) and (max-width: 1680px)'
		});

	// Para animações / transições até que a página tenha ... carregado.

	$window.on('load', function() {
		window.setTimeout(function() {
			$body.removeClass('is-preload');
		}, 100);
	});

	// ... parou de redimensionar.

	var resizeTimeout;

	$window.on('resize', function() {

		// Marcar como redimensionamento.

		$body.addClass('is-resizing');

		// Desmarcar após atraso.

		clearTimeout(resizeTimeout);

		resizeTimeout = setTimeout(function() {
			$body.removeClass('is-resizing');
		}, 100);

	});

	// Consertos.
	// O objeto se adequa a imagem.

	if (!browser.canUse('object-fit')
		|| browser.name == 'safari')
		$('.image.object').each(function() {

			var $this = $(this),
				$img = $this.children('img');

			// Esconde imagem original

			$img.css('opacity', '0');

			// Defini o fundo.

			$this
				.css('background-image', 'url("' + $img.attr('src') + '")')
				.css('background-size', $img.css('object-fit') ? $img.css('object-fit') : 'cover')
				.css('background-position', $img.css('object-position') ? $img.css('object-position') : 'center');

		});

	// Barra lateral.

	var $sidebar = $('#sidebar'),
		$sidebar_inner = $sidebar.children('.inner');

	// Inativo por padrão em "<= large".

	breakpoints.on('<=large', function() {
		$sidebar.addClass('inactive');
	});

	breakpoints.on('>large', function() {
		$sidebar.removeClass('inactive');
	});

	// Solução alternativa para o bug de posição da barra de rolagem do Chrome e do Android.

	if (browser.os == 'android'
		&& browser.name == 'chrome')
		$('<style>#sidebar .inner::-webkit-scrollbar { display: none; }</style>')
			.appendTo($head);

	// Toggle. (Alternancia)

	$('<a href="#sidebar" class="toggle">Toggle</a>')
		.appendTo($sidebar)
		.on('click', function(event) {

			// Prevent default.

			event.preventDefault();
			event.stopPropagation();

			// Toggle.

			$sidebar.toggleClass('inactive');

		});

	// Eventos.

	// click no link.
	$sidebar.on('click', 'a', function(event) {

		// Grande demais? 

		if (breakpoints.active('>large'))
			return;

		// Vars.

		var $a = $(this),
			href = $a.attr('href'),
			target = $a.attr('target');

		// Prevent default.

		event.preventDefault();
		event.stopPropagation();

		// Checka a URL.

		if (!href || href == '#' || href == '')
			return;

		// Esconde a barra lateral.

		$sidebar.addClass('inactive');

		// Redireciona para o "href".

		setTimeout(function() {

			if (target == '_blank')
				window.open(href);
			else
				window.location.href = href;

		}, 500);

	});

	// Evita que certos eventos dentro do painel borbulhem.

	$sidebar.on('click touchend touchstart touchmove', function(event) {

		// Grande demais?

		if (breakpoints.active('>large'))
			return;

		// Impede a propagação.

		event.stopPropagation();

	});

	// Ocultar painel no corpo ao clickar ou tocar no mesmo.

	$body.on('click touchend', function(event) {

		//Grande Demais?

		if (breakpoints.active('>large'))
			return;

		// Desativar a barra lateral.

		$sidebar.addClass('inactive');

	});

	// Scroll lock.
	// Nota: Se você fizer algo para alterar a altura do conteúdo da barra lateral, certifique-se de
	// "triggar" 'resize.sidebar-lock' em $window para que as coisas não fiquem fora de sincronia.

	$window.on('load.sidebar-lock', function() {

		var sh, wh, st;

		// Redefine a posição de rolagem para 0 se for 1.

		if ($window.scrollTop() == 1)
			$window.scrollTop(0);

		$window
			.on('scroll.sidebar-lock', function() {

				var x, y;

				// Grande demais?

				if (breakpoints.active('<=large')) {

					$sidebar_inner
						.data('locked', 0)
						.css('position', '')
						.css('top', '');

					return;

				}

				// Calcula as posições.

				x = Math.max(sh - wh, 0);
				y = Math.max(0, $window.scrollTop() - x);

				// travar/destravar barra lateral.

				if ($sidebar_inner.data('locked') == 1) {

					if (y <= 0)
						$sidebar_inner
							.data('locked', 0)
							.css('position', '')
							.css('top', '');
					else
						$sidebar_inner
							.css('top', -1 * x);

				}
				else {

					if (y > 0)
						$sidebar_inner
							.data('locked', 1)
							.css('position', 'fixed')
							.css('top', -1 * x);

				}

			})
			.on('resize.sidebar-lock', function() {

				// Calcular alturas.

				wh = $window.height();
				sh = $sidebar_inner.outerHeight() + 30;

				// Trigger scroll.

				$window.trigger('scroll.sidebar-lock');

			})
			.trigger('resize.sidebar-lock');

	});

	// Menu.

	var $menu = $('#menu'),
		$menu_openers = $menu.children('ul').find('.opener');

	// Openers.

	$menu_openers.each(function() {

		var $this = $(this);

		$this.on('click', function(event) {

			// Prevent default.

			event.preventDefault();

			// Toggle.

			$menu_openers.not($this).removeClass('active');
			$this.toggleClass('active');

			// Redimensionamento do Trigger (trava da barra lateral).

			$window.triggerHandler('resize.sidebar-lock');

		});

	});
	
})(jQuery);
