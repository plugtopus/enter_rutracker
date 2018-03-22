! function() {
    var e, n = "dostup-rutracker-notifications",
        t = document.createElement("div");

    function i() {
        return [].slice.call(document.querySelectorAll("#" + n + " .notification") || [])
    }
    t.id = n, document.body.appendChild(t), e = setInterval(function() {
        try {
            chrome['runtime'].sendMessage(null, {
                get: "current_state"
            }, null, function(e) {
                var n, a, c, d;
                e.is_enabled_proxy && (n = e.notifications, a = i(), c = a.map(function(e) {
                    return e.dataset.id
                }), d = n.map(function(e) {
                    return e.id
                }), a.forEach(function(e) {
                    -1 === d.indexOf(e.dataset.id) && e.parentNode.removeChild(e)
                }), n.forEach(function(e) {
                    var n, i, a, d, o; - 1 === c.indexOf(e.id) && t.insertBefore((n = e, (a = document.createElement("div")).className = "date", a.innerHTML = n.published_at, (d = document.createElement("div")).className = "message", d.innerHTML = n.message, (o = document.createElement("div")).className = "deactivate", o.innerHTML = "Скрыть", o.onclick = function() {
                        chrome['runtime'].sendMessage(null, {
                            action: "mark_notification_as_shown",
                            id: n.id
                        }, null, function(e) {
                            i.parentNode.removeChild(i)
                        })
                    }, (i = document.createElement("div")).className = "notification", i.dataset.id = n.id, i.appendChild(a), i.appendChild(d), i.appendChild(o), i), t.firstChild)
                }))
            })
        } catch (n) {
            clearInterval(e), i().forEach(function(e) {
                e.parentNode.removeChild(e)
            })
        }
    }, 1e3)
}();