

function date() {

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
  document.getElementById("endDate").setAttribute("max", today);
  document.getElementById("startDate").setAttribute("max", today);
  document.getElementById("endDate").setAttribute("value", today);

  document.getElementById("endDate").addEventListener("change",
  function(){
    document.getElementById("startDate").max = document.getElementById("endDate").value;
  });

  document.getElementById("startDate").addEventListener("change",
  function(){
    document.getElementById("endDate").min = document.getElementById("startDate").value;
  });
}


function radioButtonForm(cookieName, redirect) {
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
    return false;
  } else {
    document.cookie = cookieName + "=" + value;
    form.action = redirect;
    return true;
  }
}

function checkBoxForm(cookieName, redirect) {
  boxes = document.getElementsByClassName("check");
  form = document.getElementsByTagName("form")[0]
  valueList = [];
  for(i in boxes) {
    if(boxes[i].checked) {
      valueList.push(boxes[i].value);
    }
  }
  if(valueList == []) {
    alert("Please check at least one box");
  } else {
    document.cookie = cookieName + "=" + valueList;
    window.location.href = redirect;
  }
}

function dateFormEnter() {
  document.cookie = "start=" + document.getElementById("startDate").value;
  document.cookie = "end=" + document.getElementById("endDate").value;

  if(document.getElementById("exclude").checked) {
    window.location.href = "/includeDate";
  } else {
    window.location.href = "/graph";
  }

}
