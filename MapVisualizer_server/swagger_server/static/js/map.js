let map;
let markers = [];
let infoWindows = [];
let filterDiv;
let loadingDiv;
let graphicsDiv;
let alertDiv;
let alertMessage;
let sysinfoDiv;
let language;
let languageFromQuery;
let selectedStationId;
let closedSationGraphics = true;
let screenWidth;
const RED= 'rgba(226, 40, 0, 0.9)';
const GREEN= 'rgba(46, 254, 50, 0.9)';
const BLUE= 'rgba(48, 148, 247, 0.9)';
const BLACK= 'rgba(0, 0, 0, 0.9)';

// Se ocultan algunos elementos mientras se realiza la carga del mapa.
$( document ).ready(function() {
    document.getElementById("filter_container").style.visibility = 'hidden';
    document.getElementById("map").style.visibility = 'hidden';
    document.getElementById("c-circle-nav").style.visibility = 'hidden';
    document.getElementById("alert_container").style.visibility = 'hidden';
    document.getElementById("sysinfo_container").style.visibility= 'hidden';

   languageFromQuery = document.getElementById('language').textContent;
   if(languageFromQuery==='noLang' || languageFromQuery ===""){
      language = getLang();
   }else{
      language = languageFromQuery;
   }

   // Configuraciones de componentes incluidos en el mapa que no se pueden modularizar por que hacen uso del mapa, que tiene que usarse
   // en un fichero .js y no .mjs, por lo que no es posible exportarlo
    $('#input_station').on('change',  function(){
        showLoading();
        let selectedStation = $('#input_station').val();
        selectedStationId = $('#selector_station option[value="' + selectedStation + '"]').attr('station_id');
        zoomAtStationAjax(selectedStationId);
    });

   let infoLink =document.getElementById('info_link');
   infoLink.addEventListener("click", function (){
        showLoading();
        loadSystemInfoAjax();
        document.getElementById("c-circle-nav__toggle").click();
   });
   alertMessage = document.getElementById("alert_message");

   graphicsDiv = document.getElementById("graphics_container");
    $( "#exit_graphics_btn" ).click(function() {
        graphicsDiv.classList.remove('animate__animated', 'animate__fadeInUp');
        graphicsDiv.classList.add('animate__animated', 'animate__fadeOutDown');
        closedSationGraphics = true;
        setTimeout(() => {
            hideSysInfo();
            }, 500);
    });
   //////////////////////////////////////////////////////////////////
   //                         RESPONSIVE                           //
   //////////////////////////////////////////////////////////////////
   screenWidth = window.innerWidth;
   resizeGraphicsColumns(screenWidth);
   $( window ).resize(function() {
        date = $('#input_calendar').val();
        date = date.replaceAll('/', '-');
        screenWidth = window.innerWidth;
        resizeGraphicsColumns(screenWidth);
   });
});

function resizeGraphicsColumns(screenWidth){
    if(screenWidth < 1921 && screenWidth > 991 ){
            $('#availability_col').insertBefore($('#rentals_col'));
    }else{
            $('#rentals_col').insertBefore($('#availability_col'));
            $('#returns_col').insertBefore($('#availability_col'));
    }

    if (screenWidth < 1921){
        $('#lastweek_col').removeClass("col-lg-3").removeClass("col-lg-12").addClass("col-lg-6");
        $('#rentals_col').removeClass("col-lg-3").removeClass("col-lg-12").addClass("col-lg-6");
        $('#returns_col').removeClass("col-lg-3").removeClass("col-lg-12").addClass("col-lg-6");
        $('#availability_col').removeClass("col-lg-3").removeClass("col-lg-12").addClass("col-lg-6");

    }else{
        $('#lastweek_col').removeClass("col-lg-6").removeClass("col-lg-12").addClass("col-lg-3");
        $('#rentals_col').removeClass("col-lg-6").removeClass("col-lg-12").addClass("col-lg-3");
        $('#returns_col').removeClass("col-lg-6").removeClass("col-lg-12").addClass("col-lg-3");
        $('#availability_col').removeClass("col-lg-6").removeClass("col-lg-12").addClass("col-lg-3");
    }
    if(selectedStationId!=undefined && !closedSationGraphics){
        showGraphicsAjax(date, selectedStationId);
    }
}

