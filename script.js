window.onload = function () {
    flatpickr("#myDatepicker", {
        mode: "range",
    });
};

var isTaskAdded = false;

// * For Navigation
// User opens the navigation menu (on phone in MAIN)
document.querySelector(".btn_open_nav").addEventListener("click", function () {
    document.querySelector(".column.box").style.display = "none";
    document.querySelector(".column").style.display = "none";
    document.querySelector(".one_quarter").style.display = "block";
    document.querySelector(".MENU__btn_exit_wrapper").style.display = "block";
});

// * Exit Stuff
// User exits the Nav screen
document.querySelector(".MENU__btn_exit").addEventListener("click", function () {
    document.querySelector(".column.box").style.display = "block";
    document.querySelector(".column").style.display = "block";
    if (window.innerWidth < 1100) {
        document.querySelector(".one_quarter").style.display = "none";
    } else if (window.innerWidth >= 1100 && document.querySelector(".MENU__btn_exit_wrapper").style.display == "block") document.querySelector(".one_quarter").style.display = "none";

    document.querySelector(".MENU__btn_exit_wrapper").style.display = "none";
});

// User exits the EDIT screen
document.querySelector(".EDIT__btn_exit").addEventListener("click", function () {
    document.querySelector(".MAIN__padding").style.display = "block";
    document.querySelector(".EDIT__padding").style.display = "none";
    document.querySelector(".EDIT__ask_add_task").style.display = "none";
    document.querySelector(".EDIT__confirm_left").style.display = "none";
    document.querySelector(".EDIT__confirm_right").style.display = "none";
    document.querySelector(".EDIT__task_container").style.display = "none";
    document.querySelector(".EDIT__btn_go_back_wrapper").style.display = "none";
    document.querySelector(".EDIT__select_task_container").style.display = "none";

    //Removes text (and child elements) of
    document.querySelector("#getm").value = "";
    document.querySelector("#viewer").value = "";
    document.querySelector("#buffer").value = "";
    document.querySelector("#viewer").innerHTML = "";
    document.querySelector("#buffer").innerHTML = "";

    isTaskAdded = false;
});

// User exits the GROUP container
document.querySelector(".GROUP__btn_exit").addEventListener("click", function () {
    document.querySelector(".GROUP__add_group_container").style.display = "none";
});

// * Add Stuff
// User adds a card (from MAIN titlebar)
document.querySelector(".btn_add_card").addEventListener("click", function () {
    document.querySelector(".EDIT__padding").style.display = "block";
    document.querySelector(".EDIT__ask_add_task").style.display = "block";
    document.querySelector(".MAIN__padding").style.display = "none";
});

// User adds a task (from card in MAIN PANEL)
document.querySelectorAll(".PANEL__btn_add_task").forEach((obj) => {
    obj.addEventListener("click", (event) => {
        document.querySelector(".EDIT__padding").style.display = "block";
        document.querySelector(".EDIT__ask_add_task").style.display = "none";
        document.querySelector(".EDIT__task_container").style.display = "block";
        document.querySelector(".EDIT__confirm_right").style.display = "inline-flex";
        document.querySelector(".MAIN__padding").style.display = "none";

        isTaskAdded = true;
    });
});

// User adds a task after being asked (inside add card EDIT screen)
document.querySelector(".EDIT__btn_ask_add_task").addEventListener("click", function () {
    document.querySelector(".EDIT__ask_add_task").style.display = "none";
    document.querySelector(".EDIT__task_container").style.display = "block";
    document.querySelector(".EDIT__confirm_right").style.display = "inline-flex";

    isTaskAdded = true;
});

