import React, { useState } from "react";

export default function App() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  const addUser = () => {
    if (!newUser.name || !newUser.email) return alert("Please fill all fields!");
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setNewUser({ name: "", email: "" });
  };

  const deleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">
        👥 User Profiles Management
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-md w-96 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Add New User
        </h2>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="w-full p-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="w-full p-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={addUser}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add User
        </button>
      </div>

      <div className="w-full max-w-2xl">
        {users.length === 0 ? (
          <p className="text-center text-gray-500">No users added yet.</p>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-medium">{user.name}</p>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
