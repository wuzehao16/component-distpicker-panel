/**
 * input :
[
  {"id":"110000","name":"\u5317\u4eac","pid":"1",letter:"S",child:[{}]},
  {"id":"120000","name":"\u5929\u6d25","pid":"1",letter:"B",child:[{}]}
]
* output:
{
  groupProvinceByLetter: [
    {
      groupName: 'A-G',
      groupItems: ["110000","120000"]
    }
  ],
  groupCityByProvince: [
    {
      groupName: '广东省',
      groupItems: ['11011','2323232']
    }
  ]
}

**/
var _ = require('underscore');

exports.groupingDist = function(source) {
  var output = {
    groupProvinceByLetter: [{
      groupName: 'A-G',
      groupItems: []
    }, {
      groupName: 'H-K',
      groupItems: []
    }, {
      groupName: 'L-S',
      groupItems: []
    }, {
      groupName: 'T-Z',
      groupItems: []
    }],
    groupCityByProvince: []
  };
  var dictionry = {};
  var level2GroupIndex = {};//组2省份位置索引
  function shortenName(name) {
    var shortenNameMap = {
      '广西壮族自治区': '广西',
      '内蒙古自治区': '内蒙古',
      '宁夏回族自治区': '宁夏',
      '西藏自治区': '西藏',
      '新疆维吾尔自治区': '新疆'
    };
    name = shortenNameMap[name] || name;
    name =  (name||'').replace(/[省|市]$/,'');
    return name;
  }
  _.each(source, function(province) {
    province.name = shortenName(province.name);
    dictionry[province.id] = _.pick(province,'id','name');
    var group = {};
    if(province.letter) {
      groupByLetter(province);
      group.groupName = province.name;
      group.groupItems = [];
      _.each(province.child, function (city) {
        city.name = shortenName(city.name);
        dictionry[city.id] = _.pick(city, 'id','name','pid');
        group.groupItems.push(city.id);
      });
      output.groupCityByProvince.push(group);
    }
  });
  function groupByLetter(item) {
    var first_letter = item.letter;
    if (/[A-Ga-g]/.test(first_letter)) {
      return output.groupProvinceByLetter[0].groupItems.push(item.id);
    }
    if (/[H-Kh-k]/.test(first_letter)) {
      return output.groupProvinceByLetter[1].groupItems.push(item.id);
    }
    if (/[L-Sl-s]/.test(first_letter)) {
      return output.groupProvinceByLetter[2].groupItems.push(item.id);
    }
    if (/[T-Zt-z]/.test(first_letter)) {
      return output.groupProvinceByLetter[3].groupItems.push(item.id);
    }
  }

  // function groupToLevel2(item) {
  //   var level2 = output.level2;
  //   if(item.pid == '1') {
  //     if(level2GroupIndex[item.name] !== undefined) return;
  //     level2GroupIndex[item.name] = level2.length;
  //     level2.push({
  //       groupName: item.name,
  //       groupItems: []
  //     });
  //   } else {
  //     var parent = source[item.pid];
  //     if(parent && level2GroupIndex[parent.name] === undefined && parent.pid=='1' && parent.letter){
  //       groupToLevel2(parent);
  //     }
  //     if(parent && level2GroupIndex[parent.name]!==undefined) level2[level2GroupIndex[parent.name]].groupItems.push(item.id);
  //   }
  // }
  return {
    formatedGroup: output,
    dictionry: dictionry
  };
};
