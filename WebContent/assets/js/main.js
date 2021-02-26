(function($) {


	$.fn.navList = function() {

		var	$this = $(this);
			$a = $this.find('a'),
			b = [];

		$a.each(function() {

			var	$this = $(this),
				indent = Math.max(0, $this.parents('li').length - 1),
				href = $this.attr('href'),
				target = $this.attr('target');

			b.push(
				'<a ' +
					'class="link depth-' + indent + '"' +
					( (typeof target !== 'undefined' && target != '') ? ' target="' + target + '"' : '') +
					( (typeof href !== 'undefined' && href != '') ? ' href="' + href + '"' : '') +
				'>' +
					'<span class="indent-' + indent + '"></span>' +
					$this.text() +
				'</a>'
			);

		});

		return b.join('');

	};

/**
* "Painelar" um elemento.
* @param {object} userConfig - Configuração do usuário.
* @return {jQuery} - objeto jQuery.
* /
	 
	$.fn.panel = function(userConfig) {

		// Sem elementos?
		
			if (this.length == 0)
				return $this;

		// Multiplos elementos?
		
			if (this.length > 1) {

				for (var i=0; i < this.length; i++)
					$(this[i]).panel(userConfig);

				return $this;

			}

		// Vars.
		
			var	$this = $(this),
				$body = $('body'),
				$window = $(window),
				id = $this.attr('id'),
				config;

		// Config.
		
			config = $.extend({

				// Delay.
				
					delay: 0,

				// Esconder o painel ao clickar no link.
				
					hideOnClick: false,

				// Esconder o painel ao teclar "Esc"
				
					hideOnEscape: false,

				// Ocultar painel ao deslizar.
				
					hideOnSwipe: false,

				// Redefine a posição de rolagem ao ocultar o painel.
				
					resetScroll: false,

				// Reinicia os formulários ao ocultar o painel.
				
					resetForms: false,

				// Lado da janela de visualização, o painel aparecerá.
				
					side: null,

				// Elemento de destino para "class".
				
					target: $this,

				// Classe para toggle.
				
					visibleClass: 'visible'

			}, userConfig);

			// Expandir "target" se ainda não for um objeto jQuery.
			
				if (typeof config.target != 'jQuery')
					config.target = $(config.target);

		// Painel.

			// Metodos.
			
				$this._hide = function(event) {

					// Ainda Escondido?
					
						if (!config.target.hasClass(config.visibleClass))
							return;

					// Se um evento foi fornecido, cancele-o.
					
						if (event) {

							event.preventDefault();
							event.stopPropagation();

						}

					// Esconder.
					
						config.target.removeClass(config.visibleClass);

					// Depois de ocultar.
					
						window.setTimeout(function() {

							// Reseta a posição da rolagem.
							
								if (config.resetScroll)
									$this.scrollTop(0);

							// Reseta forms.
							
								if (config.resetForms)
									$this.find('form').each(function() {
										this.reset();
									});

						}, config.delay);

				};

			// Correções do fornecedor.
			
				$this
					.css('-ms-overflow-style', '-ms-autohiding-scrollbar')
					.css('-webkit-overflow-scrolling', 'touch');

			// Esconder ao clickar.
			
				if (config.hideOnClick) {

					$this.find('a')
						.css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');

					$this
						.on('click', 'a', function(event) {

							var $a = $(this),
								href = $a.attr('href'),
								target = $a.attr('target');

							if (!href || href == '#' || href == '' || href == '#' + id)
								return;

							// Cancelar evento original.
							
								event.preventDefault();
								event.stopPropagation();

							// Esconder painel.
							
								$this._hide();

							// Redirecionar para o href.
							
								window.setTimeout(function() {

									if (target == '_blank')
										window.open(href);
									else
										window.location.href = href;

								}, config.delay + 10);

						});

				}

			// Evento: Touch.
			
				$this.on('touchstart', function(event) {

					$this.touchPosX = event.originalEvent.touches[0].pageX;
					$this.touchPosY = event.originalEvent.touches[0].pageY;

				})

				$this.on('touchmove', function(event) {

					if ($this.touchPosX === null
					||	$this.touchPosY === null)
						return;

					var	diffX = $this.touchPosX - event.originalEvent.touches[0].pageX,
						diffY = $this.touchPosY - event.originalEvent.touches[0].pageY,
						th = $this.outerHeight(),
						ts = ($this.get(0).scrollHeight - $this.scrollTop());

					// Esconder ao deslizar?
					
						if (config.hideOnSwipe) {

							var result = false,
								boundary = 20,
								delta = 50;

							switch (config.side) {

								case 'left':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
									break;

								case 'right':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
									break;

								case 'top':
									result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY > delta);
									break;

								case 'bottom':
									result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY < (-1 * delta));
									break;

								default:
									break;

							}

							if (result) {

								$this.touchPosX = null;
								$this.touchPosY = null;
								$this._hide();

								return false;

							}

						}

					// Evita a rolagem vertical além da parte superior ou inferior.
					
						if (($this.scrollTop() < 0 && diffY < 0)
						|| (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {

							event.preventDefault();
							event.stopPropagation();

						}

				});

			// Evento: evita que certos eventos dentro do painel borbulhem.
			
				$this.on('click touchend touchstart touchmove', function(event) {
					event.stopPropagation();
				});

			// Evento: oculta o painel se uma tag âncora filha apontando para seu ID for clicada.
			
				$this.on('click', 'a[href="#' + id + '"]', function(event) {

					event.preventDefault();
					event.stopPropagation();

					config.target.removeClass(config.visibleClass);

				});

		// Body.

			// Evento: Ocultar painel no clique / toque do corpo da página.
			
				$body.on('click touchend', function(event) {
					$this._hide(event);
				});

			// Evento: Toggle.
			
				$body.on('click', 'a[href="#' + id + '"]', function(event) {

					event.preventDefault();
					event.stopPropagation();

					config.target.toggleClass(config.visibleClass);

				});

		// Window.

			// Evento: Esconder ao teclar ESC.
			
				if (config.hideOnEscape)
					$window.on('keydown', function(event) {

						if (event.keyCode == 27)
							$this._hide(event);

					});

		return $this;

	};

	/ **
* Aplique "placeholder" do atributo polyfill a um ou mais formulários.
* @return {jQuery} do objeto jQuery.
* /
	 
	$.fn.placeholder = function() {

		// O navegador oferece suporte nativo a marcadores de posição?
		
			if (typeof (document.createElement('input')).placeholder != 'undefined')
				return $(this);

		// sem elementos?
		
			if (this.length == 0)
				return $this;

		// Multiplos elementos?
		
			if (this.length > 1) {

				for (var i=0; i < this.length; i++)
					$(this[i]).placeholder();

				return $this;

			}

		// Vars.
		
			var $this = $(this);

		// Text, TextArea.
		
			$this.find('input[type=text],textarea')
				.each(function() {

					var i = $(this);

					if (i.val() == ''
					||  i.val() == i.attr('placeholder'))
						i
							.addClass('polyfill-placeholder')
							.val(i.attr('placeholder'));

				})
				.on('blur', function() {

					var i = $(this);

					if (i.attr('name').match(/-polyfill-field$/))
						return;

					if (i.val() == '')
						i
							.addClass('polyfill-placeholder')
							.val(i.attr('placeholder'));

				})
				.on('focus', function() {

					var i = $(this);

					if (i.attr('name').match(/-polyfill-field$/))
						return;

					if (i.val() == i.attr('placeholder'))
						i
							.removeClass('polyfill-placeholder')
							.val('');

				});

		// Password.
		
			$this.find('input[type=password]')
				.each(function() {

					var i = $(this);
					var x = $(
								$('<div>')
									.append(i.clone())
									.remove()
									.html()
									.replace(/type="password"/i, 'type="text"')
									.replace(/type=password/i, 'type=text')
					);

					if (i.attr('id') != '')
						x.attr('id', i.attr('id') + '-polyfill-field');

					if (i.attr('name') != '')
						x.attr('name', i.attr('name') + '-polyfill-field');

					x.addClass('polyfill-placeholder')
						.val(x.attr('placeholder')).insertAfter(i);

					if (i.val() == '')
						i.hide();
					else
						x.hide();

					i
						.on('blur', function(event) {

							event.preventDefault();

							var x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

							if (i.val() == '') {

								i.hide();
								x.show();

							}

						});

					x
						.on('focus', function(event) {

							event.preventDefault();

							var i = x.parent().find('input[name=' + x.attr('name').replace('-polyfill-field', '') + ']');

							x.hide();

							i
								.show()
								.focus();

						})
						.on('keypress', function(event) {

							event.preventDefault();
							x.val('');

						});

				});

		// Events.
		
			$this
				.on('submit', function() {

					$this.find('input[type=text],input[type=password],textarea')
						.each(function(event) {

							var i = $(this);

							if (i.attr('name').match(/-polyfill-field$/))
								i.attr('name', '');

							if (i.val() == i.attr('placeholder')) {

								i.removeClass('polyfill-placeholder');
								i.val('');

							}

						});

				})
				.on('reset', function(event) {

					event.preventDefault();

					$this.find('select')
						.val($('option:first').val());

					$this.find('input,textarea')
						.each(function() {

							var i = $(this),
								x;

							i.removeClass('polyfill-placeholder');

							switch (this.type) {

								case 'submit':
								case 'reset':
									break;

								case 'password':
									i.val(i.attr('defaultValue'));

									x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

									if (i.val() == '') {
										i.hide();
										x.show();
									}
									else {
										i.show();
										x.hide();
									}

									break;

								case 'checkbox':
								case 'radio':
									i.attr('checked', i.attr('defaultValue'));
									break;

								case 'text':
								case 'textarea':
									i.val(i.attr('defaultValue'));

									if (i.val() == '') {
										i.addClass('polyfill-placeholder');
										i.val(i.attr('placeholder'));
									}

									break;

								default:
									i.val(i.attr('defaultValue'));
									break;

							}
						});

				});

		return $this;

	};

	/ **
* Move os elementos de/para as primeiras posições de seus respectivos pais.
* @param {jQuery} $ elements - Elementos (ou seletor) para mover.
* @param {bool} condição se verdadeira, move os elementos para o topo. Caso contrário, move os elementos de volta para seus locais originais.
* /
	 
	$.prioritize = function($elements, condition) {

		var key = '__prioritize';

		/* Expanda $ elements se ainda não for um objeto jQuery.*/
		
			if (typeof $elements != 'jQuery')
				$elements = $($elements);

		/* Percorra os elementos. */
		
			$elements.each(function() {

				var	$e = $(this), $p,
					$parent = $e.parent();

				// Sem pai? 
				
					if ($parent.length == 0)
						return;

				// Não se moveu? Mova-o.
				
					if (!$e.data(key)) {

						// A condição é falsa?
						
							if (!condition)
								return;

				// Obtenha o espaço reservado (que servirá como nosso ponto de referência para quando este elemento precisar voltar).			
							
							$p = $e.prev();

				// Não conseguiu encontrar nada? Significa que este elemento já está no topo, então desista.							
								if ($p.length == 0)
									return;

				// Mova o elemento para o topo do seu respectivo pai.

							$e.prependTo($parent);

					// Marca o elemento como movido.
					
							$e.data(key, $p);

					}

				/* Já moveu? */
				
					else {

						/* A condição é verdadeira? */
						
							if (condition)
								return;

						$p = $e.data(key);

						/* Mova o elemento de volta ao seu local original (usando nosso espaço reservado). */
						
							$e.insertAfter($p);

						// Desmarque o elemento como movido.
						
							$e.removeData(key);

					}

			});

	});

})(jQuery); 
