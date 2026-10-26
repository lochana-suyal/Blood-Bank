
import { useState } from "react";
import "./HospitalDashboard.css";

function HospitalDashboard({ user, onLogout }) {
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [units, setUnits] = useState("");
  const [inventory, setInventory] = useState([
    { group: "A+", units: 5 },
    { group: "A-", units: 2 },
    { group: "B+", units: 4 },
    { group: "B-", units: 1 },
    { group: "O+", units: 6 },
    { group: "O-", units: 2 },
    { group: "AB+", units: 3 },
    { group: "AB-", units: 1 }
  ]);

  function updateInventory(e) {
    e.preventDefault();

    const amount = Number(units);

    if (!Number.isInteger(amount) || amount < 0) {
      alert("Units 0 ya usse zyada whole number honi chahiye.");
      return;
    }

    setInventory((previous) =>
      previous.map((item) =>
        item.group === bloodGroup
          ? { ...item, units: amount }
          : item
      )
    );

    setUnits("");
    alert("Blood inventory updated!");
  }

  return (
    <div className="hospital-dashboard">
      <header className="hospital-header">
        <h2>🩸 Blood Bank</h2>
        <div>
          <span>{user?.name || "Hospital / NGO"}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="hospital-content">
        <h1>Hospital / NGO Dashboard</h1>
        <p>Manage your blood stock and availability.</p>

        <h2>Blood Inventory</h2>

        <section className="hospital-inventory">
          {inventory.map((item) => (
            <div className="inventory-card" key={item.group}>
              <h3>{item.group}</h3>
              <p>{item.units} units available</p>
            </div>
          ))}
        </section>

        <section className="inventory-form">
          <h2>Update Blood Stock</h2>

          <form onSubmit={updateInventory}>
            <label htmlFor="bloodGroup">Blood Group</label>
            <select
              id="bloodGroup"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              {inventory.map((item) => (
                <option key={item.group} value={item.group}>
                  {item.group}
                </option>
              ))}
            </select>

            <label htmlFor="units">Available Units</label>
            <input
              id="units"
              type="number"
              min="0"
              step="1"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="Enter available units"
              required
            />

            <button type="submit">Update Inventory</button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default HospitalDashboard;
