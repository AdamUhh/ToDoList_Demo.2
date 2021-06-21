function loadFlatpickr() {
    flatpickr('#myDatepicker', {
        mode: 'range',
        dateFormat: 'j F, y',
        // dateFormat: "d-m-Y",
    });
}

var hasCardBeenAdded = false;
var hasMarkdown = false;
var isTaskEditMode = false;
var goBack = false;
var confirmed = false;
var currentGroupID;
var currentCardID;
var currentTaskID;

let groupDict = {};
let cardDict = {};
let taskDict = {};

function clearValues(clearTask = false, clearCard = false) {
    if (clearTask) {
        let taskTitle = document.querySelector('#taskTitleInput');
        let TaskDescriptionMarkdown = document.querySelector('#getm');
        let TaskDescriptionBuffer = document.querySelector('#buffer');
        let taskDate = document.querySelector('#myDatepicker');

        // clear textContent in task title, description, date
        taskTitle.value = '';
        TaskDescriptionMarkdown.value = '';
        TaskDescriptionBuffer.value = '';
        TaskDescriptionBuffer.innerHTML = '';
        taskDate.value = '';
        taskDate._flatpickr.clear();
    }
    if (clearCard) {
        document.querySelector('#cardTitleInput').value = '';
    }
}

// * For Navigation --------------------------------------------------------------
// ? User CLICKS/OPENS the NAVIGATION menu (on phone in MAIN)
document.querySelector('.btn_open_nav').addEventListener('click', function () {
    document.querySelector('.column.box').style.display = 'none';
    document.querySelector('.column').style.display = 'none';
    document.querySelector('.one_quarter').style.display = 'block';
    // Used to hide [x] when user switches screen size from phone to laptop
    document.querySelector('.MENU__btn_exit_wrapper').style.display = 'block';
});

// * Exit Stuff --------------------------------------------------------------
{
    // ? User CLICKS/EXITS the NAVIGATION menu [X]
    document.querySelector('.MENU__btn_exit').addEventListener('click', function () {
        document.querySelector('.column.box').style.display = 'block';
        document.querySelector('.column').style.display = 'block';
        // Used to fix bug where MAIN won't display if screen size changes from phone to laptop
        document.querySelector('.one_quarter').style.display = 'none';
        document.querySelector('.MENU__btn_exit_wrapper').style.display = 'none';
        // if (window.innerWidth < 1100) {
        //     console.log("Test")
        // } else if (
        //     window.innerWidth >= 1100 &&
        //     document.querySelector(".MENU__btn_exit_wrapper").style.display == "block"
        //     ) {
        //     console.log("TestBB")
        //     document.querySelector(".one_quarter").style.display = "none";
        //     document.querySelector(".MENU__btn_exit_wrapper").style.display = "none";
        // }
    });

    // ? User CLICKS/EXITS the EDIT screen [X]
    document.querySelector('.EDIT__btn_exit').addEventListener('click', function () {
        // Hides appropriate elements of EDIT screen and shows only the MAIN screen
        document.querySelector('.MAIN__padding').style.display = 'block'; //show MAIN
        document.querySelector('.EDIT__padding').style.display = 'none'; //hide EDIT
        document.querySelector('.EDIT__ask_add_task').style.display = 'none'; //hides Seems empty, add a task
        document.querySelector('.EDIT__confirm_left').style.display = 'none'; //hides Complete and go back
        document.querySelector('.EDIT__confirm_right').style.display = 'none'; //hides Complete and add task
        document.querySelector('.EDIT__task_container').style.display = 'none'; //hides task container
        document.querySelector('.EDIT__btn_go_back_wrapper').style.display = 'none'; //hides EDIT CARD -> Task go back button

        // removes all elements inside 'Edit Card -> Select Tasks'
        document
            .querySelectorAll('.EDIT__select_task_wrapper')
            .forEach((e) => e.parentNode.removeChild(e));
        document.querySelector('.EDIT__select_task_container').style.display = 'none';

        // clear task and card input values
        clearValues(true, true);

        // switch to correct 'edit confirm' buttons
        document.querySelector('.EDIT__btn_confirm').style.display = 'inline-flex';
        document.querySelector('.EDIT__btn_confirm_edit').style.display = 'none';

        // reset booleans
        hasCardBeenAdded = false; //no cards have been created
        hasMarkdown = false; //markdowns are no longer visible
        isTaskEditMode = false; //task edit mode disabled
        goBack = false; //go back to edit selected task screen disabled

        // reset currentCardID
        currentCardID = '';
    });

    // ? User CLICKS/EXITS the GROUP container [X]
    document.querySelector('.GROUP__btn_exit').addEventListener('click', function () {
        document.querySelector('.GROUP__add_group_container').style.display = 'none';
        document.querySelector('#groupTitleInput').value = '';
    });
    // ? User CLICKS/EXITS the DELETECONFIRM container [X]
    document.querySelector('.DeleteConfirm__btn_exit').addEventListener('click', function () {
        document.querySelector('.DeleteConfirm__container').style.display = 'none';
        // Users clicks the X and denies confirmation of deletion of element (Group, Card, Task)
        confirmed = false;
    });
    // ? User CLICKS/EXITS the ACCOUNT container [X]
    document.querySelector('.ACCOUNT__btn_exit').addEventListener('click', function () {
        document.querySelector('.ACCOUNT__container').style.display = 'none';
    });
}

