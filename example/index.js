
require('./index.less');

var DistPickerPanel = require('../src');
var source = require('./data');

var panel = new DistPickerPanel({
  el: '.dropdown',
  source: source
});