// User adds a group (from MENU)
document.querySelector(".MENU__btn_add_group").addEventListener("click", function () {
    document.querySelector(".GROUP__add_group_container").style.display = "block";
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

document.querySelectorAll(".PANEL__btn_edit_card").forEach((obj) => {
    obj.addEventListener("click", (event) => {
        document.querySelector(".EDIT__padding").style.display = "block";
        document.querySelector(".MAIN__padding").style.display = "none";

        document.querySelector(".EDIT__select_task_container").style.display = "block";
    });
});

document.querySelectorAll(".EDIT__select_task_wrapper").forEach((obj) => {
    obj.addEventListener("click", (event) => {
        // console.log(obj.childNodes[1].textContent)
        // console.log(obj.childNodes[3].textContent)
        document.querySelector(".EDIT__confirm_left").style.display = "inline-flex";
        document.querySelector(".EDIT__btn_go_back_wrapper").style.display = "block";
    });
});

// ! Creation of elements - Groups, Cards, Tasks
let currentGroupTitle;
let currentCardTitle;
let currentTaskTitle;

// * Get Inputs

// Get Group Input
document.querySelector(".GROUP__btn_confirm").addEventListener("click", function () {
    let css_class = document.querySelector(".GROUP__add_group_wrapper");
    let groupTitle = css_class.querySelector("input");
    console.log(groupTitle.value);

    createGroup(groupTitle.value);

    // Hide GROUP Elements
    document.querySelector(".GROUP__add_group_container").style.display = "none";
});

// Get Card and Task Input
document.querySelector(".EDIT__btn_confirm").addEventListener("click", function () {
    let css_class = document.querySelector(".EDIT__padding");

    // Get Card Title
    let cardTitle = css_class.querySelector("input");
    console.log(cardTitle.value);

    createCard(cardTitle.value);

    // If there is a task/markdown element on the screen
    if (isTaskAdded) {
        // Get Task Title
        let css_class_task = document.querySelector(".EDIT__task_body");

        let taskTitle = css_class_task.querySelector("input");
        console.log(taskTitle.value);

        // Get Task Date
        let taskDate = css_class.querySelector("#myDatepicker");
        taskDate = taskDate.value;
        // If user selected a date
        if (taskDate) {
            var taskDateArr = taskDate.split(" to ");
            if (taskDateArr.length > 1) {
                console.log(taskDateArr[0]);
                console.log(taskDateArr[1]);
            } else {
                console.log(taskDateArr[0]);
            }
        }

        // Get Task Description - Buffer, Markdown
        let TaskDescriptionViewer = css_class.querySelector("#viewer");
        let TaskDescriptionBuffer = css_class.querySelector("#buffer");
        let TaskDescriptionMarkdown = css_class.querySelector("#getm");

        // Simulate Keypress (ENTER) to update markdown incase of LAG
        TaskDescriptionMarkdown.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        TaskDescriptionMarkdown.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));

        // Timeout until markdown is updated
        setTimeout(() => {
            // Checks which innerHTML is longer, to showcase the text in task properly
            if (TaskDescriptionBuffer.innerHTML.length >= TaskDescriptionViewer.innerHTML.length)
                document.querySelector(".task_description").innerHTML = TaskDescriptionBuffer.innerHTML;
            else document.querySelector(".task_description").innerHTML = TaskDescriptionViewer.innerHTML;
        }, 300);
    }

    // Close and Clear elements text after Timeout
    setTimeout(() => {
        document.querySelector(".EDIT__btn_exit").click();
    }, 300);
});

// * Create Element

// Create Group
function createGroup(groupTitle) {
    let parent = document.querySelector(".menu_list");
    let li = document.createElement("li");
    let a = document.createElement("a");
    let span = document.createElement("span");

    // Append child
    span.textContent = groupTitle;
    li.appendChild(a);
    a.appendChild(span);
    parent.appendChild(li);
}