//////////////////////////////////////////////////////////////////
//                          LANGUAGE                            //
//////////////////////////////////////////////////////////////////
function getLang() {
  if (navigator.languages != undefined)
    return navigator.languages[0];
  return navigator.language;
}
//////////////////////////////////////////////////////////////////
//                            MAP                               //
//////////////////////////////////////////////////////////////////
// Funcion callback ejecutada para cargar el mapa
function initMap() {
    $( document ).ready(function() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 38.9063717, lng: -77.0225115},
            zoom:14,
            optimize:true,
            fullscreenControl: false,
            gestureHandling: "cooperative",
        });

        // FILTRO
        filterDiv = document.getElementById("filter_container");
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(filterDiv);

        // LOADING
        loadingDiv = document.getElementById("loading_div");
        hideLoading();
        map.controls[google.maps.ControlPosition.CENTER].push(loadingDiv);

        // GRÁFICOS
        graphicsDiv = document.getElementById("graphics_container");
        hideGraphics();
        map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(graphicsDiv);

        // ALERT
        alertDiv = document.getElementById("alert_container");
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(alertDiv);

        // SYS INFO
        sysinfoDiv = document.getElementById("sysinfo_container");
        hideSysInfo();
        map.controls[google.maps.ControlPosition.CENTER].push(sysinfoDiv);

        // Carga sin fallo visual
        setTimeout(() => {
            document.getElementById("filter_container").style.visibility = 'visible';
            document.getElementById("map").style.visibility = 'visible';
            document.getElementById("c-circle-nav").style.visibility = 'visible';
            loadStationsMarkersAjax();
            loadStationsInfoWindowsAjax();
                }, 600);

        google.maps.event.addListener(map,'zoom_changed',function (event) {
            hideSysInfo();
        });
        let zoomChangeBoundsListener = google.maps.event.addListener(map,'bounds_changed',function (event) {
        });
        google.maps.event.removeListener(zoomChangeBoundsListener);
    });
}

//////////////////////////////////////////////////////////////////
//                            AJAX                              //
//////////////////////////////////////////////////////////////////
// Cargar en el mapa las info windows de las estaciones
function loadStationsInfoWindowsAjax(){
    return $.ajax({
        type: "get",
        headers:{
              "accept": "application/json",
              "Access-Control-Allow-Origin":"*",
        },
        url: 'http://192.168.0.17:7070/api/v1/stations',
        success: function(result){
            result = JSON.parse(JSON.stringify(result));
            let stations = [];
            stations = result['stations'];
            if(stations.length !== 0){
                infoWindows = [];
                stations.forEach(stations_json => {
                    addInfoWindowStation(stations_json['station_id'], stations_json['name'], stations_json['capacity']);
                });
            }
            hideLoading();
        },
        error: function(result) {
            console.log("Error al cargar la información de las estaciones, comprobar el servidor de la BD.");
            setTimeout(() => {
                showAlert(_("ERROR_STATION_INFO"));
            }, 400);
            hideLoading();
        }
    });
}

// Cargar en el mapa los marcadores de las estaciones
function loadStationsMarkersAjax(){
    return $.ajax({
        type: "get",
        headers:{
              "accept": "application/json",
              "Access-Control-Allow-Origin":"*",
        },
        url: 'http://192.168.0.17:7070/api/v1/stations',
        success: function(result){
            result = JSON.parse(JSON.stringify(result));
            let stations = [];
            stations = result['stations'];
            if(stations.length !== 0){
                deleteMarkers();
                let index = 0;
                stations.forEach(stations_json => {
                     let position = new google.maps.LatLng(stations_json['lat'], stations_json['lon']);
                    addMarker(position, "./static/img/icon_not_empty.png", index, stations_json['station_id']);
                    index++;
                });
                showMarkers();
            }
        },
        error: function(result) {
            console.log("Error al cargar las estaciones, comprobar el servidor de la BD.");
            setTimeout(() => {
                showAlert(_("ERROR_STATIONS"));
            }, 400);
            hideLoading();
        }
    });
}

// Hacer Zoom a una estación dado su ID
function zoomAtStationAjax(station_id){
        return $.ajax({
        type: "get",
        headers:{
              "accept": "application/json",
              "Access-Control-Allow-Origin":"*",
        },
        url: 'http://192.168.0.17:7070/api/v1/station_information/' + station_id,
        success: function(result){
            result = JSON.parse(JSON.stringify(result));
            let center = new google.maps.LatLng(result['lat'], result['lon']);
            map.setCenter(center);
            map.setZoom(17);
            hideSysInfo();
            hideLoading();
        },
        error: function(result) {
            console.log("Error al cargar la estación");
            showAlert(_("ERROR_STATION"));
            hideLoading();
        }
    });
}

