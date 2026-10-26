/* Waitlist form. Replace FORMSPREE_ENDPOINT before this can send.
   Persona chips first; fields branch by tag. */
(function () {
  var form = document.getElementById("leadForm");
  var q = new URLSearchParams(location.search);

  var BRANCH = {
    curious: {
      show: ["name", "email", "phone", "notes"],
      require: ["name", "email"],
      stock: "No",
      hideStock: true
    },
    affiliate: {
      show: ["name", "email", "phone", "platforms", "platforms-other", "audience", "categories", "categories-other", "notes"],
      require: ["name", "email", "phone", "platforms", "audience", "categories"],
      stock: "No",
      hideStock: true
    },
    brand: {
      show: ["name", "email", "phone", "location", "categories", "categories-other", "notes"],
      require: ["name", "email", "phone", "location", "categories"],
      stock: "No",
      hideStock: true
    },
    host: {
      show: ["name", "email", "phone", "location", "platforms", "platforms-other", "categories", "categories-other", "audience", "stock", "notes"],
      require: ["name", "email", "phone", "location", "platforms", "categories", "stock"],
      stock: "Yes",
      hideStock: false
    }
  };

  var HELPERS = {
    curious: {
      email: "Waitlist updates go here.",
      phone: "Optional."
    },
    affiliate: {
      email: "Updates and creator notes go here.",
      phone: "Same number you’d answer for a launch message.",
      platforms: "Tick all that apply.",
      audience: "Rough is fine.",
      categories: "Tick all that apply."
    },
    brand: {
      location: "Where you’re based.",
      categories: "Tick all that apply."
    },
    host: {
      phone: "We’ll use this if a lot is ready.",
      location: "So we know where a lot would need to go.",
      platforms: "Tick all that apply.",
      categories: "Tick all that apply.",
      audience: "Optional. Hosts without a following: skip or pick “No public audience yet.”",
      stock: "Default Yes. A pack is a lot with photos and counts. You look, then take it or leave it."
    }
  };

  var LABELS = {
    curious: { platforms: "", categories: "" },
    affiliate: {
      platforms: "Where do you create today?",
      categories: "What would you promote?"
    },
    brand: {
      categories: "What do you make or supply?"
    },
    host: {
      platforms: "Where do you sell today?",
      categories: "What would you sell?",
      audience: "Audience or sales size"
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function setHidden(id, value) {
    var el = $(id);
    if (el) el.value = value || "";
  }

  function setSelect(id, value) {
    var el = $(id);
    if (!el || value == null || value === "") return;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].value === value) {
        el.value = value;
        return;
      }
    }
  }

  function setHelper(key, text) {
    var el = $("help-" + key);
    if (!el) return;
    if (text) {
      el.textContent = text;
      el.hidden = false;
    } else {
      el.textContent = "";
      el.hidden = true;
    }
  }

  function setLegend(key, text) {
    var el = $("legend-" + key);
    if (el && text) el.textContent = text;
  }

  function setLabel(key, text) {
    var el = $("label-" + key);
    if (el && text) {
      var opt = el.querySelector(".opt");
      var optHtml = opt ? " " + opt.outerHTML : "";
      el.innerHTML = text + optHtml;
    }
  }

  function fieldWrap(key) {
    return document.querySelector('[data-branch="' + key + '"]');
  }

  function setRequired(el, on) {
    if (!el) return;
    if (on) el.setAttribute("required", "required");
    else el.removeAttribute("required");
  }

  function clearChecks(name) {
    if (!form) return;
    Array.prototype.forEach.call(form.querySelectorAll('input[name="' + name + '"]'), function (c) {
      c.checked = false;
    });
  }

  function applyBranch(tag) {
    var cfg = BRANCH[tag];
    var details = $("branch-fields");
    var chipHelper = $("chip-helper");
    var chips = document.querySelectorAll(".chip[data-persona]");
    Array.prototype.forEach.call(chips, function (c) {
      var on = c.getAttribute("data-persona") === tag;
      c.setAttribute("aria-pressed", on ? "true" : "false");
      c.classList.toggle("is-on", on);
    });

    setHidden("f-tag", tag || "");

    if (!cfg) {
      if (details) details.hidden = true;
      if (chipHelper) chipHelper.hidden = false;
      return;
    }

    if (details) details.hidden = false;
    if (chipHelper) chipHelper.hidden = false;

    ["name", "email", "phone", "location", "platforms", "platforms-other", "audience", "categories", "categories-other", "stock", "notes"].forEach(function (key) {
      var wrap = fieldWrap(key);
      if (!wrap) return;
      var show = cfg.show.indexOf(key) !== -1;
      wrap.hidden = !show;
      if (!show) {
        var inputs = wrap.querySelectorAll("input, select, textarea");
        Array.prototype.forEach.call(inputs, function (inp) {
          if (inp.type === "checkbox" || inp.type === "radio") {
            inp.checked = false;
            inp.disabled = true;
            return;
          }
          if (inp.name === "wants_stock" || inp.id === "f-stock-hidden") return;
          setRequired(inp, false);
          if (inp.tagName === "SELECT" || inp.tagName === "TEXTAREA" || inp.type === "text" || inp.type === "tel" || inp.type === "email") {
            /* keep typed values if user switches persona; only clear location etc optional */
          }
        });
      } else {
        var inputsOn = wrap.querySelectorAll("input, select, textarea");
        Array.prototype.forEach.call(inputsOn, function (inp) {
          if (inp.type === "checkbox" || inp.type === "radio") inp.disabled = false;
        });
      }
    });

    // Required flags for visible fields
    setRequired($("f-name"), cfg.require.indexOf("name") !== -1);
    setRequired($("f-email"), cfg.require.indexOf("email") !== -1);
    setRequired($("f-phone"), cfg.require.indexOf("phone") !== -1);
    setRequired($("f-loc"), cfg.require.indexOf("location") !== -1);
    setRequired($("f-band"), cfg.require.indexOf("audience") !== -1);
    setRequired($("f-stock"), cfg.require.indexOf("stock") !== -1 && !cfg.hideStock);

    // Helpers + legends
    var h = HELPERS[tag] || {};
    setHelper("email", h.email || "");
    setHelper("phone", h.phone || "");
    setHelper("location", h.location || "");
    setHelper("platforms", h.platforms || "");
    setHelper("audience", h.audience || "");
    setHelper("categories", h.categories || "");
    setHelper("stock", h.stock || "");

    var L = LABELS[tag] || {};
    if (L.platforms) setLegend("platforms", L.platforms);
    if (L.categories) setLegend("categories", L.categories);
    if (L.audience) setLabel("audience", L.audience);

    // Stock: host shows UI; others force hidden No
    var stockWrap = fieldWrap("stock");
    var stockSelect = $("f-stock");
    var stockHidden = $("f-stock-hidden");
    if (cfg.hideStock) {
      if (stockWrap) stockWrap.hidden = true;
      if (stockSelect) {
        stockSelect.removeAttribute("required");
        stockSelect.removeAttribute("name");
        stockSelect.value = "";
      }
      if (stockHidden) {
        stockHidden.name = "wants_stock";
        stockHidden.value = "No";
      }
    } else {
      if (stockHidden) {
        stockHidden.removeAttribute("name");
        stockHidden.value = "";
      }
      if (stockSelect) {
        stockSelect.setAttribute("name", "wants_stock");
        stockSelect.setAttribute("required", "required");
        if (!stockSelect.value) stockSelect.value = cfg.stock || "Yes";
      }
      if (stockWrap) stockWrap.hidden = false;
      var packGloss = $("pack-gloss");
      if (packGloss) packGloss.hidden = false;
    }

    // Audience optional for host: remove required already done; show opt mark
    var audLabel = $("label-audience");
    if (audLabel) {
      var opt = audLabel.querySelector(".opt");
      if (tag === "host") {
        if (!opt) {
          audLabel.insertAdjacentHTML("beforeend", ' <span class="opt">(optional)</span>');
        }
      } else if (opt) {
        opt.remove();
      }
    }

    syncOtherCategory();
    syncOtherPlatform();
  }

  function selectPersona(tag, stockOverride) {
    if (!BRANCH[tag]) return;
    applyBranch(tag);
    if (tag === "host") {
      var stockSelect = $("f-stock");
      if (stockSelect) {
        var want = stockOverride || "Yes";
        if (want === "Yes" || want === "Maybe" || want === "No") stockSelect.value = want;
        else stockSelect.value = "Yes";
      }
    }
  }

  function syncOtherToggle(checkboxName, value, branchKey, inputId) {
    var other = form && form.querySelector('input[name="' + checkboxName + '"][value="' + value + '"]');
    var wrap = fieldWrap(branchKey);
    var input = $(inputId);
    var parentOk = !!(fieldWrap(checkboxName === "categories" ? "categories" : "platforms") && !fieldWrap(checkboxName === "categories" ? "categories" : "platforms").hidden);
    var show = !!(other && other.checked && wrap && parentOk);
    if (wrap) wrap.hidden = !show;
    if (input) {
      setRequired(input, show);
      if (!show) input.value = "";
    }
  }

  function syncOtherCategory() {
    syncOtherToggle("categories", "Other", "categories-other", "f-categories-other");
  }

  function syncOtherPlatform() {
    syncOtherToggle("platform", "Other", "platforms-other", "f-platforms-other");
  }

  if (form) {
    ["gclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(function (k) {
      var v = q.get(k) || "";
      try {
        if (k === "gclid") {
          if (v) sessionStorage.setItem("sl_gclid", v);
          else v = sessionStorage.getItem("sl_gclid") || "";
        }
      } catch (e) {}
      setHidden("h-" + k, v);
    });
    setHidden("h-landing_page", location.href.slice(0, 500));
    setHidden("h-referrer", (document.referrer || "").slice(0, 500));

    var tagQ = (q.get("tag") || "").toLowerCase();
    var stockQ = q.get("wants_stock") || "";
    if (BRANCH[tagQ]) {
      selectPersona(tagQ, stockQ);
    } else {
      applyBranch("");
    }

    Array.prototype.forEach.call(document.querySelectorAll(".chip[data-persona]"), function (chip) {
      chip.addEventListener("click", function () {
        selectPersona(chip.getAttribute("data-persona"));
        var details = $("branch-fields");
        if (details && details.scrollIntoView) {
          try { details.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {}
        }
        var nm = $("f-name");
        if (nm) setTimeout(function () { try { nm.focus({ preventScroll: true }); } catch (e) {} }, 200);
      });
    });

    Array.prototype.forEach.call(form.querySelectorAll('input[name="categories"]'), function (c) {
      c.addEventListener("change", syncOtherCategory);
    });
    Array.prototype.forEach.call(form.querySelectorAll('input[name="platform"]'), function (c) {
      c.addEventListener("change", syncOtherPlatform);
    });
  }

  // Who-it's-for tiles: if still buttons with data-tag, scroll + preselect
  Array.prototype.forEach.call(document.querySelectorAll("[data-tag]"), function (t) {
    if (t.tagName === "A") return;
    t.addEventListener("click", function () {
      var tag = t.getAttribute("data-tag") || "";
      var stock = t.getAttribute("data-stock");
      selectPersona(tag, stock || undefined);
      var box = $("waitlist");
      if (box && box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "start" });
      try {
        var url = new URL(location.href);
        url.searchParams.set("tag", tag);
        if (stock) url.searchParams.set("wants_stock", stock);
        else url.searchParams.delete("wants_stock");
        history.replaceState(null, "", url.pathname + url.search + "#waitlist");
      } catch (e) {}
      var nm = $("f-name");
      if (nm) setTimeout(function () { try { nm.focus({ preventScroll: true }); } catch (e) {} }, 400);
    });
  });

  var sticky = $("sticky");
  var anchor = $("waitlist");
  if (sticky && anchor && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      sticky.classList.toggle("on", !entries[0].isIntersecting);
    }).observe(anchor);
  } else if (sticky && !anchor) {
    sticky.classList.add("on");
  }

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearFail();
    var tag = ($("f-tag") && $("f-tag").value) || "";
    var cfg = BRANCH[tag];
    if (!cfg) {
      showFail("Pick what you are first.", true);
      return;
    }

    // Ensure hidden stock for non-host
    if (cfg.hideStock) {
      var stockHidden = $("f-stock-hidden");
      if (stockHidden) {
        stockHidden.name = "wants_stock";
        stockHidden.value = "No";
      }
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      showFail("Check the highlighted fields.", true);
      return;
    }

    var problems = [];
    if (cfg.require.indexOf("platforms") !== -1 && !checked("platform")) {
      problems.push("Pick at least one place you sell or create today.");
    }
    if (cfg.require.indexOf("categories") !== -1 && !checked("categories")) {
      problems.push("Pick at least one category.");
    }
    var other = form.querySelector('input[name="categories"][value="Other"]');
    var otherText = $("f-categories-other");
    if (other && other.checked && otherText && !otherText.value.trim() && cfg.show.indexOf("categories") !== -1) {
      problems.push("Tell us the other category.");
      otherText.focus();
    }
    var platOther = form.querySelector('input[name="platform"][value="Other"]');
    var platText = $("f-platforms-other");
    if (platOther && platOther.checked && platText && !platText.value.trim() && cfg.show.indexOf("platforms") !== -1) {
      problems.push("Tell us the other platform.");
      if (!(other && other.checked && otherText && !otherText.value.trim())) platText.focus();
    }
    if (problems.length) {
      showFail(problems.join(" "), true);
      return;
    }

    var action = form.getAttribute("action") || "";
    if (action.indexOf("FORMSPREE_ENDPOINT") !== -1) {
      showFail("This form is not sending yet. The action is still the FORMSPREE_ENDPOINT placeholder. Connect Formspree, then try again.", true);
      return;
    }

    var stamp = $("h-submitted_at");
    if (stamp) stamp.value = sydneyNow();
    var btn = $("submitBtn");
    if (btn) btn.disabled = true;
    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    }).then(function (r) {
      if (!r.ok) throw new Error("bad");
      var box = $("formbox");
      box.innerHTML = '<p class="thanks" tabindex="-1" role="status">You’re on the Seller Lots waitlist for TikTok Shop Australia. We’ll email this address with updates. We only talk stock if you said you want it.</p>';
      var t = box.querySelector(".thanks");
      if (t) t.focus();
    }).catch(function () {
      if (btn) btn.disabled = false;
      showFail("That didn’t go through. Try again in a minute.", true);
    });
  });

  function checked(name) {
    return form.querySelectorAll('input[name="' + name + '"]:checked').length > 0;
  }
  function clearFail() {
    var m = $("failMsg");
    if (m) m.remove();
    var top = $("failMsgTop");
    if (top) top.remove();
  }
  function showFail(text, alsoTop) {
    var m = $("failMsg");
    if (!m) {
      m = document.createElement("p");
      m.id = "failMsg";
      m.className = "fail";
      m.setAttribute("role", "alert");
      form.appendChild(m);
    }
    m.textContent = text;
    if (alsoTop) {
      var top = $("failMsgTop");
      if (!top) {
        top = document.createElement("p");
        top.id = "failMsgTop";
        top.className = "fail fail-top";
        top.setAttribute("role", "alert");
        var details = $("branch-fields");
        var insertAt = details || form;
        insertAt.insertBefore(top, insertAt.firstChild);
      }
      top.textContent = text;
      if (top.scrollIntoView) top.scrollIntoView({ block: "nearest" });
    } else if (m.scrollIntoView) {
      m.scrollIntoView({ block: "nearest" });
    }
  }
  function sydneyNow() {
    var parts = new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Sydney",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    var g = {};
    parts.forEach(function (p) { if (p.type !== "literal") g[p.type] = p.value; });
    return g.year + "-" + g.month + "-" + g.day + " " + g.hour + ":" + g.minute + ":" + g.second + " Australia/Sydney";
  }
})();
