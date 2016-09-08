function createPostEvent(programId, orgUnitId, val1, val2){
    return {
      "program": programId, // param=programId
      "orgUnit": orgUnitId, // param=orgUnitId
      "eventDate": "2015-05-17", // TODAYS DATE
      "status": "COMPLETED", // param=status
      "storedBy": "admin", // param=username
      //"coordinate": {
        //"latitude": 59.8,
        //"longitude": 10.9
      //},
      "dataValues": [ // param=allDataElementObjects
        { "dataElement": "fGE84loiXrv", "value": val1 },
        { "dataElement": "h9VbvV6vW6h", "value": val2 }
      ]
    };
}

function sendDataToServer(jsonObject) {
    return $.ajax({
        data: JSON.stringify(jsonObject),
        url: "http://192.168.10.103:8082/api/events",
        type: 'POST',
        dataType: 'json',
        contentType:'application/json',
        authorization: "Bearer 7fa34aca-a5ba-485b-b108-b18faad54c6d",
        error: function (data) {
            $('#output').html("<b>Actually sent to server:</b> <br/><br/>" + JSON.stringify(jsonObject) + "<br/><br/> <b>Server responded to this with:</b> <br/><br/>" + JSON.stringify(data));
        },
        success: function (data) {
            $('#output').html("<b>Actually sent to server:</b> <br/><br/>" + JSON.stringify(jsonObject) + "<br/><br/> <b>Server responded to this with:</b> <br/><br/>" + JSON.stringify(data));
        }
    });
}



















document.getElementById('submit-button').addEventListener("click", function(){
    var program = $('#program').val();
    var orgunit = $('#orgunit').val();
    var val1 = $('#dataelem1').val();
    var val2 = $('#dataelem2').val();
    var jsn = createPostEvent(program, orgunit, val1, val2);
    sendDataToServer(jsn);
});
