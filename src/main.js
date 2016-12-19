import elrUI from 'elr-ui';
const $ = require('jquery');

let ui = elrUI();

const elrSimpleSlider = function({
    sliderClass = 'elr-simple-slider',
    slideClass = 'elr-simple-slide',
    slideHolderClass = 'elr-simple-slide-holder',
    effect = 'fade',
    navClass = 'elr-simple-slider-nav',
    slideListClass = 'elr-simple-slider-list',
    speed = 500,
    interval = 10000,
    auto = true
} = {}) {
    const $slider = $(`.${sliderClass}`);
    let isAnimating = false;
    const self = {
        createSlideList($slides) {
            let li = '';

            $.each($slides, function(index) {
                if (index === 0) {
                    li += `<li><button class="active" data-item-num="${index}"></button></li>`;
                } else {
                    li += `<li><button data-item-num="${index}"></button></li>`;
                }
            });

            return ui.createElement('ul', {
                'class': slideListClass,
                'html': li
            });
        },
        getCurrent($slideHolder) {
            const $slides = $slideHolder.find(`.${slideClass}`);

            if (effect === 'fade') {
                return $slides.not(':hidden').index();
            } else if (effect === 'slide-left') {
                return (Math.abs($slideHolder.position().left) / parseInt($slides.first().width(), 10));
            }
        },
        goToSlide(current, slideNum, $slideHolder) {
            const $slides = $slideHolder.find(`.${slideClass}`);

            if (effect === 'fade') {
                $slides.eq(current).fadeOut(speed);
                $slides.eq(slideNum).fadeIn(speed);
            } else if (effect === 'slide-left') {
                const slideWidth = parseInt($slides.first().width(), 10);
                const pos = $slideHolder.position().left;
                let newPos;

                if (current < slideNum) {
                    const slideDiff = current - slideNum;
                    newPos = pos + (slideWidth * slideDiff);
                } else if (current > slideNum) {
                    const slideDiff = -(current - slideNum);
                    newPos = pos - (slideWidth * slideDiff);
                }

                $slideHolder.stop().animate({
                    left: newPos
                }, speed);
            }
        },
        fadeSlide(current, dir, $slides) {
            const lastSlide = $slides.length - 1;

            $slides.eq(current).fadeOut(speed);

            if (dir === 'next' && current === lastSlide) {
                $slides.first().fadeIn(speed);

                return 0;
            } else if (dir === 'next') {
                $slides.eq(current + 1).fadeIn(speed);

                return current + 1;
            } else if (dir === 'prev' && current === 0) {
                $slides.eq(lastSlide).fadeIn(speed);

                return lastSlide;
            } else {
                $slides.eq(current - 1).fadeIn(speed);

                return current - 1;
            }
        },
        slideLeft(current, dir, $slides, $slideHolder) {
            // TODO: fix bug where paging doesn't work properly when paging from first to last slide

            const lastSlide = $slides.length - 1;
            const slideWidth = parseInt($slides.first().width(), 10);
            const pos = $slideHolder.position().left;

            isAnimating = true;

            if (dir === 'next' && current === lastSlide) {
                let $oldSlides = $slides;
                let $newSlides = $slides.clone();
                let numSlides = $slides.length;

                $slideHolder.css('width', slideWidth * (numSlides * 2));
                $slideHolder.append($newSlides);
                let newPos = pos - slideWidth;

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

                return 0;
            } else if (dir === 'next') {
                let newPos = pos - slideWidth;

                $slideHolder.stop().animate({
                    left: newPos
                }, speed, 'linear', function() {
                    isAnimating = false;
                });

                return (Math.abs(newPos) / slideWidth);
            } else if (dir === 'prev' && current === 0) {
                let $oldSlides = $slides;
                let $newSlides = $slides.clone();
                let numSlides = $slides.length;
                let width = slideWidth * numSlides;

                $slideHolder.css('width', width * 2);
                $slideHolder.prepend($newSlides);
                $slideHolder.css('left', -width);
                let newPos = -width + slideWidth;

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

                return numSlides - 1;
            } else {
                let newPos = pos + slideWidth;

                $slideHolder.stop().animate({
                    left: newPos
                }, speed, 'linear', function() {
                    isAnimating = false;
                });

                return (Math.abs(newPos) / slideWidth);
            }
        },
        advanceSlide(current, dir, $slideHolder) {
            const $slides = $slideHolder.find(`.${slideClass}`);

            if (effect === 'fade') {
                return self.fadeSlide(current, dir, $slides);
            } else if (effect === 'slide-left') {
                return self.slideLeft(current, dir, $slides, $slideHolder);
            }
        },
        pageSlide(e, $slideHolder) {
            const current = self.getCurrent($slideHolder);
            let dir;

            if (e.which === 37) {
                dir = 'prev';
            } else if (e.which === 39) {
                dir = 'next';
            } else {
                return;
            }

            return self.advanceSlide(current, dir, $slideHolder);
        },
        startShow(interval, $slideHolder, $slideList) {
            return setInterval(function() {
                // $nextControl.trigger('click');
                const current = self.getCurrent($slideHolder);
                const nextSlide = self.advanceSlide(current, 'next', $slideHolder);

                $slideList.find('button').removeClass('active');
                $slideList.find('li').eq(nextSlide).find('button').addClass('active');
            }, interval);
        },
        pauseShow(start) {
            clearInterval(start);
            // console.log('slider paused');
        }
    };

    if ($slider.length) {

        $.each($slider, function() {
            const $currentSlider = $(this);
            const $slideHolder = $currentSlider.find(`.${slideHolderClass}`);
            const $slides = $slideHolder.find(`.${slideClass}`);
            const $currentSliderControls = $currentSlider.find(`.${navClass}`).find('button');
            const $nextControl = $currentSlider.find(`.${navClass}`).find(`button[data-dir='next']`);
            const $body = $('body');
            let $slideList;
            let begin;

            // add overflow hidden to make sure only the current slide is visible
            $slideHolder.css({overflow: 'hidden'});

            if (effect === 'slide-left') {
                const slideWidth = $slides.first().width();
                const numSlides = $slides.length;

                $currentSlider.addClass('slide-left');
                $slideHolder.css('width', slideWidth * numSlides);
            } else if (effect === 'fade') {
                $slides.hide().first().show();
            }

            $slideList = self.createSlideList($slides).appendTo($currentSlider);

            if (auto) {
                begin = self.startShow(interval, $slideHolder, $slideList);

                $slides.on('mouseover', function() {
                    self.pauseShow(begin);
                });

                $slides.on('mouseout', function() {
                    begin = self.startShow(interval, $slideHolder, $slideList);
                });
            }

            $currentSliderControls.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const dir = $(this).data('dir');
                const current = self.getCurrent($slideHolder);
                const nextSlide = self.advanceSlide(current, dir, $slideHolder);

                $slideList.find('button').removeClass('active');
                $slideList.find('li').eq(nextSlide).find('button').addClass('active');
                self.pauseShow(begin);
            });

            $currentSlider.on({
                mouseenter: function () {
                    const $holder = $(this).find(`.${slideHolderClass}`);

                    $body.keydown(function(e) {
                        if(isAnimating) {
                            e.preventDefault();
                            return false;
                        }

                        const nextSlide = self.pageSlide(e, $holder);

                        $slideList.find('button').removeClass('active');
                        $slideList.find('li').eq(nextSlide).find('button').addClass('active');
                    });
                },
                mouseleave: function () {
                    $body.off('keydown');
                }
            });

            $currentSlider.on('click', `.${slideListClass} button`, function(e) {
                e.preventDefault();
                e.stopPropagation();

                const $that = $(this);
                const current = self.getCurrent($slideHolder);
                const slideNum = $that.data('item-num');

                $slideList.find('button').removeClass('active');
                $that.addClass('active');

                self.goToSlide(current, slideNum, $slideHolder);
                self.pauseShow(begin);
            });
        });
    }

    return self;
};

export default elrSimpleSlider;