! function() {
    var t, o, e, n = chrome['runtime'].getManifest().version,
        i = "chrome",
        a = n,
        r = !0,
        c = 2e3,
        s = 6e5,
        l = ["rutracker.org", "*.rutracker.org", "*.rutracker.cc", "*.t-ru.org"],
        p = {
            mode: "pac_script",
            pacScript: {
                data: createPac({
                    protocol: "https",
                    host: "rtk1.pass.xzvpn.net",
                    port: 443
                }, l)
            }
        };

    function u(o) {
        r ? chrome['proxy'].settings.get({
            incognito: !1
        }, function(e) {
            var r = isControllableProxySettings(e);
            (o || r !== t) && (t = r, f(), _(), t && XHR({
                url: "https://rtk.rmcontrol.net",
                timeout: 2e3,
                data: {
                    api_version: 2,
                    browser_name: i,
                    plugin_version: n
                },
                onSuccess: function(t) {
                    !t.error && t.protocol && t.host && t.port && (p.pacScript.data = createPac(t, l), a = t.actual_plugin_version, f(), _())
                },
                onFail: function() {
                    console.log("Failed to load remote configuration")
                },
                onComplete: function() {
                    applyProxy(p, l)
                }
            }))
        }) : (_(), clearProxy())
    }

    function d() {
        XHR({
            method: "GET",
            url: "http://nrtk.rmcontrol.net/api/v1/",
            timeout: 2e3,
            onSuccess: function(t) {
                t && Array.isArray(t) && actualizeNotifications(t), f(), _(), console.log("Notifications have been updated")
            },
            onFail: function() {
                console.log("Failed to load notifications")
            }
        })
    }

    function _() {
        r ? hasActualNotifications() ? setProblemIcon() : t ? isAvailableUpdate(n, a) ? setProblemIcon() : setDefaultIcon() : setProblemIcon() : setInactiveIcon()
    }

    function f() {
        var t = chrome['extension'].getViews({
            type: "popup"
        })[0];
        t && (t.validateView(r), console.log("Popup has been validated"))
    }

    function m() {
        o = setInterval(u, c), e = setInterval(d, s)
    }
    chrome['runtime'].onMessage.addListener(function(i, c, s) {
        "is_enabled_proxy" === i.get && s({
            is_enabled_proxy: r
        }), "current_state" === i.get && s({
            is_enabled_proxy: r,
            is_available_update: isAvailableUpdate(n, a),
            is_controllable_settings: t,
            notifications: Options.getOption("notifications").actual.map(function(t) {
                return t.published_at = formatDate(t.published_at), t
            })
        }), "is_enabled_proxy" === i.set && i.value !== r && (r = i.value, Options.setOption("is_enabled_proxy", r), clearInterval(o), clearInterval(e), u(!0), r && (d(), m())), "mark_notification_as_shown" === i.action && (markNotificationAsShown(i.id), f(), _())
    }), initOptionsIfNecessary(), r = Options.getOption("is_enabled_proxy"), u(), r && (d(), m())
}();