// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

// TODO: re-write and consolidate where needed

// Error message text strings
//var ERROR_NOT_LOGGED_IN = "Your request could not be completed because it appears you have been logged out. Please try logging in again.";
//var ERROR_UNKNOWN_ERROR = "There was an error completing your request. Please refresh the page and try again. ";

function displayError(req, txtStatus, errThrown) {
  if(req.status == 403) {
    alert(I18n.t('js_error_login'));
  } else {
    alert(I18n.t('js_error_unknown'));
  }
}

// Quick jQuery extensions for missing prototype functions

jQuery.fn.extend({
  request: function( callback, type, failureCallback ) {
    var el = $(this[0]);
    return jQuery.ajax({
      type: el.attr('method'),
      url: el.attr('action'),
      data: el.serialize(),
      success: callback,
      error: failureCallback,
      dataType: type
    });
  },
	
  autofocus: function() {
    this.find('.autofocus:first').focus();
  },

  fancyRemove: function() {
    this.slideUp(300, function(evt) {
      $(this).remove();
    });
  },

  autoscrollToBottom: function() {
    var winBottom = $(window).scrollTop() + $(window).height();
    var el = $(this);
    if(winBottom < (el.offset().top + el.height())) {
      $(window).scrollTop(el.offset().top - ($(window).height() - el.height()));
    }
  }
});

// jQuery object extensions

jQuery.extend({
  del: function( url, data, callback, type, failureCallback ) {
    if ( jQuery.isFunction( data ) ) {
      callback = data;
      data = {};
    }
    
    data = data == null ? {} : data;
    if (!data['_method']) {
      if (typeof data == 'string')
        data += '&_method=DELETE';
      else
        data['_method'] = 'DELETE';
    }

    return jQuery.ajax({
      type: "POST",
      url: url,
      data: data,
      success: callback,
      dataType: type,
      error: failureCallback
    });
  },
	
  put: function( url, data, callback, type, failureCallback ) {
    if ( jQuery.isFunction( data ) ) {
      callback = data;
      data = {};
    }
		
    data = data == null ? {} : data;
    if (!data['_method']) {
      if (typeof data == 'string')
        data += '&_method=PUT';
      else
        data['_method'] = 'PUT';
    }
		
    return jQuery.ajax({
      type: "POST",
      url: url,
      data: data,
      success: callback,
      dataType: type,
      error: failureCallback
    });
  }
});

// authenticity_token fix

$(document).ajaxSend(function(event, request, settings) {
  if (typeof(AUTH_TOKEN) == "undefined" || request.type == 'GET') return;
  settings.data = settings.data ? (settings.data + '&') : "";
  settings.data += "authenticity_token=" + encodeURIComponent(AUTH_TOKEN);
});

$(document).ready(function(){
  bindStatic();
  bindDynamic();
});

function bindStatic() {
      
      $('.flash_success, .flash_error').click(function(evt) {
        $(this).hide('slow');
        
        return false;
      });

      $('.ajax_action').click(function(evt) {
        $.get($(this).attr('href'), {}, JustRebind, 'script');

        return false;
      });
      
      $('a#messageFormAdditionalTextToggle').click(function(evt) {
        $('#messageFormAdditionalText').toggle();
        $('#messageFormAdditionalTextExpand').toggle();
        $('#messageFormAdditionalTextCollapse').toggle();
        
        return false;
      });

      $('#new_account_info a.cancel').click(function(evt) {
        $.put($(this).attr('href'), {}, JustRebind, 'script');
        return false;
      });
      
      $('.taskCheckbox .completion').click(function(evt) {
        var el = $(evt.target);
        var url = el.next('a').attr('href');
        
        $.put(url, {'task[completed]': evt.target.checked}, JustReload, 'script');
        
        return false;
      });
      
      $('.loginOpenID').click(login_toggle_openid);
      
      $('.PopupMenuWidgetAttachTo').click(function(evt) {
        $(this).title = '';
        $('#'+this.id+'_menu').toggle();
      });
}

