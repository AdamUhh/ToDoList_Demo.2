window.onload = function () {
    flatpickr("#myDatepicker", {
        mode: "range",
        dateFormat: "d-m-Y",
    });

    if (Object.entries(groupDict).length === 0) {
        document.querySelector(".btn_add_card").style.display = "none";
        let Main_Padding = document.querySelector(".MAIN__padding");
        Main_Padding.querySelector(".titlebar_text").style.display = "none";
        Main_Padding.querySelector("hr").style.display = "none";
        // todo when user adds a group, showcase these elements again, and put the newly made grouptitle in the input
    }
};

var isCardAdded = false;
var isCardAddedExecute = true;
var isTaskAdded = false;
var isRepTaskAdded = false;
var currentGroupID;
var currentCardID;
var currentTaskID;

// * For Navigation
// ? User opens the navigation menu (on phone in MAIN)
document.querySelector(".btn_open_nav").addEventListener("click", function () {
    document.querySelector(".column.box").style.display = "none";
    document.querySelector(".column").style.display = "none";
    document.querySelector(".one_quarter").style.display = "block";
    document.querySelector(".MENU__btn_exit_wrapper").style.display = "block";
});

// * Exit Stuff
// ? User exits the Nav screen
document.querySelector(".MENU__btn_exit").addEventListener("click", function () {
    document.querySelector(".column.box").style.display = "block";
    document.querySelector(".column").style.display = "block";
    if (window.innerWidth < 1100) {
        document.querySelector(".one_quarter").style.display = "none";
    } else if (window.innerWidth >= 1100 && document.querySelector(".MENU__btn_exit_wrapper").style.display == "block") document.querySelector(".one_quarter").style.display = "none";

    document.querySelector(".MENU__btn_exit_wrapper").style.display = "none";
});

// ? User exits the EDIT screen
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

    isCardAdded = false;
    isTaskAdded = false;
});

// ? User exits the GROUP container
document.querySelector(".GROUP__btn_exit").addEventListener("click", function () {
    document.querySelector(".GROUP__add_group_container").style.display = "none";
});

// * Add Stuff
// ? User adds a card (from MAIN titlebar)
document.querySelector(".btn_add_card").addEventListener("click", function () {
    document.querySelector(".EDIT__padding").style.display = "block";
    document.querySelector(".EDIT__ask_add_task").style.display = "block";
    document.querySelector(".MAIN__padding").style.display = "none";

    isCardAdded = true;
});

// ? User adds a task (from card in MAIN PANEL)
function addTask() {
    document.querySelector(".EDIT__padding").style.display = "block";
    document.querySelector(".EDIT__ask_add_task").style.display = "none";
    document.querySelector(".EDIT__task_container").style.display = "block";
    document.querySelector(".EDIT__confirm_right").style.display = "inline-flex";
    document.querySelector(".MAIN__padding").style.display = "none";

    currentCardID = this.parentNode.parentNode.parentNode.id;
    isTaskAdded = true;
}

// ? User clicks add a task after being asked (inside add card EDIT screen)
document.querySelector(".EDIT__btn_ask_add_task").addEventListener("click", function () {
    document.querySelector(".EDIT__ask_add_task").style.display = "none";
    document.querySelector(".EDIT__task_container").style.display = "block";
    document.querySelector(".EDIT__confirm_right").style.display = "inline-flex";

    isTaskAdded = true;
});

// ? User clicks Complete and Add another task (inside add card EDIT screen)
document.querySelector(".EDIT__btn_confirm_and_add_task ").addEventListener("click", function () {
    isRepTaskAdded = true;
    isTaskAdded = true;

    if (isCardAdded && isCardAddedExecute) {
        getCardInput();
    }
    getTaskInput();
});

// ? User clicks add a group (from MENU) to show the wrapper
document.querySelector(".MENU__btn_add_group").addEventListener("click", function () {
    document.querySelector(".GROUP__add_group_container").style.display = "block";
});

