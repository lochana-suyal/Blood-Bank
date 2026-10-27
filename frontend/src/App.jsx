
import { useState } from "react";
import "./App.css";
import Login from "./Login";
import UserDashboard from "./UserDashboard";
import HospitalDashboard from "./HospitalDashboard";
import AdminDashboard from "./Admindashboard";
function App() {
  const [showLogin, setShowLogin] = useState(
    window.location.hash === "#login"
  );

  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("bloodBankLoggedInUser")
      );
    } catch {
      return null;
    }
  });

  function handleLogin(user) {
    localStorage.setItem(
      "bloodBankLoggedInUser",
      JSON.stringify(user)
    );

    setLoggedInUser(user);
    setShowLogin(false);
    window.location.hash = "dashboard";
  }

  function handleLogout() {
    localStorage.removeItem("bloodBankLoggedInUser");
    setLoggedInUser(null);
    setShowLogin(false);
    window.location.hash = "";
  }

  // Login page
  if (!loggedInUser && showLogin) {
    return (
      <Login
        onLogin={handleLogin}
        onBackHome={() => {
          setShowLogin(false);
          window.location.hash = "";
        }}
      />
    );
  }

  // Home page
  if (!loggedInUser) {
    return (
      <div className="home-page">
        <header className="home-header">
          <div className="home-logo">🩸 Blood Bank</div>

          <nav className="home-nav">
            <a href="#home" onClick={(e) => {
              e.preventDefault();
              setShowLogin(false);
              window.location.hash = "";
            }}>
              Home
            </a>

            <a href="#login" onClick={(e) => {
              e.preventDefault();
              setShowLogin(true);
              window.location.hash = "login";
            }}>
              Login
            </a>
          </nav>
        </header>

        <section className="hero">
          <div className="hero-text">
            <h1>BLOOD BANK</h1>
            <div className="tagline">
              Donate Blood • Save Lives
            </div>

            <p>
              A simple platform connecting blood centres
              with people in need.
            </p>

            <button
              className="home-login-button"
              onClick={() => {
                setShowLogin(true);
                window.location.hash = "login";
              }}
            >
              Get Started
            </button>
          </div>

          <div className="medical">
            <div className="heart">♡</div>
            <div className="heartbeat"></div>
          </div>
        </section>

        <section className="cards">
          <div className="card">
            <div className="icon">🩸</div>
            <h3>Find Blood</h3>
            <p>
              Request the required blood group quickly.
            </p>
          </div>

          <div className="card">
            <div className="icon">❤️</div>
            <h3>Help People</h3>
            <p>
              Connect people in need with available blood centres.
            </p>
          </div>

          <div className="card">
            <div className="icon">🏥</div>
            <h3>Blood Management</h3>
            <p>
              Manage blood availability through hospitals and NGOs.
            </p>
          </div>
        </section>

        <footer className="home-footer">
          Blood Bank Management System | Saving Lives Together
        </footer>
      </div>
    );
  }

  
  // Dashboard routing
  const role = (loggedInUser.role || "admin").toLowerCase();
  const name =
    loggedInUser.name ||
    loggedInUser.fullName ||
    "Administrator";

  // Patient/User dashboard
  if (role === "user" || role === "patient") {
    return (
      <UserDashboard
        user={loggedInUser}
        onLogout={handleLogout}
      />
    );
  }

  // Hospital/NGO dashboard
 
  // Hospital/NGO dashboard
  if (role === "hospital" || role === "ngo") {
    return (
      <HospitalDashboard
        user={loggedInUser}
        onLogout={handleLogout}
      />
    );
  }

  // Admin dashboard

  // Admin dashboard
  return (
    <AdminDashboard
      user={loggedInUser}
      onLogout={handleLogout}
    />
  );
}

export default App;

