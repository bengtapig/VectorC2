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
/* jshint esversion: 6 */
(function() {
  'use strict';

  /**
   * Mutator methods added to vector_robot blocks.
   * @mixin
   * @augments Blockly.Block
   * @package
   * @readonly
   */
  Blockly.Constants.VectorUtils.CONTROLS_VECTOR_ROBOT_EX_MUTATOR_MIXIN = {
    robotVar_: false,
    serialNumber_: false,
    robotName_: false,

    /**
     * Create XML to represent the vector_robot mutations
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function() {

      if (!this.robotVar_ && 
          !this.serialNumber_ &&
          !this.robotName_) {
        return null;
      }
      let container = document.createElement('mutation');
      container.setAttribute('robotvar', this.robotVar_);
      container.setAttribute('serialnumber', this.serialNumber_);
      container.setAttribute('robotname', this.robotName_);
      return container;
    },
    /**
     * Parse XML to restore the vector_robot mutations
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function(xmlElement) {
      this.robotVar_ = xmlElement.getAttribute('robotvar') === 'true';
      this.serialNumber_ = xmlElement.getAttribute('serialnumber') === 'true';
      this.robotName_ = xmlElement.getAttribute('robotname') === 'true';

      this.rebuildShape_();
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function(workspace) {
      let topBlock = workspace.newBlock('controls_vector_robot_vector_opt_wrapper');
      topBlock.initSvg();

      var connection = topBlock.nextConnection;
      if (this.serialNumber_) {
        let serialNumberBlock = workspace.newBlock('controls_vector_robot_vector_ext_serial_opt');
        serialNumberBlock.initSvg();
        connection.connect(serialNumberBlock.previousConnection);
      }
      if (this.robotName_) {
        let robotNameBlock = workspace.newBlock('controls_vector_robot_vector_ext_name_opt');
        robotNameBlock.initSvg();
        connection.connect(robotNameBlock.previousConnection);
      }
      if (this.robotVar_) {
        let robotVarBlock = workspace.newBlock('controls_vector_robot_vector_ext_variable_opt');
        robotVarBlock.initSvg();
        connection.connect(robotVarBlock.previousConnection);
        connection = robotVarBlock.nextConnection;
      }

      return topBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function(topBlock) {
      var clauseBlock = topBlock.nextConnection.targetBlock();
      
      // Reset and detect options
      this.robotVar_ = false;
      this.serialNumber_ = false;
      this.robotName_ = false;

      var extVariableConnection = null;
      var extSerialConnection = null;

      while (clauseBlock) {
        switch (clauseBlock.type) {
          case 'controls_vector_robot_vector_ext_variable_opt':
            if (!this.robotVar_) {
              this.robotVar_ = true;
              extVariableConnection = clauseBlock.statementConnection_;
            }
            break;
          case 'controls_vector_robot_vector_ext_serial_opt':
            if (!this.serialNumber_) {
              this.serialNumber_ = true;
              extSerialConnection = clauseBlock.statementConnection_;
            }
            break;
          case 'controls_vector_robot_vector_ext_name_opt':
            if (!this.robotName_) {
              this.robotName_ = true;
              extSerialConnection = clauseBlock.statementConnection_;
            }
            break;
          default:
            throw TypeError('Unknown block type: ' + clauseBlock.type);
        }
        clauseBlock = clauseBlock.nextConnection &&
            clauseBlock.nextConnection.targetBlock();
      }
      this.updateShape_();

      // Reconnect any child blocks.
      this.reconnectChildBlocks_(extVariableConnection, extSerialConnection);

    },
    /**
     * Modify this block to have the correct number of inputs.
     * @this Blockly.Block
     * @private
     */
    updateShape_: function() {
      // Delete everything.
      if (this.getInput('ROBOT_VAR_DUMMY')) {
        this.removeInput('ROBOT_VAR_DUMMY');
      }
      if (this.getInput('SERIAL_VAR')) {
        this.removeInput('SERIAL_VAR');
      }
      if (this.getInput('NAME_VAR')) {
        this.removeInput('NAME_VAR');
      }

      if (this.serialNumber_) {
        this.appendValueInput('SERIAL_VAR')
            .setCheck('String')
            .appendField(Blockly.Msg.VECTOR_ROBOT_EX_SERIAL_TITLE);
      }
      if (this.robotName_) {
        this.appendValueInput('NAME_VAR')
            .setCheck('String')
            .appendField(Blockly.Msg.VECTOR_ROBOT_EX_NAME_TITLE);
      }
      if (this.robotVar_) {
          this.appendDummyInput('ROBOT_VAR_DUMMY')
              // .setAlign(Blockly.ALIGN_CENTRE)
              .appendField(Blockly.Msg.VECTOR_ROBOT_EX_VARIABLE_TITLE)
              .appendField(new Blockly.FieldVariable('robot'), 'ROBOT_VAR');
      }
      if (this.serialNumber_ || 
          this.robotName_ ||
          this.robotVar_) {
        this.setInputsInline(false);
      }

      if (this.robotVar_ && this.serialNumber_) {
        this.setTooltip("Use Vector %1 %2 with serial %3 %4");
      } else if (this.robotVar_ && !this.serialNumber_) {
        this.setTooltip("Use Vector %1 %2 %3");
      } else if (!this.robotVar_ && this.serialNumber_) {
        this.setTooltip("Use Vector %1 with serial %2 %3");
      }

    },
    /**
     * Reconstructs the block with all child blocks attached.
     */
    rebuildShape_: function() {

      var extVariableConnection = null;
      var extSerialConnection = null;

      if (this.getInput('SERIAL_VAR')) {
        extSerialConnection = this.getInput('SERIAL_VAR').connection.targetConnection;
      }
      if (this.getInput('NAME_VAR')) {
        extSerialConnection = this.getInput('NAME_VAR').connection.targetConnection;
      }
      if (this.getInput('ROBOT_VAR_DUMMY')) {
        extVariableConnection = this.getInput('ROBOT_VAR_DUMMY').fieldRow[1].connection.targetConnection;
      }

      this.updateShape_();
      this.reconnectChildBlocks_(extVariableConnection, extSerialConnection);
    },
      
    /**
     * Reconnects child blocks.
     */
    reconnectChildBlocks_: function(extVariableConnection, extSerialConnection) {
      Blockly.Mutator.reconnect(extVariableConnection, this, 'ROBOT_VAR');
      Blockly.Mutator.reconnect(extSerialConnection, this, 'SERIAL_VAR');
      Blockly.Mutator.reconnect(extSerialConnection, this, 'NAME_VAR');
    }


  };

  Blockly.Extensions.registerMutator('controls_vector_robot_ex_mutator',
      Blockly.Constants.VectorUtils.CONTROLS_VECTOR_ROBOT_EX_MUTATOR_MIXIN, 
      null, //opt_helperFn
      [
        'controls_vector_robot_vector_ext_serial_opt', 
        'controls_vector_robot_vector_ext_name_opt',
        'controls_vector_robot_vector_ext_variable_opt'
      ]);






  /**
   * "controls_if" extension function. Adds mutator, shape updating methods, and
   * dynamic tooltip to "controls_if" blocks.
   * @this Blockly.Block
   * @package
   */
  Blockly.Constants.VectorUtils.CONTROLS_VROBOT_TOOLTIP_EXTENSION = function() {

    this.setTooltip(function() {
      if (!this.selectCount_) {
        return Blockly.Msg.BKY_VECTOR_ROBOT_EX_TOOLTIP;
      // } else if (!this.elseifCount_ && this.elseCount_) {
      //   return Blockly.Msg['BKY_VECTOR_ROBOT_EX_ROBOT_TOOLTIP'];
      // } else if (this.elseifCount_ && !this.elseCount_) {
      //   return Blockly.Msg['CONTROLS_IF_TOOLTIP_3'];
      } else if (this.selectCount_) {
        return Blockly.Msg.BKY_VECTOR_ROBOT_EX_ROBOT_TOOLTIP;
      }
      return '';
    }.bind(this));
  };

  Blockly.Extensions.register('controls_vrobot_tooltip',
      Blockly.Constants.VectorUtils.CONTROLS_VROBOT_TOOLTIP_EXTENSION);
}());
