$(function(){ 
  var controller = CONTROLLER.init();
  controller.update_receipt({});
});



var CONTROLLER = new function() {
  var me = this;
  var view = null;
  var model = null;
  me.init = function() {
    view = VIEW.init(query_fields_changed);
    model = MODEL.init();
    return me;
  };

  me.update_receipt = function(params) {
    view.show_loader_graphic();
    model.query(params, function(data, new_params) {
      var results = model.parse_query_results(data, new_params.currency);
      var template = new_params.currency == "dollars" ? "dollars_template" : "barter_template"
      view.update_receipt(results, template);
      view.hide_loader_graphic();
    });
  };

  var query_fields_changed = function() {
    window.log("Query fields changed!");
    params = view.get_search_params();
    me.update_receipt(params);
  };
};




var VIEW = new function() {
  var me = this;
  var on_field_change = null;

  me.init = function(field_change_callback) {
    initialize_inputs();
    on_field_change = field_change_callback;

    watch_field_inputs();
    return me;
  };

  var initialize_inputs = function() {
    $(".hover_span").mouseover(function(){
      $(this).hide();
      $(this).next(".hover_input").show();
    });
    $(".hover_input").mouseout(function(){
      $(this).hide().prev(".hover_span").show();
    });

    $("input[type='text'].hover_input").change(function() {
      $(this).prev(".hover_span").html($(this).val());
    });
    $("select.hover_input").change(function() {
      $(this).prev(".hover_span").html($(this).find(":selected").text());
    });

    $("#income").autoGrowInput({
      comfortZone:5,
      minWidth:10,
      maxWidth:300
    });
  };

  me.get_search_params = function() {
    var params = {
      year: $("#year").val(),
      income: UTILITY.convert_currency_to_number($("#income").val()),
      group_by: $("input[name=detail_level]:checked").val(),
      currency: $("input[name=currency]:checked").val()
    }
    return params;
  };

  me.show_loader_graphic = function() {
    $("#line_items").hide();
    $("#ajax_loader").show();
  };
  me.hide_loader_graphic = function() {
    $("#line_items").show();
    $("#ajax_loader").hide();
  };

  me.update_receipt = function(items, template_name) {
    $("#line_items").empty();
    $("#" + template_name).tmpl(items).appendTo("#line_items");
  };

  var watch_field_inputs = function() {
    $("#year, #income, input[name=detail_level], input[name=currency]").change(on_field_change);
  };

};



var MODEL = new function() {
  var me = this;
  me.base_url = "http://www.whatwepayfor.com/api/";

  me.init = function() {
    return me;
  };

  me.spending_type_values = ["all", "mandatory", "discretionary", "net_interest"];
  me.filing_values = ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"];
  me.group_by_values = ["agency", "bureau", "function", "subfunction"];

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

  me.parse_query_results = function(xml_data, currency) {
    var line_items = [];
    $(xml_data).find("item").each(function () {
      var new_line_item = parse_line_item_xml($(this), currency);
      if (parseFloat(new_line_item.total_amount) >= 0) {
        line_items.push(new_line_item);
      }
    });
    return line_items;
  };

  var parse_line_item_xml = function(item_node, currency) {
    var line_item = {};
    line_item.currency = currency;
    line_item.category = $(item_node).attr("dimensionname");
    line_item.total_amount = $(item_node).attr("amounti");
    line_item.my_amount = $(item_node).attr("mycosti");
    line_item.total_amount_str = UTILITY.convert_to_currency(line_item.total_amount);
    line_item.my_amount_str = UTILITY.convert_to_currency(line_item.my_amount);
    var cost_per_item = parseFloat($("input[name=currency][value=" + currency + "]").attr("data-cost"));
    line_item.total_barter_amount = calculate_barter_amount(line_item.total_amount, cost_per_item);
    line_item.my_barter_amount = calculate_barter_amount(line_item.my_amount, cost_per_item);
    return line_item;
  };

  var calculate_barter_amount = function(dollars, cost_per_item) {
    return Math.round((dollars / cost_per_item)*100)/100;
  };

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


var UTILITY = new function() {
  var me = this;

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

  me.convert_currency_to_number = function(currency) {
    currency = currency.replace(/[$,]/, "");
  }
};
