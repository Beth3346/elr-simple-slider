###############################################################################
# A simple jQuery slider
###############################################################################

( ($) ->

    drmSimpleSlider = {
        slider: $ '.drm-simple-slider'
        slideHolder: $ '.drm-simple-slide-holder'
        slideList: $ '.drm-simple-slider-list'        

        config: {
            play: 10000
            speed: 300
            animate: 'yes'
        }

        init: (config) ->
            $.extend @.config, config
            slides = @.slideHolder.find '.drm-simple-slide'
            current = 0
            sliderControls = $('.drm-simple-slider-nav').find 'button'

            ## Initialize
            
            if slides.length > 1
                sliderControls.show()
                @.slideList.show()
                @.slideList.find('button').first().addClass 'active'
                slides.hide()
                slides.first().show()
            else
                sliderControls.hide()
                @.slideList.hide()
                slides.first().show()

            if drmSimpleSlider.config.animate == 'yes'
                begin = @.startShow()
                pause = -> drmSimpleSlider.pauseShow begin
                $(window).on 'load', $.proxy begin
                @.slideHolder.on 'mouseenter', pause

            sliderControls.on 'click', @.advanceImage
            @.slideList.on 'click', 'button', @.goToImage

        getCurrent: ->            
            slides = drmSimpleSlider.slideHolder.find '.drm-simple-slide'
            currentSlide = slides.not ':hidden'
            current = slides.index currentSlide

            return current

        advanceImage: ->
            slides = drmSimpleSlider.slideHolder.find '.drm-simple-slide'
            last = slides.length - 1
            current = drmSimpleSlider.getCurrent()
            dir = $(@).data 'dir'

            nextImage = (current) ->
                if current == last
                    next = 0
                else    
                    next = current + 1
                return next

            prevImage = (current) ->
                if current == 0
                    next = last
                else
                    next = current - 1
                return next

            next = if dir == 'prev' then prevImage(current) else nextImage(current)

            drmSimpleSlider.replaceImage(current, next)       

        goToImage: ->
            current = drmSimpleSlider.getCurrent()
            next = $(@).data 'item-num'
            drmSimpleSlider.replaceImage(current, next)

        replaceImage: (current, next) ->
            links = drmSimpleSlider.slideList.find 'button'
            speed = drmSimpleSlider.config.speed
            slides = drmSimpleSlider.slideHolder.find '.drm-simple-slide'

            slides.eq(current).fadeOut speed, ->
                slides.eq(next).fadeIn speed
                links.removeClass 'active'
                links.eq(next).addClass 'active'

        startShow: ->
            slides = drmSimpleSlider.slideHolder.find '.drm-simple-slide'
            nextControl = $('.drm-simple-slider-nav').find "button[data-dir='next']"

            if slides.length > 1              
                start = setInterval ->
                    nextControl.trigger 'click'
                , drmSimpleSlider.config.play
            return start

        pauseShow: (start) ->
            clearInterval start
    }

    drmSimpleSlider.init()

) jQuery