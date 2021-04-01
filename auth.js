// ? FRONT-END VISUALS
document.querySelector(".text_create_account").addEventListener("click", function () {
    document.querySelector("#login_form").style.display = "none";
    document.querySelector("#signup_form").style.display = "block";

    document.querySelector(".text_create_account").style.display = "none";
    document.querySelector(".text_go_back").style.display = "block";
});

document.querySelector(".text_go_back").addEventListener("click", function () {
    document.querySelector("#login_form").style.display = "block";
    document.querySelector("#signup_form").style.display = "none";

    document.querySelector(".text_create_account").style.display = "block";
    document.querySelector(".text_go_back").style.display = "none";
});

// ? SIGN UP JAVASCRIPT
const signupForm = document.querySelector("#signup_form");
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get user info
    const email = signupForm["signup_email"].value;
    const password = signupForm["signup_password"].value;

    // Sign up the user
    auth.createUserWithEmailAndPassword(email, password)
        .then((cred) => {

            // save new user to firestore
            return (
                db.collection("Users").doc(cred.user.uid).collection("fbGroupDict").doc("dummy").set({}),
                db.collection("Users").doc(cred.user.uid).collection("fbCardDict").doc("dummy").set({}),
                db.collection("Users").doc(cred.user.uid).collection("fbTaskDict").doc("dummy").set({})
            );
        })
        .then(() => {
            // Reset the signup form
            signupForm.reset();

            // Redirect to index.html
            history.pushState("index.html", "", "index.html");
            location.reload();
        })
        .catch((err) => {
            signupForm.querySelector(".error").innerHTML = err.message;
        });
});

// ? LOG IN JAVASCRIPT
const loginForm = document.querySelector("#login_form");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get user info
    const email = loginForm["login_email"].value;
    const password = loginForm["login_password"].value;

    // Login the user
    auth.signInWithEmailAndPassword(email, password)
        .then((cred) => {
            // Reset the login form
            loginForm.reset();

            // Redirect to index.html
            history.pushState("index.html", "", "index.html");
            location.reload();
        })
        .catch((err) => {
            loginForm.querySelector(".error").innerHTML = err.message;
        });
});
