// 네비 활성 탭 - 스크롤 위치에 따라 자동 변경
// IntersectionObserver: 요소가 화면에 보이는지 감지하는 API

const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const sections = document.querySelectorAll('section[id]');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;

      navLinks.forEach(l => l.classList.remove('active'));

      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, {
  threshold: 0.3,
  rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--nav-height')} 0px 0px 0px`
});

sections.forEach(s => observer.observe(s));


// 드래그 앤 드롭
const uploadZone = document.getElementById('uploadZone');

uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
});


// 파일 선택 핸들러
function handleFileSelect(input) {
  if (input.files && input.files[0]) loadImage(input.files[0]);
}


// 이미지 로드
function loadImage(file) {
  const reader = new FileReader();

  reader.onload = e => {
    const data = e.target.result;

    document.getElementById('imgPreview').src = data;

    const masked = document.getElementById('maskedPreview');
    masked.src = data;
    document.getElementById('maskedPreviewWrap').style.display = 'block';

    document.getElementById('uploadTitle').textContent = file.name;
    document.getElementById('uploadSubtitle').textContent =
      `${(file.size/1024).toFixed(0)}KB · 아래 버튼으로 마스킹 시작`;
    document.getElementById('runBtn').disabled = false;

    document.getElementById('resultList').style.display = 'none';
    document.getElementById('resultEmpty').style.display = 'block';
    document.getElementById('resultCount').textContent = '0개';
    document.getElementById('downloadArea').style.display = 'none';
    document.getElementById('progressWrap').classList.remove('show');
  };

  reader.readAsDataURL(file);
}

// 마스킹 실행 (데모)
// 실제 서비스: fetch('/api/mask', ...) 로 교체
function startMasking() {
  const runBtn  = document.getElementById('runBtn');
  const progWrap= document.getElementById('progressWrap');
  const progFill= document.getElementById('progressFill');
  const progLbl = document.getElementById('progressLabel');

  runBtn.disabled = true;
  progWrap.classList.add('show');

  const doFace = document.getElementById('checkFace').checked;
  const doName = document.getElementById('checkName').checked;

  const steps = [
    { w: 18, msg: '이미지 분석 중...' },
    { w: 42, msg: doFace ? '얼굴 감지 중...' : '텍스트 분석 중...' },
    { w: 67, msg: 'OCR 텍스트 인식 중...' },
    { w: 88, msg: '마스킹 좌표 계산 중...' },
    { w: 100, msg: '완료!' }
  ];

  let idx = 0;

  function tick() {
    if (idx >= steps.length) {
      const results = [];
      if (doFace) results.push({ type:'face', content:'얼굴', x1:100,y1:80,x2:260,y2:230 });
      if (doName) results.push({ type:'text', content:'이름', x1:50,y1:290,x2:180,y2:315 });
      document.querySelectorAll('.masking-item .masking-item-label').forEach(lbl => {
        const v = lbl.textContent.trim();
        if (v !== '이름' && v !== '얼굴') {
          results.push({ type:'text', content:v, x1:50,y1:330,x2:180,y2:355 });
        }
      });

      setTimeout(() => {
        progWrap.classList.remove('show');
        renderResults(results);
        document.getElementById('downloadArea').style.display = 'flex';
        runBtn.disabled = false;
      }, 350);

      return;
    }

    const s = steps[idx++];
    progFill.style.width = s.w + '%';
    progLbl.textContent  = s.msg;
    setTimeout(tick, 320 + Math.random() * 280);
  }

  tick();
}

// 감지 결과 렌더링
function renderResults(results) {
  const list  = document.getElementById('resultList');
  const empty = document.getElementById('resultEmpty');
  const count = document.getElementById('resultCount');

  count.textContent = `${results.length}개`;

  if (!results.length) {
    empty.style.display = 'block';
    list.style.display  = 'none';
    return;
  }

  list.innerHTML = '';

  results.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'result-item';

    li.dataset.x1   = item.x1;
    li.dataset.y1   = item.y1;
    li.dataset.x2   = item.x2;
    li.dataset.y2   = item.y2;
    li.dataset.type = item.type;

    li.innerHTML = `
      <div class="result-item-left">
        <input type="checkbox" class="aero-check"
          id="res-${i}" checked
          onchange="toggleResult(this,${i})">
        <label class="result-content-label" for="res-${i}">${item.content}</label>
        <span class="result-coords">(${item.x1},${item.y1})~(${item.x2},${item.y2})</span>
        <span class="result-type">${item.type}</span>
      </div>
      <div>
        <span class="type-badge ${item.type}">
          ${item.type === 'face' ? '얼굴' : '텍스트'}
        </span>
      </div>
    `;

    list.appendChild(li);
  });

  empty.style.display = 'none';
  list.style.display  = 'flex';
}

// 결과 항목 체크/언체크
function toggleResult(checkbox, idx) {
  console.log(`항목 ${idx}: ${checkbox.checked ? '마스킹' : '제외'}`);
}

// 옵션 항목 이름변경
function renameItem(btn) {
  const label = btn.closest('.masking-item').querySelector('.masking-item-label');
  const name  = prompt('새 이름:', label.textContent.trim());
  if (name && name.trim()) label.textContent = name.trim();
}

// 옵션 항목 삭제
function deleteItem(btn) {
  btn.closest('.masking-item').remove();
}

// 단어 추가
function addMaskWord() {
  const input     = document.getElementById('addWord');
  const word      = input.value.trim();
  const list      = document.getElementById('maskingList');
  const container = document.getElementById('addWordContainer');

  if (!word) return;

  const li = document.createElement('li');
  li.className = 'masking-item';
  const uid = Date.now();
  li.innerHTML = `
    <div class="masking-item-left">
      <input class="aero-check" type="checkbox"
        id="chk-${uid}" value="${word}" checked>
      <label class="masking-item-label" for="chk-${uid}">${word}</label>
    </div>
    <div style="display:flex; gap:5px;">
      <button class="btn-aero btn-aero-ghost btn-sm-aero btn-rename"
        onclick="renameItem(this)">이름변경</button>
      <button class="btn-aero btn-aero-danger btn-sm-aero btn-del"
        onclick="deleteItem(this)">삭제</button>
    </div>
  `;

  list.insertBefore(li, container);
  input.value = '';
  input.focus();
}

// Enter 키로 단어 추가
document.getElementById('addWord').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addMaskWord(); }
});