// * Edit Stuff --------------------------------------------------------------
{
    // ? FUNCTION for when User EDITS GROUP NAME input (from MAIN titlebar)
    function editGroupInput(obj) {
        let span = document.querySelector('#' + currentGroupID);
        span.textContent = obj.value;

        // Append groupDict with new title
        groupDict[currentGroupID].groupInfoTitle = obj.value;

        // Update group title in firestore
        db.collection('Users').doc(userUID).collection('fbGroupDict').doc(currentGroupID).update({
            groupInfoTitle: obj.value,
        });
    }

    // ? FUNCTION for when User EDITS CARD NAME input (from EDIT titlebar)
    function editCardInput(obj) {
        // If currentCardID has a value - prevents errors
        if (currentCardID) {
            let cardTitle = document.querySelector('#' + currentCardID);
            cardTitle.parentNode.firstChild.querySelector('.card_title').textContent = obj.value;

            // Append cardDict with new title
            cardDict[currentCardID].cardInfoTitle = obj.value;

            // Update card title in firestore
            db.collection('Users').doc(userUID).collection('fbCardDict').doc(currentCardID).update({
                cardInfoTitle: obj.value,
            });
        }
    }
    // ? User CLICKS/GO BACK to edit of CARD->TASK (from CARD-EDIT) [<-]
    // note: also clears the task title, description, date
    document.querySelector('.EDIT__btn_go_back_wrapper').addEventListener('click', function () {
        // display EDIT Card selected tasks again, and hide '<-' and 'Complete and go back' buttons and the task container
        document.querySelector('.EDIT__select_task_container').style.display = 'block';
        document.querySelector('.EDIT__task_container').style.display = 'none';
        document.querySelector('.EDIT__confirm_left').style.display = 'none';
        document.querySelector('.EDIT__btn_go_back_wrapper').style.display = 'none';

        loadEditSelectedTasks();

        // clear Task Inputs
        clearValues(true);

        isTaskEditMode = false;
    });

    // ? User CLICKS/CONFIRMS edit of CARD/TASK (from CARD-EDIT) [+ Confirm Edit]
    // note: also clears the card name
    document.querySelector('.EDIT__btn_confirm_edit').addEventListener('click', function () {
        // As cards are already checked by editCardInput(obj), only run if the user clicks edit (selected) task
        if (isTaskEditMode) {
            EditConfirm();
        }

        document.querySelector('.EDIT__btn_exit').click();
    });

    // ? User CLICKS/CONFIRMS edit of CARD->TASK (from CARD-EDIT) [Complete and Go Back]
    document.querySelector('.EDIT__confirm_left').addEventListener('click', function () {
        goBack = true;
        EditConfirm();
    });

    // ? FUNCTION when EDITING CARDS/TASKS to reduce redundancy
    // note: also clears the task title, description, date
    function EditConfirm() {
        isTaskEditMode = false;

        let taskTitle = document.querySelector('#taskTitleInput');
        let TaskDescriptionMarkdown = document.querySelector('#getm');
        let TaskDescriptionBuffer = document.querySelector('#buffer');
        let taskDate = document.querySelector('#myDatepicker');
        let task = document.querySelector('#' + currentTaskID);

        // append task in MAIN to new task title
        task.querySelector('.task_title').textContent = taskTitle.value;

        // Simulate Keyup (ENTER) to update markdown incase of LAG
        var keyEventPress = new KeyboardEvent('keyup', {
            code: 'Enter',
            key: 'Enter',
            charKode: 13,
            keyCode: 13,
            view: window,
        });
        TaskDescriptionMarkdown.dispatchEvent(keyEventPress);

        taskInfo = {
            taskInfoIDNum: currentTaskID.replace('taskBody', ''),
            taskInfoTitle: taskTitle.value,
            taskInfoDesc: TaskDescriptionBuffer.innerHTML,
            taskInfoDate: taskDate.value,
        };
        // append task in MAIN to new task description
        task.querySelector('.task_description').innerHTML = TaskDescriptionBuffer.innerHTML;

        // check if task_date has a value and append task in MAIN to new task date
        var task_Date = task.querySelector('.task_date');
        var task_Date_Left = task_Date.querySelector('.task_date_left');
        var task_Date_Right = task_Date.querySelector('.task_date_right');
        if (taskDate.value.length > 0) {
            var taskDateArr = taskDate.value.split(' to ');
            if (taskDateArr.length > 1) {
                task_Date_Left.textContent = 'Made On: ' + taskDateArr[0];
                // task_Date_Left.textContent = "Made On: " + taskDateArr[0] + " —\u00A0";
                task_Date_Right.textContent = 'Due On: ' + taskDateArr[1];
            } else {
                task_Date_Left.textContent = 'Made On: ' + taskDateArr[0];
                task_Date_Right.textContent = '';
            }
        } else {
            task_Date_Left.textContent = '';
            task_Date_Right.textContent = '';
        }

        // save new task data to taskDict
        taskDict[currentTaskID] = taskInfo;

        db.collection('Users')
            .doc(userUID)
            .collection('fbTaskDict')
            .doc(currentTaskID)
            .update({
                taskInfoIDNum: currentTaskID.replace('taskBody', ''),
                taskInfoTitle: taskTitle.value,
                taskInfoDesc: TaskDescriptionBuffer.innerHTML,
                taskInfoDate: taskDate.value,
            });

        if (goBack) {
            goBack = false;
            // clear task values
            clearValues(true);
            // display EDIT Card selected tasks again, and hide edit buttons
            document.querySelector('.EDIT__select_task_container').style.display = 'block';
            document.querySelector('.EDIT__confirm_left').style.display = 'none';
            document.querySelector('.EDIT__btn_go_back_wrapper').style.display = 'none';

            loadEditSelectedTasks();
        }
    }

    // ? FUNCTION to ASSIGN VALUES for when User CLICKS/EDITS CARD (from MAIN titlebar)
    function editCardScreen() {
        // hides MAIN and shows EDIT
        document.querySelector('.EDIT__padding').style.display = 'block';
        document.querySelector('.MAIN__padding').style.display = 'none';

        // switches 'confirm' button for 'confirm edit' button
        document.querySelector('.EDIT__btn_confirm').style.display = 'none';
        document.querySelector('.EDIT__btn_confirm_edit').style.display = 'inline-flex';

        // displays EDIT CARD selected task container
        document.querySelector('.EDIT__select_task_container').style.display = 'block';

        // assign cardID to currentCardID
        currentCardID = this.parentNode.parentNode.parentNode.lastChild.id;
        // Since it opens a new screen, it sets the card input to the correct cardTitle (from MAIN)
        // let cardTitle = document.querySelector("#" + currentCardID);
        document.querySelector('#cardTitleInput').value =
            this.parentNode.parentNode.querySelector('.card_title').textContent;

        // to load -> create selected tasks specific to the currentCardID
        loadEditSelectedTasks();
    }

    // ? Used to LOAD -> CREATE selected tasks in the EDIT CARD Screen
    function loadEditSelectedTasks() {
        // removes all elements inside 'Edit Card -> Select Tasks'
        document
            .querySelectorAll('.EDIT__select_task_wrapper')
            .forEach((e) => e.parentNode.removeChild(e));

        // Creates selected tasks relative to current card
        for (const containedTasks of cardDict[currentCardID].cardInfoContainsTasks) {
            createEditSelectedTasks(containedTasks);
        }
    }

    // ? FUNCTION to CREATE selected task (from EDIT CARD)
    function createEditSelectedTasks(taskIDRef) {
        let parent = document.querySelector('.EDIT__select_task_container');
        let taskTitle = taskDict[taskIDRef].taskInfoTitle;
        let taskDesc = taskDict[taskIDRef].taskInfoDesc;

        // Create elements and assign textContent
        let div = document.createElement('div');
        div.className = 'EDIT__select_task_wrapper';
        let h3 = document.createElement('h3');
        h3.textContent = taskTitle;
        let h5 = document.createElement('h5');
        h5.innerHTML = taskDesc.substring(0, 150) + '<em>...</em>';
        let task_Select_Options = document.createElement('div');
        task_Select_Options.className = 'EDIT__select_task_svg';

        let task_Select_Option1_span = document.createElement('span');
        task_Select_Option1_span.className = 'icon icon_up';
        let task_Select_Option1_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        task_Select_Option1_svg.setAttribute('class', 'svg-inline--fa fa-pencil-alt fa-w-18 fa-lg');
        task_Select_Option1_svg.setAttribute('aria-hidden', 'true');
        task_Select_Option1_svg.setAttribute('data-prefix', 'fa');
        task_Select_Option1_svg.setAttribute('data-icon', 'pencil-alt');
        task_Select_Option1_svg.setAttribute('role', 'img');
        task_Select_Option1_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        task_Select_Option1_svg.setAttribute('viewBox', '0 0 512 512');
        task_Select_Option1_svg.setAttribute('data-fa-i2svg', '');
        let task_Select_Option1_path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );
        task_Select_Option1_path.setAttribute('fill', 'currentColor');
        task_Select_Option1_path.setAttribute(
            'd',
            'M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z'
        );
        task_Select_Option1_svg.appendChild(task_Select_Option1_path);
        task_Select_Option1_span.appendChild(task_Select_Option1_svg);
        task_Select_Options.appendChild(task_Select_Option1_span);
        div.onclick = function () {
            isTaskEditMode = true;
            document.querySelector('.EDIT__confirm_left').style.display = 'inline-flex';
            document.querySelector('.EDIT__btn_go_back_wrapper').style.display = 'block';
            document.querySelector('.EDIT__select_task_container').style.display = 'none';
            editTaskScreen(taskIDRef);
            document
                .querySelectorAll('.EDIT__select_task_wrapper')
                .forEach((e) => e.parentNode.removeChild(e));
        };

        div.appendChild(h3);
        div.appendChild(h5);
        div.appendChild(task_Select_Options);
        parent.appendChild(div);
    }

    // ? FUNCTION to ASSIGN VALUES for when User EDITS a task (from CARD EDIT screen)
    function editTaskScreen(taskIDRef) {
        // hides MAIN and shows EDIT
        document.querySelector('.EDIT__padding').style.display = 'block';
        document.querySelector('.MAIN__padding').style.display = 'none';

        // Displays task container but hides 'complete and add task' button
        document.querySelector('.EDIT__task_container').style.display = 'block';
        document.querySelector('.EDIT__confirm_right').style.display = 'none';

        // assign taskTitle to correct taskTitleInput
        document.querySelector('#taskTitleInput').value = taskDict[taskIDRef].taskInfoTitle;

        // Configure turndown
        var options = {
            emDelimiter: '*',
            bulletListMarker: '-',
            hr: '---',
            codeBlockStyle: 'fenced',
            headingStyle: 'atx',
        };
        // convert html to markdown and assign to textarea/markdown editor
        var turndownService = new TurndownService(options);

        turndownService.addRule('break', {
            filter: ['br'],
            replacement: function (content) {
                return '<br />\n\n';
            },
        });

        document.querySelector('#getm').value = turndownService.turndown(
            taskDict[taskIDRef].taskInfoDesc
        );

        // Simulate Keyup (ENTER) to update markdown incase of LAG
        var keyEventPress = new KeyboardEvent('keyup', {
            code: 'Enter',
            key: 'Enter',
            charKode: 13,
            keyCode: 13,
            view: window,
        });
        document.querySelector('#getm').dispatchEvent(keyEventPress);

        // assign taskDate to correct taskDateInput
        document
            .querySelector('#myDatepicker')
            ._flatpickr.setDate(taskDict[taskIDRef].taskInfoDate);

        // assigns the taskID to currentTaskID
        currentTaskID = taskIDRef;
    }
}
// * Add Stuff --------------------------------------------------------------
{
    // ? User CLICKS/ADDS a CARD (from MAIN - titlebar) [+ Add Card]
    document.querySelector('.btn_add_card').addEventListener('click', function () {
        document.querySelector('.EDIT__padding').style.display = 'block';
        document.querySelector('.EDIT__ask_add_task').style.display = 'block';
        document.querySelector('.MAIN__padding').style.display = 'none';

        // focus on the group input so user does not have to click it.
        let css_class = document.querySelector('.EDIT__padding');
        css_class.querySelector('input').focus();
    });

    // ? User CLICKS/ADDS a TASK (from CARD - card_header_options) [+]
    // note: also sets card input to correct cardTitle
    function addTask() {
        // Hide MAIN and show EDIT
        document.querySelector('.EDIT__padding').style.display = 'block';
        document.querySelector('.MAIN__padding').style.display = 'none';

        document.querySelector('.EDIT__task_container').style.display = 'block';
        document.querySelector('.EDIT__confirm_right').style.display = 'inline-flex';

        // sets the cardID to currentCardID
        currentCardID = this.parentNode.parentNode.parentNode.lastChild.id;

        // Card is already created
        hasCardBeenAdded = true;
        // Markdown is visible on screen
        hasMarkdown = true;

        // Since it opens the EDIT screen, this sets the card name to the correct cardTitle (from MAIN)
        // let cardTitle = document.querySelector("#" + currentCardID);
        document.querySelector('#cardTitleInput').value =
            this.parentNode.parentNode.querySelector('.card_title').textContent;

        // focus on the group input so user does not have to click it.
        let css_class_task = document.querySelector('.EDIT__task_body');
        css_class_task.querySelector('input').focus();
    }

    // ? User CLICKS/ADDS a task after being ASKED (from EDIT - after {+ Add Card}) [Seems empty, + Add Task]
    document.querySelector('.EDIT__btn_ask_add_task').addEventListener('click', function () {
        document.querySelector('.EDIT__ask_add_task').style.display = 'none';
        document.querySelector('.EDIT__task_container').style.display = 'block';
        document.querySelector('.EDIT__confirm_right').style.display = 'inline-flex';

        // Markdown is visible on screen
        hasMarkdown = true;

        // focus on the group input so user does not have to click it.
        document.querySelector('#taskTitleInput').focus();
    });

    // ? User CLICKS Complete and Add another task (from EDIT - after {+ Add Card}) [+ Complete and Add another task]
    document
        .querySelector('.EDIT__btn_confirm_and_add_task ')
        .addEventListener('click', function () {
            hasMarkdown = true;

            // if card has not been created yet - used to create card once
            if (!hasCardBeenAdded) {
                getCardInput();
            }

            // get task data and create task to specific cardID
            getTaskInput();

            // focus on the group input so user does not have to click it.
            document.querySelector('#taskTitleInput').focus();
        });

    // ? User CLICKS and DISPLAYS the GROUP_container for user to create new group (from MAIN - MENU) [+ Add Group]
    document.querySelectorAll('.MENU__btn_add_group').forEach((obj) => {
        obj.addEventListener('click', function () {
            document.querySelector('.GROUP__add_group_container').style.display = 'block';
            // focus on the group input so user does not have to click it.
            document.querySelector('#groupTitleInput').focus();
        });
    });
}
// ! Creation of elements - Groups, Cards, Tasks --------------------------------------------------------------

