$(document).ready(function(){
    loadSelector('http://192.168.0.17:7070/api/v1/stations');

    $('#calendar').datepicker({
        format: "yyyy/mm/dd",
        startDate: "2021-09-08",
        endDate: "2022-03-31",
        language: language
    });
    $('#calendar').datepicker('update', '2022-03-31');
    $('#input_calendar').val("2022-03-31");
    $('#calendar').on('changeDate', function() {
        $('#input_calendar').val(
            $('#calendar').datepicker('getFormattedDate')
        );
    });
});

async function loadSelector(url){
    const stations = await loadStations(url);
    const selectStation = document.getElementById("selector_station");

    stations.forEach(station => {
        let el = document.createElement("option");
        el.setAttribute("station_id", station['station_id']);
        el.value = station['station_id'] + " - " + station['name'];
        selectStation.appendChild(el);
    });
}

// Carga del componente en base a los sistemas propocionados en el .csv de la URL
async function loadStations(url) {
    let response = await fetch(url);
    let rawJson = await response.text();
    let stationsJson = JSON.parse(rawJson)['stations']
    return stationsJson;
}




