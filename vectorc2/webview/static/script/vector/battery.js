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
 * Main class for managing UI for Vector Remote Control
 */
const VectorBattery = (function(){

  /**
   * Reference to the battery HTML wrapper element
   */
  var __battery;
  /**
   * Name of the current state
   */
  var __state;
  /**
   * Handle for the last executed setInterval
   */
  var __stateCheckerInterval;

  /**
   * Initializes the UI component
   */
  function __init__() {
    __state = 'unknown';
    __battery = $('ul.navbar-nav li.nav-item a.i-battery');
    __battery.tooltip({ 
      boundary: 'window',
      delay: { 
        "show": 100, 
        "hide": 500 
      } 
    });

    VectorStatus.init(__onStateChecked);

    _startStateChecking();
  }

  /**
   * Shows given battery state
   * @param {String} state 
   */
  function _setState(state) {
    if ( ['charging', 'empty', 'full', 'half', 'low', 'unknown'].includes(state) ){
      __battery.removeClass(`battery-${__state}`).addClass(`battery-${state}`);
      __state = state;
    }
  }

  /**
   * Call to check the current Vector state
   */
  async function _checkState() {
    VectorStatus.readStatus();
  }

  /**
   * Function called as VectorStatus.onMessage callback
   * @param {StateObject} data 
   */
  function __onStateChecked(data) {
    console.log(data);

    let state = 'unknown';
    try {
      if (data.battery.is_charging) {
        state = 'charging'
      } else {
        switch (data.battery.battery_level) {
          case 3: state = 'full'; break;
          case 2: state = 'half'; break;
          case 1: state = 'low'; break;
          default:
            state = 'empty'
        }
      }
    } catch (e) {
      console.warn('Could not retrieve Vector state');
    }

    _setState(state);

    __battery.attr('data-original-title', __generateTooltip(data));
  }

  /**
   * Generates status tooltip based on status data
   * @param {StatusObject} data 
   */
  function __generateTooltip(data) {
    let tooltip = '<div class="container">' +
        '<h4>Battery:</h4>'+
        `<div class='row'><b class='col-md-8'>Level:</b><span class='col-md-4'>${data.battery.battery_level}</span></div>` +
        `<div class='row'><b class='col-md-8'>Volts:</b><span class='col-md-4'>${data.battery.battery_volts.toFixed(2)}</span></div>` +
        `<div class='row'><b class='col-md-8'>Charging:</b><span class='col-md-4'>${data.battery.is_charging}</span></div>` +
        `<div class='row'><b class='col-md-8'>Chargein:</b><span class='col-md-4'>${data.battery.suggested_charger_sec}s</span></div>` +
    '</div>';

    return tooltip;
  }

  /**
   * Start checking state at given frequency in ms.
   * Will close previous state checking interval if present
   * @param {Number} frequency in ms
   */
  function _startStateChecking(frequency) {
    if ( !$.isEmptyObject(__stateCheckerInterval) ) {
      _stopStateChecking()
    } else {
      setTimeout(_checkState, 500);
    }

    let _freq = frequency || 6000;
    __stateCheckerInterval = setInterval(_checkState, _freq);
    console.info(`Starting periodical Vector state checking at frequency every ${_freq}ms`)
  }

  /**
   * Stops state checking
   */
  function _stopStateChecking() {
    console.info("Will stop checking for Vector state");
    clearInterval(__stateCheckerInterval);
  }

  return {
    init: __init__,
    setState: _setState,
    checkState: _checkState,
    startStateChecking: _startStateChecking,
    stopStateChecking: _stopStateChecking
  }
})()

$( document ).ready(VectorBattery.init)
