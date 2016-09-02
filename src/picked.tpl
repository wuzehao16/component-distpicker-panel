<%_.each(pickedData, function(id){ if(dict[id]){ %>
    <li class="picked-item picked" data-id="<%= id%>">
      <%= dict[id].name%>
      <i class="js-remove"></i>
    </li>
<%}})%>