// * Delete Stuff
// ? User deletes a card (from MAIN titlebar)
function deleteCard() {
    var c = this.parentNode.parentNode.parentNode.parentNode;
    console.log(c);
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

    // Delete card from groupDict
    let deletedCardID = this.parentNode.parentNode.parentNode.id;
    for (const containedTasks of cardDict[deletedCardID].cardInfoContainsTasks) {
        delete taskDict[containedTasks];
    }
    delete cardDict[deletedCardID];
    groupDict[currentGroupID].groupInfoContainsCards.pop(deletedCardID);

    // todo Loop through all tasks inside ContainsCards and delete them in taskDict. Also Delete this cardDict[DeletedCardId] - do the same for GROUP later on
    // for (const containedCards of groupDict[currentGroupID].groupInfoContainsCards) { //You can add this for the Delete Group
    // }
    console.log(groupDict);
    console.log(cardDict);
    console.log(taskDict);
}

// ? User deletes a task (from MAIN titlebar)
function deleteTask() {
    var t = this.parentNode.parentNode;
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

    // Delete task from cardDict and taskDict
    let deletedTaskID = this.parentNode.parentNode.id;
    currentCardID = this.parentNode.parentNode.parentNode.parentNode.id;
    cardDict[currentCardID].cardInfoContainsTasks.pop(deletedTaskID);
    delete taskDict[deletedTaskID];
    console.log(groupDict);
    console.log(cardDict);
    console.log(taskDict);
}

// * Edit Stuff
// ? User edits a card (from MAIN titlebar)
function editCard() {
    document.querySelector(".EDIT__padding").style.display = "block";
    document.querySelector(".MAIN__padding").style.display = "none";

    document.querySelector(".EDIT__select_task_container").style.display = "block";
}

// ? User edits a task (from CARD EDIT screen )
function editTask() {
    document.querySelector(".EDIT__confirm_left").style.display = "inline-flex";
    document.querySelector(".EDIT__btn_go_back_wrapper").style.display = "block";
}

// ? User edits the Group Name input (from MAIN titlebar)
function editGroup(obj) {
    let span = document.querySelector("#" + currentGroupID);
    span.textContent = obj.value;

    // Append groupDict with new title
    groupDict[currentGroupID].groupInfoTitle = obj.value;
    console.log(groupDict);
}

// ! Creation of elements - Groups, Cards, Tasks

let groupDict = {};
let cardDict = {};
let taskDict = {};

// * Get Inputs
// ? Get Group Input
document.querySelector(".GROUP__btn_confirm").addEventListener("click", function () {
    let css_class = document.querySelector(".GROUP__add_group_wrapper");
    let groupTitle = css_class.querySelector("input");
    let groupID = new Date().getTime();

    let groupInfo = {
        groupInfoID: groupID,
        groupInfoTitle: groupTitle.value,
        groupInfoContainsCards: [],
    };

    createGroup(groupTitle.value, groupID);

    // Store group data in dictionary
    groupDict["group" + groupID] = groupInfo;

    // Hide GROUP Elements
    groupTitle.value = ""; //Clear Input
    document.querySelector(".GROUP__add_group_container").style.display = "none";
});

// ? Get Card and Task Input when user clicks the confirm button
document.querySelector(".EDIT__btn_confirm").addEventListener("click", function () {
    getCardInput();

    getTaskInput();

    setTimeout(() => {
        document.querySelector(".EDIT__btn_exit").click();
    }, 320);

    isCardAddedExecute = true;
    isCardAdded = false;
    isTaskAdded = false;
    isRepTaskAdded = false;
    currentCardID = ""; //May cause error?!
});