// * Get Inputs/CONFIRM --------------------------------------------------------------
{
    // ? KEYPRESS - if user presses enter on the Group Input, call the GROUP__btn_confirm button
    document.querySelector('#groupTitleInput').addEventListener('keydown', function onEvent(event) {
        if (event.key === 'Enter') {
            document.querySelector('.GROUP__btn_confirm').click();
        }
    });
    // ? CONFIRM - Get Group Input and store it
    // note: also clears the group-wrapper name
    document.querySelector('.GROUP__btn_confirm').addEventListener('click', function () {
        let groupWrapperTitle = document.querySelector('#groupTitleInput');
        let groupIDNum = new Date().getTime();

        // data to store in groupDict
        let groupInfo = {
            groupInfoIDNum: groupIDNum,
            groupInfoTitle: groupWrapperTitle.value,
            groupInfoContainsCards: [],
        };

        // creation of group
        createGroup(groupWrapperTitle.value, groupIDNum);

        // Store group data in dictionary
        groupDict['group' + groupIDNum] = groupInfo;
        // Store groupDict to firestore
        db.collection('Users')
            .doc(userUID)
            .collection('fbGroupDict')
            .doc('group' + groupIDNum)
            .set({
                groupInfoIDNum: groupIDNum,
                groupInfoTitle: groupWrapperTitle.value,
                groupInfoContainsCards: [],
            });

        // clear text in group-wrapper name
        groupWrapperTitle.value = '';

        // Hide GROUP-wrapper Elements
        groupWrapperTitle.parentNode.parentNode.parentNode.parentNode.style.display = 'none';
    });

    // ? CONFIRM - Call Card and Task Input when user clicks the confirm button
    // note: also clears the card name
    document.querySelector('.EDIT__btn_confirm').addEventListener('click', function () {
        // if card has not been created yet - used to create card once
        if (!hasCardBeenAdded) {
            getCardInput();
        }

        // get task data and create task to specific cardID
        getTaskInput();

        // display MAIN, and reset all required variables, values, etc.
        document.querySelector('.EDIT__btn_exit').click();
    });

    // ? Get Card Input and store it
    function getCardInput() {
        let cardIDNum;

        // Get text of card title input
        let cardTitle = document.querySelector('#cardTitleInput');

        // create numeric card ID
        cardIDNum = new Date().getTime();

        // data to store in cardDict
        let cardInfo = {
            cardInfoIDNum: cardIDNum,
            cardInfoTitle: cardTitle.value,
            cardInfoContainsTasks: [],
        };

        // creation of card
        createCard(cardTitle.value, cardIDNum);

        // assign cardID to currentCardID
        currentCardID = 'cardBody' + cardIDNum;

        // Store cardID to groupDict.contains
        groupDict[currentGroupID].groupInfoContainsCards.push('cardBody' + cardIDNum);
        // Update group.contains data in firestore
        db.collection('Users')
            .doc(userUID)
            .collection('fbGroupDict')
            .doc(currentGroupID)
            .update({
                groupInfoContainsCards: firebase.firestore.FieldValue.arrayUnion(
                    'cardBody' + cardIDNum
                ),
            });

        // Store card data in cardDict
        cardDict['cardBody' + cardIDNum] = cardInfo;
        // Store card data in firestore
        db.collection('Users').doc(userUID).collection('fbCardDict').doc(currentCardID).set({
            cardInfoIDNum: cardIDNum,
            cardInfoTitle: cardTitle.value,
            cardInfoContainsTasks: [],
        });

        // Card has been created, this is for when the User CLICKS 'Complete and Add another task (from EDIT - after {+ Add Card}) [+ Complete and Add another task]'
        hasCardBeenAdded = true;
    }
    // ? Get Task Input and store it
    // note: also clears the task title, description, date
    function getTaskInput() {
        // If there is a task/markdown element on the screen
        if (hasMarkdown) {
            let cardIDNum = currentCardID.replace('cardBody', '');
            let taskIDNum = new Date().getTime();
            var taskInfo;

            // Get text of task title input
            let taskTitle = document.querySelector('#taskTitleInput');

            // Get text of task date input
            let taskDate = document.querySelector('#myDatepicker');

            // Get Task Description - Viewer, Buffer, Markdown
            let TaskDescriptionBuffer = document.querySelector('#buffer');
            let TaskDescriptionMarkdown = document.querySelector('#getm');

            // Simulate Keyup (ENTER) to update markdown incase of LAG
            var keyEventPress = new KeyboardEvent('keyup', {
                code: 'Enter',
                key: 'Enter',
                charKode: 13,
                keyCode: 13,
                view: window,
            });
            TaskDescriptionMarkdown.dispatchEvent(keyEventPress);

            createTask(
                taskTitle.value,
                TaskDescriptionBuffer.innerHTML,
                taskDate.value,
                taskIDNum,
                cardIDNum
            );
            taskInfo = {
                taskInfoIDNum: taskIDNum,
                taskInfoTitle: taskTitle.value,
                taskInfoDesc: TaskDescriptionBuffer.innerHTML,
                taskInfoDate: taskDate.value,
            };

            // Store taskID to cardDict.contains
            cardDict['cardBody' + cardIDNum].cardInfoContainsTasks.push('taskBody' + taskIDNum);
            // Update card.contains data in firestore
            db.collection('Users')
                .doc(userUID)
                .collection('fbCardDict')
                .doc(currentCardID)
                .update({
                    cardInfoContainsTasks: firebase.firestore.FieldValue.arrayUnion(
                        'taskBody' + taskIDNum
                    ),
                });

            // Store task data in dictionary
            taskDict['taskBody' + taskIDNum] = taskInfo;
            // Store task data in firestore
            db.collection('Users')
                .doc(userUID)
                .collection('fbTaskDict')
                .doc('taskBody' + taskIDNum)
                .set({
                    taskInfoIDNum: taskIDNum,
                    taskInfoTitle: taskTitle.value,
                    taskInfoDesc: TaskDescriptionBuffer.innerHTML,
                    taskInfoDate: taskDate.value,
                });

            // clear text in task title, description, date
            taskTitle.value = '';
            TaskDescriptionMarkdown.value = '';
            TaskDescriptionBuffer.innerHTML = '';
            taskDate.value = '';
            taskDate._flatpickr.clear();
            //clearValues()
        } else {
            // hides EDIT screen and displays MAIN screen
            document.querySelector('.EDIT__btn_exit').click();
        }
    }
}

