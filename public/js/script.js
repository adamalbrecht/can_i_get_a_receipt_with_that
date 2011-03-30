$(function(){ 
  var controller = CONTROLLER.init();
});


// The CONTROLLER is for typing together the data (MODEL) and the UI (VIEW)
var CONTROLLER = new function() {
  var me = this;
  var view = null;
  var model = null;
  me.init = function() {
    view = VIEW.init(query_fields_changed);
    model = MODEL.init();
    me.update_receipt(view.get_search_params());
    return me;
  };

  // Using the given paramaters, pull the data and update the receipt UI
  me.update_receipt = function(params) {
    view.show_loader_graphic();
    model.query(params, function(data, new_params) {
      var results = model.parse_query_results(data, new_params.currency);
      var template = new_params.currency == "dollars" ? "dollars_template" : "barter_template"
      view.update_receipt(results, template);
      view.hide_loader_graphic();
    });
  };

  // When any of the inputs change, get the current inputs and update the receipt
  var query_fields_changed = function() {
    view.update_input_spans();
    params = view.get_search_params();
    me.update_receipt(params);
  };
};




var VIEW = new function() {
  var me = this;
  var on_field_change = null;

  // Do any UI initialization work
  me.init = function(field_change_callback) {
    $(window).resize(function(){
      scale_font_size();
    });
    initialize_background();
    scale_font_size();
    initialize_receipt_ui();
    initialize_inputs();
    initialize_brands_ui();
    on_field_change = field_change_callback;

    watch_field_inputs();
    return me;
  };

  var initialize_receipt_ui = function() {
    var d = new Date();
    $("#display_date").text((d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear());
    $("#display_time").text(" " + d.getHours() + ":" + d.getMinutes() + " " + d.getSeconds() + "-" + d.getMilliseconds() + "-" + d.getUTCMilliseconds());
  };

  // Initialize the various inputs UI
  var initialize_inputs = function() {
    setup_input_tooltip("#year_span", "#year_popup");
    setup_input_tooltip("#income_span", "#income_popup");
    $("#detail_level").change(function () {
        if (this.checked) {
            $(this).prev().attr({ "src": "img/corner00.png" });
        } else {
            $(this).prev().attr({ "src": "img/corner01.png" });
        }
    });
    
    add_income_option(500, false)
    add_income_option(1000, false);
    add_income_option(2000, false);
    add_income_option(3000, false);
    add_income_option(4000, false);
    for(var i=5000; i<=45000; i+=5000) {
      add_income_option(i, false);
    }
    add_income_option(50000, true);
    for (var i=60000; i<=100000; i+=10000) {
      add_income_option(i, false);
    }
    for (var i=125000; i<=300000; i+=25000) {
      add_income_option(i, false);
    }
    for (var i=350000; i<=500000; i+=50000) {
      add_income_option(i, false);
    }
    for (var i=600000; i<=1000000; i+=100000) {
      add_income_option(i, false);
    }
    for (var i=2000000; i<=10000000; i+=1000000) {
      add_income_option(i, false);
    }
    for (var i=10000000; i<=100000000; i+=10000000) {
      add_income_option(i, false);
    }
  };

  var add_income_option = function(amount, selected) {
    var option = "<option value='" + amount + "'";
    if (selected == true) {
      option = option + " selected='selected'";
    }
    option = option + ">" + UTILITY.convert_to_currency(amount).split('.')[0] + "</option>"
    $("#income").append(option);
  };

  var setup_input_tooltip = function(span, content_selector) {
    $(span).qtip({
      content: $(content_selector),
      hide: {
        event: false,
        inactive: 4000
      },
      position: {
                  my: "center left",
                  at: "center right"
                },
      style: {
               tip: {
                      corner: "center left"
                    },
               classes: "ui-tooltip-rounded ui-tooltip-shadow ui-tooltip-purple"
             },
      events: {
                show: function(event, api) {
                        $(".tooltip_anchor").each(function(){
                          if ($(this).attr("id") != api.elements.target.attr("id")) {
                            $(this).qtip("hide");
                          }
                        });
                      }
              }
    });
  }

  // Initialize the UI of the brand items (burittos, ipads, coffee, etc)
  var initialize_brands_ui = function() {
    var selected_index = $("input[name=currency]:checked").index();
    $(".brand:eq(" + selected_index + ")").addClass("selected");
    $(".brand").mouseover(function () {
        $(this).stop().animate({ opacity: .99 });
    });
    $(".brand").mouseout(function () {
        if ($(this).hasClass("selected") == false) {
            $(this).stop().animate({ opacity: .40 });
        }
    });
    $(".brand").each(function () {
        var index = $(".brand").index(this) + 1;
        if ($(this).hasClass("selected")) {
          select_brand($(this));
        } else {
          deselect_brand($(this), false);
        }
    });
    $(".brand").click(function () {
      $(this).siblings(".brand.selected").each(function(){deselect_brand($(this), true);});
      select_brand($(this));
      update_brands_radio_boxes($(".brand").index(this));
    });
  };

  // Deselect a brand - make it more translucent
  var deselect_brand = function(brand, animate) {
    $(brand).removeClass("selected");
    var index = $(brand).index() + 1;
    if (animate == true) {
      $(brand).animate({ opacity: .40 });
    }
    $(brand).css({ "background-image": "url('img/" + index + "_00.png')" });
  };
  // Select a brand - make it more opaque and stand out more
  var select_brand = function(brand) {
    $(brand).addClass("selected");
    var index = $(brand).index() + 1;
    $(brand).css({ "background-image": "url('img/" + index + "_01.png')" }).css({ opacity: .99 });
  };

  // Set the proper brand radio box as checked
  var update_brands_radio_boxes = function(index) {
    $("input[name=currency]:checked").removeAttr("checked");
    var checked_brand = $("input[name=currency]:eq(" + index + ")");
    checked_brand.attr("checked", "checked").change();
    $("#display_currency").text(checked_brand.attr("data-currency-full"));
  }

  //Variables for resizing the background image
  var the_window = $(window),
  $bg = $("#bg"),
  aspect_ratio = $bg.width() / $bg.height(),
  $receipt_container = $("#receipt_container");

  //Setup the orange background so it is always the full height and width of the receipt zone
  var initialize_background = function() {
    the_window.resize(function() {
      resize_bg();
    }).trigger("resize");
  };

  var resize_bg = function() {
    var rc_width = (.45 * the_window.width());
    $bg.css("width", rc_width + "px");
    $bg.css("height", the_window.height() + "px");
  }
  // Return the current input paramaters (income, year, file as, etc...)
  me.get_search_params = function() {
    var params = {
      year: $("#year").val(),
      income: UTILITY.convert_currency_to_number($("#income").val()),
      group_by: ($("#detail_level").is(":checked") ? "subfunction" : "function"),
      filing: $("#filed_as").val(),
      currency: $("input[name=currency]:checked").val()
    }
    return params;
  };

  // Show the receipt loader graphic and hide the receipt content
  me.show_loader_graphic = function() {
    $("#line_items").hide();
    $("#ajax_loader").show();
  };
  // Hide the receipt loader graphic and show the receipt content
  me.hide_loader_graphic = function() {
    $("#line_items").show();
    $("#ajax_loader").hide();
  };

  // Update the receipt with the given line items and the selected template
  me.update_receipt = function(results, template_name) {
    $("#line_items").empty();
    $("#" + template_name).tmpl(results.line_items).appendTo("#line_items");
    var total_str = "";
    if (results.currency == "dollars") {
      total_str = UTILITY.convert_to_currency(results.my_total_dollars);
    } else {
      total_str = UTILITY.convert_to_2_decimal_places(results.my_total_currency) + " " + results.currency;
    }
    $("#total_template").tmpl([{total_str:total_str}]).appendTo("#line_items");
    $("#taxes_paid").text(UTILITY.convert_to_currency(results.my_total_dollars));
  };

  // Watch for changes to any of the input parameters
  var watch_field_inputs = function() {
    $("#year, #income, input[name=detail_level], input[name=currency], #filed_as").change(on_field_change);
  };

  me.update_input_spans = function() {
    $("#year_span").text($("#year").val());
    $("#income_span").text($("#income option:selected").text());
    $(".tooltip_anchor").qtip("hide");
  };

  var scale_font_size = function() {
    var width = $(window).width();
    var height = $(window).height();
    //For the right side, it is only based on width (because it can scroll vertically)
    $("#receipt_container").css({"font-size":(width/50) + "px"});
    //For the left side, it is based on width unless the width is more than 65%
    //bigger than the height
    if ((height * 1.65) < width) {
      $("#questions").css({"font-size":(height/28) + "px"});
    } else {
      $("#questions").css({"font-size":(width/42) + "px"});
    }
  };

};



// THe MODEL is used for retrieving and processing data from the datasource
var MODEL = new function() {
  var me = this;
  me.base_url = "http://www.whatwepayfor.com/api/";

  me.init = function() {
    return me;
  };

  // Query the datasource given these paramaters and call the proper method on success
  me.query = function(params, success_callback) {
    var params = $.extend({
        base_url: me.base_url,
        method: "getBudgetAggregate",
        expanded: '',
        year: 2010,     // 1984 - 2015
        spending_type: 0,        // 0 - 3 // See values above
        sortdir: 0, // 0 or 1
        income: 50000,
        filing: 0,      // 0 - 3 // See values above
        group_by: "function",    // See values above
        showChange: false,
        showExtra: false,
        currency: "dollars"
      },params);

    var url = generate_url(params);

    Ajax.get(url, function(data) {success_callback(data, params);});

  };

  // Parse the results of a query from XML to a javascript object
  me.parse_query_results = function(xml_data, currency) {
    var data = {};
    data.line_items = [];
    data.currency = currency;
    data.my_total_dollars = 0;
    data.my_total_currency = 0;
    data.total_dollars = 0;
    data.total_currency = 0; 
    $(xml_data).find("item").each(function () {
      var new_line_item = parse_line_item_xml($(this), currency);
      data.line_items.push(new_line_item);
      data.my_total_dollars += parseFloat(new_line_item.my_dollar_amount);
      data.total_dollars += parseFloat(new_line_item.total_dollar_amount);
      data.my_total_currency += parseFloat(new_line_item.my_amount);
      data.total_currency += parseFloat(new_line_item.total_amount);
    });
    return data;
  };

  // Parse an individual line item (in xml) into a javascript object
  var parse_line_item_xml = function(item_node, currency) {
    var line_item = {};
    line_item.currency = currency;
    line_item.category = $(item_node).attr("dimensionname");
    line_item.total_dollar_amount = $(item_node).attr("amounti");
    line_item.my_dollar_amount = $(item_node).attr("mycosti");
    if (currency == "dollars") {
      line_item.total_amount = line_item.total_dollar_amount;
      line_item.my_amount = line_item.my_dollar_amount;
    } else {
      var cost_per_item = parseFloat($("input[name=currency][value=" + currency + "]").attr("data-cost"));
      line_item.total_amount = calculate_barter_amount(line_item.total_dollar_amount, cost_per_item);
      line_item.my_amount = calculate_barter_amount(line_item.my_dollar_amount, cost_per_item);
    }
    line_item.total_amount_str = UTILITY.convert_to_currency(line_item.total_amount);
    line_item.my_dollar_str = UTILITY.convert_to_currency(line_item.my_amount);
    return line_item;
  };

  // Calculate the number of items that could be purchased with a given amount of money
  var calculate_barter_amount = function(dollars, cost_per_item) {
    return Math.round((dollars / cost_per_item)*100)/100;
  };

  // Generate the URL to query
  var generate_url = function(params) {
    var url = [];
    url.push(params.base_url);
    url.push(params.method + "/");
    url.push("?year=" + params.year);
    url.push("&type=" + params.spending_type);
    url.push("&sortdir=" + params.sortdir);
    url.push("&income=" + params.income);
    url.push("&filing=" + params.filing);
    url.push("&group=" + params.group_by);
    url.push("&showChange=" + (params.showChange * 1));
    url.push("&showExtra=" + (params.showExtra * 1));
    return url.join('');
  };
};


// The UTILITY class holds all methods that don't fall into the 3 classes above
var UTILITY = new function() {
  var me = this;

  me.convert_to_2_decimal_places = function(amount) {
    return Math.round(amount * 100) / 100;
  };
  // Convert a number (which is a string) into a properly formatted currency string
  me.convert_to_currency = function(amount) {
    var i = parseFloat(amount);
    if(isNaN(i)) { i = 0.00; }
    var minus = '';
    if(i < 0) { minus = '-'; }
    i = Math.abs(i);
    i = parseInt((i + .005) * 100);
    i = i / 100;
    s = new String(i);
    if(s.indexOf('.') < 0) { s += '.00'; }
    if(s.indexOf('.') == (s.length - 2)) { s += '0'; }
    s = minus + s;

    var delimiter = ","; // replace comma if desired
    var a = s.split('.',2)
    var d = a[1];
    var i = parseInt(a[0]);
    if(isNaN(i)) { return ''; }
    var minus = '';
    if(i < 0) { minus = '-'; }
    i = Math.abs(i);
    var n = new String(i);
    var a = [];
    while(n.length > 3)
    {
      var nn = n.substr(n.length-3);
      a.unshift(nn);
      n = n.substr(0,n.length-3);
    }
    if(n.length > 0) { a.unshift(n); }
    n = a.join(delimiter);
    if(d.length < 1) { s = n; }
    else { s = n + '.' + d; }
    s = minus + s;
    return "$" + s;
  };

  // Convert a currency string into a basic number (still a string)
  me.convert_currency_to_number = function(currency) {
    currency = currency.replace(/[$, ]/g, "");
    currency = currency.replace(/[kK]/g, "000");
    return currency;
  }
};
