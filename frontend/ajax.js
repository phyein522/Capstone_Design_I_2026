function postImg() {
    let base64String = $("#imgPreview").attr("src");    //이미지 가져옴

    let requestData = {
        "image": base64String
    };  //요청 JSON

    $.ajax({
        url: "/api/postimg",    //요청 경로
        type: "POST",   //요청 방식
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(requestData), // JSON 문자열로 변환
    }).done(function(data, textStatus, jqXHR) {
        console.log("postImg 성공:", data);
        updateMaskingList(data.data);
        maskingImg();
        printImg();     // 추가
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("postImg 실패:", textStatus);
        maskingImg();
        printImg();
    }).always(function() {
        console.log("postImg 완료");
    });
}

function maskingImg() {
    let list = $("#maskingList").children();
    let positionList = [];
    list.filter(".masking-item").each(function() {
        const li = $(this);
        const coords = li.find(".hidden-coords input");
        const isChecked = li.find(".aero-check").is(":checked");
        positionList.push({
            x1: parseFloat(coords.eq(0).val()) || 0
            , y1: parseFloat(coords.eq(1).val()) || 0
            , x2: parseFloat(coords.eq(2).val()) || 0
            , y2: parseFloat(coords.eq(3).val()) || 0
            , type: coords.eq(4).val()
            , content: coords.eq(5).val()
            , isChecked: isChecked
        });
    });

    //frontend에서 마스킹 처리+마스킹 가능 위치 표시하는 코드
    //(원본 이미지(#imgPreview)와 positionList의 좌표와 isChecked 이용, isChecked가 true면 마스킹, false면 사각형으로 표시)
    const srcImg = new Image();
    srcImg.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = srcImg.naturalWidth;
        canvas.height = srcImg.naturalHeight;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(srcImg, 0, 0);

        positionList.forEach(pos => {
            const x = pos.x1, y = pos.y1;
            const w = pos.x2 - pos.x1, h = pos.y2 - pos.y1;

            if (pos.isChecked) {
                // 마스킹 선택됨 → 검정 박스로 채움
                ctx.fillStyle = "black";
                ctx.fillRect(x, y, w, h);
            } else {
                // 마스킹 미선택 → 감지 위치만 테두리로 표시
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);
            }
        });

        changePreView(canvas.toDataURL("image/png"));
    };
    srcImg.src = $("#imgPreview").attr("src");
}

function printImg() {
    let list = $("#maskingList").children();
    let positionList = [];
    list.filter(".masking-item").each(function() {
        const li = $(this);
        const coords = li.find(".hidden-coords input");
        const isChecked = li.find(".aero-check").is(":checked");
        positionList.push({
            x1: parseFloat(coords.eq(0).val()) || 0
            , y1: parseFloat(coords.eq(1).val()) || 0
            , x2: parseFloat(coords.eq(2).val()) || 0
            , y2: parseFloat(coords.eq(3).val()) || 0
            , type: coords.eq(4).val()
            , content: coords.eq(5).val()
            , isChecked: isChecked
        });
    });

    //frontend에서 마스킹된 이미지 출력하는 코드
    // (원본 이미지(#imgPreview)와 positionList를 이용해, isChecked가 true인 곳만 마스킹 해서, 이미지 반환)
    const srcImg = new Image();
    srcImg.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = srcImg.naturalWidth;
        canvas.height = srcImg.naturalHeight;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(srcImg, 0, 0);

        positionList.forEach(pos => {
            if (pos.isChecked) {
                // 마스킹 선택된 곳만 검정 박스로 채움
                ctx.fillStyle = "black";
                ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
            }
            // unchecked는 아무것도 그리지 않음
        });

        const maskedDataUrl = canvas.toDataURL("image/png");
        setDownloadHref(maskedDataUrl);

        // 100% + 완료 표시 후 진행바 유지, 다운로드 버튼 표시
        $("#progressFill").css("width", "100%");
        $("#progressLabel").text("완료✅ 100%");
        $("#downloadArea").css("display", "flex");
        $("#runBtn").prop("disabled", false);
    };
    srcImg.src = $("#imgPreview").attr("src");
}

function changePreView(image) {
    $("#maskedPreview").attr("src", image);
}

function setDownloadHref(image) {
    $("#downloadBtn").attr("href", image);
}

$(() => {
    // 마스킹 시작 버튼 - app.js의 startMasking() 대신 postImg() 직접 호출
    $("#runBtn").off("click").on("click", function(e) {
        e.preventDefault();
        const progWrap = document.getElementById('progressWrap');
        const progFill = document.getElementById('progressFill');
        const progLbl  = document.getElementById('progressLabel');

        $("#runBtn").prop("disabled", true);
        progFill.style.width = '0%';
        progLbl.textContent = '처리 중...';
        progWrap.classList.add('show');

        // 진행바 애니메이션 후 실제 API 호출
        const steps = [
            { w: 18,  msg: '이미지 분석 중...' },
            { w: 42,  msg: '얼굴 감지 중...' },
            { w: 67,  msg: 'OCR 텍스트 인식 중...' },
            { w: 88,  msg: '마스킹 좌표 계산 중...' },
        ];
        let idx = 0;
        function tick() {
            if (idx >= steps.length) {
                progFill.style.width = '95%';
                progLbl.textContent  = '서버 처리 중... 95%';
                postImg();
                return;
            }
            const s = steps[idx++];
            progFill.style.width = s.w + '%';
            progLbl.textContent  = s.msg + ' ' + s.w + '%';
            setTimeout(tick, 320 + Math.random() * 280);
        }
        tick();
    });

    // 체크박스 변경 시 재마스킹
    $(document).on("change", ".aero-check", function(e) {
        e.preventDefault();
        maskingImg();
        printImg();     // 추가
    });
});
