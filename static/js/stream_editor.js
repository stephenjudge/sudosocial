function patchouliUsername() {
    return $('#auth-username').text();
}
$('#add-url-form').submit(function(){    
    var successFn = function(data, status, xhr) {

        $('#no-stream-feed-blurb').hide();
        $('input[name=url]').val('');        
        var newFeedLi = $('#base-stream-feed-link').clone();
        newFeedLi.attr('id', null);
        $('a.stream-feed-source', newFeedLi).attr('href', data.feed.url)
                                     .text(data.feed.url);
        $('a.feed-delete', newFeedLi).attr('href', '' + data.feed.url_hash);
        newFeedLi.show();
        $('#user_streams').append(newFeedLi);
        };
    var completeFn = function (xhr, status) {
        $('input').attr('disabled', null);
    };
    $('input').attr('disabled', 'disabled');
    //$('#add-url-form').serialize()
    $.ajax({url: '/manage/urls/' + $('#auth-username').text(), type: 'POST', data: {url: $('input[name=url]').val(), streams:[$('input[name=streams]').val()]}, success: successFn, complete: completeFn, dataType:'json'});
    
    return false;
    });
$('a.feed-delete').live('click', function(){
    var that = $(this);
    var url_hash = that.attr('href');
    var deleteSuccessFn = function(){
        that.parent().remove();   
        };
    $.ajax({url:'/manage/url/' + $('#auth-username').text() + '/' + url_hash, type: 'DELETE', success: deleteSuccessFn, dataType: 'json'});
    return false;
    });
$('.tab a').click(function(){
    var other = $('.tab.active-tab').attr('id');
    var newActive = $(this).parent().attr('id');
    
    if (other != newActive) {
        $('#' + other).removeClass('active-tab');
        $('#' + other + '-panel').hide();
        $('#' + newActive).addClass('active-tab');
        $('#' + newActive + '-panel').show();
    }
    return false;
    });
$('.tab a:first').trigger('click');

/* auth confirm page */
$('#profile-image button').click(function(event){
  event.preventDefault();
  $(this).attr('disabled', true);
  var button = $(this);
  var img = $(this).parents('div').find('img');
  $.get('gravatar/' + $('#email').val(), function(data){
        img.attr('src', data);
        button.attr('disabled', false);
  });
  return false;
});
$(document).ready(function(){
    var changeVisibility = function(jQueryElement, newState, oldClass, newClass, newLabel) {
        var that = jQueryElement,
            url = that.attr('href');
        that.removeAttr('href');
        $.post(url, {'change-visibility': newState}, function(data, statusText){
            that.removeClass(oldClass).addClass(newClass);
            that.attr('href', url);
            that.text(newLabel);
        });    
    }
    
    $('a.display_entry').click(function(){
        var entryIsVisible = $(this).hasClass('entry-visible');
        if (entryIsVisible) {
            changeVisibility($(this), false, 'entry-visible', 'entry-hidden', 'Show Entry');
            $(this).parent().addClass('entry-hidden');
        } else {
            changeVisibility($(this), true, 'entry-hidden', 'entry-visible', 'Hide Entry');
            $(this).parent().removeClass('entry-hidden');
        }
        return false;
    });
    $('a.display_entry.entry-hidden').parent().addClass('entry-hidden');
});