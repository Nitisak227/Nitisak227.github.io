/**
 * PKH Admin System — shared across all pages
 * Place <div id="pkh-admin-slot"></div> in the header.
 */
(function () {
  'use strict';

  var CRED        = { user: 'PKH', pass: 'PKH' };
  var SESSION_KEY = 'pkh_admin_session';
  var _imgTarget  = null;

  function pageKey() {
    return 'pkh_page_' + location.pathname.split('/').pop().replace(/\.html?$/i, '');
  }

  /* ── BOOT ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    injectCSS();
    injectModal();
    injectToolbar();
    injectLoginBtn();
    autoLoad();
    if (localStorage.getItem(SESSION_KEY) === '1') enableEditMode();
  });

  /* ── CSS ──────────────────────────────────── */
  function injectCSS() {
    var s = document.createElement('style');
    s.id = 'pkh-admin-css';
    s.textContent =
      '#pkh-admin-slot{display:flex;align-items:center;gap:8px;margin-left:auto;}' +
      '.pkh-login-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 15px;' +
        'background:#1a1a2e;color:#fff;border:none;border-radius:8px;font-size:.82rem;' +
        'font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap;}' +
      '.pkh-login-btn:hover{background:#2d3e6f;}' +
      '.pkh-admin-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;' +
        'background:#e8f5e9;color:#1e8e3e;border:1px solid #a5d6a7;border-radius:20px;' +
        'font-size:.75rem;font-weight:600;}' +
      '#pkh-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);' +
        'z-index:99999;align-items:center;justify-content:center;backdrop-filter:blur(3px);}' +
      '#pkh-overlay.show{display:flex;}' +
      '.pkh-mbox{background:#fff;border-radius:18px;padding:36px 32px;width:340px;' +
        'box-shadow:0 20px 60px rgba(0,0,0,.18);animation:pkhUp .22s ease;' +
        'font-family:"Segoe UI",system-ui,sans-serif;}' +
      '@keyframes pkhUp{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}' +
      '.pkh-mhead{width:48px;height:48px;background:#1a1a2e;border-radius:12px;' +
        'display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;' +
        'color:#fff;letter-spacing:.05em;margin:0 auto 14px;}' +
      '.pkh-mbox h2{text-align:center;font-size:1.05rem;font-weight:700;color:#1a1a2e;margin-bottom:4px;}' +
      '.pkh-mbox>p{text-align:center;font-size:.8rem;color:#888;margin-bottom:22px;}' +
      '.pkh-mfield{margin-bottom:12px;}' +
      '.pkh-mfield label{display:block;font-size:.78rem;font-weight:600;color:#2d3748;margin-bottom:4px;}' +
      '.pkh-mfield input{width:100%;padding:9px 13px;border:1.5px solid #e3e8ef;border-radius:9px;' +
        'font-size:.88rem;outline:none;transition:border-color .15s;font-family:inherit;}' +
      '.pkh-mfield input:focus{border-color:#1a73e8;}' +
      '.pkh-merr{background:#fff5f5;border:1px solid #fc8181;border-radius:8px;padding:7px 11px;' +
        'font-size:.8rem;color:#c53030;margin-bottom:12px;display:none;}' +
      '.pkh-merr.show{display:block;}' +
      '.pkh-msub{width:100%;padding:10px;background:#1a1a2e;color:#fff;border:none;border-radius:9px;' +
        'font-size:.88rem;font-weight:600;cursor:pointer;transition:background .15s;font-family:inherit;}' +
      '.pkh-msub:hover{background:#2d3e6f;}' +
      '.pkh-mcanc{width:100%;padding:8px;background:transparent;color:#888;border:none;font-size:.8rem;' +
        'cursor:pointer;margin-top:7px;border-radius:9px;transition:background .15s;font-family:inherit;}' +
      '.pkh-mcanc:hover{background:#f5f7fa;}' +
      '#pkh-toolbar{display:none;position:fixed;bottom:22px;right:22px;z-index:9000;' +
        'flex-direction:column;gap:8px;align-items:flex-end;}' +
      '#pkh-toolbar.show{display:flex;}' +
      '.pkh-tlabel{background:#1a1a2e;color:#fff;padding:5px 13px;border-radius:20px;' +
        'font-size:.72rem;font-weight:700;letter-spacing:.06em;font-family:"Segoe UI",system-ui,sans-serif;}' +
      '.pkh-trow{display:flex;gap:8px;}' +
      '.pkh-tbtn{display:inline-flex;align-items:center;gap:5px;padding:9px 16px;border-radius:10px;' +
        'border:none;font-size:.82rem;font-weight:600;cursor:pointer;transition:opacity .15s,transform .1s;' +
        'box-shadow:0 4px 14px rgba(0,0,0,.13);font-family:"Segoe UI",system-ui,sans-serif;}' +
      '.pkh-tbtn:hover{opacity:.88;transform:translateY(-1px);}' +
      '.pkh-tbtn:active{transform:none;}' +
      '.pkh-tbtn.green{background:#1e8e3e;color:#fff;}' +
      '.pkh-tbtn.blue{background:#1a73e8;color:#fff;}' +
      '.pkh-tbtn.red{background:#e53e3e;color:#fff;}' +
      '.pkh-dot{display:none;width:8px;height:8px;background:#f59e0b;border-radius:50%;' +
        'margin-left:4px;vertical-align:middle;}' +
      '.pkh-dot.show{display:inline-block;}' +
      'body.pkh-edit [contenteditable=true]{outline:2px dashed #90cdf4;border-radius:4px;' +
        'min-height:1em;cursor:text;transition:outline-color .15s;}' +
      'body.pkh-edit [contenteditable=true]:focus{outline:2px solid #1a73e8;background:#f0f7ff;}' +
      'body.pkh-edit [contenteditable=true]:hover{outline-color:#1a73e8;}' +
      '.pkh-imgzone{display:none;border:2px dashed #90cdf4;border-radius:10px;' +
        'padding:14px;text-align:center;cursor:pointer;background:#f0f7ff;' +
        'font-size:.82rem;color:#1a73e8;margin:10px 0;transition:background .15s;' +
        'font-family:"Segoe UI",system-ui,sans-serif;}' +
      '.pkh-imgzone:hover{background:#deeeff;}' +
      'body.pkh-edit .pkh-imgzone{display:block;}' +
      '.pkh-delbtn{display:none;position:absolute;top:10px;right:10px;' +
        'background:#fff5f5;border:1px solid #fc8181;border-radius:7px;' +
        'color:#e53e3e;font-size:.72rem;padding:3px 8px;cursor:pointer;font-weight:600;' +
        'z-index:10;transition:background .12s;font-family:"Segoe UI",system-ui,sans-serif;}' +
      '.pkh-delbtn:hover{background:#fde8e8;}' +
      'body.pkh-edit .pkh-delbtn{display:block;}' +
      '.pkh-addsec{display:none;width:100%;padding:12px;background:transparent;' +
        'border:2px dashed #e3e8ef;border-radius:16px;color:#718096;font-size:.84rem;' +
        'font-weight:500;cursor:pointer;margin-bottom:20px;' +
        'transition:border-color .15s,color .15s,background .15s;' +
        'font-family:"Segoe UI",system-ui,sans-serif;}' +
      '.pkh-addsec:hover{border-color:#1a73e8;color:#1a73e8;background:#f0f7ff;}' +
      'body.pkh-edit .pkh-addsec{display:block;}';
    document.head.appendChild(s);
  }

  /* ── MODAL ────────────────────────────────── */
  function injectModal() {
    var d = document.createElement('div');
    d.id = 'pkh-overlay';
    d.innerHTML =
      '<div class="pkh-mbox">' +
        '<div class="pkh-mhead">PKH</div>' +
        '<h2>Admin Login</h2>' +
        '<p>Sign in to edit page content</p>' +
        '<div class="pkh-mfield"><label>Username</label>' +
          '<input type="text" id="pkh-user" placeholder="Username" autocomplete="off"/></div>' +
        '<div class="pkh-mfield"><label>Password</label>' +
          '<input type="password" id="pkh-pass" placeholder="Password"/></div>' +
        '<div class="pkh-merr" id="pkh-err">Incorrect username or password</div>' +
        '<button class="pkh-msub" id="pkh-sub">Sign In</button>' +
        '<button class="pkh-mcanc" id="pkh-canc">Cancel</button>' +
      '</div>';
    document.body.appendChild(d);
    document.getElementById('pkh-sub').onclick  = doLogin;
    document.getElementById('pkh-canc').onclick = closeModal;
    document.addEventListener('keydown', function (e) {
      if (!document.getElementById('pkh-overlay').classList.contains('show')) return;
      if (e.key === 'Enter')  doLogin();
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ── TOOLBAR ──────────────────────────────── */
  function injectToolbar() {
    var d = document.createElement('div');
    d.id = 'pkh-toolbar';
    d.innerHTML =
      '<div class="pkh-tlabel">Edit Mode</div>' +
      '<div class="pkh-trow">' +
        '<button class="pkh-tbtn blue" id="pkh-addsecbtn">Add Section</button>' +
      '</div>' +
      '<div class="pkh-trow">' +
        '<button class="pkh-tbtn green" id="pkh-savebtn">Save' +
          '<span class="pkh-dot" id="pkh-dot"></span></button>' +
        '<button class="pkh-tbtn red" id="pkh-logoutbtn">Logout</button>' +
      '</div>';
    document.body.appendChild(d);
    document.getElementById('pkh-savebtn').onclick   = saveContent;
    document.getElementById('pkh-logoutbtn').onclick = doLogout;
    document.getElementById('pkh-addsecbtn').onclick = addSection;
  }

  /* ── LOGIN BUTTON ─────────────────────────── */
  function injectLoginBtn() {
    var slot = document.getElementById('pkh-admin-slot');
    if (!slot) {
      slot = document.createElement('div');
      slot.id = 'pkh-admin-slot';
      var hdr = document.querySelector('header, .top-bar, .page-header');
      if (hdr) hdr.appendChild(slot); else document.body.prepend(slot);
    }
    slot.innerHTML =
      '<button class="pkh-login-btn" id="pkh-loginbtn">Admin</button>' +
      '<span class="pkh-admin-badge" id="pkh-badge" style="display:none;">Admin</span>';
    document.getElementById('pkh-loginbtn').onclick = openModal;
  }

  /* ── AUTH ─────────────────────────────────── */
  function openModal() {
    document.getElementById('pkh-overlay').classList.add('show');
    setTimeout(function () { document.getElementById('pkh-user').focus(); }, 50);
  }
  function closeModal() {
    document.getElementById('pkh-overlay').classList.remove('show');
    document.getElementById('pkh-err').classList.remove('show');
    document.getElementById('pkh-user').value = '';
    document.getElementById('pkh-pass').value = '';
  }
  function doLogin() {
    var u = document.getElementById('pkh-user').value.trim();
    var p = document.getElementById('pkh-pass').value.trim();
    if (u === CRED.user && p === CRED.pass) {
      localStorage.setItem(SESSION_KEY, '1');
      closeModal();
      enableEditMode();
    } else {
      document.getElementById('pkh-err').classList.add('show');
      document.getElementById('pkh-pass').value = '';
      document.getElementById('pkh-pass').focus();
    }
  }
  function doLogout() {
    if (document.getElementById('pkh-dot').classList.contains('show') &&
        !confirm('Unsaved changes. Logout anyway?')) return;
    localStorage.removeItem(SESSION_KEY);
    disableEditMode();
  }

  /* ── EDIT MODE ────────────────────────────── */
  function enableEditMode() {
    document.getElementById('pkh-loginbtn').style.display = 'none';
    document.getElementById('pkh-badge').style.display    = 'inline-flex';
    document.getElementById('pkh-toolbar').classList.add('show');
    document.body.classList.add('pkh-edit');
    makeEditable();
    addDelBtns();
    addImgZones();
    addAddSecBtn();
  }
  function disableEditMode() {
    document.getElementById('pkh-loginbtn').style.display = 'inline-flex';
    document.getElementById('pkh-badge').style.display    = 'none';
    document.getElementById('pkh-toolbar').classList.remove('show');
    document.body.classList.remove('pkh-edit');
    document.querySelectorAll('[contenteditable]').forEach(function (el) {
      el.removeAttribute('contenteditable');
    });
    document.querySelectorAll('.pkh-delbtn,.pkh-imgzone,.pkh-addsec').forEach(function (el) { el.remove(); });
    document.getElementById('pkh-dot').classList.remove('show');
  }

  /* ── MAKE EDITABLE ────────────────────────── */
  var SELS = ['h2','h3','h4','p','li','td','th',
    '.value','.label','.dose-box','.note',
    '.topic-label','.sub-label','.schedule-content','.schedule-day',
    '.section-title h2','.section-title p','.nav-card h3'];
  function makeEditable() {
    SELS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.closest('a,nav,.back-btn,.sidebar-inner,#pkh-overlay,#pkh-toolbar,header,.top-bar,.page-header')) return;
        el.setAttribute('contenteditable', 'true');
        el.addEventListener('input', markUnsaved);
      });
    });
  }

  /* ── DELETE BUTTONS ───────────────────────── */
  function addDelBtns() {
    document.querySelectorAll('.section-card,.section').forEach(function (card) {
      if (card.querySelector('.pkh-delbtn')) return;
      var btn = document.createElement('button');
      btn.className = 'pkh-delbtn';
      btn.textContent = 'Delete';
      btn.onclick = function () {
        if (confirm('Delete this section?')) { card.remove(); markUnsaved(); }
      };
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.appendChild(btn);
    });
  }

  /* ── IMAGE ZONES ──────────────────────────── */
  function addImgZones() {
    document.querySelectorAll('.section-body').forEach(function (body) {
      if (body.querySelector('.pkh-imgzone')) return;
      var z = document.createElement('div');
      z.className = 'pkh-imgzone';
      z.textContent = 'Click to upload image here';
      z.onclick = function () { triggerImg(body); };
      body.appendChild(z);
    });
  }
  function triggerImg(target) {
    _imgTarget = target;
    var inp = document.getElementById('pkh-fileinp');
    if (!inp) {
      inp = document.createElement('input');
      inp.type = 'file'; inp.id = 'pkh-fileinp'; inp.accept = 'image/*'; inp.style.display = 'none';
      inp.onchange = onImgPicked;
      document.body.appendChild(inp);
    }
    inp.value = ''; inp.click();
  }
  function onImgPicked(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      var img = document.createElement('img');
      img.src = ev.target.result;
      img.style.cssText = 'max-width:100%;border-radius:8px;margin:8px 0;display:block;';
      img.title = 'Right-click to remove';
      img.addEventListener('contextmenu', function (ce) {
        ce.preventDefault();
        if (confirm('Remove this image?')) { img.remove(); markUnsaved(); }
      });
      if (_imgTarget) {
        var zone = _imgTarget.querySelector('.pkh-imgzone');
        _imgTarget.insertBefore(img, zone || null);
      }
      markUnsaved();
    };
    reader.readAsDataURL(file);
  }

  /* ── ADD SECTION ──────────────────────────── */
  function addSection() {
    var title = prompt('Section title:', 'New Section'); if (!title) return;
    var sub   = prompt('Sub-title (optional):', '') || '';
    var abbr  = prompt('Icon label (2-3 letters):', 'NEW') || 'NEW';
    var main  = document.querySelector('main.main, .main, main');
    if (!main) return;
    var card = document.createElement('div');
    card.className = 'section-card';
    card.id = 'sec-' + Date.now();
    card.style.position = 'relative';
    card.innerHTML =
      '<button class="pkh-delbtn" onclick="this.closest(\'.section-card\').remove();' +
        'document.getElementById(\'pkh-dot\').classList.add(\'show\');">Delete</button>' +
      '<div class="section-header">' +
        '<div class="section-icon color-general" style="font-size:11px;font-weight:800;letter-spacing:.03em;">' + abbr + '</div>' +
        '<div class="section-title">' +
          '<h2 contenteditable="true">' + title + '</h2>' +
          '<p  contenteditable="true">' + (sub || 'Click to add description') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="section-body">' +
        '<p contenteditable="true" style="line-height:1.7;min-height:40px;">Click to start typing...</p>' +
        '<div class="pkh-imgzone" style="display:block;">Click to upload image here</div>' +
      '</div>';
    card.querySelectorAll('[contenteditable]').forEach(function (el) {
      el.addEventListener('input', markUnsaved);
    });
    card.querySelector('.pkh-imgzone').onclick = function () {
      triggerImg(card.querySelector('.section-body'));
    };
    var btn = main.querySelector('.pkh-addsec');
    main.insertBefore(card, btn || null);
    markUnsaved();
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Update sidebar if present
    var sidebar = document.querySelector('.sidebar-inner');
    if (sidebar) {
      var a = document.createElement('a');
      a.href = '#' + card.id;
      a.innerHTML = '<span class="dot dot-general"></span>' + title;
      sidebar.appendChild(a);
    }
  }
  function addAddSecBtn() {
    var main = document.querySelector('main.main, .main, main');
    if (!main || main.querySelector('.pkh-addsec')) return;
    var btn = document.createElement('button');
    btn.className = 'pkh-addsec';
    btn.textContent = 'Add New Section';
    btn.onclick = addSection;
    main.appendChild(btn);
  }

  /* ── SAVE / LOAD ──────────────────────────── */
  function markUnsaved() {
    document.getElementById('pkh-dot').classList.add('show');
  }
  function saveContent() {
    var main = document.querySelector('main.main, .main, main');
    if (!main) return;
    localStorage.setItem(pageKey(), main.innerHTML);
    document.getElementById('pkh-dot').classList.remove('show');
    toast('Changes saved.', '#1e8e3e');
  }
  function autoLoad() {
    var saved = localStorage.getItem(pageKey());
    if (!saved) return;
    var main = document.querySelector('main.main, .main, main');
    if (main) main.innerHTML = saved;
  }

  /* ── TOAST ────────────────────────────────── */
  function toast(msg, color) {
    var t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position:'fixed', bottom:'90px', right:'22px', zIndex:'999999',
      background: color || '#1a1a2e', color:'#fff',
      padding:'9px 18px', borderRadius:'10px', opacity:'1',
      fontSize:'.83rem', fontWeight:'600',
      boxShadow:'0 4px 16px rgba(0,0,0,.2)', transition:'opacity .4s',
      fontFamily:'"Segoe UI",system-ui,sans-serif'
    });
    document.body.appendChild(t);
    setTimeout(function () {
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 400);
    }, 2000);
  }

})();