function bindDynamic() {

      // Popup form for Add Item
      $('.addTask form').submit(function(evt) {
        var form = $(this);
        form.request(function(data, txtStatus) {
          JustRebind();
          form.find('.loading_animation').hide();
          form.find('div:last').show();
        }, 'script', function(req, txtStatus, errThrown) {
          displayError(req, txtStatus, errThrown);
          
          form.find('.loading_animation').hide();
          form.find('div:last').show();
        });
        form.reset();

        //set task list back to edit mode when new task is added
        //(or new item will be in edit mode, and rest will be in reorder mode)
        var list = form.parents('.taskList:first');
        if(list.hasClass('reorder')) {
          list.find('.doEditTaskList').click();
        }
	
        form.find('div:last').hide();
        form.find('.loading_animation').show();

        return false;
      });
      
      $('.addTask form .cancel').click(function(evt) {
        var addItemInner = $(evt.target).parents('.inner:first');
        var newItem = addItemInner.parents('.addTask:first').find('.newTask:first');
        
        addItemInner.hide();
        addItemInner.children('form').reset();
        newItem.show();
        
        return false;
      });
      
      // Add Item link
      $('.newTask a').click(function(evt) {
        var newItem = $(evt.target.parentNode);
        var addItemInner = newItem.parents('.addTask:first').find('.inner:first');
        
        addItemInner.show();
        addItemInner.autofocus();
        newItem.hide();
        addItemInner.autoscrollToBottom();
        
        return false;
      });
      
      $('.taskItem form.editTaskItem').submit(function(evt) {
        var form = $(this);
        form.request(JustRebind, 'script', function(req, txtStatus, err) {
          displayError(req, txtStatus, err);

          form.find('div:last').show();
          form.find('.loading_animation').hide();
        });

        form.find('div:last').hide();
        form.find('.loading_animation').show();

        return false;
      });
    
      $('.taskItem form.editTaskItem .cancel').click(function(evt) {
        $.get(this.href, null, JustRebind, 'script');
        
        return false;
      });
      
      $('.taskList .completion').click(function(evt) {
        var el = $(evt.target);
        var url = el.next('a').attr('href');
        
        el.parent().find('.taskText, .taskActions, .taskControls').hide();
        el.parent().append("<img src='/images/loading.gif' alt='Loading' style='height: 12px;'>");
        
        $.put(url, {'task[completed]': evt.target.checked}, JustRebind, 'script', function(req, txtStatus, errThrown) {
          displayError(req, txtStatus, errThrown);

          el.parent().find('.taskText').show();
          el.parent().find('img[alt="Loading"]').remove();
        });
        
        return false;
      });
      
      $('.taskList .taskEdit').click(function(evt) {
        var taskDiv = $(this).parent().parent().parent();
        $.get(this.href, null, function() {
          taskDiv.find('form.editTaskItem').autoscrollToBottom();
          JustRebind();
        }, 'script');

        
        return false;
      });
      
      $('.taskList .taskDelete').click(function(evt) {
        var el = $(this);
        if (confirm(el.attr('aconfirm'))) {
          el.parent().parent().find('.taskText, .taskActions, .taskControls').hide();
          el.parent().parent().append("<img src='/images/loading.gif' alt='Loading' style='height: 12px;'>");
          
          $.del(this.href, null, JustRebind, 'script', function(req, txtStatus, errThrown) {
            displayError(req, txtStatus, errThrown);
            
            el.parent().parent().find('.taskText').show();
            el.parent().parent().find('img[alt="Loading"]').remove();
          });
        }
        
        return false;
      });
      
      $('.doEditTaskList').click(function(evt) {
        var el = $(this);
        var list = el.parents('.taskList:first');
        list.removeClass('reorder');
        
        list.find('.openTasks:first ul').sortable('destroy');
        list.find('.taskItemHandle').hide();
        
        el.hide();
        el.parent().children('.doSortTaskList').show();
        
        return false;
      });
      
      $('.doSortTaskList').click(function(evt) {
        var el = $(this);
        var url = el.attr('href');
        var list = el.parents('.taskList:first');
        list.addClass('reorder');
        
        list.find('.openTasks:first ul').sortable({
          axis: 'y',
          handle: '.taskItemHandle .inner',
          opacity: 0.75,
          update: function(e, ui) {
            $.post(url, list.find('.openTasks:first ul').sortable('serialize', {key: 'tasks'}));
          }
        });
        
        list.find('.taskItemHandle').show();
         
        el.hide();
        el.parent().children('.doEditTaskList').show();
        
        return false;
      });


      // Generic action form

      $('#action_dialog form').submit(function(evt) {
        var form = $(this);
        form.request(RebindAction, 'script');

        form.find('.submit:first').attr('disabled', true);
        //form.reset();
        return false;
      });

      $('#action_dialog a.cancel').click(function(evt) {
        $('#action_dialog').hide();

        return false;
      });

      $('a.oaction').click(function(evt) {
        var el = $(this);
        var on_page = $('#content .pageList:first').length == 1 ? 1 : 0;

        if (!confirm(el.attr('aconfirm')))
            return false;

        switch(el.attr('amethod')) {
          case 'delete':
            $.del(el.attr('href'), {'on_page':on_page}, JustRebind, 'script');
            break;
          case 'post':
            $.post(el.attr('href'), {'on_page':on_page}, JustRebind, 'script');
            break;
          case 'put':
            $.put(el.attr('href'), {'on_page':on_page}, JustRebind, 'script');
            break;
          case 'get':
            $.get(el.attr('href'), {'on_page':on_page}, JustRebind, 'script');
            break;
        };

        return false;
      });

      // Start & stop time

      $('.startTime').click(function(evt) {
        var el = $(this);
        $.post(el.attr('href'), {
          'time[open_task_id]': el.attr('task_id'),
          'time[assigned_to_id]': LOGGED_USER_ID,
        }, JustRebind, 'script');
        
        return false;
      });

      $('.stopTime').click(function(evt) {
        var el = $(this);
        $.put(el.attr('href'), {
          'time[open_task_id]': el.attr('task_id'),
          'time[assigned_to_id]': LOGGED_USER_ID,
        }, JustRebind, 'script', displayError);

        return false;
      });
}

