function postImg() {
    let base64String = $("#imgPreview").attr("src");

    let requestData = {
        "image": base64String
    };

    $.ajax({
        url: "/api/postimg",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(requestData), // JSON 문자열로 변환
    }).done(function(data, textStatus, jqXHR) {
        console.log("postImg 성공:", data);
        updateMaskingList(data.data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("postImg 실패:", textStatus);
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
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("maskingImg 실패:", textStatus);
    }).always(function() {
        console.log("maskingImg 완료");
    });
}

function changePreView(image) {
    $("#maskedPreview").attr("src", image);
}