// Create Card
function createCard(cardTitle) {
    let parent = document.querySelector(".PANEL__card");
    let card_Container = document.createElement("div");
    card_Container.className = "card_container";
    let card_Body = document.createElement("div");
    card_Body.className = "card_body btn-group-vertical card_width";
    let card_Header = document.createElement("div");
    card_Header.className = "card_header";
    let card_Header_Bottom = document.createElement("div");
    card_Header_Bottom.className = "card_header_bottom_fill";
    let card_Title = document.createElement("div");
    card_Title.className = "card_title";
    let card_Options = document.createElement("div");
    card_Options.className = "card_header_options";

    // Option 1
    let card_Option1 = document.createElement("button");
    card_Option1.className = "button PANEL__btn_add_task btn_color_blue btn_padding";
    card_Option1.setAttribute("type", "button")
    let card_Option1_span = document.createElement("span");
    card_Option1_span.className = "icon icon_up";
    let card_Option1_svg = document.createElementNS( "http://www.w3.org/2000/svg","svg");
    card_Option1_svg.setAttribute("class", "svg-inline--fa fa-plus fa-w-14 fa-sm")
    card_Option1_svg.setAttribute("aria-hidden", "true");
    card_Option1_svg.setAttribute("data-prefix", "fa");
    card_Option1_svg.setAttribute("data-icon", "plus");
    card_Option1_svg.setAttribute("role", "img");
    card_Option1_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    card_Option1_svg.setAttribute("viewBox", "0 0 448 512");
    card_Option1_svg.setAttribute("data-fa-i2svg", "");
    let card_Option1_path = document.createElementNS("http://www.w3.org/2000/svg","path")
    card_Option1_path.setAttribute("fill", "currentColor")
    card_Option1_path.setAttribute("d", "M448 294.2v-76.4c0-13.3-10.7-24-24-24H286.2V56c0-13.3-10.7-24-24-24h-76.4c-13.3 0-24 10.7-24 24v137.8H24c-13.3 0-24 10.7-24 24v76.4c0 13.3 10.7 24 24 24h137.8V456c0 13.3 10.7 24 24 24h76.4c13.3 0 24-10.7 24-24V318.2H424c13.3 0 24-10.7 24-24z")

    card_Option1_svg.appendChild(card_Option1_path)
    card_Option1_span.appendChild(card_Option1_svg)
    card_Option1.appendChild(card_Option1_span)
    card_Options.appendChild(card_Option1)

    // Option 2
    let card_Option2 = document.createElement("button");
    card_Option2.className = "button PANEL__btn_delete_card btn_color_red btn_padding";
    card_Option2.setAttribute("type", "button")
    let card_Option2_span = document.createElement("span");
    card_Option2_span.className = "icon icon_up";
    let card_Option2_svg = document.createElementNS( "http://www.w3.org/2000/svg","svg");
    card_Option2_svg.setAttribute("class", "svg-inline--fa fa-trash fa-w-14 fa-sm")
    card_Option2_svg.setAttribute("aria-hidden", "true");
    card_Option2_svg.setAttribute("data-prefix", "fa");
    card_Option2_svg.setAttribute("data-icon", "plus");
    card_Option2_svg.setAttribute("role", "img");
    card_Option2_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    card_Option2_svg.setAttribute("viewBox", "0 0 448 512");
    card_Option2_svg.setAttribute("data-fa-i2svg", "");
    let card_Option2_path = document.createElementNS("http://www.w3.org/2000/svg","path")
    card_Option2_path.setAttribute("fill", "currentColor")
    card_Option2_path.setAttribute("d", "M0 84V56c0-13.3 10.7-24 24-24h112l9.4-18.7c4-8.2 12.3-13.3 21.4-13.3h114.3c9.1 0 17.4 5.1 21.5 13.3L312 32h112c13.3 0 24 10.7 24 24v28c0 6.6-5.4 12-12 12H12C5.4 96 0 90.6 0 84zm415.2 56.7L394.8 467c-1.6 25.3-22.6 45-47.9 45H101.1c-25.3 0-46.3-19.7-47.9-45L32.8 140.7c-.4-6.9 5.1-12.7 12-12.7h358.5c6.8 0 12.3 5.8 11.9 12.7z")

    card_Option2_svg.appendChild(card_Option2_path)
    card_Option2_span.appendChild(card_Option2_svg)
    card_Option2.appendChild(card_Option2_span)
    card_Options.appendChild(card_Option2)

    // Option 3
    let card_Option3 = document.createElement("button");
    card_Option3.className = "button PANEL__btn_edit_card btn_color_white btn_padding";
    card_Option3.setAttribute("type", "button")
    let card_Option3_span = document.createElement("span");
    card_Option3_span.className = "icon icon_up";
    let card_Option3_svg = document.createElementNS( "http://www.w3.org/2000/svg","svg");
    card_Option3_svg.setAttribute("class", "svg-inline--fa fa-pencil-alt fa-w-16 fa-sm")
    card_Option3_svg.setAttribute("aria-hidden", "true");
    card_Option3_svg.setAttribute("data-prefix", "fa");
    card_Option3_svg.setAttribute("data-icon", "plus");
    card_Option3_svg.setAttribute("role", "img");
    card_Option3_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    card_Option3_svg.setAttribute("viewBox", "0 0 512 512");
    card_Option3_svg.setAttribute("data-fa-i2svg", "");
    let card_Option3_path = document.createElementNS("http://www.w3.org/2000/svg","path")
    card_Option3_path.setAttribute("fill", "currentColor")
    card_Option3_path.setAttribute("d", "M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z")

    card_Option3_svg.appendChild(card_Option3_path)
    card_Option3_span.appendChild(card_Option3_svg)
    card_Option3.appendChild(card_Option3_span)
    card_Options.appendChild(card_Option3)

    // set cardTitle to user input
    card_Title.textContent = cardTitle;

    // Append child
    card_Header.appendChild(card_Header_Bottom);
    card_Header.appendChild(card_Title);
    card_Header.appendChild(card_Options);
    card_Body.appendChild(card_Header);
    card_Container.appendChild(card_Body);
    parent.appendChild(card_Container);
}

// Create Task
function createTask() {

}