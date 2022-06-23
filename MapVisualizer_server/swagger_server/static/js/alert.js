$(document).ready(function() {
    alertMessage = document.getElementById('alert_message');
    alertDiv = document.getElementById("alert_container");

    $('#alert_container').on('close.bs.alert', function (event) {
        event.preventDefault();
        hideAlert();
    });
});

function hideAlert(){
    alertMessage.innerHTML = '';
    alertDiv.style.visibility = 'hidden';
}