// Mostrar los gráficos
function showGraphicsAjax(date, station_id){
    return $.ajax({
        type: "get",
        headers:{
              "accept": "application/json",
              "Access-Control-Allow-Origin":"*",
        },
        url: 'http://192.168.0.17:8080/api/v1/forecast/' + date + '/' + station_id,
        success: function(forecast){
            let forecastData = JSON.parse(JSON.stringify(forecast));
            showForectasAndRealGraphicAjax(forecastData, date, station_id);
            showLastWeekGraphicAjax(date, station_id);
            hideSysInfo();
            graphicsDiv.style.visibility='visible';
            graphicsDiv.style.display = 'block';
            graphicsDiv.classList.remove('animate__animated', 'animate__fadeOutDown');
            graphicsDiv.classList.add('animate__animated', 'animate__fadeInUp');
            graphicsDiv.style.setProperty('--animate-duration', '0.4s');
            // Zoom in y out para que se muestre correctamente el graphic_container
            map.setZoom(map.getZoom()+1);
            map.setZoom(map.getZoom()-1);
        },
        error: function(result) {
            console.log("Error al cargar las predicciones, puede que el servidor Forecaster o la BD estén inactivos.");
            showAlert(_("ERROR_PREDICTIONS"));
            hideLoading();
        }
    });
}

// Get the system information
function loadSystemInfoAjax(){
    return $.ajax({
        type: "get",
        url: 'http://192.168.0.17:7070/api/v1/system_information',
        success: function(result){
            result = JSON.parse(JSON.stringify(result));
            document.getElementById("name_value").innerHTML = result['name'].toUpperCase();
            document.getElementById("operator_value").innerHTML = result['operator'];
            document.getElementById("email_value").innerHTML = result['email'];
            document.getElementById("phone_value").innerHTML = result['phone_number'];
            document.getElementById("startdate_value").innerHTML = result['start_date'];
            document.getElementById("timezone_value").innerHTML = result['timezone'];
            document.getElementById("url_value").innerHTML = result['url'];
            document.getElementById("url_value").href = result['url'];
            map.setZoom(map.getZoom()+1);
            map.setZoom(map.getZoom()-1);
            hideLoading();
            showSysInfo();

        },
        error: function(result) {
            console.log('Error al cargar la información sobre el sistema.');
            showAlert(_("ERROR_SYSTEM_INFO"));
            hideLoading();
        }
    });
}
// Mostrar los gráficos de alquileres, devoluciones y disponibilidad
function showForectasAndRealGraphicAjax(forecastData, date, station_id){
    showLoading();
    $.ajax({
        type: "get",
        headers:{
              "accept": "application/json",
              "Access-Control-Allow-Origin":"*",
        },
        url: 'http://192.168.0.17:8080/api/v1/real/' + date + '/' + station_id,
        success: function(real){
            let realData = JSON.parse(JSON.stringify(real));

            let hours = [];
            let forecastedRentals = [];
            let forecastedReturns = [];
            let realRentals = [];
            let realReturns = [];
            for (let i = 0; i < forecastData['rentals'].length; i++) {
                hours.push(forecastData['rentals'][i]['hour']);
                forecastedRentals.push(forecastData['rentals'][i]['value']);
                forecastedReturns.push(forecastData['returns'][i]['value']);
                realRentals.push(realData['rentals'][i]['value']);
                realReturns.push(realData['returns'][i]['value']);
            }
            let titleLabel = document.getElementById('graphics_title_label');
            titleLabel.innerHTML = '';
            let titleText = document.createTextNode(_("DATE") +": " + date.toString() + " / " + _("STATION") +": " + station_id.toString());
            titleLabel.appendChild(titleText);

            generateForectasAndRealGraphics(hours, forecastedRentals, forecastedReturns, realRentals, realReturns, date, station_id);
        },
        error: function(result) {
            console.log("Error al cargar los datos reales del día actual, comprobar el servidor de la BD.");
            showAlert(_("ERROR_ACTUAL_DAY"));
            hideLoading();
        }
    });
}

