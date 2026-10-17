document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("login");
    const registerForm = document.getElementById("register");

    const loginFormBox = document.getElementById("loginForm");
    const registerFormBox = document.getElementById("registerForm");

    const showLogin = document.getElementById("showLogin");
    const showRegister = document.getElementById("showRegister");

    const message = document.getElementById("message");

    // Get registered users
    function getUsers() {
        try {
            const users = JSON.parse(
                localStorage.getItem("bloodBankUsers") || "[]"
            );

            return Array.isArray(users) ? users : [];
        } catch (error) {
            return [];
        }
    }

    // Show registration form
    if (showRegister) {
        showRegister.addEventListener("click", function (event) {
            event.preventDefault();

            loginFormBox.classList.add("hidden");
            registerFormBox.classList.remove("hidden");

            message.textContent = "";
        });
    }

    // Show login form
    if (showLogin) {
        showLogin.addEventListener("click", function (event) {
            event.preventDefault();

            registerFormBox.classList.add("hidden");
            loginFormBox.classList.remove("hidden");

            message.textContent = "";
        });
    }

    // Register a new user
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value
                .trim().toLowerCase();
            const phone = document.getElementById("phone").value.trim();
            const role = document.getElementById("role").value;
            const password = document.getElementById("password").value;

            if (!name || !email || !phone || !role || !password) {
                message.style.color = "red";
                message.textContent = "Please fill all required fields.";
                return;
            }

            const users = getUsers();

            const existingUser = users.find(function (item) {
                return item.email.toLowerCase() === email;
            });

            if (existingUser) {
                message.style.color = "red";
                message.textContent = "Email already registered. Please login.";
                return;
            }

            const newUser = {
                name: name,
                email: email,
                phone: phone,
                role: role,
                password: password
            };

            users.push(newUser);

            localStorage.setItem(
                "bloodBankUsers",
                JSON.stringify(users)
            );

            message.style.color = "green";
            message.textContent = "Registration successful! Please login.";

            registerForm.reset();

            registerFormBox.classList.add("hidden");
            loginFormBox.classList.remove("hidden");
        });
    }

    // Login existing user
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("loginEmail")
                .value.trim().toLowerCase();

            const password = document.getElementById("loginPassword").value;

            const users = getUsers();

            const user = users.find(function (item) {
                return item.email.toLowerCase() === email &&
                       item.password === password;
            });

            if (!user) {
                message.style.color = "red";
                message.textContent = "Invalid email or password.";
                return;
            }

            // Save login details
            localStorage.setItem("loggedInUser", user.name);
            localStorage.setItem("loggedInEmail", user.email);
            localStorage.setItem("loggedInRole", user.role || "user");

            message.style.color = "green";
            message.textContent = "Welcome, " + user.name + "!";

            // Redirect according to user role
            setTimeout(function () {
                const role = (user.role || "user").toLowerCase();

                if (role === "hospital" || role === "ngo") {
                    window.location.href = "hospital-dashboard.html";
                } else if (role === "admin") {
                    window.location.href = "admin-dashboard.html";
                } else {
                    window.location.href = "user-dashboard.html";
                }
            }, 500);
        });
    }

});