function getCardInput() {
    let css_class = document.querySelector(".EDIT__padding");
    let cardID;

    // If user clicked AddCard, create card, otherwise continue
    if (isCardAdded && isCardAddedExecute) {
        if (isRepTaskAdded) isCardAddedExecute = false;
        // Get Card Title
        let cardTitle = css_class.querySelector("input");
        console.log(cardTitle.value);
        cardID = new Date().getTime();

        let cardInfo = {
            cardInfoID: cardID,
            cardInfoTitle: cardTitle.value,
            cardInfoContainsTasks: [],
        };

        createCard(cardTitle.value, cardID);

        // Store in Group Dictionary
        groupDict[currentGroupID].groupInfoContainsCards.push("cardBody" + cardID);
        // console.log(groupDict);

        // Store card data in dictionary
        cardDict["cardBody" + cardID] = cardInfo;
        // console.log(cardDict);

        currentCardID = "cardBody" + cardID;
    }
}
function getTaskInput() {
    let css_class = document.querySelector(".EDIT__padding");
    let cardID = currentCardID.replace("cardBody", "");

    // If there is a task/markdown element on the screen
    if (isTaskAdded) {
        let css_class_task = document.querySelector(".EDIT__task_body");
        let taskID = new Date().getTime();
        var taskInfo;
        // Get Task Title
        let taskTitle = css_class_task.querySelector("input");

        // Get Task Date
        let taskDate = css_class.querySelector("#myDatepicker");

        // Get Task Description - Buffer, Markdown
        let TaskDescriptionViewer = css_class.querySelector("#viewer");
        let TaskDescriptionBuffer = css_class.querySelector("#buffer");
        let TaskDescriptionMarkdown = css_class.querySelector("#getm");

        // Simulate Keypress (ENTER) to update markdown incase of LAG
        TaskDescriptionMarkdown.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        TaskDescriptionMarkdown.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));

        // Assign proper cardID if user did not click AddCard
        if (!isCardAdded) {
            cardID = currentCardID.replace("cardBody", "");
        }

        // Timeout until markdown is updated
        setTimeout(() => {
            if (TaskDescriptionBuffer.innerHTML.length >= TaskDescriptionViewer.innerHTML.length) {
                createTask(taskTitle.value, TaskDescriptionBuffer.innerHTML, taskDate.value, taskID, cardID);
                taskInfo = {
                    taskInfoID: taskID,
                    taskInfoTitle: taskTitle.value,
                    taskInfoDesc: TaskDescriptionBuffer.innerHTML,
                    taskDate: taskDate.value,
                };
                taskTitle.value = "";
                TaskDescriptionMarkdown.value = "";
                taskDate = "";
            } else {
                createTask(taskTitle.value, TaskDescriptionViewer.innerHTML, taskDate.value, taskID, cardID);
                taskInfo = {
                    taskInfoID: taskID,
                    taskInfoTitle: taskTitle.value,
                    taskInfoDesc: TaskDescriptionViewer.innerHTML,
                    taskDate: taskDate.value,
                };
                taskTitle.value = "";
                TaskDescriptionMarkdown.value = "";
                taskDate = "";
            } // end of if else statement

            //Store in Card Dictionary
            cardDict["cardBody" + cardID].cardInfoContainsTasks.push("taskBody" + taskID);

            // Store task data in dictionary
            taskDict["taskBody" + taskID] = taskInfo;
            // console.log(taskDict);

            // document.querySelector(".EDIT__btn_exit").click();
        }, 300); //end of setTimeout
    } else {
        document.querySelector(".EDIT__btn_exit").click();
    }
}

// * Create Element

