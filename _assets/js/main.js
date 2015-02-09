/* 
 * Lista con los acentos disponibles para el lector de voz
 */
var speechLanguages = [];
window.speechSynthesis.onvoiceschanged = function() {
  var languageCode = '';
  $.each( window.speechSynthesis.getVoices(), function( index, element ) {
    languageCode = element.lang;
    if ( jQuery.inArray(languageCode, speechLanguages) == -1 && languageCode ) {
      speechLanguages.push(languageCode);
    }
  });
};

/*
 * Lector de voz
 */

var voicePlayer = function() {
  // Atributos
  var autoplay = false,
  accent = 'es',
  text = '¡Tengo vida propia!';

  /* -- Lifecycle ------------------------------------------------- */
  this.created = function() {
    if ('speechSynthesis' in window) {
      this.speech = new SpeechSynthesisUtterance();
      this.ready();
    } else {
      console.error('Tu navegador no soporta Web Speech API');
    }
  };
  this.ready = function() {
    // Initialize attributes
    this.textChanged();
    this.accentChanged();
    if (autoplay) {
      this.speak();
    }
  };
  this.accentChanged = function() {
    this.speech.lang = accent;
  };
  this.textChanged = function() {
    this.speech.text = text;
  };

  // Metodos
  this.accentChange = function( newAccent ) {
    accent = newAccent;
    this.accentChanged();
  };
  this.textChange = function( newText ) {
    text = newText;
    this.textChanged();
  };
  this.speak = function() {
    window.speechSynthesis.speak(this.speech);
  };
  this.cancel = function() {
    window.speechSynthesis.cancel();
  };
  this.pause = function() {
    window.speechSynthesis.pause();
  };
  this.resume = function() {
    window.speechSynthesis.resume();
  };
};

/*
 * Reconocimiento de voz
 */
function linebreak(s) {
  var two_line = /\n\n/g,
      one_line = /\n/g;
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
function capitalize(s) {
  var first_char = /\S/;
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}
if (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition) {
  var recognition = new webkitSpeechRecognition(),
      player = new voicePlayer(),
      final_transcript = '',
      playerAccent = '';
  recognition.continuous = true;
  recognition.lang = 'es-AR';
  recognition.interimResults = false;
  $("#language-selector").on('input', function() {
    playerAccent = $(this).val();
    $('#recognition-button').removeClass('visuallyhidden');
  });
  document.querySelector('#recognition-form').addEventListener('submit', function(e) {
    e.preventDefault();
    recognition.start();
    $("html, body").animate({scrollTop: $(".permissions-section").offset().top}, 900);
  });
  recognition.onstart = function() {
    player.created();
    $("html, body").animate({scrollTop: $(".recognition-section").offset().top}, 900);
    for (var i = 0; i < speechLanguages.length; i++) {
      if ( speechLanguages[i].substr(0, 2) == playerAccent ) {
        playerAccent = speechLanguages[i];
      }
    }
    player.accentChange(playerAccent);
    console.log('¡Comenzo!');
  };
  recognition.onerror = function(event) {
    console.log('Error: ' + event.error);
  };
  recognition.onend = function() {
    console.log('¡Termino!');
  };
  recognition.onresult = function(event) {
    var interim_transcript = '';
    if (typeof(event.results) == 'undefined') {
      recognition.onend = null;
      recognition.stop();
      return;
    }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = capitalize(final_transcript);
    var finalTranscriptLine = linebreak(final_transcript),
        interimTranscriptLine = linebreak(interim_transcript);
    $.getJSON('https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20141228T005918Z.08453a5c73bdadd6.abd6c153aa5e7d9bc8327b4c77f373661193ee7d&lang=es-' + playerAccent.substr(0, 2) + '&text=' + encodeURI(finalTranscriptLine), function( data ) {
      var textTranslated = data.text[0];
      player.textChange(textTranslated);
      player.speak();
      document.getElementById('recognition-text-b').textContent = textTranslated;
    });
    document.getElementById('recognition-text-a').textContent = finalTranscriptLine;
  };
} else {
  console.error('Tu navegador no soporta Web Speech API');
}


// /* 
//  * Lista con los acentos disponibles para la lectura de discursos
//  */
// var speechLanguages = [];
// window.speechSynthesis.onvoiceschanged = function() {
//   var languageCode = '';
//   $.each( window.speechSynthesis.getVoices(), function( index, element ) {
//     languageCode = element.lang.substr(0, 2);
//     if ( jQuery.inArray(languageCode, speechLanguages) == -1 && languageCode ) {
//       speechLanguages.push(languageCode);
//     }
//   });
// };
 
//  * Comparar la lista anterior con los lenguajes disponibles para traduccion
//  * y agregar las coincidencias
 
// $.getJSON('https://translate.yandex.net/api/v1.5/tr.json/getLangs?key=trnsl.1.1.20141228T005918Z.08453a5c73bdadd6.abd6c153aa5e7d9bc8327b4c77f373661193ee7d&ui=en', function( data ) {
//   var items = ['<option selected disabled>Desplegar lista de lenguajes</option>'];
//   $.each( data.langs, function( key, val ) {
//     if (jQuery.inArray(key, speechLanguages) >= 0 ) {
//       items.push( "<option value='" + key + "'>" + val + "</li>" );
//     }
//   });
//   $( items.join("") ).appendTo( "#language-selector" );
// });