// Mostrar el grafico con datos de la semana anterior
function showLastWeekGraphicAjax(date, station_id){
    $.ajax({
        type: "get",
        headers:{
              "accept": "application/json",
              "Access-Control-Allow-Origin":"*",
        },
        url: 'http://192.168.0.17:8080/api/v1/lastweek/' + date + '/' + station_id,
        success: function(lastWeek){
            let lastWeekData = JSON.parse(JSON.stringify(lastWeek));

            let hours = [];
            let lastWeekRentals = [];
            let lastWeekReturns = [];
            for (let i = 0; i < lastWeekData['rentals'].length; i++) {
                hours.push(lastWeekData['rentals'][i]['hour']);
                lastWeekRentals.push(lastWeekData['rentals'][i]['value']);
                lastWeekReturns.push(lastWeekData['returns'][i]['value']);
            }

            generateLastWeekGraphic(hours, lastWeekRentals, lastWeekReturns, date, station_id);
            hideLoading();
        },
        error: function(result) {
            console.log("Error al cargar los datos reales de la semana pasada, comprobar el servidor de la BD.");
            showAlert(_("ERROR_LAST_WEEK"));
            hideLoading();
        }
    });
}
//////////////////////////////////////////////////////////////////
//                        INFO WINDOWS                          //
//////////////////////////////////////////////////////////////////
// Añadir ventanas de informacion a cada estación
function addInfoWindowStation(station_id, name, capacity){
    const infoWindowStation = new google.maps.InfoWindow({
        content:    '<div id="content">'+
                        '<h5><strong>'+ station_id +'&nbsp;-&nbsp;</strong>'+ name +'</h5>' +
                        '<hr id="separator">'+
                        '<div id="bodyContent">'+
                            '<img src="./static/img/dock.png" alt="Station dock" id="dock_img"><h6>&nbsp;'+ capacity +'&nbsp;'+  _('DOCKS') + '</h6>' +
                        '</div>' +
                    '</div>',
    });
    infoWindows.push(infoWindowStation);
}

//////////////////////////////////////////////////////////////////
//                          MARKERS                             //
//////////////////////////////////////////////////////////////////
// Añade un marcador al array de marcadores
function addMarker(position, icon_url, index, station_id) {
    const marker = new google.maps.Marker({
        position: position,
        icon: icon_url,
        animation: google.maps.Animation.DROP,
        map,
    });
    markers.push(marker);

    // HOVER
    google.maps.event.addListener(marker, 'mouseover', (function(index) {
        return function() {
            infoWindows[index].open(map, marker);
        }
    })(index));

    // HOVER OFF
    google.maps.event.addListener(marker, 'mouseout', (function(index) {
        return function() {
            infoWindows[index].close();
        }
    })(index));

    // CLICK
    google.maps.event.addListener(marker, 'click', (function(station_id){
        return function(){
            date = $('#input_calendar').val();
            date = date.replaceAll('/', '-');
            showLoading();
            showGraphicsAjax(date, station_id);
            selectedStationId = station_id;
            closedSationGraphics = false;
        }
    })(station_id));
}

// Establecer todos los marcadores a un mapa
function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Ocultar los marcadores
function hideMarkers() {
    setMapOnAll(null);
}

// Mostrar los marcadores
function showMarkers() {
    setMapOnAll(map);
}

// Eliminar los marcadores
function deleteMarkers() {
    hideMarkers();
    markers = [];
}

