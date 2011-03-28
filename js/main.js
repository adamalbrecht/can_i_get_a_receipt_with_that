var screen_height;
var screen_width;
var OrgW;
var RePT;
var ReW;
var ReH;
var LSf;
var paddTop;
$(document).ready(function () {
    $("#detail_level").change(function () {
        if (this.checked) {
            $(this).prev().attr({ "src": "img/corner00.png" });
        } else {
            $(this).prev().attr({ "src": "img/corner01.png" });
        }
    });
});
$(window).resize(function () {
    background();
});
function background() {
    screen_height = $(window).height();
    screen_width = $(window).width();
    OrgW = screen_width * .45;
    ReW = ((OrgW * 283) / 470);

    $("#receipt").css({ "font-size": ((OrgW * 14) / 470) });
    $("#receipt *").css({ "font-size": (OrgW * 14) / 470 });
    $("#receipt .big, #receipt * .big").css({ "font-size": (OrgW * 22) / 470 });
    $("#receipt .med, #receipt * .med").css({ "font-size": (OrgW * 18) / 470 });
    
    // $("#rec_tab").width(ReW - (ReW * .1));
    RePT = (screen_height - $("#receipt").height()) / 2;
    LSf = (OrgW * 50) / 470;
    if ($(".l_main").height() > screen_height) { LSf = (OrgW * 35) / 470; }
    if ((screen_height - $(".l_main").height()) / 2 > 1) {
        paddTop = (screen_height - $(".l_main").height()) / 2;
    } else {
        paddTop = 0;
    }
    // if ($("#receipt").height() < screen_height) {
    //     $("#receipt").css({ "margin-top": (screen_height - $("#receipt").height()) / 2, "margin-bottom": 0 });
    // } else {
    //     $("#receipt").css({ "margin-top": "10%", "margin-bottom": "10%" });
    // }
    //$("#glow").height($("#receipt").height()).width($("#receipt").width());
    //$("#glow").css({ "right": ((OrgW - OrgW) / 2) });
}
