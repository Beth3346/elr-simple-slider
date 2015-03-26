(function($) {
    window.drmSimpleSlider = function(args) {
        var self = {},
            spec = args || {};

        var sliderClass = spec.sliderClass || 'drm-simple-slider',
            slideClass = spec.slideClass || 'drm-simple-slide',
            interval = spec.interval || 5000,
            speed = spec.speed || 500,
            animate = spec.animate || false,
            slider = $('.' + sliderClass);

        self.navClass = spec.navClass || 'drm-simple-slider-nav';
        self.slideListClass = spec.slideListClass || 'drm-simple-slider-list';
        
        self.createSlideList = function(slides) {
            var li = '';

            $.each(slides, function(index) {
                if ( index === 0 ) {
                    li += '<li><button class="active" data-item-num="' + index + '"></button></li>';
                } else {
                    li += '<li><button data-item-num="' + index + '"></button></li>';
                }
            });

            return $('<ul></ul>', {
                'class': self.slideListClass,
                html: li
            });
        };

        self.getCurrent= function(slides) {
            return slides.not(':hidden').index() - 1;
        };

        self.goToSlide = function(current, slideNum, slides) {
            slides.eq(current).fadeOut();
            slides.eq(slideNum).fadeIn();
        };

        self.advanceSlide = function(current, dir, slides) {
            var lastSlide = slides.length - 1,
                nextSlide;

            slides.eq(current).fadeOut();

            if ( dir === 'next' && current === lastSlide ) {
                slides.first().fadeIn();
                nextSlide = 0;
            } else if ( dir === 'next' ) {
                slides.eq(current + 1).fadeIn();
                nextSlide = current + 1;
            } else if ( dir === 'prev' && current === 0 ) {
                slides.eq(lastSlide).fadeIn();
                nextSlide = lastSlide;
            } else {
                slides.eq(current - 1).fadeIn();
                nextSlide = current - 1;
            }

            slides.parent().find('.' + self.slideListClass).find('li').eq(nextSlide).find('button').addClass('active');
        };

        self.startShow = function(interval, slides, nextControl) {
            return setInterval(function() {
                nextControl.trigger('click');
            }, interval);
        };

        self.pauseShow = function(start) {
            clearInterval(start);
            console.log('slider paused');
        };

        if ( slider.length > 0 ) {

            $.each(slider, function() {
                var that = $(this),
                    slideHolder = that.find('div').first(),
                    slides = slideHolder.find('.' + slideClass),
                    sliderControls = that.find('.' + self.navClass).find('button'),
                    nextControl = that.find('.' + self.navClass).find("button[data-dir='next']"),
                    begin;
                
                slides.hide().first().show();
                self.createSlideList(slides).appendTo(slideHolder);

                if ( animate === true ) {
                    begin = self.startShow(interval, slides, nextControl);

                    slides.on('mouseover', function() {
                        self.pauseShow(begin);
                    });

                    slides.on('mouseout', function() {
                        begin = self.startShow(interval, slides, nextControl); 
                    });
                }

                sliderControls.on('click', function(e) {
                    var dir = $(this).data('dir'),
                        current = self.getCurrent(slides),
                        slideList = slideHolder.find('.' + self.slideListClass);

                    slideList.find('button').removeClass('active');
                    self.advanceSlide(current, dir, slides);

                    e.preventDefault();
                    e.stopPropagation();
                });

                that.on('click', '.' + self.slideListClass + ' button', function(e) {
                    var that = $(this),
                        current = self.getCurrent(slides),
                        slideNum = that.data('item-num'),
                        slideList = slideHolder.find('.' + self.slideListClass);;

                    slideList.find('button').removeClass('active');
                    that.addClass('active');

                    self.goToSlide(current, slideNum, slides);

                    e.preventDefault();
                    e.stopPropagation();                    
                });
            });
        }

        return self;
    };
})(jQuery);