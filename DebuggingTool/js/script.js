eventData = [];

function getAllPrograms(){
    return $.ajax({
        url: "http://192.168.10.103:8082/api/programs.jsonp?paging=false&",
        type: 'GET',
        dataType: 'jsonp',
        contentType:'application/jsonp',
        authorization: "Bearer 7fa34aca-a5ba-485b-b108-b18faad54c6d",
        error: function (data) {
            console.log(JSON.stringify(data));
        },
        success: function (data) {
            console.log("2", data)
            data.programs.map((val, idx) => {
                $('#program_selector').append( '<option id="' + val.id + '">' + val.displayName + '</option>' );
            })
        }
    });

}
function getGeneralProgramInfo(programId, filter) {
    return $.ajax({
        url: 'http://192.168.10.103:8082/api/programs/' + programId + '.jsonp',
        type: 'GET',
        dataType: 'jsonp',
        contentType:'application/jsonp',
        authorization: "Bearer 7fa34aca-a5ba-485b-b108-b18faad54c6d",
        error: function (data) {
            console.log(JSON.stringify(data));
        },
        success: function (data) {
            eventData = data;
            var str = '<li>   ' + data.displayName.toUpperCase() + ' </li>';
            str += '<li> ---------------- </li>';
            $('#programinfo').append(str);
            $('#programinfo').append( liElement('Program Type', data.programType) );
            $('#programinfo').append( liElement('Accesses', 'del:' + data.access.delete + ', externalize:' + data.access.externalize + ", manage:" + data.access.manage + ", read:" + data.access.read + ", update:" + data.access.update + ", write:" + data.access.write ));
            $('#programinfo').append( liElement('Id', data.id) );
            $('#programinfo').append( liElement('Version', data.version) );
            $('#programinfo').append( liElement('URI', data.href) );
            $('#programinfo').append( liElement('Ignore Overdue Events', data.ignoreOverdueEvents) );
            $('#programinfo').append( liElement('Description', data.description) );
            $('#programinfo').append( liElement('Display Description', data.displayDescription) );
            $('#programinfo').append( liElement('Display ShortName', data.displayShortName) );
            $('#programinfo').append( liElement('Display Name', data.displayName) );
            $('#programinfo').append( liElement('Created date', displaySexyDate(data.created)) );
            $('#programinfo').append( liElement('Last Updated date', displaySexyDate(data.lastUpdated)) );
            data.organisationUnits.map( (val, idx) => {
                $('#programinfo').append( liElement('Connected orgunit' + (idx+1), val.id) );
            })

            data.programStages.map( (val, idx) => {
                $('#programinfo').append( liElement('Containing Program Stage' + (idx+1), val.id) );
            })
            getProgramStageInfo();
        }
    });
}
function getEnteredProgramData(programId, filter) {
    return $.ajax({
        url: 'http://192.168.10.103:8082/api/events.jsonp?program=' + programId + '&paging=false&' + filter,
        type: 'GET',
        dataType: 'jsonp',
        contentType:'application/jsonp',
        authorization: "Bearer 7fa34aca-a5ba-485b-b108-b18faad54c6d",
        error: function (data) {
            console.log(JSON.stringify(data));
        },
        success: function (data) {

            console.log("2", data.events)
            data.events.map( (event, idx) => {
                var str = '<ul class="eventdatafields" id="' + idx + '">';
                str += '<li> EVENT NR ' + (idx+1) + ' </li>';
                str += '<li> ---------------- </li>';
                str += liElement('Completed by', event.completedBy);
                str += liElement('Orgunit Name', event.orgUnitName);
                str += liElement('Status', event.status);
                str += liElement('Coordinates', (event.coordinate.latitude + "," + event.coordinate.longitude));
                event.dataValues.map((dataelement, idx) =>{
                        str += liElement('Data Value' + (idx+1), dataelement.value);
                })
                str += liElement('Program', event.program);
                str += liElement('Program Stage', event.programStage);
                str += liElement('Orgunit', event.orgUnit);
                str+= '</ul>';
                $('#eventdata').append(str);
            })

        }
    });
}

function getProgramStageInfoFromInstance(programStageId, stageNr){
    return $.ajax({
        url: 'http://192.168.10.103:8082/api/programStages/' + programStageId + '.jsonp',
        type: 'GET',
        dataType: 'jsonp',
        contentType:'application/jsonp',
        authorization: "Bearer 7fa34aca-a5ba-485b-b108-b18faad54c6d",
        error: function (data) {
            console.log(JSON.stringify(data));
        },
        success: function (data) {
            console.log("666", data)

            var str = '<ul id="program_stages_info">';
            str += '<li> STAGE NR ' + stageNr + ' </li>';
            str += '<li> ---------------- </li>';
            str += liElement('Name', data.name);
            str += liElement('Displayed name', data.displayName);
            str += liElement('Description', data.description);
            str += liElement('Connected to program', data.program.id);
            str += liElement('Id', data.completedBy);
            str += liElement('URI', data.href);

            programStageDataElementIds = [];
            data.programStageDataElements.map((programStageDataElement, idx) =>{
                    str += '<li> ProgramStageDataElement' + (idx+1) + ': ' + programStageDataElement.id + '</li>';
                    programStageDataElementIds.push(programStageDataElement.id)
            })
            data.programStageSections.map((programStageSection, idx) =>{
                    str += '<li> programStageSection' + (idx+1) + ': ' + programStageSection.id + '</li>';
            })
            console.log("programStageDataElementIds", programStageDataElementIds);
            $('#programstagesinfolist').append(str);
            extractEachDataElementId(programStageDataElementIds);
        }
    });
}

