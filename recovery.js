/* TheFlap — self-service password recovery (client)
   Overrides recOpenForgot with a clear 3-branch flow:
     Email recovery (if an email is attached) — sends a one-time code
     Google recovery (if Google is linked)
     Account verification / support (for accounts with neither)
   A username ALONE never resets a password. Calls the "recovery-mail"
   edge function for the email code path. Loaded after the app inline JS. */
(function () {
  var FN = 'recovery-mail';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function body() { return document.getElementById('recBody'); }
  function openModal() { var m = document.getElementById('recModal'); if (m) m.classList.add('open'); }
  function setBody(html) { var b = body(); if (b) b.innerHTML = html; }

  var S = {
    btn: 'display:block;width:100%;box-sizing:border-box;margin:8px 0;padding:12px 14px;border-radius:12px;border:none;font-weight:800;font-size:15px;cursor:pointer;',
    primary: 'background:#2f7ac9;color:#fff;',
    ghost: 'background:#eef2f8;color:#22304a;',
    input: 'display:block;width:100%;box-sizing:border-box;margin:8px 0;padding:12px 14px;border-radius:12px;border:1px solid #c9d3e2;font-size:16px;',
    note: 'color:#7a8598;font-size:13px;margin:10px 2px 0;line-height:1.4;',
    err: 'color:#c0392b;font-size:14px;margin:8px 2px 0;font-weight:600;min-height:0;'
  };

  // ---------- Step 1: enter username ----------
  function stepStart(prefill) {
    openModal();
    setBody(
      '<div style="font-size:13px;color:#7a8598;margin:2px 0 10px">Enter your username and we’ll show the ways you can prove it’s you.</div>' +
      '<input id="fpUser" placeholder="Your username" style="' + S.input + '" value="' + esc(prefill || '') + '">' +
      '<div id="fpErr" style="' + S.err + '"></div>' +
      '<button id="fpGo" style="' + S.btn + S.primary + '">Continue</button>' +
      '<div style="' + S.note + '">🔒 For your security, a password can’t be reset from a username alone.</div>'
    );
    var go = document.getElementById('fpGo'), inp = document.getElementById('fpUser');
    if (inp) { try { inp.focus(); } catch (e) {} inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go.click(); }); }
    if (go) go.onclick = function () { lookup((inp.value || '').trim()); };
  }

  async function lookup(username) {
    var err = document.getElementById('fpErr');
    if (!username) { if (err) err.textContent = 'Please enter your username.'; return; }
    if (err) err.textContent = '';
    var go = document.getElementById('fpGo'); if (go) { go.textContent = 'Checking…'; go.disabled = true; }
    var email = null, found = false, realName = username;
    try {
      var r = await window.sb.from('flap_users').select('name,email').ilike('name', username).limit(3);
      if (!r.error && r.data) {
        var u = r.data.find(function (x) { return String(x.name).toLowerCase() === username.toLowerCase(); });
        if (u) { found = true; realName = u.name; email = (u.email || '').trim() || null; }
      }
    } catch (e) {}
    if (go) { go.textContent = 'Continue'; go.disabled = false; }
    if (!found) { if (err) err.textContent = 'No account found with that username.'; return; }
    stepChoose(realName, email);
  }

  // ---------- Step 2: choose method ----------
  function stepChoose(name, email) {
    var hasEmail = !!email;
    var html = '<div style="font-size:14px;color:#22304a;margin:2px 0 12px">Account found: <b>' + esc(name) + '</b>. Choose how to verify it’s you:</div>';
    if (hasEmail) {
      html += '<button id="fpEmail" style="' + S.btn + S.primary + '">📧 Email recovery</button>' +
        '<div style="' + S.note + 'margin-top:-2px">We’ll send a 6-digit code to the email on your account.</div>';
      if (window.recForgotGoogle) {
        html += '<button id="fpGoogle" style="' + S.btn + S.ghost + '">🔑 Google recovery</button>' +
          '<div style="' + S.note + 'margin-top:-2px">If you signed up with Google, verify by signing in.</div>';
      }
      html += '<button id="fpSupport" style="' + S.btn + S.ghost + '">🛟 Verify another way (support)</button>';
    } else {
      html += '<div style="' + S.note + 'margin-top:0">There’s no email or Google linked to this account, so we can’t send a code. ' +
        'To keep your account safe we won’t reset it from a username alone — verify your identity with support and we’ll restore access.</div>' +
        '<button id="fpSupport" style="' + S.btn + S.primary + '">🛟 Verify with support</button>';
    }
    html += '<button id="fpBack" style="' + S.btn + 'background:transparent;color:#7a8598;">‹ Back</button>';
    setBody(html);
    var e = document.getElementById('fpEmail'); if (e) e.onclick = function () { stepEmailSend(name, email); };
    var g = document.getElementById('fpGoogle'); if (g) g.onclick = function () { try { window.recForgotGoogle(name); } catch (err) { try { window.recForgotGoogle(); } catch (e2) {} } };
    var s = document.getElementById('fpSupport'); if (s) s.onclick = function () { stepSupport(name); };
    var b = document.getElementById('fpBack'); if (b) b.onclick = function () { stepStart(name); };
  }

  // ---------- Step 3a: send code ----------
  async function stepEmailSend(name, email) {
    setBody('<div style="text-align:center;padding:20px 0;color:#22304a">Sending your code…</div>');
    var res;
    try { res = await window.sb.functions.invoke(FN, { body: { action: 'request', username: name } }); }
    catch (e) { res = { error: e }; }
    var d = res && res.data ? res.data : null;
    if (d && d.ok && d.emailed) { stepEmailVerify(name, d.hint || 'your email'); return; }
    var reason = d && d.reason ? d.reason : 'send-failed';
    if (reason === 'no-email') { stepSupport(name); return; }
    var msg = reason === 'rate-limited' ? 'Too many attempts. Please wait a bit and try again.' :
      reason === 'not-found' ? 'We couldn’t find that account.' :
      'We couldn’t send the email right now. You can verify with support instead.';
    setBody('<div style="' + S.err + '">' + esc(msg) + '</div>' +
      '<button id="fpSupport" style="' + S.btn + S.primary + '">🛟 Verify with support</button>' +
      '<button id="fpBack" style="' + S.btn + S.ghost + '">‹ Back</button>');
    var s = document.getElementById('fpSupport'); if (s) s.onclick = function () { stepSupport(name); };
    var b = document.getElementById('fpBack'); if (b) b.onclick = function () { stepChoose(name, email); };
  }

  // ---------- Step 3b: enter code + new password ----------
  function stepEmailVerify(name, hint) {
    setBody(
      '<div style="font-size:14px;color:#22304a;margin:2px 0 10px">We sent a 6-digit code to <b>' + esc(hint) + '</b>. Enter it below and choose a new password.</div>' +
      '<input id="fpCode" inputmode="numeric" maxlength="6" placeholder="6-digit code" style="' + S.input + 'letter-spacing:4px;font-weight:700;">' +
      '<input id="fpPw" type="password" placeholder="New password (min 6 chars)" style="' + S.input + '">' +
      '<input id="fpPw2" type="password" placeholder="Confirm new password" style="' + S.input + '">' +
      '<div id="fpErr2" style="' + S.err + '"></div>' +
      '<button id="fpReset" style="' + S.btn + S.primary + '">Reset password</button>' +
      '<button id="fpResend" style="' + S.btn + 'background:transparent;color:#2f7ac9;">Didn’t get it? Send again</button>' +
      '<div style="' + S.note + '">Code expires in 15 minutes and can be used once.</div>'
    );
    var rs = document.getElementById('fpResend'); if (rs) rs.onclick = function () { stepEmailSend(name, 'x'); };
    var btn = document.getElementById('fpReset');
    btn.onclick = async function () {
      var code = (document.getElementById('fpCode').value || '').trim();
      var pw = document.getElementById('fpPw').value || '';
      var pw2 = document.getElementById('fpPw2').value || '';
      var err = document.getElementById('fpErr2'); err.textContent = '';
      if (code.length < 6) { err.textContent = 'Enter the 6-digit code from your email.'; return; }
      if (pw.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
      if (pw !== pw2) { err.textContent = 'Passwords don’t match.'; return; }
      btn.textContent = 'Resetting…'; btn.disabled = true;
      var res;
      try { res = await window.sb.functions.invoke(FN, { body: { action: 'verify', username: name, code: code, newPassword: pw } }); }
      catch (e) { res = { error: e }; }
      btn.textContent = 'Reset password'; btn.disabled = false;
      var d = res && res.data ? res.data : null;
      if (d && d.ok) { stepDone(name); return; }
      var reason = d && d.reason ? d.reason : 'bad-code';
      err.textContent = reason === 'expired' ? 'That code expired — send a new one.' :
        reason === 'used' ? 'That code was already used — send a new one.' :
        reason === 'too-many' ? 'Too many wrong tries — send a new code.' :
        reason === 'weak' ? 'Password must be at least 6 characters.' :
        'That code isn’t right. Check your email and try again.';
    };
  }

  function stepDone(name) {
    setBody(
      '<div style="text-align:center;padding:8px 0">' +
      '<div style="font-size:40px">✅</div>' +
      '<div style="font-size:17px;font-weight:800;color:#1e874b;margin:6px 0">Password updated</div>' +
      '<div style="color:#22304a;font-size:14px;margin:0 0 14px">You can now log in as <b>' + esc(name) + '</b> with your new password.</div>' +
      '<button id="fpLogin" style="' + S.btn + S.primary + '">Go to login</button></div>'
    );
    var b = document.getElementById('fpLogin');
    if (b) b.onclick = function () {
      try { window.recClose && window.recClose(); } catch (e) {}
      try { document.getElementById('recModal').classList.remove('open'); } catch (e) {}
      try { if (location.hash) history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    };
  }

  function stepSupport(name) {
    var mail = 'theflapsupport@gmail.com';
    setBody(
      '<div style="font-size:14px;color:#22304a;margin:2px 0 10px">Verify your identity with support 🛟</div>' +
      '<div style="' + S.note + 'margin-top:0">Because there’s no email or Google on this account, we protect it by verifying you personally instead of resetting from a username. Email us from an address you can be reached at and mention your username <b>' + esc(name) + '</b> — we’ll confirm it’s you and restore access.</div>' +
      '<a href="mailto:' + mail + '?subject=Account%20recovery%20for%20' + encodeURIComponent(name) + '&body=Hi%2C%20I%20need%20help%20recovering%20my%20TheFlap%20account%20(username%3A%20' + encodeURIComponent(name) + ').%20I%20don’t%20have%20an%20email%20or%20Google%20on%20the%20account." style="' + S.btn + S.primary + 'text-decoration:none;text-align:center;">✉️ Email support</a>' +
      '<button id="fpBack" style="' + S.btn + S.ghost + '">‹ Back</button>'
    );
    var b = document.getElementById('fpBack'); if (b) b.onclick = function () { stepStart(name); };
  }

  // Override the global entry point (gate link, #recover deep-link, Support page all call this).
  window.recOpenForgot = function (prefill) { stepStart(typeof prefill === 'string' ? prefill : ''); };
  window.flapForgotOpen = window.recOpenForgot;

  // ---------- Visible entry on the Support page ----------
  function injectForgotIntoSupport() {
    var card = document.querySelector('#supportModal .report-card');
    if (!card || document.getElementById('supForgotBtn')) return;
    var wrap = document.createElement('div');
    wrap.id = 'supForgotWrap';
    wrap.style.cssText = 'margin:6px 0 14px';
    wrap.innerHTML =
      '<button id="supForgotBtn" style="display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:13px 14px;border-radius:12px;border:1px solid #cfe0f4;background:#eef5ff;color:#1b3b66;font-weight:800;font-size:15px;cursor:pointer;text-align:left;">' +
      '<span style="font-size:20px">🔑</span><span>Forgot your password?<br><span style="font-weight:600;font-size:12px;color:#5b7799">Recover your account without a support ticket</span></span></button>';
    var cats = document.getElementById('supCats');
    if (cats && cats.parentNode) cats.parentNode.insertBefore(wrap, cats);
    else card.appendChild(wrap);
    document.getElementById('supForgotBtn').onclick = function () {
      try { window.closeSupport && window.closeSupport(); } catch (e) {}
      setTimeout(function () { try { window.recOpenForgot(); } catch (e) {} }, 60);
    };
  }
  if (typeof window.openSupport === 'function' && !window.openSupport.__fpWrapped) {
    var _openSupport = window.openSupport;
    window.openSupport = function () {
      var r = _openSupport.apply(this, arguments);
      try { injectForgotIntoSupport(); } catch (e) {}
      setTimeout(injectForgotIntoSupport, 200);
      return r;
    };
    window.openSupport.__fpWrapped = true;
  }

  // Re-honor the recovery deep-link in case boot ran before this loaded.
  try {
    if (/[?&]recover=1/.test(location.search || '') || /recover/i.test(location.hash || '') || /\/recover(\/|$)/i.test(location.pathname || '')) {
      if (!(window.ME && window.ME.name)) setTimeout(function () { try { window.recOpenForgot(); } catch (e) {} }, 1200);
    }
  } catch (e) {}
})();
