$(document).ready(function() {

    "use strict";
  
    /**
     * Cache variables
     */
    let menu = document.querySelector("#c-circle-nav");
    let toggle = document.querySelector("#c-circle-nav__toggle");
    let mask = document.createElement("div");
    let activeClass = "is-active";
  
    /**
     * Create mask
     */
    mask.classList.add("c-mask");
    document.body.appendChild(mask);
  
    /**
     * Listen for clicks on the toggle
     */
    toggle.addEventListener("click", function(e) {
      e.preventDefault();
      toggle.classList.contains(activeClass) ? deactivateMenu() : activateMenu();
    });
  
    /**
     * Listen for clicks on the mask, which should close the menu
     */
    mask.addEventListener("click", function() {
      deactivateMenu();
    });
  
    /**
     * Activate the menu 
     */
    function activateMenu() {
      menu.classList.add(activeClass);
      toggle.classList.add(activeClass);
      mask.classList.add(activeClass);
    }
  
    /**
     * Deactivate the menu 
     */
    function deactivateMenu() {
      menu.classList.remove(activeClass);
      toggle.classList.remove(activeClass);
      mask.classList.remove(activeClass);
    }

    /**
     *  Get the prefered language of the user settings in navigator
     */
    function getLang() {
      if (navigator.languages != undefined) 
        return navigator.languages[0]; 
      return navigator.language;
    }

    /**
     *  Manage settings language buttons
     */
    let language;
    let languageFromQuery = document.getElementById('language').textContent;

    if(languageFromQuery==='noLang' || languageFromQuery ===""){
      language = getLang();
    }else{
      language = languageFromQuery;
    }

    let lang1, lang2, lang1Parent, lang2Parent;
    let TOKEN = document.getElementById('token').textContent;
    if(language==='eu_ES') language = 'eu';
    if(language==='es'){
      lang1 = document.getElementById('icon_language1');
      lang1.textContent="EN";
      lang1Parent = lang1.parentElement;
      lang1Parent.removeAttribute('href');
      lang1Parent.setAttribute("href", 'http://192.168.0.17:7070/login?token=' + TOKEN + '&lang=en');

      lang2 =document.getElementById('icon_language2');
      lang2.textContent="EU";
      lang2Parent = lang2.parentElement;
      lang2Parent.removeAttribute('href');
      lang2Parent.setAttribute("href", 'http://192.168.0.17:7070/login?token=' + TOKEN + '&lang=eu');
    }else if(language==='eu'){
      lang1 = document.getElementById('icon_language1');
      lang1.textContent="EN";
      lang1Parent = lang1.parentElement;
      lang1Parent.removeAttribute('href');
      lang1Parent.setAttribute("href", 'http://192.168.0.17:7070/login?token=' + TOKEN + '&lang=en');
      
      lang2 =document.getElementById('icon_language2');
      lang2.textContent="CA";
      lang2Parent = lang2.parentElement;
      lang2Parent.removeAttribute('href');
      lang2Parent.setAttribute("href", 'http://192.168.0.17:7070/login?token=' + TOKEN + '&lang=es');
    }else{
      lang1 = document.getElementById('icon_language1');
      lang1.textContent="CA";
      lang1Parent = lang1.parentElement;
      lang1Parent.removeAttribute('href');
      lang1Parent.setAttribute("href", 'http://192.168.0.17:7070/login?token=' + TOKEN + '&lang=es');
      
      lang2 =document.getElementById('icon_language2');
      lang2.textContent="EU";
      lang2Parent = lang2.parentElement;
      lang2Parent.removeAttribute('href');
      lang2Parent.setAttribute("href", 'http://192.168.0.17:7070/login?token=' + TOKEN + '&lang=eu');
    }

});

