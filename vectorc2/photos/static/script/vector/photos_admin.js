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
/**
 * Main class for Vector C2 photos administration
 */
const PhotosAdmin = (function(){
  'use strict';

  /**
   * References the photos administration modal element
   */
  let __photosModal;
  /**
   * References the element where collection of photos is presented
   */
  let __photosGallery;
  /**
   * References the form for uploading new photos
   */
  let __photosUploadForm;
  /**
   * Body of the modal with gallery
   */
  let __galleryBody;
  /**
   * Currently loaded photos count
   */
  let __photosOffset = 0;
  /**
   * Index used to keep track of photos added/removed since load
   */
  let __photosDiff = 0;
  /**
   * Will be true when choosing photos for Blockly
   */
  let __chooseModeCallback = null;

  /**
   * Initializes the UI component
   */
  function __init__() {
    __photosModal = $('#photosModal');
    __photosModal.on('shown.bs.modal', __onModalShow);
    __photosModal.on('hidden.bs.modal', __onModalHidden);
    // __photosModal.find('.modal-footer button.btn-primary').mouseup(__onClose);

    __photosGallery = __photosModal.find('.photo-images');

    __photosUploadForm = $('#photosModalUploadForm');
    __photosUploadForm.submit(__uploadPhotos);

    __galleryBody = __photosModal.find('.modal-body');

    let initialPhotos = Math.ceil(__galleryBody.height()/195)*5;
    console.log(`initial photos: ${initialPhotos}`);

    __loadPhotos(0, initialPhotos);
  }

  /**
   * Will initialize modal by loading images
   * @param {Event} e 
   */
  function __onModalShow(e) {
    let allPhotosHeight = $('.form-group.photo-images').height();
    let shownPhotosHeight = $('#photosModal .modal-body').height();
  }

  /**
   * Clean up when the modal is hidden
   * @param {Event} e 
   */
  function __onModalHidden(e) {
    __chooseModeCallback = null;
    __photosModal.removeClass('choose');
  }

  /**
   * Handles scroll events on the photo gallery
   * @param {Event} e 
   */
  function __onGalleryScroll(e) {
    if ( __galleryBody.scrollTop() >= __photosGallery.height() - __galleryBody.height() ) {
      __loadPhotos(__photosOffset);
    }
  }

  /**
   * Loads given $count of photos as a ready to use HTML mixing, starting from $offset index 
   * @param {int} offset 
   * @param {int} count
   */
  function __loadPhotos(offset=0, count=10) {

    $.ajax({
      url: '/photos/',
      type: 'get',
      data: {
        offset: offset,
        max_count: count
      },
      success: function(response) {
        __photosOffset = offset + count;
        
        if (response.total_count > __photosOffset + __photosDiff) {
          __galleryBody.on('scroll', __onGalleryScroll);    
        } else {
          __galleryBody.off('scroll');
          console.log('Will stop checking for more photos now'); 
        }
        __addPhotosToGallery(response.html, offset>0)
      },
      error: function(xhr) {
        LogPanel.logError(xhr.responseText)
        LogPanel.logError(xhr);
      }
    })
  }

  /**
   * Adds photos given as HTML mixim to the gallery.
   * If append is false, it will clear the gallery content 
   * 
   * @param {*} htmlMixim 
   * @param {*} append 
   */
  function __addPhotosToGallery(htmlMixim, append=true, atBegining=false) {
    if (!append || __photosGallery.find('#box-image-empty').length > 0) {
      __photosGallery.empty();
    }
    if (atBegining) {
      __photosGallery.prepend(htmlMixim);
    } else {
      __photosGallery.append(htmlMixim);
    }

    __photosGallery.find('.box-image > div > button').mouseup(__onPhotoAction);
  }

  /**
   * Prepares to remove a photo or select photo (if __chooseMode == true)
   * Will show confirmation dialog before
   * @param {Event} e onMouseUp event
   */
  function __onPhotoAction(e) {

    if (__chooseModeCallback) {
      // we will select this photo for blockly
      let selectedImg = $(e.target).parents('button').siblings('img')[0] || 
                        $(e.target).siblings('img')[0];
      __chooseModeCallback($(selectedImg));
      __onClose(e);
    } else {
      // we will check whether we can remove this photo
      let boxImage = e.currentTarget.closest('.box-image');
      let id = $(boxImage).find('.thumbnail > img').attr('data-id');
      let label = $(boxImage).find('.thumbnail > div.caption > p').text()
  
      bootbox.confirm({
        title: gettext("Remove photo?"),
        message: interpolate(gettext('Do you want to the remove photo "%(label)s"?'), {label: label}, true),
        buttons: {
            cancel: {
                label: gettext('<i class="fa fa-times"></i> Cancel')
            },
            confirm: {
                label: gettext('<i class="fa fa-check"></i> Confirm')
            }
        },
        callback: result => (result) 
                         ? __removeImage(boxImage, id) 
                         : LogPanel.logText(interpolate(gettext('You decided not to remove the photo "%(label)s"'), {}, true))
      });    
    }
  }

  /**
   * Removing image with given
   * @param {Event} e 
   */
  function __removeImage(boxImage, id) {
    $.ajax({
      url: `/photos/${id}`,
      type: 'delete',
      headers: {
        "X-CSRFToken": $("#photosModalUploadForm").find("input[name='csrfmiddlewaretoken']").attr('value'),
      },
      success: response => {
        boxImage.remove();
        __photosDiff--;
      },
      error: xhr => LogPanel.logError(xhr)
    })
  }

  /**
   * Handle even of uploading photos to the server
   * @param {Event} e 
   */
  function __uploadPhotos(e) {
    e.preventDefault();

    var data = new FormData(__photosUploadForm.get(0));
    
    $.ajax({
        url: $(this).attr('action'),
        type: $(this).attr('method'),
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {
          __photosDiff++;
          LogPanel.logText('successfully uploaded photo');
          __addPhotosToGallery(response.html, true, true);
        },
        error: function(xhr) {
          LogPanel.logError(xhr);
        }
    });
    return false;    
  }

  /**
   * Closes the modal
   */
  function __onClose(e) {
    __photosModal.modal('hide');
  }

  /**
   * Opens the modal with photos gallery ready for picking up a photo
   * @param {Function} callback 
   */
  function _choosePhoto(callback) {
    __chooseModeCallback = callback;
    __photosModal.modal('show');
    __photosModal.addClass('choose');
  }

  return {
    init: __init__,
    choosePhoto: _choosePhoto
  }
})()

$( document ).ready(PhotosAdmin.init)
