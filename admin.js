(function(){
  "use strict";

  var CFG = window.QUIZ_CONFIG || {};
  var SCRIPT_URL = CFG.googleScriptUrl || "";
  var app = document.getElementById("app");

  var password = "";
  var state = { questions: [], config: { moduleName: "", dureeMinutes: 10, pointsParQuestion: 0.25 } };

  function esc(s){
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function toast(msg){
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 2400);
  }

  function renderConfigError(){
    app.innerHTML = '<div class="gate-wrap"><div class="card register-card">' +
      '<h1>Configuration manquante</h1>' +
      '<p class="lead">L\'URL du script Google n\'est pas renseignée dans config.js.</p>' +
    '</div></div>';
  }

  function renderGate(error){
    app.innerHTML = '<div class="gate-wrap"><div class="card register-card">' +
      '<h1>Accès administrateur</h1>' +
      '<p class="lead">Entre le mot de passe défini dans Code.gs (fonction setAdminPassword).</p>' +
      (error ? '<div class="error-box">' + esc(error) + '</div>' : '') +
      '<form id="gateForm">' +
        '<div class="field"><label for="fPass">Mot de passe</label><input id="fPass" type="password" required></div>' +
        '<button type="submit" class="btn btn-primary" style="width:100%;" id="gateBtn">Se connecter</button>' +
      '</form>' +
    '</div></div>';

    document.getElementById("gateForm").addEventListener("submit", function(ev){
      ev.preventDefault();
      var btn = document.getElementById("gateBtn");
      btn.disabled = true; btn.textContent = "Vérification…";
      password = document.getElementById("fPass").value;
      loadAdminData(function(ok, err){
        if (!ok){
          btn.disabled = false; btn.textContent = "Se connecter";
          renderGate(err || "Mot de passe incorrect.");
          return;
        }
        try{ sessionStorage.setItem("quizAdminPass", password); }catch(e){}
        renderDashboard();
      });
    });
  }

  function loadAdminData(cb){
    fetch(SCRIPT_URL + "?action=admin&password=" + encodeURIComponent(password), {method:"GET"})
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data || data.error === "unauthorized"){ cb(false, "Mot de passe incorrect."); return; }
        if (!data.questions){ cb(false, "Réponse inattendue du serveur."); return; }
        state.questions = data.questions.map(function(q){
          return { q: q.q || "", opts: {A: (q.opts&&q.opts.A)||"", B:(q.opts&&q.opts.B)||"", C:(q.opts&&q.opts.C)||"", D:(q.opts&&q.opts.D)||""}, correct: q.correct || "A" };
        });
        state.config = {
          moduleName: (data.config && data.config.moduleName) || "",
          dureeMinutes: (data.config && Number(data.config.dureeMinutes)) || 10,
          pointsParQuestion: (data.config && Number(data.config.pointsParQuestion)) || 0.25
        };
        cb(true);
      })
      .catch(function(){ cb(false, "Connexion au serveur impossible. Réessaie."); });
  }

  function renderDashboard(){
    app.innerHTML =
      '<div class="card admin-section" id="cfgSection">' +
        '<h2>Réglages du module</h2>' +
        '<p class="sublead">Nom affiché aux étudiants, durée du quiz, points par bonne réponse.</p>' +
        '<div class="row2">' +
          '<div class="field"><label for="cModule">Nom du module</label><input id="cModule" value="' + esc(state.config.moduleName) + '"></div>' +
          '<div class="field"><label for="cMinutes">Durée (minutes)</label><input id="cMinutes" type="number" min="1" max="180" value="' + esc(state.config.dureeMinutes) + '"></div>' +
        '</div>' +
        '<div class="field" style="max-width:220px;"><label for="cPoints">Points par bonne réponse</label><input id="cPoints" type="number" step="0.05" min="0" value="' + esc(state.config.pointsParQuestion) + '"></div>' +
        '<button class="btn btn-primary" id="saveCfgBtn">Enregistrer les réglages</button>' +
      '</div>' +

      '<div class="card admin-section">' +
        '<div class="admin-toolbar">' +
          '<div><h2 style="margin-bottom:2px;">Questions</h2><p class="sublead" style="margin:0;">' + state.questions.length + ' question(s) · marque la bonne réponse avec le rond à gauche de chaque proposition.</p></div>' +
          '<button class="btn" id="addQBtn">+ Ajouter une question</button>' +
        '</div>' +
        '<div id="qList"></div>' +
        '<button class="btn btn-primary" id="saveQBtn" style="margin-top:8px;">Enregistrer toutes les questions</button>' +
      '</div>';

    renderQuestionList();

    document.getElementById("addQBtn").addEventListener("click", function(){
      state.questions.push({q:"", opts:{A:"",B:"",C:"",D:""}, correct:"A"});
      renderQuestionList();
    });

    document.getElementById("saveCfgBtn").addEventListener("click", function(){
      var btn = document.getElementById("saveCfgBtn");
      var cfg = {
        moduleName: document.getElementById("cModule").value.trim() || "Quiz",
        dureeMinutes: Number(document.getElementById("cMinutes").value) || 10,
        pointsParQuestion: Number(document.getElementById("cPoints").value) || 0.25
      };
      btn.disabled = true; btn.textContent = "Enregistrement…";
      fetch(SCRIPT_URL, {
        method:"POST", mode:"no-cors", headers:{"Content-Type":"text/plain;charset=utf-8"},
        body: JSON.stringify({action:"saveConfig", password: password, config: cfg})
      }).then(function(){
        state.config = cfg;
        btn.disabled = false; btn.textContent = "Enregistrer les réglages";
        toast("Réglages enregistrés ✓");
      }).catch(function(){
        btn.disabled = false; btn.textContent = "Enregistrer les réglages";
        toast("Échec de l'enregistrement");
      });
    });

    document.getElementById("saveQBtn").addEventListener("click", saveQuestions);
  }

  function renderQuestionList(){
    var listEl = document.getElementById("qList");
    if (!listEl) return;
    listEl.innerHTML = state.questions.map(function(item, idx){
      var letters = ["A","B","C","D"];
      var optsHtml = letters.map(function(l){
        return '<div class="qedit-opt">' +
          '<input type="radio" name="correct' + idx + '" value="' + l + '"' + (item.correct === l ? " checked" : "") + ' data-qidx="' + idx + '" class="correctRadio">' +
          '<span class="optletter">' + l + '</span>' +
          '<input type="text" placeholder="Proposition ' + l + (l === "D" ? " (optionnel)" : "") + '" value="' + esc(item.opts[l]) + '" data-qidx="' + idx + '" data-letter="' + l + '" class="optInput">' +
        '</div>';
      }).join("");
      return '<div class="qedit" data-idx="' + idx + '">' +
        '<div class="qedit-top">' +
          '<div class="qnum">' + (idx+1) + '</div>' +
          '<textarea class="qtextInput" data-qidx="' + idx + '" placeholder="Texte de la question">' + esc(item.q) + '</textarea>' +
        '</div>' +
        '<div class="qedit-opts">' + optsHtml + '</div>' +
        '<div class="qedit-foot">' +
          '<span class="qedit-hint">Bonne réponse : ' + item.correct + '</span>' +
          '<button class="icon-btn delQBtn" data-qidx="' + idx + '">Supprimer</button>' +
        '</div>' +
      '</div>';
    }).join("") || '<p class="sublead">Aucune question. Clique sur « + Ajouter une question ».</p>';

    listEl.querySelectorAll(".qtextInput").forEach(function(el){
      el.addEventListener("input", function(){
        state.questions[Number(el.getAttribute("data-qidx"))].q = el.value;
      });
    });
    listEl.querySelectorAll(".optInput").forEach(function(el){
      el.addEventListener("input", function(){
        var idx = Number(el.getAttribute("data-qidx"));
        var letter = el.getAttribute("data-letter");
        state.questions[idx].opts[letter] = el.value;
      });
    });
    listEl.querySelectorAll(".correctRadio").forEach(function(el){
      el.addEventListener("change", function(){
        var idx = Number(el.getAttribute("data-qidx"));
        state.questions[idx].correct = el.value;
        renderQuestionList();
      });
    });
    listEl.querySelectorAll(".delQBtn").forEach(function(el){
      el.addEventListener("click", function(){
        var idx = Number(el.getAttribute("data-qidx"));
        state.questions.splice(idx, 1);
        renderQuestionList();
      });
    });
  }

  function saveQuestions(){
    var btn = document.getElementById("saveQBtn");
    var cleaned = state.questions
      .filter(function(item){ return item.q && item.q.trim() && item.opts.A && item.opts.A.trim() && item.opts.B && item.opts.B.trim(); })
      .map(function(item){
        return { q: item.q.trim(), opts: {A:item.opts.A.trim(), B:item.opts.B.trim(), C:(item.opts.C||"").trim(), D:(item.opts.D||"").trim()}, correct: item.correct };
      });
    if (!cleaned.length){
      toast("Chaque question a besoin d'un texte et au moins des propositions A et B.");
      return;
    }
    btn.disabled = true; btn.textContent = "Enregistrement…";
    fetch(SCRIPT_URL, {
      method:"POST", mode:"no-cors", headers:{"Content-Type":"text/plain;charset=utf-8"},
      body: JSON.stringify({action:"saveQuestions", password: password, questions: cleaned})
    }).then(function(){
      state.questions = cleaned;
      btn.disabled = false; btn.textContent = "Enregistrer toutes les questions";
      toast(cleaned.length + " question(s) enregistrée(s) ✓ — en ligne immédiatement");
      renderDashboard();
    }).catch(function(){
      btn.disabled = false; btn.textContent = "Enregistrer toutes les questions";
      toast("Échec de l'enregistrement");
    });
  }

  function init(){
    if (!SCRIPT_URL || SCRIPT_URL.indexOf("http") !== 0){
      renderConfigError();
      return;
    }
    var saved = "";
    try{ saved = sessionStorage.getItem("quizAdminPass") || ""; }catch(e){}
    if (saved){
      password = saved;
      loadAdminData(function(ok){
        if (ok){ renderDashboard(); } else { renderGate(); }
      });
    } else {
      renderGate();
    }
  }

  init();
})();
