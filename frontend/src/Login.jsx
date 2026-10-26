
import { useState } from "react";
import "./Login.css";

const ADMIN_EMAIL = "lochanasuyal@gmail.com";
const ADMIN_PASSWORD = "Lochana2005";

function Login({ onLogin, onBackHome }) {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const email = form.email.trim().toLowerCase();

    if (mode === "login") {
      // Admin login
      if (
        email === ADMIN_EMAIL &&
        form.password === ADMIN_PASSWORD
      ) {
        onLogin({
          name: "Administrator",
          email: ADMIN_EMAIL,
          role: "admin"
        });
        return;
      }

      // Registered user login
      const users = JSON.parse(
        localStorage.getItem("bloodBankUsers") || "[]"
      );

      const foundUser = users.find(
        (user) =>
          user.email.toLowerCase() === email &&
          user.password === form.password
      );

      if (!foundUser) {
        setMessage("Invalid email or password.");
        return;
      }

      onLogin(foundUser);
      return;
    }

    if (mode === "register") {
      if (email === ADMIN_EMAIL) {
        setMessage("This email is reserved for the admin.");
        return;
      }

      const users = JSON.parse(
        localStorage.getItem("bloodBankUsers") || "[]"
      );

      if (users.some((user) => user.email.toLowerCase() === email)) {
        setMessage("This email is already registered.");
        return;
      }

      const newUser = {
        name: form.name.trim(),
        email,
        phone: form.phone,
        role: form.role,
        password: form.password
      };

      localStorage.setItem(
        "bloodBankUsers",
        JSON.stringify([...users, newUser])
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        role: "",
        password: ""
      });

      setMessage("Account created. Please login.");
      setMode("login");
      return;
    }

    if (mode === "forgot") {
      setMessage(
        "Demo: password reset needs a backend or email verification."
      );
    }
  }

  return (
    <div className="login-page">
      <div className="login">
        <button
          type="button"
          className="back-home"
          onClick={onBackHome}
        >
          ← Back to Home
        </button>

        <div className="login-brand">
          <div className="login-drop">🩸</div>
          <h1>BLOOD BANK</h1>
          <p>Management System</p>
        </div>

        <h2>
          {mode === "login"
            ? "Welcome Back"
            : mode === "register"
            ? "Create Account"
            : "Forgot Password"}
        </h2>

        <p className="login-subtitle">
          {mode === "login"
            ? "Login to your account"
            : mode === "register"
            ? "Register to get started"
            : "Enter your registered email"}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

              <label>Mobile Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                maxLength={10}
                required
              />

              <label>User Type</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="">Select User Type</option>
                <option value="user">Blood Requester</option>
                <option value="hospital">Hospital</option>
                <option value="ngo">NGO</option>
              </select>
            </>
          )}

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          {mode !== "forgot" && (
            <>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  mode === "register"
                    ? "Create password (min 6 characters)"
                    : "Enter your password"
                }
                minLength={mode === "register" ? 6 : undefined}
                required
              />
            </>
          )}

          {mode === "login" && (
            <div className="forgot-row">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setMessage("");
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button type="submit" className="login-submit">
            {mode === "login"
              ? "Login"
              : mode === "register"
              ? "Register"
              : "Continue"}
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}

        {mode === "login" && (
          <p className="login-switch">
            New user?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              Create Account
            </button>
          </p>
        )}

        {mode === "register" && (
          <p className="login-switch">
            Already registered?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Login
            </button>
          </p>
        )}

        {mode === "forgot" && (
          <p className="login-switch">
            Remembered your password?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Login
            </button>
          </p>
        )}

        <div className="login-footer">
          Every drop counts. Donate blood, save lives.
        </div>
      </div>
    </div>
  );
}

export default Login;