// * Create Elements --------------------------------------------------------------
{
    // ? Create Group
    function createGroup(groupTitle, groupIDNumRef) {
        let Main_Padding = document.querySelector('.MAIN__padding');

        //If there is no group but you are adding one now, show MAIN titlebar (makes it intuitive)
        if (Object.entries(groupDict).length === 0) {
            document.querySelector('.GROUP__ask_add_group_container').style.display = 'none';
            document.querySelector('.btn_add_card').style.display = 'block';
            Main_Padding.querySelector('.titlebar_text').style.display = 'block';
            Main_Padding.querySelector('hr').style.display = 'block';
        }

        // When new group is created, automatically clear all current cards on screen
        document.querySelectorAll('.card_container').forEach((obj) => {
            obj.remove();
        });

        let parent = document.querySelector('.menu_list');
        let li = document.createElement('li');
        let a = document.createElement('a');
        let span = document.createElement('span');
        span.id = 'group' + groupIDNumRef;

        // Option 1
        let group_Options = document.createElement('button');
        group_Options.className = 'button GROUP__btn_delete_group btn_color_red btn_padding';
        group_Options.setAttribute('type', 'button');
        let group_Option_span = document.createElement('span');
        group_Option_span.className = 'icon icon_centered';
        let group_Option_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        group_Option_svg.setAttribute('class', 'svg-inline--fa fa-trash fa-w-14 fa-sm');
        group_Option_svg.setAttribute('aria-hidden', 'true');
        group_Option_svg.setAttribute('data-prefix', 'fa');
        group_Option_svg.setAttribute('data-icon', 'trash');
        group_Option_svg.setAttribute('role', 'img');
        group_Option_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        group_Option_svg.setAttribute('viewBox', '0 0 448 512');
        group_Option_svg.setAttribute('data-fa-i2svg', '');
        let group_Option_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        group_Option_path.setAttribute('fill', 'currentColor');
        group_Option_path.setAttribute(
            'd',
            'M0 84V56c0-13.3 10.7-24 24-24h112l9.4-18.7c4-8.2 12.3-13.3 21.4-13.3h114.3c9.1 0 17.4 5.1 21.5 13.3L312 32h112c13.3 0 24 10.7 24 24v28c0 6.6-5.4 12-12 12H12C5.4 96 0 90.6 0 84zm415.2 56.7L394.8 467c-1.6 25.3-22.6 45-47.9 45H101.1c-25.3 0-46.3-19.7-47.9-45L32.8 140.7c-.4-6.9 5.1-12.7 12-12.7h358.5c6.8 0 12.3 5.8 11.9 12.7z'
        );

        group_Option_svg.appendChild(group_Option_path);
        group_Option_span.appendChild(group_Option_svg);
        group_Options.appendChild(group_Option_span);
        group_Options.onclick = function () {
            deleteElementConfirm('Group', this);
        };

        // set span to user input
        span.textContent = groupTitle;
        // set group name input in MAIN to user input
        Main_Padding.querySelector('input').value = groupTitle;

        // Append child
        li.appendChild(a);
        li.appendChild(group_Options);
        a.appendChild(span);
        parent.appendChild(li);

        // When user clicks on the group, change class to active and remove previous active class
        a.onclick = function () {
            currentGroupID = a.lastChild.id;
            let listItems = parent.querySelectorAll('li');
            for (let i = 0; i < listItems.length; i++) {
                if (listItems[i].classList.contains('active'))
                    listItems[i].classList.remove('active');
            }
            a.parentNode.className = 'active';
            // Hide all card containers

            // If user is in EDIT and clicks a group (in desktop device), goes directly to MAIN and undo's everything
            document.querySelector('.EDIT__btn_exit').click();

            // Remove all card containers from the screen
            document.querySelectorAll('.card_container').forEach((obj) => {
                obj.remove();
            });
            // Load appropriate card containers, relative to the currentGroupID
            loadCards();
            // set group name input in MAIN to user input
            document.querySelector('#MainGroupTitleInput').value = document.querySelector(
                '#' + currentGroupID
            ).textContent;

            // Checks if there are any cards on the screen
            if (document.querySelector('.card_container') != null) {
                document.querySelector('.SORT__container').style.display = 'block';
                document.querySelector('.SORT__btn_sort_card').style.display = 'inline-flex';
                // Checks if there are any tasks on the screen
                if (document.querySelector('.task_container') != null)
                    document.querySelector('.SORT__btn_sort_task').style.display = 'inline-flex';
                else document.querySelector('.SORT__btn_sort_task').style.display = 'none';
            } else {
                document.querySelector('.SORT__container').style.display = 'none';
                document.querySelector('.SORT__btn_sort_card').style.display = 'none';
                document.querySelector('.SORT__btn_sort_task').style.display = 'none';
            }
        };

        // When user creates a group, make its class active
        let listItems = parent.querySelectorAll('li');
        for (let i = 0; i < listItems.length; i++) {
            if (listItems[i].classList.contains('active')) listItems[i].classList.remove('active');
        }
        li.className = 'active';

        // Change currentGroupID to newly created group
        currentGroupID = span.id;

        // Checks if there are any cards on the screen
        if (document.querySelector('.card_container') != null) {
            document.querySelector('.SORT__container').style.display = 'block';
            document.querySelector('.SORT__btn_sort_card').style.display = 'inline-flex';
            // Checks if there are any tasks on the screen
            if (document.querySelector('.task_container') != null)
                document.querySelector('.SORT__btn_sort_task').style.display = 'inline-flex';
            else document.querySelector('.SORT__btn_sort_task').style.display = 'none';
        } else {
            document.querySelector('.SORT__container').style.display = 'none';
            document.querySelector('.SORT__btn_sort_card').style.display = 'none';
            document.querySelector('.SORT__btn_sort_task').style.display = 'none';
        }
    }

    // ? Create Card
    function createCard(cardTitle, cardIDNumRef) {
        let parent = document.querySelector('.PANEL__card');
        let card_Container = document.createElement('div');
        card_Container.className = 'card_container';
        card_Container.id = 'cardContainer'; // + cardIDNumRef; //Don't know if this is needed
        card_Container.setAttribute('data-id', 'cardBody' + cardIDNumRef);
        let card_Body = document.createElement('div');
        card_Body.className = 'card_body btn-group-vertical card_width';
        card_Body.id = 'cardBody' + cardIDNumRef;
        let card_Header = document.createElement('div');
        card_Header.className = 'card_header';
        let card_Header_Bottom = document.createElement('div');
        card_Header_Bottom.className = 'card_header_bottom_fill';
        let card_Title = document.createElement('div');
        card_Title.className = 'card_title';
        let card_Options = document.createElement('div');
        card_Options.className = 'card_header_options';
        card_Title.ondblclick = enlargeCard;

        // Option 1
        let card_Option1 = document.createElement('button');
        card_Option1.className = 'button PANEL__btn_add_task btn_color_blue btn_padding';
        card_Option1.setAttribute('type', 'button');
        let card_Option1_span = document.createElement('span');
        card_Option1_span.className = 'icon icon_up';
        let card_Option1_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        card_Option1_svg.setAttribute('class', 'svg-inline--fa fa-plus fa-w-14 fa-sm');
        card_Option1_svg.setAttribute('aria-hidden', 'true');
        card_Option1_svg.setAttribute('data-prefix', 'fa');
        card_Option1_svg.setAttribute('data-icon', 'plus');
        card_Option1_svg.setAttribute('role', 'img');
        card_Option1_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        card_Option1_svg.setAttribute('viewBox', '0 0 448 512');
        card_Option1_svg.setAttribute('data-fa-i2svg', '');
        let card_Option1_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        card_Option1_path.setAttribute('fill', 'currentColor');
        card_Option1_path.setAttribute(
            'd',
            'M448 294.2v-76.4c0-13.3-10.7-24-24-24H286.2V56c0-13.3-10.7-24-24-24h-76.4c-13.3 0-24 10.7-24 24v137.8H24c-13.3 0-24 10.7-24 24v76.4c0 13.3 10.7 24 24 24h137.8V456c0 13.3 10.7 24 24 24h76.4c13.3 0 24-10.7 24-24V318.2H424c13.3 0 24-10.7 24-24z'
        );

        card_Option1_svg.appendChild(card_Option1_path);
        card_Option1_span.appendChild(card_Option1_svg);
        card_Option1.appendChild(card_Option1_span);
        card_Options.appendChild(card_Option1);
        card_Option1.onclick = addTask;

        // Option 2
        let card_Option2 = document.createElement('button');
        card_Option2.className = 'button PANEL__btn_delete_card btn_color_red btn_padding';
        card_Option2.setAttribute('type', 'button');
        let card_Option2_span = document.createElement('span');
        card_Option2_span.className = 'icon icon_up';
        let card_Option2_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        card_Option2_svg.setAttribute('class', 'svg-inline--fa fa-trash fa-w-14 fa-sm');
        card_Option2_svg.setAttribute('aria-hidden', 'true');
        card_Option2_svg.setAttribute('data-prefix', 'fa');
        card_Option2_svg.setAttribute('data-icon', 'trash');
        card_Option2_svg.setAttribute('role', 'img');
        card_Option2_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        card_Option2_svg.setAttribute('viewBox', '0 0 448 512');
        card_Option2_svg.setAttribute('data-fa-i2svg', '');
        let card_Option2_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        card_Option2_path.setAttribute('fill', 'currentColor');
        card_Option2_path.setAttribute(
            'd',
            'M0 84V56c0-13.3 10.7-24 24-24h112l9.4-18.7c4-8.2 12.3-13.3 21.4-13.3h114.3c9.1 0 17.4 5.1 21.5 13.3L312 32h112c13.3 0 24 10.7 24 24v28c0 6.6-5.4 12-12 12H12C5.4 96 0 90.6 0 84zm415.2 56.7L394.8 467c-1.6 25.3-22.6 45-47.9 45H101.1c-25.3 0-46.3-19.7-47.9-45L32.8 140.7c-.4-6.9 5.1-12.7 12-12.7h358.5c6.8 0 12.3 5.8 11.9 12.7z'
        );

        card_Option2_svg.appendChild(card_Option2_path);
        card_Option2_span.appendChild(card_Option2_svg);
        card_Option2.appendChild(card_Option2_span);
        card_Options.appendChild(card_Option2);
        card_Option2.onclick = function () {
            deleteElementConfirm('Card', this);
        };

        // Option 3
        let card_Option3 = document.createElement('button');
        card_Option3.className = 'button PANEL__btn_edit_card btn_color_white btn_padding';
        card_Option3.setAttribute('type', 'button');
        let card_Option3_span = document.createElement('span');
        card_Option3_span.className = 'icon icon_up';
        let card_Option3_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        card_Option3_svg.setAttribute('class', 'svg-inline--fa fa-pencil-alt fa-w-16 fa-sm');
        card_Option3_svg.setAttribute('aria-hidden', 'true');
        card_Option3_svg.setAttribute('data-prefix', 'fa');
        card_Option3_svg.setAttribute('data-icon', 'pencil-alt');
        card_Option3_svg.setAttribute('role', 'img');
        card_Option3_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        card_Option3_svg.setAttribute('viewBox', '0 0 512 512');
        card_Option3_svg.setAttribute('data-fa-i2svg', '');
        let card_Option3_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        card_Option3_path.setAttribute('fill', 'currentColor');
        card_Option3_path.setAttribute(
            'd',
            'M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z'
        );

        card_Option3_svg.appendChild(card_Option3_path);
        card_Option3_span.appendChild(card_Option3_svg);
        card_Option3.appendChild(card_Option3_span);
        card_Options.appendChild(card_Option3);
        card_Option3.onclick = editCardScreen;

        // set cardTitle to user input
        card_Title.textContent = cardTitle;

        // Append child
        card_Header.appendChild(card_Header_Bottom);
        card_Header.appendChild(card_Title);
        card_Header.appendChild(card_Options);
        card_Container.appendChild(card_Header);
        // card_Body.appendChild(card_Header);
        card_Container.appendChild(card_Body);
        parent.appendChild(card_Container);

        // Checks if there are any cards on the screen
        if (document.querySelector('.card_container') != null) {
            document.querySelector('.SORT__container').style.display = 'block';
            document.querySelector('.SORT__btn_sort_card').style.display = 'inline-flex';
        } else {
            document.querySelector('.SORT__container').style.display = 'none';
            document.querySelector('.SORT__btn_sort_card').style.display = 'none';
            document.querySelector('.SORT__btn_sort_task').style.display = 'none';
        }
    }

    // ? Create Task
    function createTask(taskTitleRef, taskDescriptionRef, taskDateRef, taskIDNumRef, cardIDNumRef) {
        let parent = document.querySelector('#cardBody' + cardIDNumRef);
        let task_Container = document.createElement('div');
        task_Container.className = 'task_container';
        task_Container.setAttribute('data-id', 'taskBody' + taskIDNumRef);
        let task_Body = document.createElement('div');
        task_Body.className = 'task_body';
        task_Body.id = 'taskBody' + taskIDNumRef;
        let task_Options = document.createElement('div');
        task_Options.className = 'task_options';
        let task_Title = document.createElement('div');
        task_Title.className = 'task_title';
        let task_Description = document.createElement('div');
        task_Description.className = 'task_description';
        let task_Date = document.createElement('div');
        task_Date.className = 'task_date';

        task_Container.ondblclick = enlargeTask;
        // Option 1
        let task_Option1 = document.createElement('button');
        task_Option1.className = 'button PANEL__btn_edit_task btn_color_whitesmoke';
        task_Option1.setAttribute('type', 'button');
        let task_Option1_span = document.createElement('span');
        task_Option1_span.className = 'icon icon_centered';

        let task_Option1_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        task_Option1_svg.setAttribute('class', 'svg-inline--fa fa-pencil-alt fa-w-16 fa-sm');
        task_Option1_svg.setAttribute('aria-hidden', 'true');
        task_Option1_svg.setAttribute('data-prefix', 'fa');
        task_Option1_svg.setAttribute('data-icon', 'pencil-alt');
        task_Option1_svg.setAttribute('role', 'img');
        task_Option1_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        task_Option1_svg.setAttribute('viewBox', '0 0 512 512');
        task_Option1_svg.setAttribute('data-fa-i2svg', '');
        let task_Option1_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        task_Option1_path.setAttribute('fill', 'currentColor');
        task_Option1_path.setAttribute(
            'd',
            'M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z'
        );

        task_Option1_svg.appendChild(task_Option1_path);
        task_Option1_span.appendChild(task_Option1_svg);
        task_Option1.appendChild(task_Option1_span);
        task_Options.appendChild(task_Option1);
        task_Option1.onclick = function () {
            // hides MAIN and shows EDIT
            document.querySelector('.EDIT__padding').style.display = 'block';
            document.querySelector('.MAIN__padding').style.display = 'none';
            // switches 'confirm' button for 'confirm edit' button
            document.querySelector('.EDIT__btn_confirm').style.display = 'none';
            document.querySelector('.EDIT__btn_confirm_edit').style.display = 'inline-flex';

            isTaskEditMode = true;

            // assign cardID to currentCardID
            currentCardID = this.parentNode.parentNode.parentNode.parentNode.id;
            // Since it opens a new screen, it sets the card input to the correct cardTitle (from MAIN)
            let cardTitle = document.querySelector('#' + currentCardID);
            document.querySelector('#cardTitleInput').value =
                this.parentNode.parentNode.parentNode.parentNode.parentNode.firstChild.querySelector(
                    '.card_title'
                ).textContent;

            editTaskScreen('taskBody' + taskIDNumRef);
        };
        // Option 2
        let task_Option2 = document.createElement('button');
        task_Option2.className = 'button PANEL__btn_delete_task btn_color_red';
        task_Option2.setAttribute('type', 'button');
        let task_Option2_span = document.createElement('span');
        task_Option2_span.className = 'icon icon_centered';

        let task_Option2_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        task_Option2_svg.setAttribute('class', 'svg-inline--fa fa-trash fa-w-14 fa-sm');
        task_Option2_svg.setAttribute('aria-hidden', 'true');
        task_Option2_svg.setAttribute('data-prefix', 'fa');
        task_Option2_svg.setAttribute('data-icon', 'trash');
        task_Option2_svg.setAttribute('role', 'img');
        task_Option2_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        task_Option2_svg.setAttribute('viewBox', '0 0 448 512');
        task_Option2_svg.setAttribute('data-fa-i2svg', '');
        let task_Option2_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        task_Option2_path.setAttribute('fill', 'currentColor');
        task_Option2_path.setAttribute(
            'd',
            'M0 84V56c0-13.3 10.7-24 24-24h112l9.4-18.7c4-8.2 12.3-13.3 21.4-13.3h114.3c9.1 0 17.4 5.1 21.5 13.3L312 32h112c13.3 0 24 10.7 24 24v28c0 6.6-5.4 12-12 12H12C5.4 96 0 90.6 0 84zm415.2 56.7L394.8 467c-1.6 25.3-22.6 45-47.9 45H101.1c-25.3 0-46.3-19.7-47.9-45L32.8 140.7c-.4-6.9 5.1-12.7 12-12.7h358.5c6.8 0 12.3 5.8 11.9 12.7z'
        );

        task_Option2_svg.appendChild(task_Option2_path);
        task_Option2_span.appendChild(task_Option2_svg);
        task_Option2.appendChild(task_Option2_span);
        task_Options.appendChild(task_Option2);
        task_Option2.onclick = function () {
            deleteElementConfirm('Task', this);
        };

        // set task elements to user input
        task_Title.textContent = taskTitleRef;
        task_Description.innerHTML = taskDescriptionRef;

        // check if task_date has a value
        if (taskDateRef.length > 0) {
            var taskDateArr = taskDateRef.split(' to ');
            if (taskDateArr.length > 1) {
                let task_Date_Left = document.createElement('div');
                task_Date_Left.className = 'task_date_left';
                task_Date_Left.textContent = 'Made On: ' + taskDateArr[0];
                // task_Date_Left.textContent = "Made On: " + taskDateArr[0] + " —\u00A0";
                let task_Date_Right = document.createElement('div');
                task_Date_Right.className = 'task_date_right';
                task_Date_Right.textContent = 'Due On: ' + taskDateArr[1];

                task_Date.appendChild(task_Date_Left);
                task_Date.appendChild(task_Date_Right);
            } else {
                let task_Date_Left = document.createElement('div');
                task_Date_Left.className = 'task_date_left';
                task_Date_Left.textContent = 'Made On: ' + taskDateArr[0];
                let task_Date_Right = document.createElement('div');
                task_Date_Right.className = 'task_date_right';
                task_Date_Right.textContent = '';

                task_Date.appendChild(task_Date_Left);
                task_Date.appendChild(task_Date_Right);
            }
        } else {
            let task_Date_Left = document.createElement('div');
            task_Date_Left.className = 'task_date_left';
            task_Date_Left.textContent = '';
            let task_Date_Right = document.createElement('div');
            task_Date_Right.className = 'task_date_right';
            task_Date_Right.textContent = '';

            task_Date.appendChild(task_Date_Left);
            task_Date.appendChild(task_Date_Right);
        }

        // Append elements to card parent
        task_Body.appendChild(task_Title);
        task_Body.appendChild(task_Description);
        task_Body.appendChild(task_Date);
        task_Body.appendChild(task_Options);
        task_Container.appendChild(task_Body);
        parent.appendChild(task_Container);

        // Checks if there are any tasks on the screen
        if (document.querySelector('.task_container') != null)
            document.querySelector('.SORT__btn_sort_task').style.display = 'inline-flex';
    }
}

