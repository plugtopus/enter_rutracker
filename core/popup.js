function validateView(e) {
    var n = document.getElementById("not-controllable"),
        t = document.getElementById("inform"),
        l = document.getElementById("update-available");
    if (!e) return t.style.display = "inline-block", n.style.display = "none", void(l.style.display = "none");
    t.style.display = "none", chrome['runtime'].sendMessage({
        get: "current_state"
    }, function(e) {
        l.style.display = e.is_available_update ? "block" : "none", n.style.display = e.is_controllable_settings ? "none" : "block", updateNotifications(e.notifications)
    })
}! function(e) {
    e(document).ready(function() {
        e("input").lc_switch();
        var n = document.querySelector("#control .label .status");
        e("body").delegate(".lcs_check", "lcs-on", function() {
            chrome['runtime'].sendMessage({
                set: "is_enabled_proxy",
                value: !0
            }), n.innerHTML = "Плагин включен", n.style.color = "green", validateView(!0)
        }), e("body").delegate(".lcs_check", "lcs-off", function() {
            chrome['runtime'].sendMessage({
                set: "is_enabled_proxy",
                value: !1
            }), n.innerHTML = "Плагин выключен", n.style.color = "grey", validateView(!1)
        })
    }), chrome['runtime'].sendMessage({
        get: "is_enabled_proxy"
    }, function(n) {
        n.is_enabled_proxy ? e(".lcs_check").lcs_on() : e(".lcs_check").lcs_off()
    })
}(jQuery);