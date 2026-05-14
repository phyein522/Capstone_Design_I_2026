// 네비 활성 탭 - 스크롤 위치에 따라 자동 변경
const navLinks = document.querySelectorAll(’.navbar-nav .nav-link’);
const sections = document.querySelectorAll(‘section[id]’);

const observer = new IntersectionObserver(entries => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const id = entry.target.id;
navLinks.forEach(l => l.classList.remove(‘active’));
const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
if (activeLink) activeLink.classList.add(‘active’);
}
});
}, {
threshold: 0.3,
rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--nav-height')} 0px 0px 0px`
});

sections.forEach(s => observer.observe(s));

// 드래그 앤 드롭
const uploadZone = document.getElementById(‘uploadZone’);

uploadZone.addEventListener(‘dragover’, e => {
e.preventDefault();
uploadZone.classList.add(‘drag-over’);
});

uploadZone.addEventListener(‘dragleave’, () => {
uploadZone.classList.remove(‘drag-over’);
});

uploadZone.addEventListener(‘drop’, e => {
e.preventDefault();
uploadZone.classList.remove(‘drag-over’);
const file = e.dataTransfer.files[0];
if (file && file.type.startsWith(‘image/’)) loadImage(file);
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

```
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
```

};

reader.readAsDataURL(file);
}

// startMasking(): ajax.js의 #runBtn click 핸들러가 대신 처리함
function startMasking() {}

// 마스킹 항목 선택 목록 재구성
// - 고정 항목 없음: 기존 동적 항목 전부 제거 후 새로 추가
// - 중복 content는 건너뜀
function updateMaskingList(results) {
const list      = document.getElementById(‘maskingList’);
const container = document.getElementById(‘addWordContainer’);

// 기존 동적 항목 모두 제거
list.querySelectorAll(’.masking-item’).forEach(el => el.remove());

// content 중복 체크용
const seen = new Set();

results.forEach((item, i) => {
if (seen.has(item.content)) return;
seen.add(item.content);

```
const uid = `json-${Date.now()}-${i}`;
const li  = document.createElement('li');
li.className = 'masking-item';
li.innerHTML = `
  <div class="hidden-coords" style="display:none;">
    <input type="hidden" value="${item.x1}" />
    <input type="hidden" value="${item.y1}" />
    <input type="hidden" value="${item.x2}" />
    <input type="hidden" value="${item.y2}" />
    <input type="hidden" value="${item.type}" />
    <input type="hidden" value="${item.content}" />
  </div>
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
```

});

// 감지 결과 카드 렌더링
renderResults(results);
}

// 감지 결과 카드 렌더링 - 체크박스 없이 텍스트+뱃지만 표시
function renderResults(results) {
const list  = document.getElementById(‘resultList’);
const empty = document.getElementById(‘resultEmpty’);
const count = document.getElementById(‘resultCount’);
const summary = document.getElementById(‘resultSummary’);

count.textContent = `${results.length}개`;
if (summary) summary.style.display = ‘none’;

if (!results.length) {
empty.style.display = ‘block’;
list.style.display  = ‘none’;
return;
}

// content별 개수 집계
const countMap = {};
const typeMap  = {};
results.forEach(item => {
countMap[item.content] = (countMap[item.content] || 0) + 1;
typeMap[item.content]  = item.type;
});

list.innerHTML = ‘’;

// content별로 한 행씩 렌더링 (체크박스 없음)
const rendered = new Set();
results.forEach((item, i) => {
if (rendered.has(item.content)) return;
rendered.add(item.content);

```
const n  = countMap[item.content];
const li = document.createElement('li');
li.className    = 'result-item';
li.dataset.type = item.type;

li.innerHTML = `
  <div class="result-item-left">
    <span class="result-content-label">${item.content}</span>
  </div>
  <div style="display:flex; align-items:center; gap:8px;">
    <span class="result-item-count">${n}개</span>
    <span class="type-badge ${item.type}">
      ${item.type === 'face' ? '얼굴' : '텍스트'}
    </span>
  </div>
`;

list.appendChild(li);
```

});

empty.style.display = ‘none’;
list.style.display  = ‘flex’;
}

// 항목 이름변경
function renameItem(btn) {
const label = btn.closest(’.masking-item’).querySelector(’.masking-item-label’);
const name  = prompt(‘새 이름:’, label.textContent.trim());
if (name && name.trim()) label.textContent = name.trim();
}

// 항목 삭제
function deleteItem(btn) {
btn.closest(’.masking-item’).remove();
}

// 단어 직접 추가
function addMaskWord() {
const input     = document.getElementById(‘addWord’);
const word      = input.value.trim();
const list      = document.getElementById(‘maskingList’);
const container = document.getElementById(‘addWordContainer’);

if (!word) return;

const uid = Date.now();
const li  = document.createElement(‘li’);
li.className = ‘masking-item’;
li.innerHTML = `<div class="hidden-coords" style="display:none;"> <input type="hidden" value="" /> <input type="hidden" value="" /> <input type="hidden" value="" /> <input type="hidden" value="" /> <input type="hidden" value="text" /> <input type="hidden" value="${word}" /> </div> <div class="masking-item-left"> <input class="aero-check" type="checkbox" id="chk-${uid}" value="${word}" checked> <label class="masking-item-label" for="chk-${uid}">${word}</label> </div> <div style="display:flex; gap:5px;"> <button class="btn-aero btn-aero-ghost btn-sm-aero" onclick="renameItem(this)">이름변경</button> <button class="btn-aero btn-aero-danger btn-sm-aero" onclick="deleteItem(this)">삭제</button> </div>`;

list.insertBefore(li, container);
input.value = ‘’;
input.focus();
}

// Enter 키로 단어 추가
document.getElementById(‘addWord’).addEventListener(‘keydown’, e => {
if (e.key === ‘Enter’) { e.preventDefault(); addMaskWord(); }
});
