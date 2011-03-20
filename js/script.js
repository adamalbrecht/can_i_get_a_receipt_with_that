$(function(){
  var ui_obj = UI.init();
  var data_obj = DATA.init();
  data_obj.query({}, ui_obj.update_receipt, ui_obj.display_error_message);
});

var UI = new function() {
  this.init = function() {
    return this;
  };

  this.update_receipt = function(data) {
    alert("Success!");
  };

  this.insert_line_item = function(text, amount) {

  };

  this.display_error_message = function(XMLHttpRequest, textStatus, errorThrown) {
    alert("ERROR: " + textStatus + " : " + errorThrown);
  };
};

var DATA = new function() {
  this.base_url = "http://www.whatwepayfor.com/api/";

  this.init = function() {
    return this;
  };

  this.spending_type_values = ["all", "mandatory", "discretionary", "net_interest"];
  this.filing_values = ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"];
  this.group_by_values = ["agency", "bureau", "function", "subfunction"];

  this.query = function(params, success_callback, error_callback) {
    var params = $.extend({
        base_url: this.base_url,
        method: "getBudgetAggregate",
        expanded: '',
        year: 2010,     // 1984 - 2015
        spending_type: 0,        // 0 - 3 // See values above
        sortdir: 0, // 0 or 1
        income: 50000,
        filing: 0,      // 0 - 3 // See values above
        group_by: "subfunction",    // See values above
        showChange: false,
        showExtra: false
      },params);

    var url = generate_url(params);

    Ajax.get(url, success_callback);

  };

  this.parse_line_item_xml = function(item_node) {
    var line_item = {};
    line_item.name = $(item_node).find("dimensionName").text();
    line_item.total_amount = $(item_node).find("amounti").text();
    line_item.my_amount = $(item_node).find("mycosti").text();
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

