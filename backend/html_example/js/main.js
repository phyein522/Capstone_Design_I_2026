$(".dropdown-toggle").click(() => {
	$(".dropdown-toggle").toggleClass("show");
	let aria_expanded = $(".dropdown-toggle").attr("aria-expanded");
	switch(aria_expanded) {
		case "false":
			$(".dropdown-toggle").attr("aria-expanded", "true");
			break;
		case "true":
			$(".dropdown-toggle").attr("aria-expanded", "false");
			break;
	}
	$(".dropdown-menu").toggleClass("show");
	let data_bs_popper = $(".dropdown-menu").attr("data-bs-popper");
	switch(data_bs_popper) {
		case undefined:
			$(".dropdown-menu").attr("data-bs-popper", "static");
			break;
		case "static":
			$(".dropdown-menu").removeAttr("data-bs-popper");
			break;
	}
});

$(".navbar-toggler").click(() => {
	$(".navbar-toggler").toggleClass("collapsed");
	let aria_expanded = $(".navbar-toggler").attr("aria-expanded");
	switch(aria_expanded) {
		case "false":
			$(".navbar-toggler").attr("aria-expanded", "true");
			break;
		case "true":
			$(".navbar-toggler").attr("aria-expanded", "false");
			break;
	}
	$(".navbar-collapse").toggleClass("show");
});