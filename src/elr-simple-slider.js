(function($) {

    window.elrSimpleSlider = function(params) {
        var self = {};
        var spec = params || {};
        var sliderClass = spec.sliderClass || 'elr-simple-slider';
        var slideClass = spec.slideClass || 'elr-simple-slide';
        var slideHolderClass = spec.slideHolderClass || 'elr-simple-slide-holder';
        var effect = spec.effect || 'fade';
        var navClass = spec.navClass || 'elr-simple-slider-nav';
        var slideListClass = spec.slideListClass || 'elr-simple-slider-list';
        var isAnimating = false;
        var speed = spec.speed || 500;
        var interval = spec.interval || 5000;
        var auto = spec.auto || true;
        var $slider = $('.' + sliderClass);

        var createSlideList = function($slides) {
            var li = '';

            $.each($slides, function(index) {
                if ( index === 0 ) {
                    li += '<li><button class="active" data-item-num="' + index + '"></button></li>';
                } else {
                    li += '<li><button data-item-num="' + index + '"></button></li>';
                }
            });

            return elr.createElement('ul', {
                'class': slideListClass,
                'html': li
            });
        };

        var getCurrent = function($slideHolder) {
            var $slides = $slideHolder.find('.' + slideClass);

            if ( effect === 'fade' ) {
                return $slides.not(':hidden').index();                
            } else if ( effect === 'slide-left' ) {
                return (Math.abs($slideHolder.position().left) / parseInt($slides.first().width(), 10));
            }
        };

        var goToSlide = function(current, slideNum, $slideHolder) {
            var $slides = $slideHolder.find('.' + slideClass);

            if ( effect === 'fade' ) {
                $slides.eq(current).fadeOut(speed);
                $slides.eq(slideNum).fadeIn(speed);
            } else if ( effect === 'slide-left' ) {
                var slideWidth = parseInt($slides.first().width(), 10);
                var pos = $slideHolder.position().left;
                var slideDiff;
                var newPos;

                if ( current < slideNum ) {
                    slideDiff = current - slideNum;
                    newPos = pos + (slideWidth * slideDiff);
                } else if ( current > slideNum ) {
                    slideDiff = -(current - slideNum);
                    newPos = pos - (slideWidth * slideDiff);
                }
                
                $slideHolder.stop().animate({
                    left: newPos
                }, speed);
            }
        };

        var fadeSlide = function(current, dir, $slides) {
            var lastSlide = $slides.length - 1,
                nextSlide;

            $slides.eq(current).fadeOut(speed);

            if ( dir === 'next' && current === lastSlide ) {
                $slides.first().fadeIn(speed);
                nextSlide = 0;
            } else if ( dir === 'next' ) {
                $slides.eq(current + 1).fadeIn(speed);
                nextSlide = current + 1;
            } else if ( dir === 'prev' && current === 0 ) {
                $slides.eq(lastSlide).fadeIn(speed);
                nextSlide = lastSlide;
            } else {
                $slides.eq(current - 1).fadeIn(speed);
                nextSlide = current - 1;
            }

            return nextSlide;
        };

        var slideLeft = function(current, dir, $slides, $slideHolder) {
            var lastSlide = $slides.length - 1;
            var slideWidth = parseInt($slides.first().width(), 10);
            var pos = $slideHolder.position().left;
            var newPos;
            var $newSlides;
            var numSlides;
            var nextSlide;
            var width;
            var $oldSlides;

            isAnimating = true;

            if ( dir === 'next' && current === lastSlide ) {
                $oldSlides = $slides;
                $newSlides = $slides.clone();
                numSlides = $slides.length;
                
                $slideHolder.css('width', slideWidth * (numSlides * 2));
                $slideHolder.append($newSlides);
                newPos = pos - slideWidth;
                
                $slideHolder.stop().animate({
                    left: newPos
                }, speed, 'linear', function() {
                    $slideHolder.css({
                        'width': slideWidth * numSlides,
                        'left': 0
                    });
                    $oldSlides.remove();
                    isAnimating = false;
                });

                nextSlide = 0;
            } else if ( dir === 'next' ) {
                newPos = pos - slideWidth;
                nextSlide = (Math.abs(newPos) / slideWidth);
                
                $slideHolder.stop().animate({
                    left: newPos
                }, speed, 'linear', function() {
                    isAnimating = false;
                });
            } else if ( dir === 'prev' && current === 0 ) {
                $oldSlides = $slides;
                $newSlides = $slides.clone();
                numSlides = $slides.length;
                width = slideWidth * numSlides;
                
                $slideHolder.css('width', width * 2);
                $slideHolder.prepend($newSlides);
                $slideHolder.css('left', -width);
                newPos = -width + slideWidth;
                
                $slideHolder.stop().animate({
                    left: newPos
                }, speed, 'linear', function() {
                    $slideHolder.css({
                        'width': width,
                        'left': -(width - slideWidth)
                    });
                    $oldSlides.remove();
                    isAnimating = false;
                });

                nextSlide = numSlides - 1;
            } else {
                newPos = pos + slideWidth;
                nextSlide = (Math.abs(newPos) / slideWidth);
                
                $slideHolder.stop().animate({
                    left: newPos
                }, speed, 'linear', function() {
                    isAnimating = false;
                });
            }
            
            return nextSlide;
        };

        var advanceSlide = function(current, dir, $slideHolder) {
            var $slides = $slideHolder.find('.' + slideClass);

            if ( effect === 'fade' ) {
                return fadeSlide(current, dir, $slides);
            } else if ( effect === 'slide-left' ) {
                return slideLeft(current, dir, $slides, $slideHolder);
            }
        };

        var pageSlide = function(e, $slideHolder) {
            var current = getCurrent($slideHolder);
            var dir;
            
            if (e.which === 37) {   
                dir = 'prev';
            } else if (e.which === 39) {
                dir = 'next';
            } else {
                return;
            }

            return advanceSlide(current, dir, $slideHolder);                                
        };

        var startShow = function(interval, $slides, $nextControl) {
            return setInterval(function() {
                $nextControl.trigger('click');
            }, interval);
        };

        var pauseShow = function(start) {
            clearInterval(start);
            console.log('slider paused');
        };

        if ( $slider.length ) {

            $.each($slider, function() {
                var $currentSlider = $(this);
                var $slideHolder = $currentSlider.find('.' + slideHolderClass);
                var $slides = $slideHolder.find('.' + slideClass);
                var $currentSliderControls = $currentSlider.find('.' + navClass).find('button');
                var $nextControl = $currentSlider.find('.' + navClass).find("button[data-dir='next']");
                var $body = $('body');
                var $slideList;
                var begin;

                if ( effect === 'slide-left' ) {
                    var slideWidth = $slides.first().width(),
                        numSlides = $slides.length;

                    $currentSlider.addClass('slide-left');
                    $slideHolder.css('width', slideWidth * numSlides);
                } else if ( effect === 'fade' ) {
                    $slides.hide().first().show();
                }

                $slideList = createSlideList($slides).appendTo($currentSlider);

                if ( auto ) {
                    begin = startShow(interval, $slides, $nextControl);

                    $slides.on('mouseover', function() {
                        pauseShow(begin);
                    });

                    $slides.on('mouseout', function() {
                        begin = startShow(interval, $slides, $nextControl); 
                    });
                }

                $currentSliderControls.on('click', function(e) {
                    var dir = $(this).data('dir'),
                        current = getCurrent($slideHolder),
                        nextSlide;

                    nextSlide = advanceSlide(current, dir, $slideHolder);

                    $slideList.find('button').removeClass('active');
                    $slideList.find('li').eq(nextSlide).find('button').addClass('active');

                    e.preventDefault();
                    e.stopPropagation();
                });

                $currentSlider.on({
                    mouseenter: function () {
                        var $holder = $(this).find('.' + slideHolderClass);
                        
                        $body.keydown(function(e) {
                            if( isAnimating ) {
                                e.preventDefault();
                                return false;
                            }

                            var nextSlide = pageSlide(e, $holder);

                            $slideList.find('button').removeClass('active');
                            $slideList.find('li').eq(nextSlide).find('button').addClass('active');
                        });
                    },
                    mouseleave: function () {
                        $body.off('keydown');
                    }
                });

                $currentSlider.on('click', '.' + slideListClass + ' button', function(e) {
                    var $that = $(this);
                    var current = getCurrent($slideHolder);
                    var slideNum = $that.data('item-num');

                    $slideList.find('button').removeClass('active');
                    $that.addClass('active');

                    goToSlide(current, slideNum, $slideHolder);

                    e.preventDefault();
                    e.stopPropagation();                    
                });
            });
        }

        return self;
    };
})(jQuery);