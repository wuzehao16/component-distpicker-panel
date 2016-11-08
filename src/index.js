
// 城市选择面板

/**
 * usage:
 *
 * <div class="dropdown">
 *   <p><span>请选择</span><i></i></p>
 * </div>
 *
 * new DistPickerPanel({
 *  el: '.dist-picker-panel',
 *  source: [], // 数据源
 *  pickedData: [],
 *  onSelect: function (pickedItem) {}
 * })
 */

require('./index.async.less');

var $ = require('jquery');
var _ = require('underscore');
var tpl = require('./index.tpl');
var childTpl = require('./child.tpl');
var pickedTpl = require('./picked.tpl');
var addon = require('./addon');
var Dropdown = require('component-dropdown');
var inherits = require('inherits');

function removeSpamValue(arr) {
  _.each(arr, function (item) {
    if(_.indexOf(['',undefined,null,'undefined','null'],item) >=0) arr = _.without(arr, item);
  });
  return arr;
}

function PickerPanel(options) {
  Dropdown.call(this, options);

  this.source = this.source || {};
  this.multiProvince = this.multiProvince === undefined ? false : this.multiProvince;
  this.pickedData = removeSpamValue(this.pickedData || []);
  this.onSelect = this.onSelect || $.noop;

  this.$menu = this.getMenu();
  this.$toggleSpan = this.getToggle().find('span');
  this.group = {};
  this.dictionry = {};

  this.$el.addClass('dist-picker-panel');

  // 格式化一下
  var format = addon.groupingDist(this.source);

  this.group = format.formatedGroup;
  this.dictionry = format.dictionry;
  this.dictionry['1'] = {name:'全国',id:'1'};
  this.dictionry['-1'] = {name:'全国',id:'1'};

  this.$menu.on('click', _.bind(this._eventDispatcher, this));

  this._renderAll();

  if (this.pickedData.length) {
    this._renderPickedName();
  }
}

