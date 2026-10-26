
import { useState } from "react";
import "./UserDashboard.css";

function UserDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [requests, setRequests] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("bloodRequests") || "[]"
      ).filter((request) => request.email === user.email);
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    patientName: user.name || user.fullName || "",
    bloodGroup: "",
    units: "1",
    contact: user.phone || "",
    hospital: "",
    city: "",
    details: ""
  });

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  function submitRequest(event) {
    event.preventDefault();

    const newRequest = {
      id: Date.now(),
      ...form,
      email: user.email,
      status: "Pending",
      date: new Date().toLocaleDateString()
    };

    const allRequests = JSON.parse(
      localStorage.getItem("bloodRequests") || "[]"
    );

    allRequests.push(newRequest);
    localStorage.setItem(
      "bloodRequests",
      JSON.stringify(allRequests)
    );

    setRequests([...requests, newRequest]);
    setForm({
      patientName: user.name || user.fullName || "",
      bloodGroup: "",
      units: "1",
      contact: user.phone || "",
      hospital: "",
      city: "",
      details: ""
    });

    alert("Blood request submitted successfully!");
    setActivePage("My Requests");
  }

  return (
    <div className="user-dashboard">
      <header className="user-header">
        <div className="user-logo">🩸 Blood Bank</div>
        <div className="user-header-right">
          <span>{user.name || user.fullName || "Patient"}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="user-layout">
        <aside className="user-sidebar">
          <h3>Patient Panel</h3>

          {[
            "Dashboard",
            "New Blood Request",
            "My Requests",
            "Blood Availability"
          ].map((page) => (
            <button
              key={page}
              className={activePage === page ? "selected" : ""}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
        </aside>

        <main className="user-main">
          {activePage === "Dashboard" && (
            <>
              <h1>Welcome, {user.name || user.fullName || "Patient"}!</h1>
              <p>Request blood and keep track of your requests.</p>

              <div className="user-stats">
                <div className="user-stat">
                  <h2>{requests.length}</h2>
                  <p>Total Requests</p>
                </div>

                <div className="user-stat">
                  <h2>
                    {requests.filter((r) => r.status === "Pending").length}
                  </h2>
                  <p>Pending</p>
                </div>

                <div className="user-stat">
                  <h2>
                    {requests.filter((r) => r.status === "Fulfilled").length}
                  </h2>
                  <p>Fulfilled</p>
                </div>
              </div>

              <button
                className="user-primary"
                onClick={() => setActivePage("New Blood Request")}
              >
                + Request Blood
              </button>
            </>
          )}

          {activePage === "New Blood Request" && (
            <section className="user-card">
              <h1>New Blood Request</h1>

              <form onSubmit={submitRequest}>
                <label>Patient Name</label>
                <input
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  required
                />

                <label>Blood Group</label>
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select blood group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    )
                  )}
                </select>

                <label>Units Required</label>
                <input
                  type="number"
                  name="units"
                  min="1"
                  max="20"
                  value={form.units}
                  onChange={handleChange}
                  required
                />

                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contact"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  required
                />

                <label>Hospital Name</label>
                <input
                  name="hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  placeholder="Hospital name"
                  required
                />

                <label>City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />

                <label>Additional Details</label>
                <textarea
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  placeholder="Any additional information"
                />

                <button className="user-primary" type="submit">
                  Submit Request
                </button>
              </form>
            </section>
          )}

          {activePage === "My Requests" && (
            <section className="user-card">
              <h1>My Requests</h1>

              {requests.length === 0 ? (
                <p>No requests submitted yet.</p>
              ) : (
                <div className="user-table-wrap">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Blood Group</th>
                        <th>Units</th>
                        <th>Hospital</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr key={request.id}>
                          <td>{String(request.id).slice(-6)}</td>
                          <td>{request.bloodGroup}</td>
                          <td>{request.units}</td>
                          <td>{request.hospital}</td>
                          <td>{request.date}</td>
                          <td>{request.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activePage === "Blood Availability" && (
            <section className="user-card">
              <h1>Blood Availability</h1>
              <p>
                Blood stock availability will appear here after the
                hospital inventory is connected to the database.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;
