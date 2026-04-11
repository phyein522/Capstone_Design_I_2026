// 네비 활성 탭 - 스크롤 위치에 따라 자동 변경
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
  const runBtn   = document.getElementById('runBtn');
  const progWrap = document.getElementById('progressWrap');
  const progFill = document.getElementById('progressFill');
  const progLbl  = document.getElementById('progressLabel');

  runBtn.disabled = true;
  progWrap.classList.add('show');

  const steps = [
    { w: 18,  msg: '이미지 분석 중...' },
    { w: 42,  msg: '얼굴 감지 중...' },
    { w: 67,  msg: 'OCR 텍스트 인식 중...' },
    { w: 88,  msg: '마스킹 좌표 계산 중...' },
    { w: 100, msg: '완료!' }
  ];

  let idx = 0;

  function tick() {
    if (idx >= steps.length) {

      // ── 데모용 JSON 결과 (실제 서비스에서는 백엔드 API 응답으로 교체) ──
      const jsonResults = [
        { type: 'face', content: '얼굴',    x1: 100, y1:  80, x2: 260, y2: 230 },
        { type: 'text', content: '이름',    x1:  50, y1: 290, x2: 180, y2: 315 },
        { type: 'text', content: '전화번호', x1:  50, y1: 330, x2: 180, y2: 355 },
      ];

      setTimeout(() => {
        progWrap.classList.remove('show');

        // 마스킹 항목 선택 목록 재구성 (이름/얼굴 유지, 나머지 초기화 후 JSON 결과 추가)
        updateMaskingList(jsonResults);

        // 감지 결과 카드 렌더링
        renderResults(jsonResults);

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


// 마스킹 항목 선택 목록 재구성
// - 이름/얼굴 고정 항목은 유지
// - 이전에 추가된 JSON/사용자 항목은 전부 제거
// - JSON results 중 이름/얼굴과 중복되지 않는 항목만 추가
function updateMaskingList(results) {
  const list      = document.getElementById('maskingList');
  const container = document.getElementById('addWordContainer');

  // 고정 항목(data-fixed)이 아닌 항목만 제거
  list.querySelectorAll('.masking-item:not([data-fixed])').forEach(el => el.remove());

  // 현재 고정 항목의 라벨 텍스트 수집 (중복 체크용)
  const existingLabels = new Set(
    [...list.querySelectorAll('.masking-item-label')].map(l => l.textContent.trim())
  );

  // JSON 결과 중 중복 아닌 항목만 추가
  results.forEach((item, i) => {
    if (existingLabels.has(item.content)) return; // 중복 스킵

    const uid = `json-${Date.now()}-${i}`;
    const li  = document.createElement('li');
    li.className = 'masking-item';
    li.innerHTML = `
      <div class="masking-item-left">
        <input class="aero-check" type="checkbox"
          id="chk-${uid}" value="${item.content}" checked>
        <label class="masking-item-label" for="chk-${uid}">${item.content}</label>
      </div>
      <div style="display:flex; gap:5px;">
        <button class="btn-aero btn-aero-ghost btn-sm-aero"
          onclick="renameItem(this)">이름변경</button>
        <button class="btn-aero btn-aero-danger btn-sm-aero"
          onclick="deleteItem(this)">삭제</button>
      </div>
    `;
    list.insertBefore(li, container);
  });
}


// 감지 결과 카드 렌더링
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


// 감지 결과 항목 체크/언체크
function toggleResult(checkbox, idx) {
  console.log(`항목 ${idx}: ${checkbox.checked ? '마스킹' : '제외'}`);
}


// 항목 이름변경
function renameItem(btn) {
  const label = btn.closest('.masking-item').querySelector('.masking-item-label');
  const name  = prompt('새 이름:', label.textContent.trim());
  if (name && name.trim()) label.textContent = name.trim();
}


// 항목 삭제
function deleteItem(btn) {
  btn.closest('.masking-item').remove();
}


// 단어 직접 추가
function addMaskWord() {
  const input     = document.getElementById('addWord');
  const word      = input.value.trim();
  const list      = document.getElementById('maskingList');
  const container = document.getElementById('addWordContainer');

  if (!word) return;

  const uid = Date.now();
  const li  = document.createElement('li');
  li.className = 'masking-item';
  li.innerHTML = `
    <div class="masking-item-left">
      <input class="aero-check" type="checkbox"
        id="chk-${uid}" value="${word}" checked>
      <label class="masking-item-label" for="chk-${uid}">${word}</label>
    </div>
    <div style="display:flex; gap:5px;">
      <button class="btn-aero btn-aero-ghost btn-sm-aero"
        onclick="renameItem(this)">이름변경</button>
      <button class="btn-aero btn-aero-danger btn-sm-aero"
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
