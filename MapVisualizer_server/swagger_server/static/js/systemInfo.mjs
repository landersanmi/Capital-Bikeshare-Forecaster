let sysinfoDiv;

$(document).ready(function(){
    sysinfoDiv = document.getElementById("sysinfo_container");
    $( "#exit_sysinfo_btn" ).click(function() {
        sysinfoDiv.classList.remove('animate__animated', 'animate__fadeIn');
        sysinfoDiv.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            hideSysInfo();
        }, 400);
    });
});

function hideSysInfo(){
    sysinfoDiv.style.visibility = 'hidden';
    sysinfoDiv.style.display = 'none';
}

export { hideSysInfo };
