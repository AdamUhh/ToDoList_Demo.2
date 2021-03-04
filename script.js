// new Litepicker({
//     element: document.getElementById('myDatepicker'),
//     singleMode: false,
//     tooltipText: {
//       one: 'day',
//       other: 'days'
//     },
//     tooltipNumber: (totalDays) => {
//       return totalDays - 1;
//     }
// })

flatpickr("#myDatepicker", {
    mode: "range",
});

document.getElementsByClassName("EDIT__btn_exit")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__padding")[0].style.display = "none";
    document.getElementsByClassName("MAIN__padding")[0].style.display = "block";
});

document.getElementsByClassName("btn_add_card")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__padding")[0].style.display = "block";
    document.getElementsByClassName("MAIN__padding")[0].style.display = "none";
});

document.getElementsByClassName("PANEL__btn_add_task")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__padding")[0].style.display = "block";
    document.getElementsByClassName("EDIT__ask_add_task")[0].style.display = "none";
    document.getElementsByClassName("MAIN__padding")[0].style.display = "none";
});
