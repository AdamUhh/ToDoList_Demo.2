var userUID;

// listen for auth status changes
auth.onAuthStateChanged((user) => {
    if (user) {
        //if there is a user
        getFSData(user.uid).then(CreateElements);
        userUID = user.uid;
        document.querySelector(".ACCOUNT__header_wrapper span").textContent = "Currently Logged in as: " + user.email;
    } else {
        //if user is null
        // console.log("logged out");

        //if user logged out, redirect to auth.html
        history.pushState("auth.html", "", "auth.html");
        location.reload();
    }
});

// get() the groupDict, then() call an ES6 arrow function
function getFSData(userUIDRef) {
    return new Promise(function (resolve) {
        db.collection("Users")
            .doc(userUIDRef)
            .collection("fbGroupDict")
            .get()
            .then((snapshot) => {
                snapshot.docs.forEach((doc) => {
                    // store data into temporary group dictonary if there is a value
                    if (Object.entries(doc.data()).length != 0) {
                        let tempGroupDict = doc.data();

                        // store the values in groupDict[groupID]
                        groupDict["group" + tempGroupDict.groupInfoIDNum] = tempGroupDict;

                        // Create group
                        createGroup(
                            groupDict["group" + tempGroupDict.groupInfoIDNum].groupInfoTitle,
                            groupDict["group" + tempGroupDict.groupInfoIDNum].groupInfoIDNum
                        );
                    }
                });
                // console.log(groupDict);
            });

        db.collection("Users")
            .doc(userUIDRef)
            .collection("fbTaskDict")
            .get()
            .then((snapshot) => {
                // console.log(snapshot.docs);
                snapshot.docs.forEach((doc) => {
                    // store data into temporary task dictonary if there is a value
                    if (Object.entries(doc.data()).length != 0) {
                        // store data into temporary task dictonary
                        let tempTaskDict = doc.data();

                        // store the values in taskDict[firstKey]
                        taskDict["taskBody" + tempTaskDict.taskInfoIDNum] = tempTaskDict;
                    }
                });
                // console.log(taskDict);
            });

        db.collection("Users")
            .doc(userUIDRef)
            .collection("fbCardDict")
            .get()
            .then((snapshot) => {
                // console.log(snapshot.docs);
                snapshot.docs.forEach((doc) => {
                    // store data into temporary card dictonary if there is a value
                    if (Object.entries(doc.data()).length != 0) {
                        // store data into temporary card dictonary
                        let tempCardDict = doc.data();

                        // store the values in cardDict[firstKey]
                        cardDict["cardBody" + tempCardDict.cardInfoIDNum] = tempCardDict;
                    }
                });
                // console.log(cardDict);
                // when all tasks are loaded, start creation of elements for first group
                // setTimeout(() => {
                resolve();
                // }, 500);
            });
    });
}

function CreateElements() {
    // remove loading screen
    document.querySelector("#loading").remove();

    if (Object.entries(groupDict).length != 0) {
        let Main_Padding = document.querySelector(".MAIN__padding");
        document.querySelector(".GROUP__ask_add_group_container").style.display = "none";
        document.querySelector(".btn_add_card").style.display = "block";
        Main_Padding.querySelector(".titlebar_text").style.display = "block";
        Main_Padding.querySelector("hr").style.display = "block";

        //automatically select first list in menu_list
        let menu_list = document.querySelector(".menu_list");
        let li = menu_list.querySelector("li");
        li.querySelector("a").click();
    } else { // if there is no group
        document.querySelector(".GROUP__ask_add_group_container").style.display = "block";
    }
}