// * Load Elements --------------------------------------------------------------
// ? Load Cards
function loadCards() {
    if (Object.entries(groupDict).length > 0) {
        for (const containedCards of groupDict[currentGroupID].groupInfoContainsCards) {
            createCard(
                cardDict[containedCards].cardInfoTitle,
                containedCards.replace('cardBody', '')
            );
            if (Object.entries(cardDict[containedCards].cardInfoContainsTasks).length > 0) {
                for (const containedTasks of cardDict[containedCards].cardInfoContainsTasks) {
                    createTask(
                        taskDict[containedTasks].taskInfoTitle,
                        taskDict[containedTasks].taskInfoDesc,
                        taskDict[containedTasks].taskInfoDate,
                        containedTasks.replace('taskBody', ''),
                        containedCards.replace('cardBody', '')
                    );
                }
            }
        }
    }
}

// * Delete Stuff --------------------------------------------------------------
{
    // ? User deletes a group (from MENU)
    function deleteGroup(thisObj) {
        var g = thisObj.parentNode;
        // Used to prevent user from being able to click delete button twice and cause error
        g.style.pointerEvents = 'none';
        //delete animation
        g.animate(
            [
                // keyframes
                { opacity: '.5' },
                { opacity: '0' },
            ],
            {
                // timing options
                duration: 500,
            }
        );

        let tempGroupID = thisObj.parentNode.firstChild.lastChild.id;

        // delete card data that was inside groupDict.contains
        for (const containedCards of groupDict[tempGroupID].groupInfoContainsCards) {
            for (const containedTasks of cardDict[containedCards].cardInfoContainsTasks) {
                delete taskDict[containedTasks];
                // delete task in firestore
                db.collection('Users')
                    .doc(userUID)
                    .collection('fbTaskDict')
                    .doc(containedTasks)
                    .delete();
            }
            delete cardDict[containedCards];
            // delete card in firestore
            db.collection('Users')
                .doc(userUID)
                .collection('fbCardDict')
                .doc(containedCards)
                .delete();
        }
        delete groupDict[tempGroupID];
        // delete group in firestore
        db.collection('Users').doc(userUID).collection('fbGroupDict').doc(tempGroupID).delete();

        // Timeout to delete until animation complete and check if there are any groups left
        setTimeout(function () {
            g.remove();
            if (Object.entries(groupDict).length === 0) {
                // check if groupDict has any keys/values - if it doesn't, display appropriate elements
                let Main_Padding = document.querySelector('.MAIN__padding');
                document.querySelector('.GROUP__ask_add_group_container').style.display = 'block';
                document.querySelector('.btn_add_card').style.display = 'none';
                Main_Padding.querySelector('.titlebar_text').style.display = 'none';
                Main_Padding.querySelector('hr').style.display = 'none';
                // if user deletes the last group, but that group contains cards, hide them all
                Main_Padding.querySelectorAll('.card_container').forEach((obj) => {
                    obj.style.display = 'none';
                });
            } else {
                //automatically select first list in menu_list when a group is deleted
                let menu_list = document.querySelector('.menu_list');
                let li = menu_list.querySelector('li');
                li.querySelector('a').click();
            }
        }, 500);
    }

    function deleteElementConfirm(name, thisObjRef) {
        let delete_container = document.querySelector('.DeleteConfirm__container');
        delete_container.style.display = 'block';
        if (name == 'Group') {
            // set up the text for the deleteConfirm container
            delete_container.querySelector('.DeleteConfirm__header_wrapper').textContent =
                'Are you sure you want to delete this group:';
            delete_container.querySelector('.DeleteConfirm__header_wrapper_title').textContent =
                "'" + thisObjRef.parentNode.firstChild.firstChild.textContent + "'";
            // when user clicks the confirm btn, call the specific delete 'element' function
            document.querySelector('.DeleteConfirm__btn_confirm').onclick = () => {
                deleteGroup(thisObjRef);
                // hide the deleteConfirm container
                document.querySelector('.DeleteConfirm__btn_exit').click();
            };
        }
        if (name == 'Card') {
            delete_container.querySelector('.DeleteConfirm__header_wrapper').textContent =
                'Are you sure you want to delete this card:';
            delete_container.querySelector('.DeleteConfirm__header_wrapper_title').textContent =
                "'" +
                thisObjRef.parentNode.parentNode.querySelector('div:nth-child(2)').textContent +
                "'";
            // when user clicks the confirm btn, call the specific delete 'element' function
            document.querySelector('.DeleteConfirm__btn_confirm').onclick = () => {
                deleteCard(thisObjRef);
                // hide the deleteConfirm container
                document.querySelector('.DeleteConfirm__btn_exit').click();
            };
        }

        if (name == 'Task') {
            // If task title is NOT empty
            if (thisObjRef.parentNode.parentNode.firstChild.textContent != '') {
                delete_container.querySelector('.DeleteConfirm__header_wrapper').textContent =
                    'Are you sure you want to delete this task (title):';
                delete_container.querySelector('.DeleteConfirm__header_wrapper_title').textContent =
                    "'" + thisObjRef.parentNode.parentNode.firstChild.textContent + "'";
            } else {
                //if task title is empty, show task description
                delete_container.querySelector('.DeleteConfirm__header_wrapper').textContent =
                    'Are you sure you want to delete this task (description):';
                delete_container.querySelector('.DeleteConfirm__header_wrapper_title').textContent =
                    "'" +
                    thisObjRef.parentNode.parentNode
                        .querySelector('div:nth-child(2)')
                        .textContent.substring(0, 50) +
                    "...'";
            }
            // when user clicks the confirm btn, call the specific delete 'element' function
            document.querySelector('.DeleteConfirm__btn_confirm').onclick = () => {
                deleteTask(thisObjRef);
                // hide the deleteConfirm container
                document.querySelector('.DeleteConfirm__btn_exit').click();
            };
        }
    }

    // ? User deletes a card (from MAIN titlebar)
    function deleteCard(thisObj) {
        var c = thisObj.parentNode.parentNode.parentNode;
        //delete animation
        c.animate(
            [
                // keyframes
                { opacity: '.5' },
                { opacity: '0' },
            ],
            {
                // timing options
                duration: 500,
            }
        );

        // Timeout to delete until animation complete
        setTimeout(function () {
            c.remove();

            // if there are no card containers on the screen
            if (document.querySelector('.card_container') == null) {
                document.querySelector('.SORT__container').style.display = 'none';
                document.querySelector('.SORT__btn_sort_card').style.display = 'none';
                document.querySelector('.SORT__btn_sort_task').style.display = 'none';
            }
        }, 500);

        // Delete all card data
        let deletedCardID = thisObj.parentNode.parentNode.parentNode.lastChild.id;
        // delete task data that was inside cardDict.contains
        for (const containedTasks of cardDict[deletedCardID].cardInfoContainsTasks) {
            delete taskDict[containedTasks];
            // delete task in firestore
            db.collection('Users')
                .doc(userUID)
                .collection('fbTaskDict')
                .doc(containedTasks)
                .delete();
        }

        // delete card data from cardDict
        delete cardDict[deletedCardID];
        // delete card in firestore
        db.collection('Users').doc(userUID).collection('fbCardDict').doc(deletedCardID).delete();

        // delete card data that was inside groupDict.contains
        let deletedCardIndex =
            groupDict[currentGroupID].groupInfoContainsCards.indexOf(deletedCardID);
        groupDict[currentGroupID].groupInfoContainsCards.splice(deletedCardIndex, 1);
        // delete group.contains in firestore
        db.collection('Users')
            .doc(userUID)
            .collection('fbGroupDict')
            .doc(currentGroupID)
            .update({
                groupInfoContainsCards: firebase.firestore.FieldValue.arrayRemove(deletedCardID),
                // groupInfoContainsCards: groupDict[currentGroupID].groupInfoContainsCards.filter(toBeDeletedCard => toBeDeletedCard !== deletedCardID)
            });
    }

    // ? User deletes a task (from MAIN titlebar)
    function deleteTask(thisObj) {
        var t = thisObj.parentNode.parentNode.parentNode;
        //delete animation
        t.animate(
            [
                // keyframes
                { opacity: '.5', transform: 'scale(1)' },
                { opacity: '0', transform: 'scale(.5)' },
            ],
            {
                // timing options
                duration: 500,
            }
        );

        // Timeout to delete until animation complete
        setTimeout(function () {
            t.remove();

            // if there are no task containers on the screen
            if (document.querySelector('.task_container') == null)
                document.querySelector('.SORT__btn_sort_task ').style.display = 'none';
        }, 500);

        // Delete all task data
        let deletedTaskID = thisObj.parentNode.parentNode.id;
        currentCardID = thisObj.parentNode.parentNode.parentNode.parentNode.id;
        // delete task data that was inside cardDict.contains
        let deletedTaskIndex = cardDict[currentCardID].cardInfoContainsTasks.indexOf(deletedTaskID);
        cardDict[currentCardID].cardInfoContainsTasks.splice(deletedTaskIndex, 1);
        // delete card.contains in firestore
        db.collection('Users')
            .doc(userUID)
            .collection('fbCardDict')
            .doc(currentCardID)
            .update({
                cardInfoContainsTasks: firebase.firestore.FieldValue.arrayRemove(deletedTaskID),
                // cardInfoContainsTasks: cardDict[currentCardID].cardInfoContainsTasks.filter(toBeDeletedTask => toBeDeletedTask !== deletedTaskID)
            });

        // delete task data from taskDict
        delete taskDict[deletedTaskID];
        // delete task in firestore
        db.collection('Users').doc(userUID).collection('fbTaskDict').doc(deletedTaskID).delete();
    }
}

