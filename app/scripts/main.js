/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // Check to see if there's an updated version of service-worker.js with
      // new files to cache:
      // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-registration-update-method
      if (typeof registration.update === 'function') {
        registration.update();
      }

      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here

  function StickyNotesApp () {
     this.notesContainer = document.getElementById('notes-container');
     this.noteMessageInput = document.getElementById('message');
     this.addNoteButton = document.getElementById('save');
     this.notesSectionTitle = document.getElementById('notes-section-title');

     this.addNoteButton.addEventListener('click', this.saveNote.bind(this));

     this.noteMessageInput.addEventListener('keyup', this.toggleButton.bind(this));

     for (var key in localStorage){
      this.displayNote(key, localStorage[key]);
     }

     window.addEventListener('storage', function(e){
      this.displayNote(e.key, e.newValue);
     }.bind(this));
  }

  StickyNotesApp.prototype.saveNote = function(){
    if(this.noteMessageInput.value); {
      var key = Date.now().toString();
      localStorage.setItem(key, this.noteMessageInput.value);
      this.displayNote(key, this.noteMessageInput.value);
      StickyNotesApp.resetMaterialTextField(this.noteMessageInput);
      this.toggleButton();
    }
  };

  StickyNotesApp.resetMaterialTextField = function(element){
    element.value = '';
    element.parentNode.MaterialTextField.boundUpdateClassesHandler();
    element.blur();
  };

  StickyNotesApp.prototype.displayNote = function(key, message){
    var note = document.getElementById(key);

    if (!note){
      note = document.createElement('sticky-note');
      note.id = key;
      this.notesContainer.insertBefore(note, this.notesSectionTitle.nextSibling);
    }

    if (!message){
      return note.deleteNote();
    }
    note.setMessage(message);
  };

  StickyNotesApp.prototype.toggleButton = function() {
    if(this.noteMessageInput.value){
      this.addNoteButton.removeAttribute('disabled');
    }else {
      this.addNoteButton.setAttribute('disabled', 'true');
    }
  };

  window.addEventListener('load', function(){
    new StickyNotesApp();
  });

  var StickyNote = Object.create(HTMLElement.prototype);

  StickyNote.TEMPLATE = 
    '<div class="message"></div>' + 
    '<div class="date"></div>'+
    '<button class="delete mdl-button mdl-js-button mdl-js-ripple-effect">'+
    ' Delete'+
    '</button>';

    StickyNote.CLASSES = ['mdl-cell--4-col-desktop', 'mdl-card__supporting-text', 'mdl-cell--12-col',
                          'mdl-shadow--2dp', 'mdl-cell--4-col-tablet', 'mdl-card', 'mdl-cell', 'sticky-note'];

    StickyNote.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    StickyNote.createdCallback = function(){
      StickyNote.CLASSES.forEach(function(klass){
        this.classList.add(klass);
      }.bind(this));
      this.innerHTML = StickyNote.TEMPLATE;
      this.messageElement = this.querySelector('.message');
      this.dateElement = this.querySelector('.date');
      this.deleteButton = this.querySelector('.delete');
      this.deleteButton.addEventListener('click', this.deleteNote.bind(this));
    };

    StickyNote.attributeChangedCallback = function(attributeName){
      if(attributeName == 'id'){
        var date = new Date();
        if(this.id){
          date = new Date(parseInt(this.id));
        }
        var month = StickyNote.MONTHS[date.getMonth()];
        this.dateElement.textContent = 'Created on' + month + ' ' + date.getDate();
        }
    };

    StickyNote.setMessage = function(message){
      this.messageElement.textContent = message;
      this.messageElement.innerHTML = this.messageElement.innerHTML.replace(/\n/g, '<br>');
    };

    StickyNote.deleteNote = function(){
      localStorage.removeItem(this.id);
      this.parentNode.removeChild(this);
    };

    document.registerElement('sticky-note', {
      prototype: StickyNote
    });

})();
