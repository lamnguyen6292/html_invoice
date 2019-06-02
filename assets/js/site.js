jQuery(window).load( function () {
    CropImage( '.imggr',1 );
})

jQuery(document).ready( function () {
    App.init();
    App.initSliders();
    ParallaxSlider.initParallaxSlider();

    $( "a[rel^='zoomphoto']" ).prettyPhoto( { default_width: "100%", default_height: "100%" } );

    $( ".template .img-wrapper .zoomer" ).click( function () {
        var src = $( this ).find( "img" ).attr( "src" );

        $( ".template #img-show" ).hide();
        $( ".template #img-show" ).attr( "src", src );
        $( ".template #img-show" ).fadeIn();

        $( ".template .img-wrapper .zoomer" ).removeClass( "active" );
        $( this ).addClass( "active" );
    } )

    //$("img.lazy").lazyload({ event: "sporty" });

    //$(window).bind("load", function () {
    //    var timeout = setTimeout(function () {
    //        $("img.lazy").trigger("sporty")
    //    }, 0);
    //});

    //$(window).on("load resize", getResize);
    //function getResize() {
    //    var widthWindow = $(window).outerWidth(true);
    //    if (widthWindow > 768) {
    //        var height_slide = $("#Slider .carousel-inner .item:first-child").outerHeight(true);
    //        $(".e-tracuu .e-tracuu-body").css("height", height_slide - 3);
    //    } else {
    //        $(".e-tracuu .e-tracuu-body").css("height", 487);
    //    }
    //}
    $( ".btn-tracuu-down" ).click( function () {
        $( ".e-tracuu-body" ).toggle();
        $( ".tracuu-footer" ).toggle();
        $( ".so_xacthuc" ).focus();
    } );
} );

function CropImage( oSelector, cropType ) {
    //Xét kiểu cắt: 1: bỏ phần thừa, 0: không bỏ phần thừa( co ảnh lại và để trống 2 phía)
    if ( typeof cropType == 'undefined' )
        cropType = 1;


    /*Ý nghĩa hàm: Chỉnh width, height ảnh sao cho ảnh đại diện không bị méo khi hiển thị*/
    var listFrame = jQuery( '' + oSelector + '' ); //Tìm tất cả các đối tượng cần crop ảnh theo điều kiện tìm kiếm            
    /*
    Chú ý: các khung chứa ảnh cần có cấu trúc như sau

    <div class='khungAnh'>
    <img src="img/pic1.jpg"/>
    </div>

    Trong đó: class khungAnh phải fix width, height, overflow:hidden, position:relative - Mục đích: tạo khung chứa ảnh
    */

    var maxwidth; var maxheight; var child; var width; var height; var time;
    for ( var i = 0; i < listFrame.length; i++ ) {//Duyệt qua tất cả các đối tượng tìm thấy

        maxwidth = jQuery( listFrame[i] ).outerWidth(); //Lấy chiều rộng của khung
        maxheight = jQuery( listFrame[i] ).outerHeight(); //Lấy chiều cao của khung        
        child = jQuery( listFrame[i] ).find( "img" ); //Tìm con trong khung (trường hợp này là thẻ img)
        width = child.outerWidth(); //Lấy width của img
        height = child.outerHeight(); //Lấy height của img     
        time = 0;//Thời gian
        if ( cropType == 1 ) {
            if ( ( width / height ) > ( maxwidth / maxheight ) )//Nếu ảnh thừa width --> fix height
            {
                //Tính width thiếu theo tỉ lệ
                width = width * ( maxheight / height );

                //Đặt lại position để ảnh rơi vào giữa khung
                var left = width - maxwidth;
                left = left / 2;

                child.css( { "position": "absolute", "z-index": 1, "top": 0, "left": 0 } )
                jQuery( child ).animate( { "left": -left + "px", "top": 0, "height": maxheight + "px", "width": width + "px" }, time );

            }
            else {//Nếu thừa height --> fix width

                //Tính height thiếu theo tỉ lệ
                height = height * ( maxwidth / width );

                //Đặt lại position để ảnh rơi vào giữa khung
                var top = height - maxheight;
                top = top / 2;

                child.css( { "position": "absolute", "z-index": 1, "top": 0, "left": 0 } )
                jQuery( child ).animate( { "top": -top + "px", "left": 0, "width": maxwidth + "px", "height": height + "px" }, time );
            }
        }
        else {
            if ( ( width / height ) > ( maxwidth / maxheight ) )//Nếu ảnh thừa width --> fix width
            {
                //Tính height thiếu theo tỉ lệ
                height = height * ( maxwidth / width );

                //Đặt lại position để ảnh rơi vào giữa khung
                var top = maxheight - height;
                top = top / 2;

                child.css( { "position": "absolute", "z-index": 1, "top": 0, "left": 0 } )
                jQuery( child ).animate( { "top": top + "px", "left": 0, "width": maxwidth + "px", "height": height + "px" }, time );
            }
            else {//Nếu thừa height --> fix height
                //Tính width thiếu theo tỉ lệ
                width = width * ( maxheight / height );

                //Đặt lại position để ảnh rơi vào giữa khung
                var left = maxwidth - width;
                left = left / 2;

                child.css( { "position": "absolute", "z-index": 1, "top": 0, "left": 0 } )
                jQuery( child ).animate( { "left": left + "px", "top": 0, "height": maxheight + "px", "width": width + "px" }, time );
            }
        }
    }
}