
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login");
    const registerForm = document.getElementById("register");

    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    const loginMessage = document.getElementById("loginMessage");
    const registerMessage = document.getElementById("registerMessage");

    // Show registration form
    if (showRegister) {
        showRegister.addEventListener("click", function (event) {
            event.preventDefault();

            document.getElementById("loginForm").classList.add("hidden");
            document.getElementById("registerForm").classList.remove("hidden");
        });
    }

    // Show login form
    if (showLogin) {
        showLogin.addEventListener("click", function (event) {
            event.preventDefault();

            document.getElementById("registerForm").classList.add("hidden");
            document.getElementById("loginForm").classList.remove("hidden");
        });
    }

    // Get registered users
    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem("bloodbankUsers") || "[]");
        } catch (error) {
            return [];
        }
    }

    // Register a new user
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = registerForm.querySelector("#name")?.value.trim();
            const email = registerForm.querySelector("#email")?.value.trim().toLowerCase();
            const phone = registerForm.querySelector("#phone")?.value.trim();
            const role = registerForm.querySelector("#role")?.value;
            const password = registerForm.querySelector("#password")?.value;

            if (!name || !email || !phone || !role || !password) {
                alert("Please fill all fields.");
                return;
            }

            if (!["user", "hospital", "ngo"].includes(role)) {
                alert("Please select a valid user type.");
                return;
            }

            const users = getUsers();

            if (users.some(user => user.email.toLowerCase() === email)) {
                if (registerMessage) {
                    registerMessage.style.color = "red";
                    registerMessage.textContent = "Email already registered. Please login.";
                } else {
                    alert("Email already registered. Please login.");
                }
                return;
            }

            users.push({
                name: name,
                email: email,
                phone: phone,
                role: role,
                password: password
            });

            localStorage.setItem("bloodbankUsers", JSON.stringify(users));

            if (registerMessage) {
                registerMessage.style.color = "green";
                registerMessage.textContent = "Registration successful! Please login.";
            } else {
                alert("Registration successful! Please login.");
            }

            registerForm.reset();

            document.getElementById("registerForm").classList.add("hidden");
            document.getElementById("loginForm").classList.remove("hidden");
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = loginForm.querySelector("#loginEmail")?.value.trim().toLowerCase();
            const password = loginForm.querySelector("#loginPassword")?.value;

            // Fixed Admin login
            if (email === "lochanasuyal@gmail.com" && password === "lochana2005") {
                localStorage.setItem("loggedInUser", "Admin");
                localStorage.setItem("loggedInEmail", email);
                localStorage.setItem("loggedInRole", "admin");

                window.location.href = "admin-dashboard.html";
                return;
            }

            // Login for registered users
            const users = getUsers();

            const user = users.find(function (item) {
                return item.email.toLowerCase() === email &&
                       item.password === password;
            });

            if (!user) {
                if (loginMessage) {
                    loginMessage.style.color = "red";
                    loginMessage.textContent = "Invalid email or password.";
                } else {
                    alert("Invalid email or password.");
                }
                return;
            }

            localStorage.setItem("loggedInUser", user.name);
            localStorage.setItem("loggedInEmail", user.email);
            localStorage.setItem("loggedInRole", user.role);

            // Redirect according to role
            if (user.role === "hospital" || user.role === "ngo") {
                window.location.href = "hospital-dashboard.html";
            } else if (user.role === "admin") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "user-dashboard.html";
            }
        });
    }
});
