"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/app/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";

export default function EmployeeShifts() {
    const [shifts, setShifts] = useState([]);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchShifts(currentUser.uid);
            } else {
                router.push("/auth/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchShifts = async (userId) => {
        try {
            const q = query(collection(db, "shifts"), where("employeeId", "==", userId));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => {
                const item = doc.data();

                return {
                    date: item.date,
                    startTimeUTC: item.startTimeUTC,
                    endTimeUTC: item.endTimeUTC,
                    startTime: DateTime.fromISO(item.startTimeUTC, { zone: "utc" }).toLocal().toFormat("hh:mm a"),
                    endTime: DateTime.fromISO(item.endTimeUTC, { zone: "utc" }).toLocal().toFormat("hh:mm a"),
                };
            });

            setShifts(data);
        } catch (error) {
            console.error("Error fetching shifts:", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                    Your Assigned Shifts 🏢
                </h1>
    
                <div className="overflow-x-auto text-black">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="border border-gray-300 p-3">Date</th>
                                <th className="border border-gray-300 p-3">Start Time</th>
                                <th className="border border-gray-300 p-3">End Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.length > 0 ? (
                                shifts.map((shift, index) => (
                                    <tr key={index} className="odd:bg-white even:bg-gray-100 hover:bg-gray-200 transition duration-200">
                                        <td className="border border-gray-300 p-3">{shift.date}</td>
                                        <td className="border border-gray-300 p-3">{shift.startTime}</td>
                                        <td className="border border-gray-300 p-3">{shift.endTime}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="border border-gray-300 p-3 text-gray-500 text-center">
                                        No shifts assigned yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );    
}