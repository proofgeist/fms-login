
var util = {
  getCookie : function (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
  },

  removeCookie : function(cname){
    document.cookie = cname+"=; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  },

  queryString : function () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
          // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
          // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
        query_string[pair[0]] = arr;
          // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }
    return query_string;
  },

  queryStringify: function(obj){

    var keys = Object.keys(obj)
    var s ="?"
    var amp = ""
    keys.map(function(key){
      s = s + amp + key + '=' + encodeURIComponent(obj[key])
      amp = "&"
    })
    return s
  },

  applyI18nString : function(){
    $("#Connecting").text(lang.Label_Connecting);
    $(".inputBoxTitle h3").text(lang.Title_Sign_In);
    $("#submitButton").text(lang.Btn_Import_Data);
   // $("label[for=solutionName]").text(lang.Label_Source_Solution_Name);
  //  $("label[for=layoutName]").text(lang.Label_Source_Layout_Name);
    $("label[for=user]").text(lang.Label_Account);
    $("label[for=password]").text(lang.Label_Passwor);
  //  $("label[for=incremental]").text(lang.Label_Incremental_Import);
    $("label[for=oauth_providers]").text(lang.Label_Login_With);
  //  $("#incrementalTP").text(lang.Tooltip_Enable_Incremental_Refresh);
    $("#oauth-required-label").text(lang.Label_Or);
  },

  makeErrorMessage : function(xhr, textStatus, thrownError){
    var message = textStatus + " : ";
    if(xhr.readyState===0){
      message = message+lang.Error_Connection_Failed
    }
    else if(thrownError){
      var showResponse = true;
      try{
        JSON.parse(xhr.responseText);
      }catch(e){
        showResponse = false;
      }
      message = message + thrownError + ' : '+(showResponse ?  xhr.responseText : lang.Error_Data_API_Server_Is_Down );
    }
    return message;
  },

  hasRequiredInput : function(){
    return  ($('#user').val().trim()) && ($('#password').val().trim())
  },

  showErrorDialog : function(title, message){
    $( "#dialog" ).dialog( "option", "title", title );
    $( "#dialogMessage" ).html(message)
    $( "#dialog" ).dialog( "open" );
  },

  enableBtnOnInput : function(){
    if(util.hasRequiredInput()){
      $("#submitButton").prop('disabled', false);
    }else{
      $("#submitButton").prop('disabled', true);
    }
  }

}
