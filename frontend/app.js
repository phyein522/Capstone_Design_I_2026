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

// startMasking(): ajax.js의 #runBtn click 핸들러가 대신 처리함
function startMasking() {}

//  마스킹 항목 목록 재구성 
// content 중복 제거 후 항목 추가
function updateMaskingList(results) {
  const list      = document.getElementById('maskingList');
  const container = document.getElementById('addWordContainer');

  // 서버 결과 항목만 제거 (사용자가 직접 추가한 항목은 보존)
  list.querySelectorAll('.masking-item[data-source="server"]').forEach(el => el.remove());

  const seen = new Set();

  results.forEach((item, i) => {
    if (seen.has(item.content)) return;
    seen.add(item.content);

    const uid = `json-${Date.now()}-${i}`;
    const li = createMaskingItem(uid, item.x1, item.y1, item.x2, item.y2, item.type, item.content, true);
    li.dataset.source = 'server';  // 서버 항목 표시
    list.insertBefore(li, container);
  });

  renderResults(results);
}

//  마스킹 항목 li 생성
function createMaskingItem(uid, x1, y1, x2, y2, type, content, checked) {
  const li = document.createElement('li');
  li.className = 'masking-item';
  li.innerHTML = `
    <div class="hidden-coords" style="display:none;">
      <input type="hidden" value="${x1}" />
      <input type="hidden" value="${y1}" />
      <input type="hidden" value="${x2}" />
      <input type="hidden" value="${y2}" />
      <input type="hidden" value="${type}" />
      <input type="hidden" value="${content}" />
    </div>
    <div class="masking-item-main">
      <div class="masking-item-left">
        <input class="aero-check" type="checkbox"
          id="chk-${uid}" value="${content}" ${checked ? 'checked' : ''}>
        <label class="masking-item-label" for="chk-${uid}">${content}</label>
      </div>
      <div style="display:flex; gap:5px;">
        <button class="btn-aero btn-aero-ghost btn-sm-aero"
          onclick="toggleEditItem(this)">수정</button>
        <button class="btn-aero btn-aero-danger btn-sm-aero"
          onclick="deleteItem(this)">삭제</button>
      </div>
    </div>
    <div class="masking-item-edit" style="display:none;">
      <div class="coord-grid">
        <label>x1: <input class="aero-input coord-input" type="number" value="${x1}" data-coord="x1"></label>
        <label>y1: <input class="aero-input coord-input" type="number" value="${y1}" data-coord="y1"></label>
        <label>x2: <input class="aero-input coord-input" type="number" value="${x2}" data-coord="x2"></label>
        <label>y2: <input class="aero-input coord-input" type="number" value="${y2}" data-coord="y2"></label>
      </div>
      <div class="coord-grid" style="margin-top:6px;">
        <label style="display:flex;align-items:center;gap:5px;">
          <input class="aero-radio" type="radio" name="type-${uid}" value="text" ${type !== 'face' ? 'checked' : ''}> 텍스트
        </label>
        <label style="display:flex;align-items:center;gap:5px;">
          <input class="aero-radio" type="radio" name="type-${uid}" value="face" ${type === 'face' ? 'checked' : ''}> 얼굴
        </label>
      </div>
      <div style="margin-top:6px;">
        <label style="font-size:12px;color:var(--sky-dark);">content:
          <input class="aero-input" type="text" value="${content}" data-coord="content" style="margin-top:4px;width:100%;">
        </label>
      </div>
    </div>
  `;
  return li;
}

// 수정 버튼 토글
function toggleEditItem(btn) {
  const li   = btn.closest('.masking-item');
  const edit = li.querySelector('.masking-item-edit');
  const hidden = li.querySelector('.hidden-coords');
  const label  = li.querySelector('.masking-item-label');
  const checkbox = li.querySelector('.aero-check');

  const isOpen = edit.style.display !== 'none';

  if (isOpen) {
    // 저장: edit 필드 → hidden inputs 반영
    const inputs = hidden.querySelectorAll('input');
    inputs[0].value = li.querySelector('[data-coord="x1"]').value;
    inputs[1].value = li.querySelector('[data-coord="y1"]').value;
    inputs[2].value = li.querySelector('[data-coord="x2"]').value;
    inputs[3].value = li.querySelector('[data-coord="y2"]').value;
    const typeRadio = li.querySelector('.aero-radio:checked');
    inputs[4].value = typeRadio ? typeRadio.value : 'text';
    const newContent = li.querySelector('[data-coord="content"]').value.trim();
    if (newContent) {
      inputs[5].value = newContent;
      label.textContent = newContent;
      checkbox.value = newContent;
    }
    edit.style.display = 'none';
    btn.textContent = '수정';
  } else {
    edit.style.display = 'block';
    btn.textContent = '저장';
  }
}

// 항목 삭제
function deleteItem(btn) {
  btn.closest('.masking-item').remove();
}

// 감지 결과 렌더링 - 얼굴/텍스트 타입별 요약
function renderResults(results) {
  const list  = document.getElementById('resultList');
  const empty = document.getElementById('resultEmpty');
  const count = document.getElementById('resultCount');
  const summary = document.getElementById('resultSummary');

  count.textContent = `${results.length}개`;
  if (summary) summary.style.display = 'none';

  if (!results.length) {
    empty.style.display = 'block';
    list.style.display  = 'none';
    return;
  }

  // type별 개수 집계
  let faceCount = 0;
  let textCount = 0;
  results.forEach(item => {
    if (item.type === 'face') faceCount++;
    else textCount++;
  });

  list.innerHTML = '';

  if (faceCount > 0) {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.dataset.type = 'face';
    li.innerHTML = `
      <div class="result-item-left">
        <span class="result-content-label">얼굴</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="result-item-count type-badge face">${faceCount}개</span>
      </div>
    `;
    list.appendChild(li);
  }

  if (textCount > 0) {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.dataset.type = 'text';
    li.innerHTML = `
      <div class="result-item-left">
        <span class="result-content-label">텍스트</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="result-item-count type-badge text">${textCount}개</span>
      </div>
    `;
    list.appendChild(li);
  }

  empty.style.display = 'none';
  list.style.display  = 'flex';
}

// 위치 직접 추가
function addMaskPosition() {
  const nameInput = document.getElementById('addWord');
  const x1Input   = document.getElementById('addX1');
  const y1Input   = document.getElementById('addY1');
  const x2Input   = document.getElementById('addX2');
  const y2Input   = document.getElementById('addY2');
  const typeRadio = document.querySelector('input[name="addType"]:checked');

  const name = nameInput.value.trim();
  const x1   = x1Input.value.trim();
  const y1   = y1Input.value.trim();
  const x2   = x2Input.value.trim();
  const y2   = y2Input.value.trim();
  const type = typeRadio ? typeRadio.value : 'text';

  if (!name) { nameInput.focus(); return; }

  const list      = document.getElementById('maskingList');
  const container = document.getElementById('addWordContainer');
  const uid       = Date.now();

  const li = createMaskingItem(uid, x1, y1, x2, y2, type, name, true);
  li.dataset.source = 'user';  // 사용자 추가 항목 표시
  list.insertBefore(li, container);

  nameInput.value = '';
  x1Input.value = '';
  y1Input.value = '';
  x2Input.value = '';
  y2Input.value = '';
  nameInput.focus();
}

// Enter 키로 추가
document.getElementById('addWord').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addMaskPosition(); }
});