// ? Create Group
function createGroup(groupTitle, groupIDRef) {
    let Main_Padding = document.querySelector(".MAIN__padding");
    if (Object.entries(groupDict).length === 0) {
        //If there is no group but you are adding one now
        document.querySelector(".btn_add_card").style.display = "block";
        Main_Padding.querySelector(".titlebar_text").style.display = "block";
        Main_Padding.querySelector("hr").style.display = "block";
    }

    // When new group is created, automatically clear all current cards on screen
    document.querySelectorAll(".card_container").forEach((obj) => {
        obj.remove();
    });

    let parent = document.querySelector(".menu_list");
    let li = document.createElement("li");
    let a = document.createElement("a");
    let span = document.createElement("span");
    span.id = "group" + groupIDRef;

    // set span to user input
    span.textContent = groupTitle;
    // set group name input to user input
    Main_Padding.querySelector("input").value = groupTitle;

    // Append child
    li.appendChild(a);
    a.appendChild(span);
    parent.appendChild(li);

    // When user clicks on the group, change class to active and remove previous active class
    li.onclick = function () {
        currentGroupID = li.lastChild.lastChild.id;
        let listItems = parent.querySelectorAll("li");
        for (let i = 0; i < listItems.length; i++) {
            if (listItems[i].classList.contains("active")) listItems[i].classList.remove("active");
        }
        li.className = "active";
        // Hide all card containers
        document.querySelectorAll(".card_container").forEach((obj) => {
            obj.remove();
        });
        loadCards();
        // set group name input to user input
        let Main_Padding = document.querySelector(".MAIN__padding");
        Main_Padding.querySelector("input").value = document.querySelector("#" + currentGroupID).textContent;
    };

    // When user creates a group, make its class active
    let listItems = parent.querySelectorAll("li");
    for (let i = 0; i < listItems.length; i++) {
        if (listItems[i].classList.contains("active")) listItems[i].classList.remove("active");
        li.className = "active";
    }

    // Change currentgroupid to newly created group
    currentGroupID = span.id;
}