function JustReload(data) {
  window.location.reload();
}

function JustRebind(data) {
  rebindDynamic();
}

function RebindAction(data) {
  rebindDynamic();
  $('#action_dialog').hide();
}

function rebindDynamic() {
  
  $('.addTask form').unbind();
  $('.addTask form .cancel').unbind();
  $('.newTask a').unbind();
  $('.taskItem form').unbind();
  $('.taskItem form .cancel').unbind();
  $('.taskList .completion').unbind();
  $('.taskList .taskEdit').unbind();
  $('.taskList .taskDelete').unbind();
  
  $('.doSortTaskList').unbind();
  $('.doEditTaskList').unbind();

  $('#action_dialog form').unbind();
  $('#action_dialog a.cancel').unbind();

  $('a.oaction').unbind();

  $('.startTime').unbind();
  $('.stopTime').unbind();
  
  bindDynamic();
}

var Project = {
  buildUrl: function(resource) {
    return ('/projects/' + PROJECT_ID + resource);
  },

  updateRunningTimes: function(size, locale) {
    $('#running_times_count span').html(locale);
    
    if (size > 0)
      $('#running_times_count').show();
    else {
      $('#running_times_count').hide();
      $('#running_times_menu').hide();
    }
  }
};

// Login form stuff

function login_toggle_openid() {
  if ($('#openid_login').css('display') == 'none') {
    $('#openid_login').show();
    $('#normal_login').hide();
    $('#loginOpenIDIdentity').focus();
  } else {
    $('#openid_login').hide();
    $('#normal_login').show();
    $('#loginUsername').focus();
  }
}

// Permissions form stuff
var permissions_form_items = [];

function permissions_form_project_select(id) {
  if ($('#projectPermissions' + id).attr('checked'))
    $('#projectPermissionsBlock' + id).show();
  else
    $('#projectPermissionsBlock' + id).hide();
}

function permissions_form_project_select_company(id) {
  if ($('#projectCompany' + id).attr('checked'))
    $('#projectCompanyUsers' + id).show();
  else
    $('#projectCompanyUsers' + id).hide();
}

function permissions_form_project_select_all(id) {
  var val = $('#projectPermissions' + id + 'All').attr('checked');
  
  // Select all items then!
  $.each(permissions_form_items, function(){
    $('#projectPermission' + id + this).attr('checked', val);
  });
}

function permissions_form_project_select_item(id) {
  var do_all = true;
	
  // Check to see if everything has been selected
  $.each(permissions_form_items, function(){
    if (!$('#projectPermission' + id + this).attr('checked'))
      do_all = false;
  });
  
  $('#projectPermissions' + id + 'All').attr('checked', do_all);
}

