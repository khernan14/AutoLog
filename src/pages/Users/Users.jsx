import React from "react";
import { useState, useEffect } from "react";
import UsersForm from "../../components/Users/UserForm/index.jsx";
import { getUsers } from "../../services/AuthServices.jsx";

export default function Dashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUsers();
        if (data) setUsers(data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  return <UsersForm users={users} />;
}
