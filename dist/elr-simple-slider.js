'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _elrUtilities = require('elr-utilities');

var _elrUtilities2 = _interopRequireDefault(_elrUtilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $ = require('jquery');

var elr = (0, _elrUtilities2.default)();

var elrSimpleSlider = function elrSimpleSlider() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$sliderClass = _ref.sliderClass,
        sliderClass = _ref$sliderClass === undefined ? 'elr-simple-slider' : _ref$sliderClass,
        _ref$slideClass = _ref.slideClass,
        slideClass = _ref$slideClass === undefined ? 'elr-simple-slide' : _ref$slideClass,
        _ref$slideHolderClass = _ref.slideHolderClass,
        slideHolderClass = _ref$slideHolderClass === undefined ? 'elr-simple-slide-holder' : _ref$slideHolderClass,
        _ref$effect = _ref.effect,
        effect = _ref$effect === undefined ? 'fade' : _ref$effect,
        _ref$navClass = _ref.navClass,
        navClass = _ref$navClass === undefined ? 'elr-simple-slider-nav' : _ref$navClass,
        _ref$slideListClass = _ref.slideListClass,
        slideListClass = _ref$slideListClass === undefined ? 'elr-simple-slider-list' : _ref$slideListClass,
        _ref$speed = _ref.speed,
        speed = _ref$speed === undefined ? 500 : _ref$speed,
        _ref$interval = _ref.interval,
        interval = _ref$interval === undefined ? 10000 : _ref$interval,
        _ref$auto = _ref.auto,
        auto = _ref$auto === undefined ? true : _ref$auto;

    var $slider = $('.' + sliderClass);
    var isAnimating = false;
    var self = {
        createSlideList: function createSlideList($slides) {
            var li = '';

            $.each($slides, function (index) {
                if (index === 0) {
                    li += '<li><button class="active" data-item-num="' + index + '"></button></li>';
                } else {
                    li += '<li><button data-item-num="' + index + '"></button></li>';
                }
            });

            return elr.createElement('ul', {
                'class': slideListClass,
                'html': li
            });
        },
        getCurrent: function getCurrent($slideHolder) {
            var $slides = $slideHolder.find('.' + slideClass);

            if (effect === 'fade') {
                return $slides.not(':hidden').index();
            } else if (effect === 'slide-left') {
                return Math.abs($slideHolder.position().left) / parseInt($slides.first().width(), 10);
            }
        },
        goToSlide: function goToSlide(current, slideNum, $slideHolder) {
            var $slides = $slideHolder.find('.' + slideClass);

            if (effect === 'fade') {
                $slides.eq(current).fadeOut(speed);
                $slides.eq(slideNum).fadeIn(speed);
            } else if (effect === 'slide-left') {
                var slideWidth = parseInt($slides.first().width(), 10);
                var pos = $slideHolder.position().left;
                var newPos = void 0;

                if (current < slideNum) {
                    var slideDiff = current - slideNum;
                    newPos = pos + slideWidth * slideDiff;
                } else if (current > slideNum) {
                    var _slideDiff = -(current - slideNum);
                    newPos = pos - slideWidth * _slideDiff;
                }

                $slideHolder.stop().animate({
                    left: newPos
                }, speed);
            }
        },
        fadeSlide: function fadeSlide(current, dir, $slides) {
            var lastSlide = $slides.length - 1;

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
        slideLeft: function slideLeft(current, dir, $slides, $slideHolder) {
            // TODO: fix bug where paging doesn't work properly when paging from first to last slide

            var lastSlide = $slides.length - 1;
            var slideWidth = parseInt($slides.first().width(), 10);
            var pos = $slideHolder.position().left;

            isAnimating = true;

            if (dir === 'next' && current === lastSlide) {
                var _ret = function () {
                    var $oldSlides = $slides;
                    var $newSlides = $slides.clone();
                    var numSlides = $slides.length;

                    $slideHolder.css('width', slideWidth * (numSlides * 2));
                    $slideHolder.append($newSlides);
                    var newPos = pos - slideWidth;

                    $slideHolder.stop().animate({
                        left: newPos
                    }, speed, 'linear', function () {
                        $slideHolder.css({
                            'width': slideWidth * numSlides,
                            'left': 0
                        });
                        $oldSlides.remove();
                        isAnimating = false;
                    });

                    return {
                        v: 0
                    };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            } else if (dir === 'next') {
                var _newPos = pos - slideWidth;

                $slideHolder.stop().animate({
                    left: _newPos
                }, speed, 'linear', function () {
                    isAnimating = false;
                });

                return Math.abs(_newPos) / slideWidth;
            } else if (dir === 'prev' && current === 0) {
                var _ret2 = function () {
                    var $oldSlides = $slides;
                    var $newSlides = $slides.clone();
                    var numSlides = $slides.length;
                    var width = slideWidth * numSlides;

                    $slideHolder.css('width', width * 2);
                    $slideHolder.prepend($newSlides);
                    $slideHolder.css('left', -width);
                    var newPos = -width + slideWidth;

                    $slideHolder.stop().animate({
                        left: newPos
                    }, speed, 'linear', function () {
                        $slideHolder.css({
                            'width': width,
                            'left': -(width - slideWidth)
                        });
                        $oldSlides.remove();
                        isAnimating = false;
                    });

                    return {
                        v: numSlides - 1
                    };
                }();

                if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
            } else {
                var _newPos2 = pos + slideWidth;

                $slideHolder.stop().animate({
                    left: _newPos2
                }, speed, 'linear', function () {
                    isAnimating = false;
                });

                return Math.abs(_newPos2) / slideWidth;
            }
        },
        advanceSlide: function advanceSlide(current, dir, $slideHolder) {
            var $slides = $slideHolder.find('.' + slideClass);

            if (effect === 'fade') {
                return self.fadeSlide(current, dir, $slides);
            } else if (effect === 'slide-left') {
                return self.slideLeft(current, dir, $slides, $slideHolder);
            }
        },
        pageSlide: function pageSlide(e, $slideHolder) {
            var current = self.getCurrent($slideHolder);
            var dir = void 0;

            if (e.which === 37) {
                dir = 'prev';
            } else if (e.which === 39) {
                dir = 'next';
            } else {
                return;
            }

            return self.advanceSlide(current, dir, $slideHolder);
        },
        startShow: function startShow(interval, $slideHolder, $slideList) {
            return setInterval(function () {
                // $nextControl.trigger('click');
                var current = self.getCurrent($slideHolder);
                var nextSlide = self.advanceSlide(current, 'next', $slideHolder);

                $slideList.find('button').removeClass('active');
                $slideList.find('li').eq(nextSlide).find('button').addClass('active');
            }, interval);
        },
        pauseShow: function pauseShow(start) {
            clearInterval(start);
            console.log('slider paused');
        }
    };

    if ($slider.length) {

        $.each($slider, function () {
            var $currentSlider = $(this);
            var $slideHolder = $currentSlider.find('.' + slideHolderClass);
            var $slides = $slideHolder.find('.' + slideClass);
            var $currentSliderControls = $currentSlider.find('.' + navClass).find('button');
            var $nextControl = $currentSlider.find('.' + navClass).find("button[data-dir='next']");
            var $body = $('body');
            var $slideList = void 0;
            var begin = void 0;

            // add overflow hidden to make sure only the current slide is visible
            $slideHolder.css({ overflow: 'hidden' });

            if (effect === 'slide-left') {
                var slideWidth = $slides.first().width();
                var numSlides = $slides.length;

                $currentSlider.addClass('slide-left');
                $slideHolder.css('width', slideWidth * numSlides);
            } else if (effect === 'fade') {
                $slides.hide().first().show();
            }

            $slideList = self.createSlideList($slides).appendTo($currentSlider);

            if (auto) {
                begin = self.startShow(interval, $slideHolder, $slideList);

                $slides.on('mouseover', function () {
                    self.pauseShow(begin);
                });

                $slides.on('mouseout', function () {
                    begin = self.startShow(interval, $slideHolder, $slideList);
                });
            }

            $currentSliderControls.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var dir = $(this).data('dir');
                var current = self.getCurrent($slideHolder);
                var nextSlide = self.advanceSlide(current, dir, $slideHolder);

                $slideList.find('button').removeClass('active');
                $slideList.find('li').eq(nextSlide).find('button').addClass('active');
                self.pauseShow(begin);
            });

            $currentSlider.on({
                mouseenter: function mouseenter() {
                    var $holder = $(this).find('.' + slideHolderClass);

                    $body.keydown(function (e) {
                        if (isAnimating) {
                            e.preventDefault();
                            return false;
                        }

                        var nextSlide = self.pageSlide(e, $holder);

                        $slideList.find('button').removeClass('active');
                        $slideList.find('li').eq(nextSlide).find('button').addClass('active');
                    });
                },
                mouseleave: function mouseleave() {
                    $body.off('keydown');
                }
            });

            $currentSlider.on('click', '.' + slideListClass + ' button', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var $that = $(this);
                var current = self.getCurrent($slideHolder);
                var slideNum = $that.data('item-num');

                $slideList.find('button').removeClass('active');
                $that.addClass('active');

                self.goToSlide(current, slideNum, $slideHolder);
                self.pauseShow(begin);
            });
        });
    }

    return self;
};

exports.default = elrSimpleSlider;