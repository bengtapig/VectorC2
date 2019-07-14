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

  VectorMutator.init('vector_photos_count_ex', {});
  VectorMutator.init('vector_photo_list_ex', {});
  VectorMutator.init('vector_show_photo_ex', {
/*
,
    {
      "type": "field_input",
      "name": "window_name",
      "text": "new"
    }
*/
    window_name: {
      appendFunction: 'appendValueInput',
      checkType: 'String',
      align: Blockly.ALIGN_RIGHT
    }
  });

})();