//////////////////////////////////////////////////////////////////
//                      EXT. FUNCTIONS                          //
//////////////////////////////////////////////////////////////////
function showSysInfo(){
    sysinfoDiv.style.visibility = 'visible';
    sysinfoDiv.style.display = 'block';
    sysinfoDiv.classList.remove('animate__animated', 'animate__fadeOut');
    sysinfoDiv.classList.add('animate__animated', 'animate__fadeIn');
    sysinfoDiv.style.setProperty('--animate-duration', '0.3s');
}
function hideSysInfo(){
    sysinfoDiv.style.visibility = 'hidden';
    sysinfoDiv.style.display = 'none';
}
function showLoading(){
    loadingDiv.style.visibility = 'visible';
    loadingDiv.style.display = 'block';
}
function hideLoading(){
    loadingDiv.style.visibility= 'hidden';
    loadingDiv.style.display = 'none';
}
function showAlert(message){
    alertMessage.innerHTML = message;
    alertDiv.style.visibility='visible'
    alertDiv.style.display = 'block';
    alertDiv.classList.add('fade', 'show');
}
//   GRAPHICS    //
function hideGraphics(){
    graphicsDiv.style.visibility= 'hidden';
    graphicsDiv.style.display = 'none';
}
function generateForectasAndRealGraphics(hours, forecastedRentals, forecastedReturns, realRentals, realReturns, date, station_id){
    let rentalsContainer = document.getElementById('rentals_col');
    let returnsContainer = document.getElementById('returns_col');
    let availabilityContainer = document.getElementById('availability_col');


    let rentalsForecastAxis = {x: hours, y: forecastedRentals, name: _("RENTALS_FORECAST_AXIS_LABEL"), type: 'scatter', mode:'lines', line: {color: RED}};
    let rentalsRealAxis = {x: hours, y: realRentals, name: _("RENTALS_REAL_AXIS_LABEL"), type: 'scatter', mode:'lines', line: {color: GREEN}};

    let rentalsAxes = [rentalsForecastAxis, rentalsRealAxis];
    let rentalsLayout = {
        title: _("RENTALS_TITLE"),
        legend: {
          orientation: "h",
          x: 0.20,
          xanchor: 'rigth',
          y: -0.2
        },
    };
    let rentalsConfig = {
      toImageButtonOptions: {
        format: 'svg',
        filename: _("RENTALS")+' - '+station_id.toString()+' [' + date.toString() + ']',

      }
    };


    let returnsForecastAxis = {x: hours, y: forecastedReturns, name: _("RETURNS_FORECAST_AXIS_LABEL"), type: 'scatter', mode:'lines', line: {color: RED}};
    let returnsRealAxis = {x: hours, y: realReturns, name: _("RETURNS_REAL_AXIS_LABEL"), type: 'scatter', mode:'lines', line: {color: BLACK}};
    let returnsAxes = [returnsForecastAxis, returnsRealAxis];
    let returnsLayout = {
        title: _("RETURNS_TITLE"),
        legend: {
          orientation: "h",
          x: 0.22,
          xanchor: 'rigth',
          y: -0.2
        },
    };
    let returnsConfig = {
      toImageButtonOptions: {
        format: 'svg',
        filename: _("RETURNS")+' - '+station_id.toString()+' [' + date.toString() + ']',
      }
    };

    let forecastedAvailability = [];
    let realAvailability = [];
    let lastHourForecastAvailabilityTemp = 0;
    let lastHourRealAvailabilityTemp = 0;
    for(let i = 0; i < hours.length; i++) {
        lastHourForecastAvailabilityTemp = lastHourForecastAvailabilityTemp + (forecastedReturns[i] - forecastedRentals[i]);
        lastHourRealAvailabilityTemp = lastHourRealAvailabilityTemp + (realReturns[i] - realRentals[i]);
        forecastedAvailability.push(lastHourForecastAvailabilityTemp);
        realAvailability.push(lastHourRealAvailabilityTemp)
    }
    let forecastedAvailabilityAxis = {x: hours, y: forecastedAvailability, name: _("AVAILABILITY_FORECAST_AXIS_LABEL"), type: 'scatter', mode:'lines', line: {color: RED}};
    let realAvailabilityAxis = {x: hours, y: realAvailability, name: _("AVAILABILITY_REAL_AXIS_LABEL"), type: 'scatter', mode:'lines', line: {color: BLUE}};
    let availabilityAxes = [forecastedAvailabilityAxis, realAvailabilityAxis];
    let availabilityLayout = {
        title: _("AVAILABILITY_TITLE"),
        legend: {
          orientation: "h",
          x: 0.17,
          xanchor: 'rigth',
          y: -0.2
        },
    };
    let availabilityConfig = {
      toImageButtonOptions: {
        format: 'svg',
        filename: _("AVAILABILITY")+' - '+station_id.toString()+' [' + date.toString() + ']',
      }
    };

    Plotly.newPlot(rentalsContainer, rentalsAxes, rentalsLayout, rentalsConfig);
    Plotly.newPlot(returnsContainer, returnsAxes, returnsLayout, returnsConfig);
    Plotly.newPlot(availabilityContainer, availabilityAxes, availabilityLayout, availabilityConfig);

}

function generateLastWeekGraphic(hours, lastWeekRentals, lastWeekReturns, date, station_id){
    let lastWeekContainer = document.getElementById('lastweek_col');

    let rentalsLastWeekAxis = {x: hours, y: lastWeekRentals, name: _("LASTWEEK_RENTALS_AXIS_LABEL"), type: 'scatter', mode:'lines', line: {color: GREEN}};
    let returnsLastWeekAxis = {x: hours, y: lastWeekReturns, name: _("LASTWEEK_RETURNS_AXIS_LABEL"), type: 'scatter', mode:'lines', line: {color: BLACK}};
    let lastWeekAxes = [rentalsLastWeekAxis, returnsLastWeekAxis];
    let lastWeekLayout = {
        title: _("LASTWEEK_TITLE"),
        autosize: true,
        legend: {
          orientation: "h",
          x: 0.17,
          xanchor: 'rigth',
          y: -0.2
        },
    };

    let lastWeekConfig = {
      toImageButtonOptions: {
        format: 'svg',
        filename: _("LASTWEEK")+' - '+station_id.toString()+' [' + date.toString() + ']',
      },
    };
    Plotly.newPlot(lastWeekContainer, lastWeekAxes, lastWeekLayout, lastWeekConfig);
}