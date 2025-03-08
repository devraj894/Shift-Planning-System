"use client"

import { useState, useEffect } from "react";
import { db, auth } from "@/app/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const EmployeeDashboard = () => {
  const [employeeName, setEmployeeName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          setEmployeeName(userDoc.data().email);
        }

      } else {
        router.push("/auth/login");
      }

    }

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("role");
    router.push("/auth/login");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Hello, {employeeName || "Employee"}! 👋
        </h1>
        <p className="text-gray-600 mb-6">Manage your schedule and shifts easily.</p>

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => router.push("/employee/availability")}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Set Availability
          </button>

          <button
            onClick={() => router.push("/employee/shifts")}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-300"
          >
            View Assigned Shifts
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-3 rounded-md mt-6 hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default EmployeeDashboard