(function(){
  "use strict";

  var QUESTIONS = window.QUIZ_QUESTIONS || [];
  var CFG = window.QUIZ_CONFIG || {};
  var POINTS_PER_Q = CFG.pointsParQuestion || 0.25;
  var TOTAL_POINTS = QUESTIONS.length * POINTS_PER_Q;
  var MINUTES = CFG.dureeMinutes || 10;
  var SCRIPT_URL = CFG.googleScriptUrl || "";

  var app = document.getElementById("app");
  document.getElementById("moduleName").textContent = CFG.moduleName || "Quiz";

  var reg = null;
  var answers = {};
  var timerInterval = null;
  var secondsLeft = 0;
  var submitting = false;

  function esc(s){
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function storageKey(id){
    return "quizDone_" + (CFG.moduleName || "quiz") + "_" + id;
  }

  function fmtTime(sec){
    sec = Math.max(0, sec);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" + m : "" + m) + ":" + (s < 10 ? "0" + s : "" + s);
  }

  function renderRegister(opts){
    opts = opts || {};
    app.innerHTML =
      '<div class="register-wrap"><div class="card register-card">' +
        '<h1>Quiz — ' + esc(CFG.moduleName || "") + '</h1>' +
        '<p class="lead">' + QUESTIONS.length + ' questions · ' + MINUTES + ' minutes · ' + POINTS_PER_Q.toFixed(2).replace(".",",") + ' pt par bonne réponse (note sur ' + TOTAL_POINTS.toFixed(2).replace(".",",") + ')</p>' +
        (opts.error ? '<div class="error-box">' + esc(opts.error) + '</div>' : '') +
        '<form id="regForm">' +
          '<div class="field"><label for="fNom">Nom</label><input id="fNom" name="nom" autocomplete="family-name" required></div>' +
          '<div class="field"><label for="fPrenom">Prénom</label><input id="fPrenom" name="prenom" autocomplete="given-name" required></div>' +
          '<div class="row2">' +
            '<div class="field"><label for="fClasse">Classe</label>' +
              '<select id="fClasse" name="classe" required>' +
                '<option value="">Choisir…</option>' +
                '<option value="Master 1">Master 1</option>' +
                '<option value="Master 2">Master 2</option>' +
              '</select>' +
            '</div>' +
            '<div class="field"><label for="fId">Identifiant</label><input id="fId" name="identifiant" required placeholder="ex : e2451"></div>' +
          '</div>' +
          '<div class="hint" style="margin:-8px 0 18px;">Un seul essai par identifiant sur cet appareil.</div>' +
          '<button type="submit" class="btn btn-primary" style="width:100%;" id="startBtn">Commencer le quiz</button>' +
        '</form>' +
      '</div></div>';

    document.getElementById("regForm").addEventListener("submit", function(ev){
      ev.preventDefault();
      var nom = document.getElementById("fNom").value.trim();
      var prenom = document.getElementById("fPrenom").value.trim();
      var classe = document.getElementById("fClasse").value;
      var identifiant = document.getElementById("fId").value.trim();
      if (!nom || !prenom || !classe || !identifiant){ return; }

      var already = false;
      try{ already = !!localStorage.getItem(storageKey(identifiant)); }catch(e){}
      if (already){
        renderRegister({error:"Tu as déjà répondu à ce quiz avec cet identifiant sur cet appareil."});
        return;
      }

      reg = {nom:nom, prenom:prenom, classe:classe, identifiant:identifiant};
      answers = {};
      secondsLeft = MINUTES * 60;
      renderQuiz();
      startTimer();
    });
  }

  function startTimer(){
    stopTimer();
    updateTimerBar();
    timerInterval = setInterval(function(){
      secondsLeft -= 1;
      if (secondsLeft <= 0){
        secondsLeft = 0;
        updateTimerBar();
        stopTimer();
        submitQuiz(true);
        return;
      }
      updateTimerBar();
    }, 1000);
  }
  function stopTimer(){ if (timerInterval){ clearInterval(timerInterval); timerInterval = null; } }

  function updateTimerBar(){
    var numEl = document.getElementById("timerNum");
    var wrapEl = document.getElementById("timerWrap");
    var barEl = document.getElementById("timerFill");
    var progEl = document.getElementById("progressTxt");
    if (!numEl) return;
    numEl.textContent = fmtTime(secondsLeft);
    var totalSec = MINUTES * 60;
    var pct = totalSec > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSec) * 100)) : 0;
    if (barEl) barEl.style.width = pct + "%";
    wrapEl.classList.remove("low","mid");
    if (secondsLeft <= 30) wrapEl.classList.add("low");
    else if (secondsLeft <= 60) wrapEl.classList.add("mid");
    if (progEl){
      var answered = Object.keys(answers).length;
      progEl.textContent = answered + " / " + QUESTIONS.length + " répondues";
    }
  }

  function renderQuiz(){
    var letters = ["A","B","C","D"];
    var qHtml = QUESTIONS.map(function(item, idx){
      var optsHtml = letters.filter(function(l){ return item.opts[l] != null; }).map(function(l){
        return '<label class="opt">' +
          '<input type="radio" name="q' + idx + '" value="' + l + '">' +
          '<span class="optletter">' + l + '</span><span>' + esc(item.opts[l]) + '</span>' +
        '</label>';
      }).join("");
      return '<div class="card qcard">' +
        '<div class="qhead"><div class="qnum">' + (idx+1) + '</div><div class="qtext">' + esc(item.q) + '</div></div>' +
        '<div class="opts" data-qidx="' + idx + '">' + optsHtml + '</div>' +
      '</div>';
    }).join("");

    app.innerHTML =
      '<div class="timerbar" id="timerWrap">' +
        '<div><span class="mono timer-num" id="timerNum">--:--</span></div>' +
        '<div class="bar"><span id="timerFill" style="width:100%"></span></div>' +
        '<div class="progress-txt" id="progressTxt">0 / ' + QUESTIONS.length + ' répondues</div>' +
      '</div>' +
      qHtml +
      '<div class="submitbar"><button class="btn btn-primary" id="submitBtn">Envoyer mes réponses</button></div>';

    document.querySelectorAll(".opts").forEach(function(optsEl){
      var idx = Number(optsEl.getAttribute("data-qidx"));
      optsEl.addEventListener("change", function(ev){
        answers[idx] = ev.target.value;
        optsEl.querySelectorAll(".opt").forEach(function(o){ o.classList.remove("checked"); });
        ev.target.closest(".opt").classList.add("checked");
        updateTimerBar();
      });
    });
    document.getElementById("submitBtn").addEventListener("click", function(){ submitQuiz(false); });
    updateTimerBar();
  }

  function submitQuiz(auto){
    if (submitting) return;
    submitting = true;
    stopTimer();
    var btn = document.getElementById("submitBtn");
    if (btn){ btn.disabled = true; btn.textContent = "Envoi…"; }

    var score = 0;
    QUESTIONS.forEach(function(item, idx){
      if (answers[idx] && answers[idx] === item.correct){ score += POINTS_PER_Q; }
    });
    score = Math.round(score * 100) / 100;

    var payload = {
      module: CFG.moduleName || "",
      nom: reg.nom, prenom: reg.prenom, classe: reg.classe, identifiant: reg.identifiant,
      score: score, total: TOTAL_POINTS, auto: !!auto,
      reponses: answers,
      horodatage: new Date().toISOString()
    };

    try{ localStorage.setItem(storageKey(reg.identifiant), "1"); }catch(e){}

    var finish = function(){ submitting = false; renderDone(); };

    if (SCRIPT_URL && SCRIPT_URL.indexOf("http") === 0){
      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script ne renvoie pas d'en-têtes CORS lisibles ; on suppose l'envoi réussi
        headers: {"Content-Type": "text/plain;charset=utf-8"},
        body: JSON.stringify(payload)
      }).then(finish).catch(finish);
    } else {
      // Pas d'URL configurée : on affiche quand même le message de fin,
      // mais rien n'est envoyé nulle part tant que config.js n'est pas renseigné.
      finish();
    }
  }

  function renderDone(){
    app.innerHTML =
      '<div class="done-wrap"><div class="card done-card">' +
        '<div class="done-mark">✓</div>' +
        '<h2>Merci d\'avoir répondu, à la prochaine !</h2>' +
        '<p>Ta réponse a bien été enregistrée. Tu peux fermer cette page.</p>' +
      '</div></div>';
  }

  renderRegister();
})();