// ? SORTING CARDS/TASKS
var sortCard = false;
var sortTask = false;

var taskOrder = [];
var sortables = [];

var sortableCard;
var sortableTask;

var boxFilter;

// ? USER CLICKS/SORTS the CARDS (from MAIN)
document.querySelector('.SORT__btn_sort_card').addEventListener('click', function () {
    sortCard = !sortCard;
    let panel = document.querySelector('.PANEL__card');
    if (sortCard) {
        // Make the card containers sortable
        sortableCard = Sortable.create(panel, {
            multiDrag: true, // Enable the plugin
            selectedClass: 'sortable-selected', // Class name for selected item
            animation: 175,
            fallbackTolerance: 3,
        });
        // Add a filter/blur to the entire screen and increase zIndex of sort btn
        boxFilter = document.createElement('div');
        boxFilter.className = 'box_filter';
        document.querySelector('body').appendChild(boxFilter);
        document.querySelector('.SORT__btn_sort_card').style.zIndex = '5';
        document.querySelectorAll('.card_header_options').forEach((obj) => {
            obj.style.display = 'none';
        });
        document.querySelectorAll('.task_options').forEach((obj) => {
            obj.style = 'display: none !important';
        });
    } else {
        // remove the box filter and decrease zIndex of sort btn and
        boxFilter.remove();
        document.querySelector('.SORT__btn_sort_card').style.zIndex = '0';
        document.querySelectorAll('.card_header_options').forEach((obj) => {
            obj.style.display = 'block';
        });
        document.querySelectorAll('.task_options').forEach((obj) => {
            obj.style = 'display: auto !important';
        });

        // disable the sortable state of card containers
        let state = sortableCard.option('disabled'); // get
        sortableCard.option('disabled', !state); // set

        // Turn it into an array, containing the order of the data-id's of the card_container's
        var cardOrder = sortableCard.toArray();

        // Save new card order to groupDict
        groupDict[currentGroupID].groupInfoContainsCards = cardOrder;

        // Store/Update new card order to firestore
        db.collection('Users').doc(userUID).collection('fbGroupDict').doc(currentGroupID).update({
            groupInfoContainsCards: cardOrder,
        });
    }
});

