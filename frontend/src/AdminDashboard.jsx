
import { useState } from "react";
import "./AdminDashboard.css";
const initialRequests = [
  {
    id: "BR001",
    patient: "Rahul Sharma",
    group: "O+",
    units: 2,
    hospital: "City Hospital",
    status: "Pending",
  },
  {
    id: "BR002",
    patient: "Priya Verma",
    group: "B+",
    units: 1,
    hospital: "Life Care Hospital",
    status: "Approved",
  },
  {
    id: "BR003",
    patient: "Amit Singh",
    group: "AB-",
    units: 3,
    hospital: "General Hospital",
    status: "Pending",
  },
];

const initialInventory = [
  { group: "A+", units: 12 },
  { group: "A-", units: 5 },
  { group: "B+", units: 9 },
  { group: "B-", units: 4 },
  { group: "O+", units: 18 },
  { group: "O-", units: 3 },
  { group: "AB+", units: 7 },
  { group: "AB-", units: 2 },
];

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [requests, setRequests] = useState(initialRequests);
  const [inventory] = useState(initialInventory);
  const [search, setSearch] = useState("");

  const pending = requests.filter(
    (r) => r.status === "Pending"
  ).length;

  function updateStatus(id, status) {
    setRequests((previous) =>
      previous.map((r) =>
        r.id === id ? { ...r, status } : r
      )
    );
  }

  const filteredRequests = requests.filter((r) =>
    `${r.id} ${r.patient} ${r.group} ${r.hospital}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const tabs = [
    "Overview",
    "Blood Requests",
    "Blood Inventory",
    "Hospitals / NGOs",
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">🩸</span>
          <div>
            <h2>BloodBank</h2>
            <small>Management System</small>
          </div>
        </div>

        <p className="admin-menu-label">MAIN MENU</p>

        <nav className="admin-nav">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={
                activeTab === tab ? "admin-nav-item active" : "admin-nav-item"
              }
              onClick={() => setActiveTab(tab)}
            >
              <span>{["▦", "♡", "◉", "⌂"][index]}</span>
              {tab}
              {tab === "Blood Requests" && pending > 0 && (
                <b className="admin-nav-count">{pending}</b>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-avatar">A</div>
          <div className="admin-profile">
            <strong>{user?.name || user?.fullName || "Administrator"}</strong>
            <small>System Admin</small>
          </div>
          <button className="admin-logout" onClick={onLogout}>
            ↗
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-breadcrumb">BloodBank / Admin</span>
            <h1>{activeTab}</h1>
          </div>
          <div className="admin-top-user">
            <span className="admin-status-dot" />
            Admin Panel
          </div>
        </header>

        <div className="admin-content">
          {activeTab === "Overview" && (
            <>
              <div className="admin-welcome">
                <div>
                  <h2>Welcome back, Admin! 👋</h2>
                  <p>Monitor blood requests and manage blood bank operations.</p>
                </div>
                <span className="admin-welcome-icon">🩸</span>
              </div>

              <section className="admin-stats">
                <div className="admin-stat-card">
                  <span className="admin-stat-icon red">♡</span>
                  <p>Total Requests</p>
                  <h2>{requests.length}</h2>
                  <small>Blood requests listed</small>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-icon orange">◷</span>
                  <p>Pending Requests</p>
                  <h2>{pending}</h2>
                  <small>Need review</small>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-icon green">✓</span>
                  <p>Approved Requests</p>
                  <h2>{requests.filter(r => r.status === "Approved").length}</h2>
                  <small>Marked as approved</small>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-icon blue">▦</span>
                  <p>Blood Groups</p>
                  <h2>{inventory.length}</h2>
                  <small>Tracked blood types</small>
                </div>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Recent Blood Requests</h2>
                    <p>Review and update request status</p>
                  </div>
                  <button
                    className="admin-secondary-btn"
                    onClick={() => setActiveTab("Blood Requests")}
                  >
                    View all →
                  </button>
                </div>
                <RequestTable
                  requests={requests.slice(0, 3)}
                  onUpdate={updateStatus}
                />
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Blood Stock Overview</h2>
                    <p>Sample inventory by blood group</p>
                  </div>
                  <button
                    className="admin-secondary-btn"
                    onClick={() => setActiveTab("Blood Inventory")}
                  >
                    View stock →
                  </button>
                </div>
                <div className="admin-stock-grid">
                  {inventory.map((item) => (
                    <div className="admin-stock-card" key={item.group}>
                      <span>{item.group}</span>
                      <strong>{item.units}</strong>
                      <small>units</small>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === "Blood Requests" && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Manage Blood Requests</h2>
                  <p>Search requests and change their status.</p>
                </div>
              </div>
              <input
                className="admin-search"
                placeholder="Search patient, ID, hospital or blood group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <RequestTable
                requests={filteredRequests}
                onUpdate={updateStatus}
              />
            </section>
          )}

          {activeTab === "Blood Inventory" && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Blood Inventory</h2>
                  <p>Current demonstration stock by blood group.</p>
                </div>
              </div>
              <div className="admin-stock-grid">
                {inventory.map((item) => (
                  <div className="admin-stock-card" key={item.group}>
                    <span>{item.group}</span>
                    <strong>{item.units}</strong>
                    <small>units available</small>
                  </div>
                ))}
              </div>
              <p className="admin-note">
                Inventory editing and live stock data will be connected to
                MongoDB in the backend integration step.
              </p>
            </section>
          )}

          {activeTab === "Hospitals / NGOs" && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Hospitals & NGOs</h2>
                  <p>Registered centres will appear here.</p>
                </div>
              </div>
              <div className="admin-empty">
                <span>🏥</span>
                <h3>No connected hospital records yet</h3>
                <p>
                  This section will display hospital and NGO accounts after
                  registration data is connected to MongoDB.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function RequestTable({ requests, onUpdate }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Patient</th>
            <th>Blood</th>
            <th>Units</th>
            <th>Hospital</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.patient}</td>
              <td><span className="admin-blood-badge">{r.group}</span></td>
              <td>{r.units}</td>
              <td>{r.hospital}</td>
              <td>
                <span className={`admin-status ${r.status.toLowerCase()}`}>
                  {r.status}
                </span>
              </td>
              <td>
                {r.status === "Pending" ? (
                  <div className="admin-actions">
                    <button
                      className="admin-approve"
                      onClick={() => onUpdate(r.id, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="admin-reject"
                      onClick={() => onUpdate(r.id, "Rejected")}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="admin-action-done">Updated</span>
                )}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan="7" className="admin-no-data">
                No matching requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