function permissions_form_items_set(list) {
  permissions_form_items = list;
}

// Form form stuff

function form_form_update_action() {
  $('#projectFormActionSelectMessage').attr('disabled', !$('#projectFormActionAddComment').attr('checked'));
  $('#projectFormActionSelectTaskList').attr('disabled', !$('#projectFormActionAddTask').attr('checked'));
}

// User form stuff

function user_form_update_passwordgen() {
  if ($('#userFormGeneratePassword').attr('checked'))
    $('#userFormPasswordInputs').hide();
  else
    $('#userFormPasswordInputs').show();
}

// File form stuff
var file_form_controls = null;

function file_form_select_revision() {
  if ($('#fileFormVersionChange').attr('checked'))
    $('#fileFormRevisionCommentBlock').show();
  else
    $('#fileFormRevisionCommentBlock').hide();
}

function file_form_select_update() {
  if ($('#fileFormUpdateFile').attr('checked'))
    $('#updateFileForm').show();
  else
    $('#updateFileForm').hide();
}

function file_form_attach_update_action() {
  $('#attachFormSelectFile').attr('disabled', !$('#attachFormExistingFile').attr('checked'));
  $('#attachFilesInput_1').attr('disabled', !$('#attachFormNewFile').attr('checked'));
}

function file_form_attach_init(limit) {
  if (file_form_controls != null)
    return;
	
  file_form_controls = {'count' : 1, 'next_id' : 2, 'limit' : limit};
	
  var add_button = document.createElement('button');
  add_button.setAttribute('type', 'button');
  add_button.setAttribute('id', 'attachFilesAdd');
  add_button.className = 'add_button';
  add_button.appendChild(document.createTextNode( "Add file" ));
	
  $('#attachFiles')[0].appendChild(add_button);
  
  $(add_button).click(file_form_attach_add);
}

function file_form_attach_add() {
  // Check to see if we have reached the limit
  if (file_form_controls.count >= file_form_controls.limit)
    return;
	
  var cur_id = file_form_controls.next_id;
	
  var attach_div = document.createElement('div');
  attach_div.id = 'attachFiles' + '_' + cur_id;
	
  var file_input = document.createElement('input');
  file_input.id = 'attachFilesInput_' + '_' + cur_id;
  file_input.setAttribute('type', 'file');
  file_input.setAttribute('name', 'uploaded_files[]');
	
  var remove_button = document.createElement('button');
  remove_button.setAttribute('type', 'button');
  remove_button.className = 'remove_button';
  remove_button.appendChild(document.createTextNode("Remove"));
	
  $(remove_button).click(function(event){
    file_form_attach_remove(cur_id);
  });
	
  attach_div.appendChild(file_input);
  attach_div.appendChild(remove_button);

  $('#attachFilesControls')[0].appendChild(attach_div);
	
  if (cur_id >= file_form_controls.limit)
    $('#attachFilesAdd').attr('disabled', true);
	
  file_form_controls.next_id += 1;
  file_form_controls.count += 1;
}

function file_form_attach_remove(id) {
  $('#attachFiles_' + id).remove();
  $('#attachFilesAdd').attr('disabled', false);
  file_form_controls.count -= 1;
}

// Notification form stuff (mainly for message posting)
var notify_form_companies = {};

function notify_form_select(company_id, id) {
  var do_all = true;
  
  // Check to see if everything has been selected
  $.each(notify_form_companies['company_' + company_id].users, function(){
    if (!$('#notifyUser' + this).attr('checked'))
      do_all = false;
  });
  
  $('#notifyCompany' + company_id).attr('checked', do_all);
}

function notify_form_select_company(id) {
  var val = $('#notifyCompany' + id).attr('checked');
  
  $.each(notify_form_companies['company_' + id].users, function(){
    $('#notifyUser' + this).attr('checked', val);
  });
}

function notify_form_set_company(id) {
  var count = 0;
  var users = notify_form_companies['company_' + id].users;
	
  $.each(users, function(){
    if ($('#notifyUser' + this).attr('checked'))
      count += 1;
  });
	
  if (count == users.length)
    $('#notifyCompany' + id).attr('checked', true);
}
