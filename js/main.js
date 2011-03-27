var ScH;
var ScW;
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
    brands();
});
$(window).resize(function () {
    background();
});
function background() {
    var d = new Date();
    $("#time").text(" " + d.getHours() + ":" + d.getMinutes() + " " + d.getSeconds() + "-" + d.getMilliseconds() + "-" + d.getUTCMilliseconds());
    ScH = $(window).height();
    ScW = $(window).width();
    OrgW = ScW * .45;
    ReW = ((OrgW * 283) / 470);

    $("#content").height(ScH).width(ScW);
    $("#background_orange").width(OrgW);
    $("#background_orange").height(ScH);
    $("#background_teal, #background_teal img").width(ScW);
    $("#background_teal, #background_teal img").height(ScH);
    $("#receipt_inner").width(ReW * (260 / 283));

    $("#income, #filed_as, #year").css({ "width": OrgW * (160 / 470) }).attr({ "width": (ReW * (55 / 470)) });

    $("#receipt").width(ReW);
    $("#receipt").css({ "font-size": ((OrgW * 14) / 470) });
    $("#receipt *").css({ "font-size": (OrgW * 14) / 470 });
    $("#receipt .big, #receipt * .big, .l_main .med, .l_main * .med ").css({ "font-size": (OrgW * 22) / 470 });
    $("#receipt .med, #receipt * .med, .l_main .small, .l_main * .small").css({ "font-size": (OrgW * 18) / 470 });
    $("#rec_tab").width(ReW - (ReW * .1));
    RePT = (ScH - $("#receipt").height()) / 2;
    LSf = (OrgW * 50) / 470;
    if ($(".l_main").height() > ScH) { LSf = (OrgW * 35) / 470; }
    $(".l_main .big, .l_main * .big, #taxes_paid, #income").css({ "font-size": LSf, "line-height": Math.floor(LSf - (LSf * .2)) + "px" });
    if ((ScH - $(".l_main").height()) / 2 > 1) {
        paddTop = (ScH - $(".l_main").height()) / 2;
    } else {
        paddTop = 0;
    }
    $(".l_main").css({ "padding-top": (ScH - $(".l_main").height()) / 2 });
    if ((ScH - $("#receipt").height()) / 2 > 1) {
        paddTop = (ScH - $("#receipt").height()) / 2;
    } else {
        paddTop = 0;
    }
    if ($("#receipt").height() < ScH) {
        $("#receipt").css({ "margin-top": (ScH - $("#receipt").height()) / 2, "margin-bottom": 0 });
    } else {
        $("#receipt").css({ "margin-top": "10%", "margin-bottom": "10%" });
    }
    //$("#glow").height($("#receipt").height()).width($("#receipt").width());
    //$("#glow").css({ "right": ((OrgW - OrgW) / 2) });
}

function brands() {
    $(".brand").mouseover(function () {
        $(this).stop().animate({ opacity: .99 });
    });
    $(".brand").mouseout(function () {
        if ($(this).hasClass("selected") == false) {
            $(this).stop().animate({ opacity: .40 });
        }
    });
    $(".brand").each(function () {
        var Index = $(".brand").index(this) + 1;
        if ($(this).hasClass("selected")) {
            $(this).css({ "background-image": "url('img/" + Index + "_01.png')" }).css({ opacity: .99 });
        } else {
            $(this).css({ "background-image": "url('img/" + Index + "_00.png')" });
        }
    });
    $(".brand").click(function () {
        $(this).siblings(".brand").removeClass("selected");
        $(this).addClass("selected");
        $(this).siblings(".brand").stop().animate({ opacity: .40 });
        $(".brand").each(function () {
            var Index = $(".brand").index(this) + 1;
            if ($(this).hasClass("selected")) {
                $(this).css({ "background-image": "url('img/" + Index + "_01.png')" }).css({ opacity: .99 });
            } else {
                $(this).css({ "background-image": "url('img/" + Index + "_00.png')" });
            }
        });
    });

}