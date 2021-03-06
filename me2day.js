/*
    Script: me2day.js

    Version:
        0.1.0pre

    License:
        MIT-style license.

    Author:
        Lee, Heungsub <lee@heungsub.net>
*/
if (true || typeof window.me2day == 'undefined') {

/*
    Namespace: me2day
*/
var me2day = {
    /*
        Variable: version
            me2day.js 버전
    */
    version: '0.1.0pre',

    /*
        Variable: optimizedPrototypeVersion
            개발 기준으로 사용한 프로토타입 버전
    */
    optimizedPrototypeVersion: '1.6.0.3',

    /*
        Variable: me
            로그인한 사용자
    */
    me: null,

    /*
        Function: notify
            미투데이 알림창에 메시지를 띄웁니다.

        Parameters:
            message - 알림창에 띄울 메시지
    */
    notify: notification_message.show_message.bind(notification_message),

    /*
        Function: request
            외부 도메인으로 Ajax GET 요청을 보냅니다.

        Parameters:
            url - 요청 주소
            options - Prototype의 Ajax Options(method는 GET으로 고정)
    */
    request: function(url, options) {
        options.parameters = options.parameters || '';
        if (typeof options.parameters.toQueryString == 'function') {
            options.parameters = options.parameters.toQueryString();
        }
        options.parameters = {url: url + '?' + options.parameters};
        options.method = 'get';
        return new Ajax.Request('http://me2day.net/get_html', options);
    }
};
window.me2day = me2day;

/*
    Class: me2day.User
        미투데이 사용자를 추상화하는 클래스
*/
me2day.User = Class.create({
    /*
        Property: key
            사용자키

        Property: name
            사용자 아이디
    */
    key: null, name: null,

    /*
        Constructor: initialize

        Parameters:
            name - 사용자 아이디
    */
    initialize: function(name) {
        this.name = name.strip();
    },

    /*
        Function: getKey
            로그인한 사용자의 사용자키를 가져옵니다.

        Parameters:
            events - 사용자키 요청 시 Ajax 이벤트

        Events:
            onSuccess - 사용자키를 성공적으로 가져왔을 때
            onFailure - 사용자키를 가져오는데 실패했을 때
    */
    getKey: function(events) {
        if (this != me2day.me) {
            var msg = '로그인한 사용자의 사용자키만 가져올 수 있습니다.';
            throw new Error(msg);
        } else if (Object.isFunction(events)) {
            events = {onSuccess: events};
        }
        events = Object.extend({
            onSuccess: Prototype.emptyFunction,
            onFailure: function() {
                throw new Error('사용자키를 가져오지 못했습니다.');
            }
        }, events);
        new Ajax.Request('/' + this.name + '/setting/basic', {
            method:'get',
            onFailure: events.onFailure,
            onSuccess: (function(transport) {
                try {
                    var pattern = /id="user_key">\s*([^\s]+)/;
                    var response = transport.responseText;
                    this.key = response.match(pattern)[1];
                } catch (e) {
                    return failure();
                }
                return events.onSuccess(this.key);
            }).bind(this)
        });
    },

    /*
        Function: showProfile
            프로필 상자를 엽니다.
    */
    showProfile: function(element, page) {
        page = page || 'basic';
        var pages = 'band basic blog friend memo name_card sms token';
        if ($w(pages).indexOf(page) == -1)
            throw new Error('page에는 다음 값만 올 수 있습니다: ' + pages);
        Profile['show_' + page](element, this.name);
    }
});

me2day.me = new me2day.User(etc.mid);

} else {
    var me2day = window.me2day;
}

