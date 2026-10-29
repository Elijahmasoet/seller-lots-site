/* Snippet A: mobile sticky follows the first in-page Get ready. Never on /waitlist/. */
(function(){
  var path = location.pathname || "";
  if (/\/waitlist\/?$/.test(path) || /\/waitlist\/index\.html$/.test(path)) return;
  var s = document.getElementById("sticky");
  var first = document.querySelector("[data-first-cta]");
  if (!s || !first || !("IntersectionObserver" in window)) return;
  var link = s.querySelector("a");
  new IntersectionObserver(function(entries){
    var e = entries[0];
    var past = !e.isIntersecting && e.boundingClientRect.top < 0;
    s.classList.toggle("on", past);
    document.body.classList.toggle("sticky-on", past);
    s.setAttribute("aria-hidden", past ? "false" : "true");
    if (link) link.tabIndex = past ? 0 : -1;
  }).observe(first);
})();

(function(){
  var BRANCH = {
    curious: {
      show: ["name","email","phone","notes-short"],
      require: ["name","email"],
      hasSellStep: false,
      label: "Just Curious"
    },
    affiliate: {
      show: ["name","email","phone","platforms","platforms-other","tiktok-row","tiktok","audience","categories","categories-other","notes"],
      require: ["name","email","phone","platforms","categories","tiktok","audience"],
      hasSellStep: true,
      label: "Affiliate / Creator"
    },
    brand: {
      show: ["name","email","phone","location","categories","categories-other","notes-short"],
      require: ["name","email","phone","location","categories"],
      hasSellStep: false,
      label: "Australian Brand"
    },
    host: {
      show: ["name","email","phone","location","platforms","platforms-other","tiktok-row","tiktok","audience","categories","categories-other","notes"],
      require: ["name","email","phone","location","platforms","categories","tiktok"],
      hasSellStep: true,
      label: "Creator Buying Stock"
    }
  };
  var HELPERS = {
    curious: { email: "Waitlist updates go here.", phone: "Optional." },
    affiliate: {
      email: "Updates and creator notes go here.",
      phone: "Same number you’d answer for a launch message.",
      platforms: "Tick all that apply.",
      categories: "Tick all that apply.",
      tiktok: "Your TikTok @ — we’ll use this to check fit.",
      audience: "Rough is fine."
    },
    brand: { location: "Where you’re based.", categories: "Tick all that apply." },
    host: {
      phone: "We’ll use this if a lot is ready.",
      location: "So we know where a lot would need to go.",
      platforms: "Tick all that apply.",
      categories: "Tick all that apply.",
      tiktok: "Your TikTok @ — we’ll use this to check fit.",
      audience: "Optional if you’re just starting."
    }
  };
  var LABELS = {
    curious: {},
    affiliate: {
      platforms: "Where do you sell or create content today?",
      categories: "What would you promote?"
    },
    brand: { categories: "What do you make or supply?" },
    host: {
      platforms: "Where do you sell or create content today?",
      categories: "What would you sell?"
    }
  };
  var TITLES = {
    1: { title: "Who You Are", sub: "Host, affiliate, brand, or curious. Tap one to start." },
    2: { title: "How we reach you", sub: "Name and contact — then the sell details." },
    3: { title: "How you sell", sub: "Platforms, TikTok, and what you’d sell." }
  };

  /* Home (and other pages) may load this file; only run on waitlist wizard. */
  if (!document.getElementById("leadForm") || !document.getElementById("step-1")) return;

  var params = new URLSearchParams(location.search);
  var roleMap = {stock:"host", creator:"affiliate", brand:"brand", curious:"curious", host:"host", affiliate:"affiliate"};
  var chips = document.querySelectorAll(".chip");
  var tagEl = document.getElementById("f-tag");
  var roleEl = document.getElementById("f-role");
  var step = 1;
  var persona = null;

  function $(id){ return document.getElementById(id); }
  function setErrors(ul, list){
    if (!ul) return;
    ul.textContent = "";
    (list || []).forEach(function(m){
      var li = document.createElement("li");
      li.textContent = m;
      ul.appendChild(li);
    });
    ul.hidden = !list || !list.length;
  }
  function setRequired(el, on){
    if (!el) return;
    if (on) el.setAttribute("required","required");
    else el.removeAttribute("required");
  }
  function fieldWrap(key){ return document.querySelector('[data-branch="'+key+'"]'); }

  function applyBranch(tag){
    var cfg = BRANCH[tag];
    if (!cfg) return;
    ["name","email","phone","location","platforms","platforms-other","tiktok-row","tiktok","audience","categories","categories-other","notes","notes-short"].forEach(function(key){
      var wrap = fieldWrap(key);
      if (!wrap) return;
      var show = cfg.show.indexOf(key) !== -1;
      wrap.hidden = !show;
      var inputs = wrap.querySelectorAll("input, select, textarea");
      Array.prototype.forEach.call(inputs, function(inp){
        if (!show){
          if (inp.type === "checkbox" || inp.type === "radio"){ inp.checked = false; inp.disabled = true; }
          else { setRequired(inp, false); inp.disabled = true; }
        } else {
          inp.disabled = false;
        }
      });
    });
    setRequired($("f-name"), cfg.require.indexOf("name") !== -1);
    setRequired($("f-email"), cfg.require.indexOf("email") !== -1);
    setRequired($("f-phone"), cfg.require.indexOf("phone") !== -1);
    setRequired($("f-loc"), cfg.require.indexOf("location") !== -1);
    setRequired($("f-tiktok"), cfg.require.indexOf("tiktok") !== -1);
    setRequired($("f-audience"), cfg.require.indexOf("audience") !== -1);
    var optAud = $("audience-opt");
    if (optAud) optAud.hidden = cfg.require.indexOf("audience") !== -1;
    var h = HELPERS[tag] || {};
    ["email","phone","location","platforms","categories","tiktok","audience"].forEach(function(k){
      var el = $("help-"+k);
      if (!el) return;
      if (h[k]){ el.textContent = h[k]; el.hidden = false; }
      else { el.textContent = ""; el.hidden = true; }
    });
    var L = LABELS[tag] || {};
    if (L.platforms && $("legend-platforms")) $("legend-platforms").textContent = L.platforms;
    if (L.categories && $("legend-categories")) $("legend-categories").textContent = L.categories;
    syncOther("platform","platforms-other","f-platforms-other");
    syncOther("categories","categories-other","f-categories-other");

    /* Short finish (brand/curious of-2) vs long continue */
    var shortF = $("short-finish");
    var longN = $("long-next");
    if (cfg.hasSellStep){
      if (shortF) shortF.hidden = true;
      if (longN) longN.hidden = false;
      /* disable short notes name conflict — only one notes field active */
      var ns = $("f-notes-short");
      if (ns){ ns.disabled = true; ns.removeAttribute("name"); }
      var nl = $("f-notes");
      if (nl){ nl.disabled = false; nl.setAttribute("name","notes"); }
    } else {
      if (shortF) shortF.hidden = false;
      if (longN) longN.hidden = true;
      var ns2 = $("f-notes-short");
      if (ns2){ ns2.disabled = false; ns2.setAttribute("name","notes"); }
      var nl2 = $("f-notes");
      if (nl2){ nl2.disabled = true; nl2.removeAttribute("name"); }
    }
  }

  function syncOther(name, boxId, inputId){
    var box = $(boxId);
    var other = document.querySelector('input[name="'+name+'"][value="Other"]');
    var parentKey = name === "categories" ? "categories" : "platforms";
    var parent = fieldWrap(parentKey);
    var parentOk = !!(parent && !parent.hidden);
    if (!box || !other) return;
    var show = other.checked && parentOk;
    box.hidden = !show;
    if (!show){
      var inp = $(inputId);
      if (inp){ inp.value = ""; setRequired(inp, false); }
    } else {
      setRequired($(inputId), true);
    }
  }

  function updateIndicator(){
    var ind = $("step-indicator");
    ind.hidden = false;
    var d1 = $("dot-1"), d2 = $("dot-2"), d3 = $("dot-3");
    var sep1 = $("sep-1"), sep2 = $("sep-2");
    var cfg = persona ? BRANCH[persona] : null;
    var ofN = (cfg && !cfg.hasSellStep) ? 2 : 3;
    var displayStep = step;
    if (cfg && !cfg.hasSellStep && step === 2) displayStep = 2;
    if (cfg && !cfg.hasSellStep && step === 1) displayStep = 1;

    d1.className = "dot" + (step === 1 ? " on" : " done");
    if (ofN === 3){
      d2.hidden = false; if (sep2) sep2.hidden = false; d3.hidden = false;
      d2.className = "dot" + (step === 2 ? " on" : (step > 2 ? " done" : ""));
      d3.className = "dot" + (step === 3 ? " on" : "");
    } else {
      /* of 2: hide middle dot */
      d2.hidden = true; if (sep2) sep2.hidden = true; d3.hidden = false;
      d3.className = "dot" + (step >= 2 ? " on" : "");
      d3.textContent = "2";
    }
    if (ofN === 3){ d3.textContent = "3"; }

    var label = $("step-label");
    if (step === 1 && !persona){
      label.textContent = "Step 1 of 3 · under a minute";
      d2.hidden = false; if (sep2) sep2.hidden = false; d3.hidden = false;
      d2.className = "dot"; d3.className = "dot"; d3.textContent = "3";
    } else if (ofN === 2){
      label.textContent = "Step " + displayStep + " of 2" + (step === 1 ? " · under a minute" : "");
    } else {
      label.textContent = "Step " + step + " of 3" + (step === 1 ? " · under a minute" : "");
    }

    /* Sticky role · Change on steps 2–3 */
    var sticky = $("role-sticky");
    if (step >= 2 && persona){
      sticky.hidden = false;
      $("role-label").textContent = (cfg && cfg.label) || persona;
    } else {
      sticky.hidden = true;
    }

    var t = TITLES[step] || TITLES[1];
    $("card-title").textContent = t.title;
    $("card-sub").textContent = t.sub;
    if (persona === "curious" && step === 2){
      $("card-title").textContent = "Stay in the loop";
      $("card-sub").textContent = "Name and email. That’s it for curious.";
    }
    if (persona === "brand" && step === 2){
      $("card-title").textContent = "Brand details";
      $("card-sub").textContent = "Contact + what you make. Then you’re on the list.";
    }
    if ((persona === "host" || persona === "affiliate") && step === 2){
      $("card-title").textContent = "How we reach you";
      $("card-sub").textContent = "Contact first — TikTok details next.";
    }
    if ((persona === "host" || persona === "affiliate") && step === 3){
      $("card-title").textContent = "How you sell";
      $("card-sub").textContent = "Platforms, TikTok, and what you’d sell.";
    }
  }

  function showStep(n){
    step = n;
    $("step-1").hidden = n !== 1;
    $("step-2").hidden = n !== 2;
    $("step-3").hidden = n !== 3;
    updateIndicator();
    ["fail-2","fail-2-short","fail-3"].forEach(function(id){
      var el = $(id);
      if (el){ el.hidden = true; el.textContent = ""; }
    });
    var card = $("waitlist");
    if (card && n > 1 && card.scrollIntoView){
      try { card.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch(e){}
    }
  }

  function selectPersona(p, r){
    persona = p;
    chips.forEach(function(c){
      var on = c.getAttribute("data-persona") === p;
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (tagEl) tagEl.value = p;
    if (roleEl) roleEl.value = r || p;
    applyBranch(p);
    showStep(2);
  }

  function clearPersona(){
    persona = null;
    chips.forEach(function(c){ c.setAttribute("aria-pressed","false"); });
    if (tagEl) tagEl.value = "";
    if (roleEl) roleEl.value = "";
    showStep(1);
  }

  chips.forEach(function(c){
    c.addEventListener("click", function(){
      selectPersona(c.getAttribute("data-persona"), c.getAttribute("data-role"));
    });
  });

  $("role-change").addEventListener("click", clearPersona);
  $("back-2").addEventListener("click", clearPersona);
  $("back-2-short").addEventListener("click", clearPersona);
  $("back-3").addEventListener("click", function(){ showStep(2); });

  function checked(name){
    return document.querySelectorAll('input[name="'+name+'"]:checked').length > 0;
  }

  function validateContact(){
    var cfg = BRANCH[persona];
    var problems = [];
    var name = $("f-name"), email = $("f-email"), phone = $("f-phone"), loc = $("f-loc");
    if (cfg.require.indexOf("name") !== -1 && name && !name.value.trim()) problems.push("Add your name.");
    if (cfg.require.indexOf("email") !== -1 && email && !email.value.trim()) problems.push("Add your email.");
    if (cfg.require.indexOf("phone") !== -1 && phone && !phone.value.trim()) problems.push("Add your mobile.");
    if (cfg.require.indexOf("location") !== -1 && loc && !loc.value.trim()) problems.push("Add city or postcode.");
    return problems;
  }

  $("next-2").addEventListener("click", function(){
    var problems = validateContact();
    var fail = $("fail-2");
    if (problems.length){
      setErrors(fail, problems);
      return;
    }
    showStep(3);
  });

  document.querySelectorAll('input[name="platform"]').forEach(function(c){
    c.addEventListener("change", function(){ syncOther("platform","platforms-other","f-platforms-other"); });
  });
  document.querySelectorAll('input[name="categories"]').forEach(function(c){
    c.addEventListener("change", function(){ syncOther("categories","categories-other","f-categories-other"); });
  });

  var lead = $("leadForm");
  lead.addEventListener("submit", function(e){
    var cfg = BRANCH[persona];
    var failId = (cfg && !cfg.hasSellStep) ? "fail-2-short" : "fail-3";
    var fail = $(failId) || $("fail-3");
    if (!cfg){
      e.preventDefault();
      setErrors(fail, ["Pick who you are first."]);
      showStep(1);
      return;
    }
    var problems = validateContact();
    if (cfg.hasSellStep){
      if (cfg.require.indexOf("platforms") !== -1 && !checked("platform")){
        problems.push("Pick at least one place you sell or create content today.");
      }
      var platOther = document.querySelector('input[name="platform"][value="Other"]');
      var platText = $("f-platforms-other");
      if (platOther && platOther.checked && platText && !platText.value.trim()){
        problems.push("Tell us the other platform.");
      }
      var tt = $("f-tiktok");
      if (cfg.require.indexOf("tiktok") !== -1 && tt && !tt.value.trim()){
        problems.push("Add your TikTok username.");
      }
      var aud = $("f-audience");
      if (cfg.require.indexOf("audience") !== -1 && aud && !aud.value){
        problems.push("Pick a following size.");
      }
      if (cfg.require.indexOf("categories") !== -1 && !checked("categories")){
        problems.push("Pick at least one category.");
      }
      var other = document.querySelector('input[name="categories"][value="Other"]');
      var otherText = $("f-categories-other");
      if (other && other.checked && otherText && !otherText.value.trim()){
        problems.push("Tell us the other category.");
      }
    } else {
      if (cfg.require.indexOf("categories") !== -1 && !checked("categories")){
        problems.push("Pick at least one category.");
      }
      var otherB = document.querySelector('input[name="categories"][value="Other"]');
      var otherTextB = $("f-categories-other");
      if (otherB && otherB.checked && otherTextB && !otherTextB.value.trim()){
        problems.push("Tell us the other category.");
      }
    }

    if (!lead.checkValidity() && problems.length === 0){
      e.preventDefault();
      lead.reportValidity();
      setErrors(fail, ["Check the highlighted fields."]);
      return;
    }
    if (problems.length){
      e.preventDefault();
      setErrors(fail, problems);
      return;
    }
    var u = $("f-tiktok");
    if (u && u.value) u.value = u.value.replace(/^@+/, "").trim();
    if (params.get("nosubmit") === "1"){
      e.preventDefault();
    }
  });

  /* Brand needs categories on of-2 finish — clone visibility: show categories fieldset inside short-finish for brand */
  function ensureBrandCategories(){
    var cfg = persona && BRANCH[persona];
    var shortF = $("short-finish");
    var fsCat = $("fs-categories");
    if (!shortF || !fsCat) return;
    if (cfg && !cfg.hasSellStep && cfg.show.indexOf("categories") !== -1){
      /* move categories into short-finish before notes */
      var notesShort = fieldWrap("notes-short");
      if (notesShort && fsCat.parentNode !== shortF){
        shortF.insertBefore(fsCat, notesShort);
      }
      fsCat.hidden = false;
    } else if (cfg && cfg.hasSellStep){
      /* ensure categories back in step-3 before notes */
      var notes = fieldWrap("notes");
      var step3 = $("step-3");
      if (notes && fsCat.parentNode !== step3){
        step3.insertBefore(fsCat, notes);
      }
    }
  }

  var _apply = applyBranch;
  applyBranch = function(tag){
    _apply(tag);
    ensureBrandCategories();
  };

  /* Deep-link: ?role= preselects and advances. ?step= for screenshots. */
  var roleQ = (params.get("role") || params.get("tag") || "").toLowerCase();
  var mapped = roleMap[roleQ] || null;
  if (mapped){
    var chip = document.querySelector('.chip[data-persona="'+mapped+'"]');
    if (chip) selectPersona(mapped, chip.getAttribute("data-role"));
    var jump = parseInt(params.get("step") || "0", 10);
    if (jump === 1) showStep(1);
    if (jump === 2) showStep(2);
    if (jump === 3 && BRANCH[mapped] && BRANCH[mapped].hasSellStep) showStep(3);
  } else {
    showStep(1);
    if (tagEl) tagEl.value = "";
    if (roleEl) roleEl.value = "";
  }
  if (params.get("demo") === "errors" && step === 2 && $("next-2")) $("next-2").click();

  /* Attribution hiddens */
  (function fillAttribution(){
    ["gclid","utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(function(k){
      var v = params.get(k) || "";
      try {
        if (k === "gclid") {
          if (v) sessionStorage.setItem("sl_gclid", v);
          else v = sessionStorage.getItem("sl_gclid") || "";
        }
      } catch (e) {}
      var el = document.getElementById("h-" + k);
      if (el) el.value = v || "";
    });
    var lp = document.getElementById("h-landing_page");
    if (lp) lp.value = location.href.slice(0, 500);
    var rf = document.getElementById("h-referrer");
    if (rf) rf.value = (document.referrer || "").slice(0, 500);
  })();

  function sydneyNow(){
    var parts = new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Sydney",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var g = {};
    parts.forEach(function(p){ if (p.type !== "literal") g[p.type] = p.value; });
    return g.year + "-" + g.month + "-" + g.day + " " + g.hour + ":" + g.minute + ":" + g.second + " Australia/Sydney";
  }

  /* Fetch submit after SoT validation (bubble, registered after SoT listener) */
  var _lead = $("leadForm");
  if (_lead) {
    _lead.addEventListener("submit", function(e){
      if (e.defaultPrevented) return;
      if (params.get("nosubmit") === "1") {
        e.preventDefault();
        alert("Demo mode (nosubmit=1) — would send to Formspree.");
        return;
      }
      e.preventDefault();
      var stamp = $("h-submitted_at");
      if (stamp) stamp.value = sydneyNow();
      var btns = [_lead.querySelector("#submitBtn"), _lead.querySelector("#submitBtnShort")].filter(Boolean);
      btns.forEach(function(b){ b.disabled = true; });
      fetch(_lead.action, {
        method: "POST",
        body: new FormData(_lead),
        headers: { Accept: "application/json" }
      }).then(function(r){
        if (!r.ok) throw new Error("bad");
        var card = $("waitlist");
        var title = $("card-title");
        var sub = $("card-sub");
        if (title) title.textContent = "You’re on the list";
        if (sub) sub.textContent = "";
        ["step-indicator","role-sticky","step-1","step-2","step-3"].forEach(function(id){
          var el = $(id); if (el) el.hidden = true;
        });
        _lead.hidden = true;
        var msg = document.createElement("p");
        msg.className = "thanks";
        msg.setAttribute("tabindex","-1");
        msg.setAttribute("role","status");
        msg.textContent = "You’re on the Seller Lots waitlist for TikTok Shop Australia. We’ll email this address with updates. Stock talk is for hosts on the list.";
        if (card) card.appendChild(msg);
        msg.focus();
      }).catch(function(){
        btns.forEach(function(b){ b.disabled = false; });
        var fail = $("fail-3") || $("fail-2-short") || $("fail-2");
        setErrors(fail, ["That didn’t go through. Try again in a minute — or email hello@sellerlots.com.au."]);
      });
    });
  }

})();
(function(){
})();
