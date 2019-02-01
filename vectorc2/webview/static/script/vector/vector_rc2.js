/**
 * 
 * @author sebastian@kruk.me
 */

'use strict';

const SessionStorage = (function(){

  return (function(){

    try {
        return window.sessionStorage;
    } catch(e) {}
    return null;

  })() || {

    setItem: function(){},
    getItem: function(){ return null },
    removeItem: function(){},
    clear: function(){},
    key: function(){},
    length: function(){ return 0; }
  };

})();


/**
 * Main class for managing UI for Vector Remote Control
 */
const VectorRC2 = (function(){

    // ---------------------------------------------------------------------------
    //                                  constants 
    // ---------------------------------------------------------------------------
    const __LANGS = {
        'en': 'English',
        'pl': 'Polski'
    }

    /**
     * Currently selected language
     * @type {string}
     */
    const __LANG = __getLang();

    /**
     * List of tab names.
     * @private
     */
    const __VIEWS = ['blocks', 'javascript', 'python', 'xml'];

    // ---------------------------------------------------------------------------
    //                                  variables 
    // ---------------------------------------------------------------------------

    /**
     * Main workspace object
     * @type {Blockly.WorkspaceSvg}
     */
    var __workspace = null;
    /**
     * 
     */
    var __selectedView = 'blocks';

    /**
     * References to key elements
     */
    var __elements = {
        blocklyArea: null,
        blocklyDiv: null,
        toolbox: null
    }

    // ---------------------------------------------------------------------------
    //                                  private methods 
    // ---------------------------------------------------------------------------

    /**
     * Initializing all necessary stuff to have VectorRC run
     */
    function __init__() {
        // initialize key element references
        $.each(__elements, function (index, value) {
            __elements[index] = $('#'+index)[0];
        });
        
        // hook actions
        $('#languageMenu').change(__beforeLanguageChange);
        $(window).resize(__onAreaResize);

        // initilize blockly
        __onAreaResize();
        __initilizeToolbox();

        __workspace =  Blockly.inject(__elements.blocklyDiv,
            {
                toolbox: __elements.toolbox,
                collapse: false,
                grid: {
                    spacing: 20,
                    length: 1,
                    colour: '#777',
                    snap: true },
                horizontalLayout: false,
                oneBasedIndex: false,
                scrollbars: true,
                sounds: false,
                trashcan: true,
                maxTrashcanContents: 10,
                zoom: false 
            });        

        Blockly.JavaScript.addReservedWords('code,timeouts,checkTimeout');

        __loadBlocks('');
    }

    /**
     * Initlizes the toolbox
     */
    function __initilizeToolbox() {
      for (var messageKey in MSG) {
          if (messageKey.indexOf('cat') == 0) {
            Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
          }
        }
      
      // Construct the toolbox XML, replacing translated variable names.
      var toolboxText =__elements.toolbox.outerHTML;
      toolboxText = toolboxText.replace(/(^|[^%]){(\w+)}/g,
          function(m, p1, p2) {return p1 + MSG[p2];});
      var toolboxXml = Blockly.Xml.textToDom(toolboxText);
    }

    /**
     * Extracts value of the given query parameter
     * @param {String} param 
     */
    function __urlParam(param, _default) {
        var results = new RegExp('[\?&]' + param + '=([^&#]*)').exec(window.location.search);
        return results ? decodeURIComponent(results[1].replace(/\+/g, '%20')) : _default;
    }

    /**
     * returns currently selected language
     */
    function __getLang() {
        return __urlParam('lang', 'en');
    }

    /**
     * 
     * @param {Event} event 
     */
    function __beforeLanguageChange(event) {
        var xml = Blockly.Xml.workspaceToDom(__workspace);
        var text = Blockly.Xml.domToText(xml);
        SessionStorage.setItem('loadOnceBlocks', text);
    }

    function __onAreaResize(e) {
        // Compute the absolute coordinates and dimensions of blocklyArea.
        var element = __elements.blocklyArea;
        var x = 0;
        var y = 0;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while (element);
        // Position blocklyDiv over blocklyArea.
        __elements.blocklyDiv.style.left = x + 'px';
        __elements.blocklyDiv.style.top = y + 'px';
        __elements.blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
        __elements.blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
        Blockly.svgResize(__workspace);      
    }

    // ------------------------------------------------------------------

    /**
     * TODO!!!
     * @param {*} defaultXml 
     */
    function __loadBlocks(defaultXml) {
        try {
          var loadOnce = window.sessionStorage.loadOnceBlocks;
        } catch(e) {
          // Firefox sometimes throws a SecurityError when accessing sessionStorage.
          // Restarting Firefox fixes this, so it looks like a bug.
          var loadOnce = null;
        }
        if ('BlocklyStorage' in window && window.location.hash.length > 1) {
          // An href with #key trigers an AJAX call to retrieve saved blocks.
          BlocklyStorage.retrieveXml(window.location.hash.substring(1));
        } else if (loadOnce) {
          // Language switching stores the blocks during the reload.
          delete window.sessionStorage.loadOnceBlocks;
          var xml = Blockly.Xml.textToDom(loadOnce);
          Blockly.Xml.domToWorkspace(xml, Code.workspace);
        } else if (defaultXml) {
          // Load the editor with default starting blocks.
          var xml = Blockly.Xml.textToDom(defaultXml);
          Blockly.Xml.domToWorkspace(xml, Code.workspace);
        } else if ('BlocklyStorage' in window) {
          // Restore saved blocks in a separate thread so that subsequent
          // initialization is not affected from a failed load.
          window.setTimeout(BlocklyStorage.restoreBlocks, 0);
        }
      };
      

    // ---------------------------------------------------------------------------

    return {
        init: __init__
    }

})();

$( document ).ready(VectorRC2.init)