// ? USER CLICKS/SORTS the TASKS (from MAIN)
document.querySelector('.SORT__btn_sort_task').addEventListener('click', function () {
    sortTask = !sortTask;

    if (sortTask) {
        // Make the task containers sortable
        document.querySelectorAll('.card_body').forEach((obj) => {
            // for all elements named '.card_body', make obj/element Sortable and push to sortables array
            sortables.push(
                new Sortable(obj, {
                    multiDrag: true, // Enable the plugin
                    selectedClass: 'sortable-selected', // Class name for selected item
                    group: '.card_body', // shared group
                    animation: 175,
                    fallbackTolerance: 3,
                    onEnd: function (/**Event*/ evt) {
                        let newTarget = evt.to.id;
                        let oldTarget = evt.from.id;

                        let cardIDArrContains = document
                            .querySelector('#' + newTarget)
                            .querySelectorAll('.task_container');

                        cardIDArrContains.forEach((obj) => {
                            taskOrder.push(obj.getAttribute('data-id'));
                        });
                        cardDict[newTarget].cardInfoContainsTasks = taskOrder;

                        // Reset taskOrder
                        taskOrder = [];

                        cardIDArrContains = document
                            .querySelector('#' + oldTarget)
                            .querySelectorAll('.task_container');

                        cardIDArrContains.forEach((obj) => {
                            taskOrder.push(obj.getAttribute('data-id'));
                        });
                        cardDict[oldTarget].cardInfoContainsTasks = taskOrder;

                        // Reset taskOrder
                        taskOrder = [];
                    },
                })
            );
        });
        // Add a filter/blur to the entire screen and increase zIndex of sort btn
        boxFilter = document.createElement('div');
        boxFilter.className = 'box_filter';
        document.querySelector('body').appendChild(boxFilter);
        document.querySelector('.SORT__btn_sort_task').style.zIndex = '5';
        document.querySelectorAll('.card_header_options').forEach((obj) => {
            obj.style.display = 'none';
        });
        document.querySelectorAll('.task_options').forEach((obj) => {
            obj.style = 'display: none !important';
        });
    } else {
        // remove the box filter and decrease zIndex of sort btn
        boxFilter.remove();
        document.querySelector('.SORT__btn_sort_task').style.zIndex = '0';
        document.querySelectorAll('.card_header_options').forEach((obj) => {
            obj.style.display = 'block';
        });
        document.querySelectorAll('.task_options').forEach((obj) => {
            obj.style = 'display: auto !important';
        });
        // disable the sortable state of card containers
        sortables.forEach((obj) => {
            // disable each obj that has 'new Sortable()'
            let state = obj.option('disabled'); // get
            obj.option('disabled', !state); // set
        });

        // reset sortables array
        sortables = [];

        let groupContains = groupDict[currentGroupID].groupInfoContainsCards;
        /// for each cardID in groupDict.contains
        groupContains.forEach((groupCardID) => {
            // Store/Update new card order to firestore
            db.collection('Users').doc(userUID).collection('fbCardDict').doc(groupCardID).update({
                cardInfoContainsTasks: cardDict[groupCardID].cardInfoContainsTasks,
            });
        });
    }
});
// ! TEMPORARY AND BAD IMPLEMENTATION
// ! THIS ONLY WORKS ON DESKTOP.  DOES NOT WORK ON MOBILE AS ondblclick IS NOT RECOGNIZED
// * Enlarge Tasks
function enlargeTask() {
    enlargedID = this.getAttribute('data-id');
    if (!sortTask && !sortCard) {
        if (
            !this.classList.contains('enlarged') &&
            !this.classList.contains('enlarged__btn_exit')
        ) {
            //if task_container does not have the class 'enlarged'
            boxFilter2 = document.createElement('div');
            boxFilter2.className = 'box_filter2';
            document.querySelector('body').appendChild(boxFilter2);

            enlargedBackground = document.createElement('div');
            enlargedBackground.className = 'enlarged_background enlarged';
            enlargedBackground.ondblclick = enlargeTask;

            enlargedBody = document.createElement('div');
            enlargedBody.className = 'enlarged_body';

            enlargedTitle = document.createElement('div');
            enlargedTitle.innerHTML = taskDict[enlargedID].taskInfoTitle;
            enlargedTitle.className = 'enlarged_title';

            enlargedDesc = document.createElement('div');
            enlargedDesc.innerHTML = taskDict[enlargedID].taskInfoDesc;
            enlargedDesc.className = 'enlarged_desc';

            enlargedDate = document.createElement('div');
            tempTaskDate = taskDict[enlargedID].taskInfoDate;
            if (tempTaskDate !== '') {
                enlargedDate.className = 'enlarged_date';

                var taskDateArr = tempTaskDate.split(' to ');
                if (taskDateArr.length > 1) {
                    enlargedDate.innerHTML =
                        '<strong>Made On:</strong> ' +
                        taskDateArr[0] +
                        ' | <strong>Due On:</strong> ' +
                        taskDateArr[1];
                } else {
                    enlargedDate.innerHTML = '<strong>Made On:</strong> ' + taskDateArr[0];
                }
            } else {
                enlargedDate.innerHTML = '';
            }
            enlargedTitle.appendChild(enlargedDate);
            enlargedBody.appendChild(enlargedTitle);
            enlargedBody.appendChild(enlargedDesc);
            enlargedBackground.appendChild(enlargedBody);

            enlargedBtnWrapper = document.createElement('div');
            enlargedBtnWrapper.className = 'enlarged__btn_wrapper';

            enlargedBtn = document.createElement('button');
            enlargedBtn.className = 'enlarged__btn_exit';

            let enlargedBtn_span = document.createElement('span');
            enlargedBtn_span.className = 'icon icon_centered';

            let enlargedBtn_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            enlargedBtn_svg.setAttribute('class', 'svg-inline--fa fa-times fa-w-18 fa-lg');
            enlargedBtn_svg.setAttribute('aria-hidden', 'true');
            enlargedBtn_svg.setAttribute('data-prefix', 'fa');
            enlargedBtn_svg.setAttribute('data-icon', 'times');
            enlargedBtn_svg.setAttribute('role', 'img');
            enlargedBtn_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            enlargedBtn_svg.setAttribute('viewBox', '0 0 448 512');
            enlargedBtn_svg.setAttribute('data-fa-i2svg', '');
            let enlargedBtn_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            enlargedBtn_path.setAttribute('fill', 'currentColor');
            enlargedBtn_path.setAttribute(
                'd',
                'M323.1 441l53.9-53.9c9.4-9.4 9.4-24.5 0-33.9L279.8 256l97.2-97.2c9.4-9.4 9.4-24.5 0-33.9L323.1 71c-9.4-9.4-24.5-9.4-33.9 0L192 168.2 94.8 71c-9.4-9.4-24.5-9.4-33.9 0L7 124.9c-9.4 9.4-9.4 24.5 0 33.9l97.2 97.2L7 353.2c-9.4 9.4-9.4 24.5 0 33.9L60.9 441c9.4 9.4 24.5 9.4 33.9 0l97.2-97.2 97.2 97.2c9.3 9.3 24.5 9.3 33.9 0z'
            );
            enlargedBtn.onclick = enlargeTask;

            enlargedBtn_svg.appendChild(enlargedBtn_path);
            enlargedBtn_span.appendChild(enlargedBtn_svg);
            enlargedBtn.appendChild(enlargedBtn_span);
            enlargedBtnWrapper.appendChild(enlargedBtn);
            enlargedBackground.appendChild(enlargedBtnWrapper);
            document.querySelector('.box').appendChild(enlargedBackground);
        } else {
            // document.querySelectorAll('.enlarged').forEach((element) => {
            this.classList.remove('enlarged');
            // });
            enlargedBackground.remove();
            boxFilter2.remove();
        }
    }
}

