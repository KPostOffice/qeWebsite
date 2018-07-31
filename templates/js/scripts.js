
function date() {

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0
  var yyyy = today.getFullYear();
   if(dd<10){
          dd='0'+dd
      }
      if(mm<10){
          mm='0'+mm
      }

  today = yyyy+'-'+mm+'-'+dd;
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