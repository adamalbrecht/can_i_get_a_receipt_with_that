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
    model.query(params, function(data) {
      var results = model.parse_query_results(data);
      view.update_receipt(results);
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
    on_field_change = field_change_callback;

    watch_field_inputs();
    return me;
  };

  me.get_search_params = function() {
    var params = {
      year: $("#year").val(),
      income: $("#income").val(),
      group_by: $("input[name=detail_level]").val(),
      showChange: false,
      showExtra: false
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

  me.update_receipt = function(items) {
    $("#line_items").empty();
    $("#line_item_template").tmpl(items).appendTo("#line_items");
  };

  var watch_field_inputs = function() {
    $("#year, #income, #taxes, input[name=detail_level], input[name=currency]").change(on_field_change);
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
        showExtra: false
      },params);

    var url = generate_url(params);

    Ajax.get(url, success_callback);

  };

  me.parse_query_results = function(xml_data) {
    var line_items = [];
    $(xml_data).find("item").each(function () {
      line_items.push(parse_line_item_xml($(this)));
    });
    return line_items;
  };

  var parse_line_item_xml = function(item_node) {
    var line_item = {};
    line_item.category = $(item_node).attr("dimensionname");
    line_item.total_amount = $(item_node).attr("amounti");
    line_item.my_amount = $(item_node).attr("mycosti");
    return line_item;
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
