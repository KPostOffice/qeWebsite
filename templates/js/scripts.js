

var keyboardState = {};
window.onkeyup = function(e) { keyboardState[e.keyCode] = false; }
window.onkeydown = function(e) { keyboardState[e.keyCode] = true; }


function getCookieDict() {
  cookiesArray = document.cookie.split("; ");
  cookieDict = {};
  for( i in cookiesArray ) {
    singleCookie = cookiesArray[i].split("=");
    cookieDict[singleCookie[0]] = singleCookie[1];
  }
  return cookieDict;
}


function date() {
  cookies = getCookieDict();
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0
  var yyyy = today.getFullYear();
   if(dd<10){
          dd="0"+dd
      }
      if(mm<10){
          mm="0"+mm
      }

  today = yyyy+"-"+mm+"-"+dd;
  if(cookies["start"]) {
    document.getElementById("startDate").setAttribute("value", cookies["start"]);
  }
  if(cookies["end"]) {
    document.getElementById("endDate").setAttribute("value", cookies["end"]);
  } else {
    document.getElementById("endDate").setAttribute("value", today);
  } 
  document.getElementById("endDate").setAttribute("max", today);
  document.getElementById("startDate").setAttribute("max", document.getElementById("endDate").value);

  document.getElementById("endDate").addEventListener("change",
  function(){
    document.getElementById("startDate").max = document.getElementById("endDate").value;
  });

  document.getElementById("startDate").addEventListener("change",
  function(){
    document.getElementById("endDate").min = document.getElementById("startDate").value;
  });
}


function radioButtonForm(cookieName, redirect, cookiesToDelete) {
  buttons = document.getElementsByClassName("rad");
  form = document.getElementsByTagName("form")[0]
  val = null;
  for(i in buttons) {
    if(buttons[i].checked) {
      val = buttons[i].value;
    }
  }
  if(val == null) {
    alert("Please make a selection");
  } else {
    document.cookie = cookieName + "=" + val;
    window.location.href = redirect;
    for(i in cookiesToDelete) {
      deleteCookie(cookiesToDelete[i]);
    }
  }
}

function checkBoxForm(cookieName, redirect, cookiesToDelete) {
  boxes = document.getElementsByClassName("check");
  form = document.getElementsByTagName("form")[0]
  valueList = [];
  for(i in boxes) {
    if(boxes[i].checked) {
      valueList.push(boxes[i].value);
    }
  }
  if(valueList.length == 0) {
    alert("Please check at least one box");
  } else {
    document.cookie = cookieName + "=" + valueList;
    window.location.href = redirect;
    for(i in cookiesToDelete) {
      deleteCookie(cookiesToDelete[i]);
    }
  }
}

function dateFormEnter() {
  document.cookie = "start=" + document.getElementById("startDate").value;
  document.cookie = "end=" + document.getElementById("endDate").value;
  document.cookie = "update=" + (document.getElementById("update").checked ? "on" : "off")
  if(document.getElementById("exclude").checked) {
    window.location.href = "/includeDates";
  } else {
    deleteCookie("exclude");
    document.cookie = "graph=Graph";
    window.location.href = "/graph"; 
  }
}

function excludeDates() {
  excludeList = [];
  dateList = document.getElementsByClassName("check");
  for( i in dateList) {
    if(!dateList[i].checked) {
      excludeList.push(dateList[i].value);
    }
  }
  document.cookie = "graph=Graph"
  document.cookie = "exclude=" + excludeList;
  window.location.href = "/graph";
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function dateboxClick(boxNum) {
  if(dateboxClick.previous == undefined) {
    dateboxClick.previous = boxNum;
    return
  }
  range = [boxNum, dateboxClick.previous];
  range = range.sort((a,b) => a-b);
  isChecked = document.getElementById("date_" + boxNum).checked;
  if( keyboardState[16] ) {
    for( i = range[0]; i <= range[1]; i++) {
      document.getElementById("date_" + i).checked = isChecked;
    }
  }

  dateboxClick.previous = boxNum;
}