function extractDataElementId(programDataElementId, idx){
    return $.ajax({
        url: 'http://192.168.10.103:8082/api/programStageDataElements/' + programDataElementId + '.jsonp?fields=dataElement',
        type: 'GET',
        dataType: 'jsonp',
        contentType:'application/jsonp',
        authorization: "Bearer 7fa34aca-a5ba-485b-b108-b18faad54c6d",

        error: function (data) {
            console.log(JSON.stringify(data));
        },
        success: function (data) {
            getDataElementInformation(data.dataElement.id, idx)
        }
    });
}

function getDataElementInformation(dataElementId, idx){
    return $.ajax({
        url: 'http://192.168.10.103:8082/api/dataElements/' + dataElementId + '.jsonp',
        type: 'GET',
        dataType: 'jsonp',
        contentType:'application/jsonp',
        authorization: "Bearer 7fa34aca-a5ba-485b-b108-b18faad54c6d",
        error: function (data) {
            console.log(JSON.stringify(data));
        },
        success: function (data) {
            console.log("MAgnus Li", data);

            var str = '<li> DATA ELEMENT NR.' + idx + '</li>'
            str += '<ul>'
            str += liElement('Display Name', data.displayName);
            str += liElement('Value type', data.valueType);
            str += liElement('Domain Type', data.domainType);
            str += liElement('Short name', data.shortName);
            str += liElement('Display Short name', data.displayShortName);
            str += liElement('Last Updated', displaySexyDate(data.lastUpdated) );

            str += liElement('URI', data.href);

            str += '</ul>';

            $('#program_stages_info').append(str)
        }
    });
}

function extractEachDataElementId(programStageDataElementIds){
    console.log("programStageDataElementIds INNI LITEN FUNKSJON: " , programStageDataElementIds)
    programStageDataElementIds.map( (programDataElementId, idx) =>{
        extractDataElementId(programDataElementId, (idx+1));
    });
}

function getProgramStageInfo() {
    console.log("EveentData: " , eventData.programStages)
    eventData.programStages.map( (val, idx) =>{
        getProgramStageInfoFromInstance(val.id, (idx+1));
    });
}
function sendTestData(jsonObject) {
    return $.ajax({
        data: JSON.stringify(jsonObject),
        url: "http://192.168.10.102:8082/api/events",
        type: 'POST',
        dataType: 'json',
        contentType:'application/json',
        authorization: "Bearer 7fa34aca-a5ba-485b-b108-b18faad54c6d",
        error: function (data) {
            console.log(JSON.stringify(data));
        },
        success: function (data) {
            console.log("3", data)
        }
    });
}

function createPostEvent(programId, orgUnitId, username, status, allDataElementObjects){
    var jsn = {
      "program": "xemNskRTf8M", // param=programId
      "orgUnit": "xZDHHbT4oCq", // param=orgUnitId
      "eventDate": "2015-05-17", // TODAYS DATE
      "status": "COMPLETED", // param=status
      "storedBy": "admin", // param=username
      //"coordinate": {
        //"latitude": 59.8,
        //"longitude": 10.9
      //},
      "dataValues": [ // param=allDataElementObjects
        { "dataElement": "fGE84loiXrv", "value": "666" },
        { "dataElement": "h9VbvV6vW6h", "value": "666" }
      ]
    };

}


function displaySexyDate(notSexyDate){
    return notSexyDate.substring(0,notSexyDate.length-18);
}

function liElement(id, val){
    return '<li>' + id + ": " + val + '</li>';
}


// sendTestData(jsn);
function renderWebpage(){

    $('#eventdata').text('');
    $('#programinfo').text('');
    $('#program_stages_info').remove();
    extractedProgramId = $('#program_selector option:selected').attr('id');
    var programId = (extractedProgramId == "" || extractedProgramId == undefined ) ? 'xemNskRTf8M' : extractedProgramId;

    extractedFilter = $('#filter_selector option:selected').val();
    var filter = (extractedFilter == "Choose Filter Options" || extractedFilter == undefined) ? 'paging=false' : extractedFilter;
    console.log("Filter", filter,"Extracted" , extractedFilter);
    console.log("programId", programId,"extractedProgramId" , extractedProgramId);

    getGeneralProgramInfo( programId, filter );
    getEnteredProgramData( programId, filter );
}


$( "#program_selector" ).change(function() {
    renderWebpage();
});

$( "#filter_selector" ).change(function() {
    renderWebpage();
});

getAllPrograms();
renderWebpage();
