window.onload = function () {
    flatpickr("#myDatepicker", {
        mode: "range",
    });
};

var taskAdded = false;

// User closes the EDIT screen
document.getElementsByClassName("EDIT__btn_exit")[0].addEventListener("click", function () {
    document.getElementsByClassName("MAIN__padding")[0].style.display = "block";
    document.getElementsByClassName("EDIT__padding")[0].style.display = "none";
    document.getElementsByClassName("EDIT__ask_add_task")[0].style.display = "none";
    document.getElementsByClassName("EDIT__confirm_left")[0].style.display = "none";
    document.getElementsByClassName("EDIT__confirm_right")[0].style.display = "none";
    document.getElementsByClassName("EDIT__task_container")[0].style.display = "none";


    //Removes text (and child elements) of
    document.getElementById("getm").value = "";
    document.getElementById("viewer").value = "";
    document.getElementById("buffer").value = "";
    document.getElementById("viewer").innerHTML = "";
    document.getElementById("buffer").innerHTML = "";
});

// User adds a card (from MAIN titlebar)
document.getElementsByClassName("btn_add_card")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__padding")[0].style.display = "block";
    document.getElementsByClassName("EDIT__ask_add_task")[0].style.display = "block";
    document.getElementsByClassName("MAIN__padding")[0].style.display = "none";
});

// User deletes a card (from MAIN titlebar)
document.getElementsByClassName("PANEL__btn_delete_card")[0].addEventListener("click", function () {
    var c = this.parentNode.parentNode.parentNode.parentNode;

    //delete animation
    c.animate(
        [
            // keyframes
            { opacity: "0" },
        ],
        {
            // timing options
            duration: 500,
        }
    );

    // Timeout to delete until animation complete
    setTimeout(function () {
        c.remove();
    }, 500);
});

// User edits a card (from MAIN titlebar)
document.getElementsByClassName("PANEL__btn_edit_card")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__padding")[0].style.display = "block";
    document.getElementsByClassName("MAIN__padding")[0].style.display = "none";
    document.getElementsByClassName("EDIT__confirm_left")[0].style.display = "inline-flex";

});

// User deletes a card (from MAIN titlebar)
document.getElementsByClassName("PANEL__btn_delete_task")[0].addEventListener("click", function () {
    var t = this.parentNode.parentNode;
    //delete animation
    t.animate(
        [
            // keyframes
            { padding: "0px", opacity: ".5"},
        ],
        {
            // timing options
            duration: 1000,
        }
    );

    // Timeout to delete until animation complete
    setTimeout(function () {
        t.remove();
    }, 1000);
});

// User adds a task (from card in MAIN PANEL)
document.getElementsByClassName("PANEL__btn_add_task")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__padding")[0].style.display = "block";
    document.getElementsByClassName("EDIT__ask_add_task")[0].style.display = "none";
    document.getElementsByClassName("EDIT__task_container")[0].style.display = "block";
    document.getElementsByClassName("EDIT__confirm_right")[0].style.display = "inline-flex";
    document.getElementsByClassName("MAIN__padding")[0].style.display = "none";
});

// User adds a task after being asked (inside add card EDIT screen)
document.getElementsByClassName("EDIT__btn_ask_add_task")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__ask_add_task")[0].style.display = "none";
    document.getElementsByClassName("EDIT__task_container")[0].style.display = "block";
    document.getElementsByClassName("EDIT__confirm_right")[0].style.display = "inline-flex";

    taskAdded = true;
});
