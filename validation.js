const form = document.getElementById('form');

const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');


// ========================
// SIGNUP
// ========================
function signupUser(email, password) {
    const user = { email, password };

    localStorage.setItem("user", JSON.stringify(user));

    // set logged in user for tracker
    localStorage.setItem("currentUser", email);

    window.location.href = "login.html";
}


// ========================
// LOGIN
// ========================
function loginUser(email, password) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.email === email && user.password === password) {
        localStorage.setItem("currentUser", email);
        window.location.href = "tracker.html";
    } else {
        alert("Invalid login credentials");
    }
}


// ========================
// FORM HANDLER
// ========================
form.addEventListener('submit', (e) => {
    e.preventDefault();

    let errors = [];

    // SIGNUP PAGE
    if (firstname_input) {
        errors = getSignupFormErrors(
            firstname_input.value,
            email_input.value,
            password_input.value,
            repeat_password_input.value
        );

        if (errors.length === 0) {
            signupUser(email_input.value, password_input.value);
        }

    // LOGIN PAGE
    } else {
        errors = getLoginFormErrors(email_input.value, password_input.value);

        if (errors.length === 0) {
            loginUser(email_input.value, password_input.value);
        }
    }

    if (errors.length > 0) {
        error_message.innerText = errors.join(". ");
    }
});


// ========================
// SIGNUP VALIDATION
// ========================
function getSignupFormErrors(firstname, email, password, repeatPassword) {
    let errors = [];

    if (!firstname) {
        errors.push("Firstname is required");
        firstname_input?.parentElement.classList.add("incorrect");
    }

    if (!email) {
        errors.push("Email is required");
        email_input.parentElement.classList.add("incorrect");
    }

    if (!password) {
        errors.push("Password is required");
        password_input.parentElement.classList.add("incorrect");
    }

    if (password && password.length < 8) {
        errors.push("Password must have at least 8 characters");
        password_input.parentElement.classList.add("incorrect");
    }

    if (password !== repeatPassword) {
        errors.push("Passwords do not match");
        password_input.parentElement.classList.add("incorrect");
        repeat_password_input.parentElement.classList.add("incorrect");
    }

    return errors;
}


// ========================
// LOGIN VALIDATION
// ========================
function getLoginFormErrors(email, password) {
    let errors = [];

    if (!email) {
        errors.push("Email is required");
        email_input.parentElement.classList.add("incorrect");
    }

    if (!password) {
        errors.push("Password is required");
        password_input.parentElement.classList.add("incorrect");
    }

    return errors;
}


// ========================
// CLEAR ERRORS
// ========================
const allInputs = [firstname_input, email_input, password_input, repeat_password_input]
    .filter(Boolean);

allInputs.forEach(input => {
    input.addEventListener('input', () => {
        input.parentElement.classList.remove('incorrect');
        error_message.innerText = '';
    });
});