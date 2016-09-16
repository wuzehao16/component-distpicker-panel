<div class="picker-panel">
  <div class="picked-result">
    <div class="picked-title">已选择<span style="display:block;font-size:14px;font-weight:lighter;color: #9a9a9a;">( 可多选 )</span></div>
    <ul class="js-render-picked picked-items"></ul>
  </div>
  <ul class="group-parents">
    <li class="global" data-id="-1">全国</li>
    <%_.each(group.groupProvinceByLetter, function(letterGroup){%>
    <li class="group">
      <div class="level-1"><%=letterGroup.groupName%></div>
      <ul class="js-render-level2 level-2 provinces">
        <%_.each(letterGroup.groupItems, function(provinceId){%>
        <li class="level2-item <%=pickedData.indexOf(provinceId) >=0 ?'picked':''%>"
          data-id="<%=provinceId%>">
          <%=(dict[provinceId]||{}).name%>
        </li>
        <%})%>
      </ul>
    </li>
    <%})%>
  </ul>
  <ul class="group-childs">
    <li style="width:100%;color:#5b626f;">请选择城市</li>
    <ul class="js-render-childs childs"></ul>
  </ul>
  <div class="picked-footer">
    <button class="js-confirm" type="button" name="button">确定</button>
    <button class="js-cancel" type="button" name="button">取消</button>
  </div>
</div>
