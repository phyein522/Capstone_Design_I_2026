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
        $("#maskedPreview").attr("src", "");
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

    $.ajax({
        url: "/api/marskingimg",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(requestData), // JSON 문자열로 변환
    }).done(function(data, textStatus, jqXHR) {
        console.log("maskingImg 성공:", data);
        changePreView(data.data.image)
        printImg();
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("maskingImg 실패:", textStatus);
        $("#maskedPreview").attr("src", "");
    }).always(function() {
        console.log("maskingImg 완료");
    });
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

    $.ajax({
        url: "/api/printimg",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(requestData), // JSON 문자열로 변환
    }).done(function(data, textStatus, jqXHR) {
        console.log("printImg 성공:", data);
        setDownloadHref(data.data.image)
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("printImg 실패:", textStatus);
        $("#maskedPreview").attr("src", "");
    }).always(function() {
        console.log("printImg 완료");
    });
}

function changePreView(image) {
    $("#maskedPreview").attr("src", image);
}

function setDownloadHref(image) {
    $("#downloadBtn").attr("href", image);
}

$(() => {
    $("#runBtn").click((e) => {
        e.preventDefault();
        postImg();
    });

    $(document).on("change", ".aero-check", function (e) {
        e.preventDefault();
        maskingImg();
    });
});