PickerPanel.prototype = {
  constructor: PickerPanel,
  // 事件代理
  _eventDispatcher: function (e) {
    var $target = $(e.target);

    if($target.hasClass('level2-item')){
      this._onClickProvince($target.attr('data-id'), $target);
    }
    else if( $target.hasClass('picked-item') || $target.hasClass('js-remove')){
      if($target.hasClass('js-remove')) {
        $target = $target.parent();
      }
      this._onClickPickedItem($target.attr('data-id'));
    }
    else if($target.hasClass('child-item') ){
      this._onClickCity($target.attr('data-id'),$target);
    }
    else if($target.hasClass('js-cancel')) {
      this.hide();
    }
    else if($target.hasClass('js-confirm')) {
      var pickedItem = this.getPickedItem();

      this._renderPickedName();
      this.onSelect(pickedItem);
      this.hide();
    }
    else if($target.hasClass('global')){
      this._onClickGlobal($target.attr('data-id'),$target);
    }

    e.stopPropagation();
  },

  _onClickGlobal: function (id, $global) { // 点击全国
    var self = this;

    this.$menu.find('.level2-item').removeClass('picked');

    $global.addClass('picked');

    this.pickedData = [id];
    this._renderChildItems();
    this._renderPickedItems();
  },

  _onClickPickedItem: function (id) {
    this._removePickedItem(id);
    this._renderPickedItems();
    this._unStylePickedItem(id);
  },

  _onClickProvince: function (id, $province) {
    var self = this;

    if(this.pickedData.indexOf('-1') >=0) {// 若已选中全国，去掉
      this._removePickedItem('-1');
      this._unStylePickedItem('-1');
    }
    if(this.pickedData.indexOf('1') >=0) {// 若已选中全国，去掉
      this._removePickedItem('1');
      this._unStylePickedItem('1');
    }
    if(!this.multiProvince) { // 省份单选
      this.$menu.find('.provinces li').not($province).removeClass('picked');
      _.each(this.pickedData, function (pickedId) {
        if(pickedId !== id) self._removePickedItem(pickedId);
      });
    }
    if(!$province.hasClass('picked'))  {
      this._addPickedItem(id);
      //点击省份时，意味着重新选择，故删除该省已选择的城市
     _.each(this.pickedData, function (pickedId) {
       if(self.getItem(pickedId).pid == id) {
         self._removePickedItem(pickedId);
       }
     });
    }

    $province.addClass('picked');
    // if(!$province.hasClass('picked')){
    //   this._removePickedItem(id);
    // }

    this._renderChildItems($province.attr('data-id'));
    this._renderPickedItems();
  },

  _onClickCity: function (id, $city) {
    $city.toggleClass('picked');
    this._togglePickedItem(id);

    var parentId = this._findParentId(id);

    if($city.hasClass('picked')){
      this._removePickedItem(parentId);
    }
    else if(_.indexOf(this.pickedData, parentId) === -1&&!$city.siblings('.picked').length) {
      this._addPickedItem(parentId);
    }
    this._renderPickedItems();
  },

  _unStylePickedItem: function (id) {
    var $item = this.$menu.find('li[data-id="'+id+'"]');
    var parentId = this._findParentId(id);
    var $parent = this.$menu.find('li[data-id="'+parentId+'"]'), self = this;

    $item.removeClass('picked');
    // 当删除完城市时，将其省份也删掉
    if($item.parent().hasClass('childs') && !$item.siblings('.picked').length) {
      $parent.removeClass('picked');
    } else if($parent.hasClass('picked')){
      if(!_.find(this.pickedData, function (pickedId) {
        return self.getItem(pickedId).pid == parentId;
      })) $parent.removeClass('picked');
    }
  },

  // 渲染pickedName到选择框上
  _renderPickedName: function () {
    var names = this.getPickedName();

    if (names.length) {
      this.$toggleSpan.html(names.join(','));
    } else {
      this.$toggleSpan.html('请选择');
    }
  },

  getItem: function (id) {
    return this.dictionry[id] || {};
  },

  setPickedItem: function (picked) {
    if(typeof picked === 'string') {
      picked = picked.split(',');
    }
    this.pickedData = removeSpamValue(picked);
    this._renderAll();

    if (this.pickedData.length) {
      this._renderPickedName();
    }
  },

  getPickedItem: function () {
    var self = this;

    if(!this.pickedData || !this.pickedData.length) {
      return [{
        id: '1',
        name: '全国'
      }];
    }
    _.each(this.pickedData, function (id) {
      if(!self.dictionry[id]) self.pickedData = _.without(self.pickedData, id);
    });
    return _.map(self.pickedData,function (id) {
      return self.dictionry[id];
    });
  },

  getPickedValue: function () {
    return this.pickedData;
  },

  getPickedName: function () {
    var names = [];
    var self = this;

    _.each(this.pickedData, function (v) {
      var item = self.getItem(v);

      names.push(item.name);
    });

    return names;
  },

  _getChilds: function (provinceId) {
    return (_.find(this.source, function (province) {
      return province.id == provinceId;
    })||{}).child;
  },

  _findParentId: function (id) {
    return this.dictionry[id].pid;
  },

  _renderAll: function () {
    var self = this,
    pid = (this.dictionry[this.pickedData[0]]||{}).pid; //若已有选中,默认展开第一个省

    this._renderParents();
    this._renderChildItems(pid);
    this._renderPickedItems();
    if(this.pickedData.length){  //为省份着色
      _.each(this.pickedData, function (pickedId) {
        pid = self.getItem(pickedId).pid;
        if(pid) self.$menu.find('li[data-id="'+pid+'"]').addClass('picked');
      });
    }
  },

  _renderParents: function () {
    this.$menu.html(tpl({
      dict: this.dictionry,
      group: this.group,
      pickedData: this.pickedData
    }));
  },

  _renderPickedItems: function () {
    this.$menu.find('.js-render-picked').html(pickedTpl({
      dict: this.dictionry,
      pickedData: this.pickedData
    }));
  },

  _renderChildItems: function (provinceId) {
    if(!provinceId) {
      this.$menu.find('.js-render-childs').html('');
      return;
    }
    this.$menu.find('.js-render-childs').html(childTpl({
      pickedData: this.pickedData,
      childs: this._getChilds(provinceId)
    }));
  },

  _clearPicked: function () {
    this.pickedData = [];
  },

  _removePickedItem: function (id) {
    this.pickedData = _.without(this.pickedData,id);
  },

  _addPickedItem: function (id) {
    this.pickedData.push(id);
  },

  _togglePickedItem: function (id) {
    if(_.indexOf(this.pickedData, id) > -1) {
      this._removePickedItem(id);
    } else {
      this._addPickedItem(id);
    }
  }
};

inherits(PickerPanel, Dropdown);

module.exports = PickerPanel;
