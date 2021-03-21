window.onload = function () {
    flatpickr("#myDatepicker", {
        mode: "range",
    });
};

var taskAdded = false;

// * For Navigation
// User opens the navigation menu (on phone in MAIN)
document.getElementsByClassName("btn_open_nav")[0].addEventListener("click", function () {
    document.getElementsByClassName("column box")[0].style.display = "none";
    document.getElementsByClassName("column")[0].style.display = "none";
    document.getElementsByClassName("one_quarter")[0].style.display = "block";

});

// * Exit Stuff
// User exits the Nav screen
document.getElementsByClassName("MENU__btn_exit")[0].addEventListener("click", function () {
    document.getElementsByClassName("column box")[0].style.display = "block";
    document.getElementsByClassName("column")[0].style.display = "block";
    if (window.innerWidth < 1100) {
        document.getElementsByClassName("one_quarter")[0].style.display = "none";
    } else {
        console.log(window.innerWidth)
    }
});

// User exits the EDIT screen
document.getElementsByClassName("EDIT__btn_exit")[0].addEventListener("click", function () {

    document.getElementsByClassName("MAIN__padding")[0].style.display = "block";
    document.getElementsByClassName("EDIT__padding")[0].style.display = "none";
    document.getElementsByClassName("EDIT__ask_add_task")[0].style.display = "none";
    document.getElementsByClassName("EDIT__confirm_left")[0].style.display = "none";
    document.getElementsByClassName("EDIT__confirm_right")[0].style.display = "none";
    document.getElementsByClassName("EDIT__task_container")[0].style.display = "none";
    document.getElementsByClassName("EDIT__btn_go_back_wrapper")[0].style.display = "none";
    document.getElementsByClassName("EDIT__select_task_container")[0].style.display = "none";

    //Removes text (and child elements) of
    document.getElementById("getm").value = "";
    document.getElementById("viewer").value = "";
    document.getElementById("buffer").value = "";
    document.getElementById("viewer").innerHTML = "";
    document.getElementById("buffer").innerHTML = "";
});





// * Add Stuff
// User adds a card (from MAIN titlebar)
document.getElementsByClassName("btn_add_card")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__padding")[0].style.display = "block";
    document.getElementsByClassName("EDIT__ask_add_task")[0].style.display = "block";
    document.getElementsByClassName("MAIN__padding")[0].style.display = "none";
});

// User adds a task (from card in MAIN PANEL)
document.querySelectorAll(".PANEL__btn_add_task").forEach((obj) => {
    obj.addEventListener("click", (event) => {
        document.getElementsByClassName("EDIT__padding")[0].style.display = "block";
        document.getElementsByClassName("EDIT__ask_add_task")[0].style.display = "none";
        document.getElementsByClassName("EDIT__task_container")[0].style.display = "block";
        document.getElementsByClassName("EDIT__confirm_right")[0].style.display = "inline-flex";
        document.getElementsByClassName("MAIN__padding")[0].style.display = "none";
    });
});

// User adds a task after being asked (inside add card EDIT screen)
document.getElementsByClassName("EDIT__btn_ask_add_task")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__ask_add_task")[0].style.display = "none";
    document.getElementsByClassName("EDIT__task_container")[0].style.display = "block";
    document.getElementsByClassName("EDIT__confirm_right")[0].style.display = "inline-flex";

    taskAdded = true;
});



// * Delete Stuff
// User deletes a card (from MAIN titlebar)
document.querySelectorAll(".PANEL__btn_delete_card").forEach((obj) => {
    obj.addEventListener("click", (event) => {
        var c = obj.parentNode.parentNode.parentNode.parentNode;

        //delete animation
        c.animate(
            [
                // keyframes
                { opacity: ".5" },
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
});

// User deletes a task (from MAIN titlebar)
document.querySelectorAll(".PANEL__btn_delete_task").forEach((obj) => {
    obj.addEventListener("click", (event) => {
        var t = obj.parentNode.parentNode;
        //delete animation
        t.animate(
            [
                // keyframes
                { opacity: ".5", transform: "scale(1)" },
                { opacity: "0", transform: "scale(.5)" },
            ],

            {
                // timing options
                duration: 500,
            }
        );

        // Timeout to delete until animation complete
        setTimeout(function () {
            t.remove();
        }, 500);
    });
});



// * Edit Stuff
// User edits a card (from MAIN titlebar)
document.getElementsByClassName("PANEL__btn_edit_card")[0].addEventListener("click", function () {
    document.getElementsByClassName("EDIT__padding")[0].style.display = "block";
    document.getElementsByClassName("MAIN__padding")[0].style.display = "none";
    document.getElementsByClassName("EDIT__confirm_left")[0].style.display = "inline-flex";
    document.getElementsByClassName("EDIT__btn_go_back_wrapper")[0].style.display = "block";
    document.getElementsByClassName("EDIT__select_task_container")[0].style.display = "block";
});




