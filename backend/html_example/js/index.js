class WordList {
	#wordList = [
		// {
		// 	id: 0
		// 	, word: ""
		// }
	];
	#lastId = 0;

	addWord() {
		if($("#addWord").val() == "" || this.#wordList.findIndex(word => word.word == $("#addWord").val()) != -1) {	//추가할려는 단어가 이미 wordList에 있는지 검사
			console.log("이미 목록에 있는 단어입니다.");
			$("#addWord").val("");
			return;
		}
		let newId;
		if(this.#wordList.length == 0) {	//마스킹 목록 개수가 0일 경우
			newId = this.#lastId + 1;	//마지막 id + 1
		} else {
			newId = this.#wordList.reduce((max, word) => (max < word.id) ? word.id : max, 0) + 1;	//누적값 max는 0, max보다 wordList의 id값이 더 크면, max는 해당 id 값을 가짐, 순회 종료 후, max+1의 값을 newId에 넣음
		}
		this.#lastId = newId;	//마지막 id 기억
		let newWord = {	//단어 객체 생성
			id: newId	//새로 만든 id 넣음
			, word: $("#addWord").val()	//추가할 단어 가져옴
		};
		this.#wordList.push(newWord);	//wordList에 새 단어 넣음
		$("#addWord").val("");	//추가할 단어가 들어있던 input 초기화
		$("#addWordContainer").before(this.printWord(newWord));	//마스킹 단어 목록에 단어 추가, 단어 추가 input과 butotn 앞에 추가
	}

	printWord(newWord) {
		let html = `
<li class="list-group-item d-flex justify-content-between align-items-center">
	<div class="form-check">
		<input class="form-check-input" type="checkbox" value="" id="maskingWord${newWord.id}" />
		<label class="form-check-label" for="maskingWord${newWord.id}">${newWord.word}</label>
	</div>
	<span class="badge rounded-pill">
		<button type="button" class="btn btn-outline-primary btn-rename">이름변경</button>
		<button type="button" class="btn btn-outline-secondary btn-del">삭제</button>
	</span>
</li>
`;
		return html;
	}

	renameWord(id, text, element) {
		if($("#renameBox").val() == undefined) {	//처음 이름변경 버튼 누름
			let html = `
<div>
	<fieldset>
		<input class="form-control" id="renameBox" type="text" placeholder="변경할 이름" value=${text.text()} />
	</fieldset>
</div>
`;
			element.text("");
			element.append(html);	//변경할 이름을 입력할 텍스트 박스 생성
		} else {	//입력 텍스트 박스에 변경할 이름을 입력 후, 이름 변경 버튼 누름
			let numId = id.replace(/[^0-9]/g, "");	//id에서 숫자만 가져옴
			let index = this.#wordList.findIndex(word => word.id == numId);	//해당 id가 있는 index 가져옴
			element.text($("#renameBox").val());	//입력 텍스트 박스 값을 가져와서, 리스트의 텍스트로 지정
			$("#renameBox").remove();	//입력 텍스트 박스 없앰
			this.#wordList[index].word = element.text();	//wordList에 변경한 텍스트 입력
		}
	}

	delWord(id, text, element) {
		element.remove();	//요소를 목록에서 삭제
		this.#wordList = this.#wordList.filter(word => word.word != text && word.id != id);	//마스킹 목록에서 단어 삭제
	}
}

$(() => {
	let wordList = new WordList();

	$("#formFile").change((e) => {	//파일 선택
		e.preventDefault();
		const file = e.currentTarget.files[0];	//파일 가져옴 (1개, 최초로 선택된 파일)
		if(file == undefined) {	//파일 업로드 안됨
			$("#imgPreviewContainer").css("display", "none");	//이미지 프리뷰 숨김
			$("#imgPreview").removeAttr("src");	//이미지 경로 제거
			$("#downloadBtn").removeAttr("href");	//이미지 다운로드 경로 제거
			$("#downloadBtn").removeAttr("download");	//이미지 이름 제거
			$(".btn-download").css("display", "none");	//이미지 다운로드 버튼 숨김
			return;
		}
		let url = URL.createObjectURL(file);	//이미지 경로 생성
		$("#imgPreview").attr("src", url);	//이미지 경로 지정
		$("#imgPreviewContainer").css("display", "block");	//이미지 프리뷰 보임
		$("#downloadBtn").attr("href", url);	//이미지 다운로드 경로 지정
		$("#downloadBtn").attr("download", file.name);	//이미지 다운로드 시, 업로드한 이미지 이름으로 다운로드하도록 지정
		$(".btn-download").css("display", "inline-block");	//이미지 다운로드 버튼 보임
	});

	$("#addWordBtn").click((e) => {	//단어 추가 버튼 클릭
		e.preventDefault();
		wordList.addWord();
	});

	$(document).on("click", ".btn-rename", function(e) {	//현재 문서의 btn-rename 클래스를 가진 요소에 click 이벤트 부여
		e.preventDefault();
		let text = $(e.currentTarget).parent().parent().children().first().children().last();
		let id = $(e.currentTarget).parent().parent().children().first().children().first().attr("id");
		let element = $(e.currentTarget).parent().parent().children().first().children().last();
		wordList.renameWord(id, text, element);
	});

	$(document).on("click", ".btn-del", function(e) {	//현재 문서의 btn-del 클래스를 가진 요소에 click 이벤트 부여
		e.preventDefault();
		let element = $(e.currentTarget).parent().parent();
		let text = $(e.currentTarget).parent().parent().children().first().children().last();
		let id = $(e.currentTarget).parent().parent().children().first().children().first().attr("id").replace(/[^0-9]/g, '');
		wordList.delWord(id, text, element);
	});
});







/*
	$(document).on("click", "tr", function (e) {
		e.preventDefault();
		let id = $(e.currentTarget).children().first().text() * 1;
		page.printOneGame(id);
		$('html, body').animate({ scrollTop: 0 }, 100, 'linear');
	});
*/