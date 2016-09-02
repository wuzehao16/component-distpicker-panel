<%_.each(childs, function(child){%>
<li class="child-item <%= _.indexOf(pickedData, child.id) > -1 ? 'picked':'' %>" data-id="<%= child.id%>">
  <%= child.name%>
</li>
<%})%>
