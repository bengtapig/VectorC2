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
Blockly.JavaScript['vector_utils_distance_mm'] = function(block) {
  var value_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `${value_value}/*mm*/`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['vector_utils_speed_mmps'] = function(block) {
  var value_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `${value_value}/*mm/s*/`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['vector_utils_degrees'] = function(block) {
  var value_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `${value_value}/*deg*/`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['vector_utils_sleep'] = function(block) {
  var number_sleep_var = block.getFieldValue('sleep_var');
  var code = `Vectorex.wait(${number_sleep_var});\n`;
  return code;
};

Blockly.JavaScript['vector_const_min_head_angle'] = function(block) {
  var code = 'Vectorex.const.MIN_HEAD_ANGLE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['vector_const_max_head_angle'] = function(block) {
  var code = 'Vectorex.const.MAX_HEAD_ANGLE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['vector_const_max_lift_height'] = function(block) {
  var code = 'Vectorex.const.MAX_LIFT_HEIGHT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['vector_const_min_lift_height'] = function(block) {
  var code = 'Vectorex.const.MIN_LIFT_HEIGHT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};
