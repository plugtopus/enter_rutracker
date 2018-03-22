var Options = {
    isSetOptions: function() {
        return void 0 !== localStorage.options
    },
    initOptions: function() {
        localStorage.options = JSON.stringify({})
    },
    getOption: function(t) {
        return JSON.parse(localStorage.options)[t]
    },
    setOption: function(t, o) {
        var e = JSON.parse(localStorage.options);
        e[t] = o, localStorage.options = JSON.stringify(e)
    }
};

function initOptionsIfNecessary() {
    Options.isSetOptions() || Options.initOptions(), void 0 === Options.getOption("is_enabled_proxy") && Options.setOption("is_enabled_proxy", !0), void 0 === Options.getOption("notifications") && Options.setOption("notifications", {
        actual: [],
        shown: []
    })
}

function XHR(t) {
    var o = new XMLHttpRequest,
        e = function(t, o) {
            var n = [];
            for (var i in t)
                if (t.hasOwnProperty(i)) {
                    var r = o ? o + "[" + i + "]" : i,
                        a = t[i];
                    n.push("object" == typeof a ? e(a, r) : encodeURIComponent(r) + "=" + encodeURIComponent(a))
                }
            return n.filter(function(t) {
                return !!t
            }).join("&")
        },
        n = function() {
            t.onFail && t.onFail(o), t.onComplete && t.onComplete()
        };
    o.addEventListener("load", function() {
        if (t.onSuccess) {
            var e;
            try {
                e = JSON.parse(o.responseText)
            } catch (t) {
                e = {
                    response: o.responseText,
                    error: t
                }
            }
            t.onSuccess(e)
        }
        t.onComplete && t.onComplete()
    }, !1), o.addEventListener("error", n, !1), o.addEventListener("abort", n, !1), o.addEventListener("timeout", n, !1), t.method = t.method || "POST", o.open(t.method, t.url, !0), "POST" === t.method && (o.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), t.data = e(t.data)), o.timeout = t.timeout, o.send(t.data)
}

function createPac(t, o) {
    return "function FindProxyForURL(url, host) {if ( " + o.map(function(t) {
        return "shExpMatch(host, '" + t + "')"
    }).join(" || ") + " ) {return '" + (("http" === t.protocol ? "PROXY" : t.protocol.toUpperCase()) + " " + t.host + ":" + parseInt(t.port, 10)) + "';}return 'DIRECT';}"
}

function isControllableProxySettings(t) {
    return t && t.hasOwnProperty("levelOfControl") && "controllable_by_this_extension" === t.levelOfControl || "controlled_by_this_extension" === t.levelOfControl
}

function clearProxy() {
    chrome['proxy'].settings.clear({
        scope: "regular"
    }), console.log("Proxy has been cleared")
}

function applyProxy(t, o) {
    chrome['proxy'].settings.set({
        value: t,
        scope: "regular"
    }, function() {
        console.log("Proxy has been set"), chrome['browsingData'].removeCache({
            since: getOneDayAgoTimestamp()
        }, function() {
            console.log("Cache has been cleared"), chrome['tabs'].query({
                currentWindow: !0,
                active: !0
            }, function(t) {
                t.forEach(function(t) {
                    t.url && isProxyHost(t.url, o) && (chrome['tabs'].reload(t.id), console.log("Active tab has been reloaded"))
                })
            })
        })
    })
}

function actualizeNotifications(t) {
    var o = !1,
        e = Options.getOption("notifications"),
        n = e.actual.map(function(t) {
            return t.id
        }),
        i = e.shown.map(function(t) {
            return t.id
        }),
        r = t.map(function(t) {
            return t.id
        });
    e.actual.forEach(function(t, n) {
        -1 === r.indexOf(t.id) && (e.actual.splice(n, 1), o = !0)
    }), t.forEach(function(t) {
        -1 === n.indexOf(t.id) && -1 === i.indexOf(t.id) && (e.actual.push({
            id: t.id,
            message: t.message,
            published_at: 1e3 * t.date,
            shown_at: null
        }), o = !0)
    }), o && e.actual.sort(function(t, o) {
        return o.published_at - t.published_at
    }), Options.setOption("notifications", e)
}

function markNotificationAsShown(t) {
    var o = Options.getOption("notifications");
    o.actual.forEach(function(e, n) {
        e.id === t && (-1 === o.shown.map(function(t) {
            return t.id
        }).indexOf(e.id) && (e.shown_at = Date.now(), o.shown.push(e)), o.actual.splice(n, 1))
    }), Options.setOption("notifications", o)
}

function isAvailableUpdate(t, o) {
    return "string" == typeof t && "string" == typeof o && t && o && t < o
}

function hasActualNotifications() {
    return Options.getOption("notifications").actual.length > 0
}

function setProblemIcon() {
    chrome.browserAction.setBadgeText({
        text: "!"
    }), chrome.browserAction.setBadgeBackgroundColor({
        color: "orange"
    }), chrome.browserAction.setIcon({
        path: {
            19: "img/19.png",
            38: "img/38.png"
        }
    })
}

function setInactiveIcon() {
    chrome.browserAction.setBadgeText({
        text: ""
    }), chrome.browserAction.setIcon({
        path: {
            19: "img/inactive19.png",
            38: "img/inactive38.png"
        }
    })
}

function setDefaultIcon() {
    chrome.browserAction.setBadgeText({
        text: ""
    }), chrome.browserAction.setIcon({
        path: {
            19: "img/19.png",
            38: "img/38.png"
        }
    })
}

function getOneDayAgoTimestamp() {
    return (new Date).getTime() - 864e5
}

function getHost(t) {
    return !(!t || !t.match(/^https?:\/\//)) && t.replace(/^https?:\/\//, "").split(/[/?#]/)[0]
}

function isProxyHost(t, o) {
    var e = getHost(t);
    return !!e && e.match(buildRegex(o))
}

function buildRegex(t) {
    var o = [];
    return t.forEach(function(t) {
        o.push(t.replace(/^\*\./, "\\w+\\."))
    }), new RegExp("^(?:" + o.join("|") + ")$")
}

function formatDate(t) {
    return new Date(t).toLocaleString("ru-RU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    })
}