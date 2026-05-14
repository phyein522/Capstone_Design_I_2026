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
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("postImg 실패:", textStatus);
        // 실패해도 이미지 유지
    }).always(function() {
        console.log("postImg 완료");
    });
}

function maskingImg() {
    let list = $("#maskingList").children();
    let positionList = [];
    for(let i = 0; i < list.length - 1; i++) {
        let li = list.eq(i).children();
        let data = li.first().children();
        let liIsChecked = li.eq(1).children().first().is(':checked');
        let json = {
            x1: data.eq(0).val()
            , y1: data.eq(1).val()
            , x2: data.eq(2).val()
            , y2: data.eq(3).val()
            , type: data.eq(4).val()
            , content: data.eq(5).val()
            , isChecked: liIsChecked
        };
        positionList.push(json);
    }
    let requestData = {
        image: $("#imgPreview").attr("src")
        , positions: positionList
    };
    console.log("요청:", requestData);

    //frontend에서 마스킹 처리+마스킹 가능 위치 표시하는 코드
    //(원본 이미지(#imgPreview)와 positionList의 좌표와 isChecked 이용, isChecked가 true면 마스킹, false면 사각형으로 표시)
    /*
    $.ajax({
        url: "/api/marskingimg",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(requestData), // JSON 문자열로 변환
    }).done(function(data, textStatus, jqXHR) {
        console.log("maskingImg 성공:", data);
        changePreView(data.data.image);
        printImg();
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("maskingImg 실패:", textStatus);
        // 실패해도 이미지 유지
    }).always(function() {
        console.log("maskingImg 완료");
    });
    */
}

function printImg() {
    let list = $("#maskingList").children();
    let positionList = [];
    for(let i = 0; i < list.length - 1; i++) {
        let li = list.eq(i).children();
        let data = li.first().children();
        let liIsChecked = li.eq(1).children().first().is(':checked');
        let json = {
            x1: data.eq(0).val()
            , y1: data.eq(1).val()
            , x2: data.eq(2).val()
            , y2: data.eq(3).val()
            , type: data.eq(4).val()
            , content: data.eq(5).val()
            , isChecked: liIsChecked
        };
        positionList.push(json);
    }
    let requestData = {
        image: $("#imgPreview").attr("src")
        , positions: positionList
    };
    console.log("요청:", requestData);

    //frontend에서 마스킹된 이미지 출력하는 코드
    // (원본 이미지(#imgPreview)와 positionList를 이용해, isChecked가 true인 곳만 마스킹 해서, 이미지 반환)
    /*
    $.ajax({
        url: "/api/printimg",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(requestData), // JSON 문자열로 변환
    }).done(function(data, textStatus, jqXHR) {
        console.log("printImg 성공:", data);
        setDownloadHref(data.data.image);

        // 다운로드 버튼 표시 + 진행바 숨김 + 버튼 활성화
        $("#progressWrap").removeClass("show");
        $("#downloadArea").css("display", "flex");
        $("#runBtn").prop("disabled", false);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("printImg 실패:", textStatus);
        // 실패해도 이미지 유지
        $("#runBtn").prop("disabled", false);
    }).always(function() {
        console.log("printImg 완료");
    });
    */
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
    });
});