function enlargeCard() {
    enlargedID = this.parentNode.parentNode.getAttribute('data-id');
    if (!sortTask && !sortCard) {
        if (
            !this.classList.contains('enlarged') &&
            !this.classList.contains('enlarged__btn_exit')
        ) {
            //if task_container does not have the class 'enlarged'
            boxFilter2 = document.createElement('div');
            boxFilter2.className = 'box_filter2';
            document.querySelector('body').appendChild(boxFilter2);

            enlargedBackground = document.createElement('div');
            enlargedBackground.className = 'enlarged_background enlarged';
            enlargedBackground.ondblclick = enlargeCard;

            // add tasks to the enlargedBackground
            cardDict[enlargedID].cardInfoContainsTasks.forEach((task) => {
                enlargedBody = document.createElement('div');
                enlargedBody.className = 'enlarged_card_body';

                enlargedTitle = document.createElement('div');
                enlargedTitle.innerHTML = taskDict[task].taskInfoTitle;
                enlargedTitle.className = 'enlarged_title';

                enlargedDesc = document.createElement('div');
                enlargedDesc.innerHTML = taskDict[task].taskInfoDesc;
                enlargedDesc.className = 'enlarged_card_desc';

                enlargedDate = document.createElement('div');
                tempTaskDate = taskDict[task].taskInfoDate;
                if (tempTaskDate !== '') {
                    enlargedDate.className = 'enlarged_date';

                    var taskDateArr = tempTaskDate.split(' to ');
                    if (taskDateArr.length > 1) {
                        enlargedDate.innerHTML =
                            '<strong>Made On:</strong> ' +
                            taskDateArr[0] +
                            ' | <strong>Due On:</strong> ' +
                            taskDateArr[1];
                    } else {
                        enlargedDate.innerHTML = '<strong>Made On:</strong> ' + taskDateArr[0];
                    }
                } else {
                    enlargedDate.innerHTML = '';
                }
                enlargedTitle.appendChild(enlargedDate);
                enlargedBody.appendChild(enlargedTitle);
                enlargedBody.appendChild(enlargedDesc);
                enlargedBackground.appendChild(enlargedBody);
            });

            enlargedBtnWrapper = document.createElement('div');
            enlargedBtnWrapper.className = 'enlarged__btn_wrapper';

            enlargedBtn = document.createElement('button');
            enlargedBtn.className = 'enlarged__btn_exit';

            let enlargedBtn_span = document.createElement('span');
            enlargedBtn_span.className = 'icon icon_centered';

            let enlargedBtn_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            enlargedBtn_svg.setAttribute('class', 'svg-inline--fa fa-times fa-w-18 fa-lg');
            enlargedBtn_svg.setAttribute('aria-hidden', 'true');
            enlargedBtn_svg.setAttribute('data-prefix', 'fa');
            enlargedBtn_svg.setAttribute('data-icon', 'times');
            enlargedBtn_svg.setAttribute('role', 'img');
            enlargedBtn_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            enlargedBtn_svg.setAttribute('viewBox', '0 0 448 512');
            enlargedBtn_svg.setAttribute('data-fa-i2svg', '');
            let enlargedBtn_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            enlargedBtn_path.setAttribute('fill', 'currentColor');
            enlargedBtn_path.setAttribute(
                'd',
                'M323.1 441l53.9-53.9c9.4-9.4 9.4-24.5 0-33.9L279.8 256l97.2-97.2c9.4-9.4 9.4-24.5 0-33.9L323.1 71c-9.4-9.4-24.5-9.4-33.9 0L192 168.2 94.8 71c-9.4-9.4-24.5-9.4-33.9 0L7 124.9c-9.4 9.4-9.4 24.5 0 33.9l97.2 97.2L7 353.2c-9.4 9.4-9.4 24.5 0 33.9L60.9 441c9.4 9.4 24.5 9.4 33.9 0l97.2-97.2 97.2 97.2c9.3 9.3 24.5 9.3 33.9 0z'
            );
            enlargedBtn.onclick = enlargeTask;

            enlargedBtn_svg.appendChild(enlargedBtn_path);
            enlargedBtn_span.appendChild(enlargedBtn_svg);
            enlargedBtn.appendChild(enlargedBtn_span);
            enlargedBtnWrapper.appendChild(enlargedBtn);
            enlargedBackground.appendChild(enlargedBtnWrapper);
            document.querySelector('.box').appendChild(enlargedBackground);
        } else {
            // document.querySelectorAll('.enlarged').forEach((element) => {
            this.classList.remove('enlarged');
            // });
            enlargedBackground.remove();
            boxFilter2.remove();
        }
    }
}

// * Testing
// function displayData() {
//     console.log(groupDict);
//     console.log(cardDict);
//     console.log(taskDict);
// }

function AccountLogout() {
    document.querySelector('.ACCOUNT__container').style.display = 'block';
}

// logout of account
document.querySelector('.btn_logout').addEventListener('click', (e) => {
    auth.signOut();
});
