/**
 * login module
 */



(function () {

    var _auth = {
        apiPath: location.origin + '/fmi/rest/api/'
    }

    var FMLogin = function (credentials) {

        var authType = credentials ? 'userpass' : 'oauth'

        var layout = localStorage.getItem('layout');
        var database = localStorage.getItem('database');
        var connectionUrl = _auth.apiPath + "auth/" + encodeURIComponent(database);
        if (authType === 'oauth') {
            var headers = { "X-FM-Data-Login-Type": "oauth" };
            var params = {
                "layout": layout,
                "oAuthRequestId": _auth.oAuthRequestId,
                "oAuthIdentifier": _auth.oAuthIdentifier
            };

        } else {//Regular login with FM account
            var params = {
                "layout": layout,
                "user": credentials.user,
                "password": credentials.password
            };
        }
        var xhr = $.ajax({
            url: connectionUrl,
            dataType: 'json',
            contentType: "application/json",
            headers: headers,
            type: "POST",
            data: JSON.stringify(params),
            success: function (res, textStatus, xhr) {
                if (res.errorCode === "0") {
                    var d = {
                        authType: authType,
                        token: res.token,
                        layout: layout,
                        database: database
                    }
                    if (authType === 'oauth') {
                        d.oAuthRequestId = _auth.oAuthRequestId,
                            d.oAuthIdentifier = _auth.oAuthIdentifier
                    } else {
                        d.user = credentials.user;
                        d.password = credentials.password
                    }
                    var callBack = localStorage.getItem('callBack') + util.queryStringify(d)
                    localStorage.removeItem('callBack')
                    localStorage.removeItem('database')
                    localStorage.removeItem('layout')
                    location.replace(callBack)
                } else {
                    util.showErrorDialog(lang.Error_Login_Failed, xhr.responseText)
                    util.enableBtnOnInput()
                  
                }
            },
            error: function (xhr, textStatus, thrownError) {
                $('#loader').hide();
                util.showErrorDialog(lang.Error_Login_Failed, util.makeErrorMessage(xhr, textStatus, thrownError))
                util.enableBtnOnInput()
            }
        });
    }

    var Oauth = {
        providers: [],  //contains oauth providers meta data which will be populated with getProvidersInfo()
        getProvidersInfo: function () {
            var xhr = $.ajax({
                context: this,
                dataType: 'json',
                url: location.origin + '/fmws/oauthproviderinfo',
                success: function (res, textStatus, xhr) {
                    if (res.data) {
                        this.providers = res.data.Provider;
                        this.providers.sort(function SortByName(a, b) {//sort on provider name to make them rendered in consistent order.
                            var aName = a.Name.toLowerCase();
                            var bName = b.Name.toLowerCase();
                            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
                        });
                        this.renderBtns();
                    }
                },
                error: function (xhr, textStatus, thrownError) {
                    util.showErrorDialog(lang.Error_OAuth_Fail_At_GetProvidersInfo + util.makeErrorMessage(xhr, textStatus, thrownError));
                }
            })
        },

        renderBtns: function () {
            var providersList = $('#oauth-container');

            if (this.providers.length > 0) {
                this.providers.forEach(function (provider) {
                    var $btn = $("<button>", { "data-provider-name": provider.Name, "class": "oauth-btn", "text": provider.Name });
                    $btn.click(function () {
                        Oauth.getOauthUrl($(this).data("provider-name"));
                    });

                    providersList.append($btn);
                })

                util.getCookie("oAuthIdentifier") ? providersList.show() : providersList.slideDown();
            }
        },

        getOauthUrl: function (provider) {
            $('#loader').show();
            var apiUrl = '/oauth/getoauthurl?trackingID=&provider=' + provider + '&address=' + location.hostname + '&X-FMS-OAuth-AuthType=2';
            var headers = {
                "X-FMS-Application-Type": 9,
                "X-FMS-Application-Version": 15,
                "X-FMS-Return-URL": location.href
            }

            var xhr = $.ajax({
                context: this,
                url: location.origin + apiUrl,
                dataType: "text",
                headers: headers,
                success: function (data, textStatus, xhr) {
                    $('#loader').hide();
                    var oAuthRequestId = xhr.getResponseHeader('X-FMS-Request-ID');
                    var oAuthUrl = data.trim();
                    if (!oAuthUrl) {
                        util.showErrorDialog(lang.Error_OAuth_Fail_At_GetOauthUrl + lang.Error_OAuth_Empty_Url);
                    }
                    var d = new Date();
                    d.setTime(d.getTime() + (3 * 60 * 1000));
                    document.cookie = "oAuthRequestId=" + oAuthRequestId + "; expires=" + d.toUTCString();
                    location.href = oAuthUrl;
                },
                error: function (xhr, textStatus, thrownError) {
                    $('#loader').hide();

                    util.showErrorDialog(lang.Error_OAuth_Fail_At_GetOauthUrl + util.makeErrorMessage(xhr, textStatus, thrownError))
                }
            })

        }
    };

    var handleSubmit = function () {
        $('#submitButton').prop('disabled', true);
        var credentials = {
            user: $('#user').val().trim(),
            password: $('#password').val().trim()
        }
        FMLogin(credentials);
    }


    $(window).load(function () {

        $("#dialog").dialog({
            autoOpen: false,
            modal :true,
            width: 500,
            position : {
                at : 'top+100'
            },
            show: {
                effect: "drop",
                direction : 'up',
                duration: 500
            },
            hide: {
                effect: "drop",
                direction : 'up',
                duration: 500
            }
        });


        util.applyI18nString();
        var query = util.queryString();
        if (query.identifier) {
            $('#loader').show();

            // coming back from provider
            Oauth.getProvidersInfo();
            //store the credentials on _auth
            _auth.oAuthRequestId = util.getCookie("oAuthRequestId");
            _auth.oAuthIdentifier = query.identifier
            _auth.token = ""
            util.removeCookie("oAuthRequestId");
            return FMLogin();

        } else {   // Initial Load

            if (query.callBack && query.database && query.layout) {
                $('#loginForm').show();
                $('#submitButton').on('click', handleSubmit)

                localStorage.setItem('callBack', query.callBack);
                localStorage.setItem('database', query.database);
                localStorage.setItem('layout', query.layout);
                Oauth.getProvidersInfo();
            } else {
                var msg = "<h3>Can't proceed. Missing Parameters</h3>"
                msg = msg + "The following query parmeters are missing: <ul> "
                msg = msg + (query.callBack ? "" : '<li>callBack</li>')
                msg = msg + (query.database ? "" : '<li>database</li>')
                msg = msg + (query.layout ? "" : '<li>layout</li>')
                msg = msg + "</ul>"
        
                $('#missingParams').html(msg)
                $('#missingParams').show();
            }

        }
    });
})()