// ? Create Card
function createCard(cardTitle, cardIDRef) {
    let parent = document.querySelector(".PANEL__card");
    let card_Container = document.createElement("div");
    card_Container.className = "card_container";
    card_Container.id = "cardContainer" + cardIDRef; //Don't know if this is needed
    let card_Body = document.createElement("div");
    card_Body.className = "card_body btn-group-vertical card_width";
    card_Body.id = "cardBody" + cardIDRef;
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
    card_Option1.setAttribute("type", "button");
    let card_Option1_span = document.createElement("span");
    card_Option1_span.className = "icon icon_up";
    let card_Option1_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    card_Option1_svg.setAttribute("class", "svg-inline--fa fa-plus fa-w-14 fa-sm");
    card_Option1_svg.setAttribute("aria-hidden", "true");
    card_Option1_svg.setAttribute("data-prefix", "fa");
    card_Option1_svg.setAttribute("data-icon", "plus");
    card_Option1_svg.setAttribute("role", "img");
    card_Option1_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    card_Option1_svg.setAttribute("viewBox", "0 0 448 512");
    card_Option1_svg.setAttribute("data-fa-i2svg", "");
    let card_Option1_path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    card_Option1_path.setAttribute("fill", "currentColor");
    card_Option1_path.setAttribute(
        "d",
        "M448 294.2v-76.4c0-13.3-10.7-24-24-24H286.2V56c0-13.3-10.7-24-24-24h-76.4c-13.3 0-24 10.7-24 24v137.8H24c-13.3 0-24 10.7-24 24v76.4c0 13.3 10.7 24 24 24h137.8V456c0 13.3 10.7 24 24 24h76.4c13.3 0 24-10.7 24-24V318.2H424c13.3 0 24-10.7 24-24z"
    );

    card_Option1_svg.appendChild(card_Option1_path);
    card_Option1_span.appendChild(card_Option1_svg);
    card_Option1.appendChild(card_Option1_span);
    card_Options.appendChild(card_Option1);
    card_Option1.onclick = addTask;

    // Option 2
    let card_Option2 = document.createElement("button");
    card_Option2.className = "button PANEL__btn_delete_card btn_color_red btn_padding";
    card_Option2.setAttribute("type", "button");
    let card_Option2_span = document.createElement("span");
    card_Option2_span.className = "icon icon_up";
    let card_Option2_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    card_Option2_svg.setAttribute("class", "svg-inline--fa fa-trash fa-w-14 fa-sm");
    card_Option2_svg.setAttribute("aria-hidden", "true");
    card_Option2_svg.setAttribute("data-prefix", "fa");
    card_Option2_svg.setAttribute("data-icon", "trash");
    card_Option2_svg.setAttribute("role", "img");
    card_Option2_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    card_Option2_svg.setAttribute("viewBox", "0 0 448 512");
    card_Option2_svg.setAttribute("data-fa-i2svg", "");
    let card_Option2_path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    card_Option2_path.setAttribute("fill", "currentColor");
    card_Option2_path.setAttribute(
        "d",
        "M0 84V56c0-13.3 10.7-24 24-24h112l9.4-18.7c4-8.2 12.3-13.3 21.4-13.3h114.3c9.1 0 17.4 5.1 21.5 13.3L312 32h112c13.3 0 24 10.7 24 24v28c0 6.6-5.4 12-12 12H12C5.4 96 0 90.6 0 84zm415.2 56.7L394.8 467c-1.6 25.3-22.6 45-47.9 45H101.1c-25.3 0-46.3-19.7-47.9-45L32.8 140.7c-.4-6.9 5.1-12.7 12-12.7h358.5c6.8 0 12.3 5.8 11.9 12.7z"
    );

    card_Option2_svg.appendChild(card_Option2_path);
    card_Option2_span.appendChild(card_Option2_svg);
    card_Option2.appendChild(card_Option2_span);
    card_Options.appendChild(card_Option2);
    card_Option2.onclick = deleteCard;

    // Option 3
    let card_Option3 = document.createElement("button");
    card_Option3.className = "button PANEL__btn_edit_card btn_color_white btn_padding";
    card_Option3.setAttribute("type", "button");
    let card_Option3_span = document.createElement("span");
    card_Option3_span.className = "icon icon_up";
    let card_Option3_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    card_Option3_svg.setAttribute("class", "svg-inline--fa fa-pencil-alt fa-w-16 fa-sm");
    card_Option3_svg.setAttribute("aria-hidden", "true");
    card_Option3_svg.setAttribute("data-prefix", "fa");
    card_Option3_svg.setAttribute("data-icon", "pencil-alt");
    card_Option3_svg.setAttribute("role", "img");
    card_Option3_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    card_Option3_svg.setAttribute("viewBox", "0 0 512 512");
    card_Option3_svg.setAttribute("data-fa-i2svg", "");
    let card_Option3_path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    card_Option3_path.setAttribute("fill", "currentColor");
    card_Option3_path.setAttribute(
        "d",
        "M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z"
    );

    card_Option3_svg.appendChild(card_Option3_path);
    card_Option3_span.appendChild(card_Option3_svg);
    card_Option3.appendChild(card_Option3_span);
    card_Options.appendChild(card_Option3);
    card_Option3.onclick = editCard;

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

// ? Create Task
function createTask(taskTitle, taskDescription, taskDate, taskIDRef, cardIDRef) {
    let parent = document.querySelector("#cardBody" + cardIDRef);
    let task_Container = document.createElement("div");
    task_Container.className = "task_container";
    let task_Body = document.createElement("div");
    task_Body.className = "task_body";
    task_Body.id = "taskBody" + taskIDRef;
    let task_Options = document.createElement("div");
    task_Options.className = "task_options";
    let task_Title = document.createElement("div");
    task_Title.className = "task_title";
    let task_Description = document.createElement("div");
    task_Description.className = "task_description";
    let task_Date = document.createElement("div");
    task_Date.className = "task_date";

    // Option 1
    let task_Option1 = document.createElement("button");
    task_Option1.className = "button PANEL__btn_edit_task btn_color_whitesmoke";
    task_Option1.setAttribute("type", "button");
    let task_Option1_span = document.createElement("span");
    task_Option1_span.className = "icon icon_centered";

    let task_Option1_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    task_Option1_svg.setAttribute("class", "svg-inline--fa fa-pencil-alt fa-w-16 fa-sm");
    task_Option1_svg.setAttribute("aria-hidden", "true");
    task_Option1_svg.setAttribute("data-prefix", "fa");
    task_Option1_svg.setAttribute("data-icon", "pencil-alt");
    task_Option1_svg.setAttribute("role", "img");
    task_Option1_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    task_Option1_svg.setAttribute("viewBox", "0 0 512 512");
    task_Option1_svg.setAttribute("data-fa-i2svg", "");
    let task_Option1_path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    task_Option1_path.setAttribute("fill", "currentColor");
    task_Option1_path.setAttribute(
        "d",
        "M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z"
    );

    task_Option1_svg.appendChild(task_Option1_path);
    task_Option1_span.appendChild(task_Option1_svg);
    task_Option1.appendChild(task_Option1_span);
    task_Options.appendChild(task_Option1);
    task_Option1.onclick = editTask;

    // Option 2
    let task_Option2 = document.createElement("button");
    task_Option2.className = "button PANEL__btn_delete_task btn_color_red";
    task_Option2.setAttribute("type", "button");
    let task_Option2_span = document.createElement("span");
    task_Option2_span.className = "icon icon_centered";

    let task_Option2_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    task_Option2_svg.setAttribute("class", "svg-inline--fa fa-trash fa-w-14 fa-sm");
    task_Option2_svg.setAttribute("aria-hidden", "true");
    task_Option2_svg.setAttribute("data-prefix", "fa");
    task_Option2_svg.setAttribute("data-icon", "trash");
    task_Option2_svg.setAttribute("role", "img");
    task_Option2_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    task_Option2_svg.setAttribute("viewBox", "0 0 448 512");
    task_Option2_svg.setAttribute("data-fa-i2svg", "");
    let task_Option2_path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    task_Option2_path.setAttribute("fill", "currentColor");
    task_Option2_path.setAttribute(
        "d",
        "M0 84V56c0-13.3 10.7-24 24-24h112l9.4-18.7c4-8.2 12.3-13.3 21.4-13.3h114.3c9.1 0 17.4 5.1 21.5 13.3L312 32h112c13.3 0 24 10.7 24 24v28c0 6.6-5.4 12-12 12H12C5.4 96 0 90.6 0 84zm415.2 56.7L394.8 467c-1.6 25.3-22.6 45-47.9 45H101.1c-25.3 0-46.3-19.7-47.9-45L32.8 140.7c-.4-6.9 5.1-12.7 12-12.7h358.5c6.8 0 12.3 5.8 11.9 12.7z"
    );

    task_Option2_svg.appendChild(task_Option2_path);
    task_Option2_span.appendChild(task_Option2_svg);
    task_Option2.appendChild(task_Option2_span);
    task_Options.appendChild(task_Option2);
    task_Option2.onclick = deleteTask;

    // set task elements to user input
    task_Title.textContent = taskTitle;
    task_Description.innerHTML = taskDescription;

    if (taskDate.length > 0) {
        var taskDateArr = taskDate.split(" to ");
        if (taskDateArr.length > 1) {
            let task_Date_Left = document.createElement("div");
            task_Date_Left.className = "task_date_left";
            task_Date_Left.textContent = "Made On: " + taskDateArr[0];
            let task_Date_Right = document.createElement("div");
            task_Date_Right.className = "task_date_right";
            task_Date_Right.textContent = "Due On: " + taskDateArr[1];

            task_Date.appendChild(task_Date_Left);
            task_Date.appendChild(task_Date_Right);
        } else {
            let task_Date_Left = document.createElement("div");
            task_Date_Left.className = "task_date_left";
            task_Date_Left.textContent = "Made On: " + taskDateArr[0];

            task_Date.appendChild(task_Date_Left);
        }
    }

    // Append elements to card parent
    task_Body.appendChild(task_Title);
    task_Body.appendChild(task_Description);
    if (taskDate.length > 0) task_Body.appendChild(task_Date);
    task_Body.appendChild(task_Options);
    task_Container.appendChild(task_Body);
    parent.appendChild(task_Container);
}

// * Load Elements

// ? Load Cards
function loadCards() {
    for (const containedCards of groupDict[currentGroupID].groupInfoContainsCards) {
        // console.log(containedCards);
        createCard(cardDict[containedCards].cardInfoTitle, containedCards.replace("cardBody", ""));
        for (const containedTasks of cardDict[containedCards].cardInfoContainsTasks) {
            // console.log(containedTasks);
            createTask(
                taskDict[containedTasks].taskInfoTitle,
                taskDict[containedTasks].taskInfoDesc,
                taskDict[containedTasks].taskDate,
                containedTasks.replace("taskBody", ""),
                containedCards.replace("cardBody", "")
            );
        }
    }
}
