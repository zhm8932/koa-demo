$(function () {
    const pathname = window.location.pathname;
    let $nav = $('.nav'),
        $dtA = $nav.find('dt a'),
        $ddA = $nav.find('dd a');
    console.log("$ddA:",$ddA)
    $.each($dtA,function (index,item) {
        console.log("dtA",item)
        if($(item).attr('href')==pathname){
            $(item).parent().addClass('on').siblings().removeClass()
            $(item).parent().next('dd').show()
        }else{
            // $(item).parent().removeClass()
        }
    })

    $('body').on('click','.nav dt',function (){
        console.log("this:",$(this).text())
        $(this).addClass('on').siblings().removeClass()
        $(this).next('dd').slideToggle().siblings('dd').slideUp()
    })
    $.each($ddA,function (index,item) {
        console.log("ddA:",$(item).attr('href'))
        if($(item).attr('href')==pathname){
            $(item).addClass('on').siblings().removeClass();
            $(item).parent().show();
            $(item).parent().prev('dt').addClass('on');
        }
    })

})