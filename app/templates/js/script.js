(function (window, document, $, undefined) {

    /*
     * VARIABLES
     */
    var navClass = 'nav';
    var customSelect = $('select').length ? $('select').customSelect({
        customClass: 'custom-select'
    }) : '';



    /*
     * FUNCTIONS
     */
    // Off canvas nav toggle
    function toggleNav(event, navClass) {
        $('.' + navClass).toggleClass(navClass + '_is_visible');
        $('.' + navClass + '--overlay').toggleClass(navClass + '--overlay_is_visible');
        event.preventDefault();
    }


    /*
     * ON LOAD
     */



    /*
     * EVENTS
     */
    // Off canvas nav toggle
    $('.' + navClass + '--btn,' +
      '.' + navClass + '--overlay').on('click touchstart', function(e){
        toggleNav(e, navClass);
    });


})(window, document, jQuery);