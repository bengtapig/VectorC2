/**
 *  Copyright 2019 Sebastian Ryszard Kruk <vectorc2@kruk.me>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * 
 * @author vectorc2@kruk.me
 */
'use strict';

/**
 * Main class for downloading and uploading workspace definitions
 */
const VectorSafe = (function(){

  /**
   * Reference to the download HTML wrapper element
   */
  let __download;  
  /**
   * Reference to the upload HTML wrapper element
   */
  let __upload;  
  /**
   * Reference to the input element for uploading files
   */
  let __workspaceFileInput;

  /**
   * Initializes the component
   */
  function __init__() {
    __download = $('ul.navbar-nav li.nav-item a.a-button-download');
    if ('Blob' in window) {
      __download.mouseup(__startDownload);
    } else {
      __download.parent().removeClass('active').addClass('disabled');
    }

    __upload = $('ul.navbar-nav li.nav-item a.a-button-upload');
    __workspaceFileInput = $('#workspaceFile');
    if ('FileReader' in window) { 
      __upload.mouseup(__startUpload);
      __workspaceFileInput.change(__fileInputChange);
    } else {
      __upload.parent().removeClass('active').addClass('disabled');
    }
  }
  /**
   * Starts the download process
   */
  function __startDownload() {
    var fileName = prompt('Please enter file name to save', 'vector_workspace.xml');
    if (fileName) {
      __dowloadFile(VectorC2.getWorkspaceXML(), fileName);
    }
  }
  /**
   * 
   * @param {XML} workspaceXML 
   * @param {String} fileName 
   */
  function __dowloadFile(workspaceXML, fileName) {
    let blob = new Blob([workspaceXML], {type: "text/xml"});
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
  }
  /**
   * Starts the upload process
   */
  function __startUpload() {
    __workspaceFileInput.click();
  }
  /**
   * When we select a file to be uploaded
   * @param {Event} event 
   */
  function __fileInputChange(event) {
    let fileToLoad = event.target.files[0];

    if (fileToLoad) {
      let reader = new FileReader();
      reader.onload = __onFileLoaded;
      reader.readAsText(fileToLoad, 'UTF-8');
    }
  }
  /**
   * Load the file as XML into the workspace
   * @param {FileLoadedEvent} event 
   */
  function __onFileLoaded(event) {
    var xmlWorkspace = event.target.result;
    VectorC2.updateWorkspaceBlocks(xmlWorkspace);
    // console.log("loaded " + textFromFileLoaded);
  }


  return {
    init: __init__,
  }
})()

$( document ).ready(VectorSafe.init)
