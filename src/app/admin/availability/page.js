"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { DateTime } from "luxon";

const AdminAvailability = () => {
    const [availability, setAvailability] = useState([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "availability"));
                const data = querySnapshot.docs.map(doc => {
                    const item = doc.data();

                    return {
                        userId: item.userId,
                        date: item.date,
                        startTime: DateTime.fromISO(item.startTimeUTC, { zone: "utc" }).toLocal().toFormat("hh:mm a"),
                        endTime: DateTime.fromISO(item.endTimeUTC, { zone: "utc" }).toLocal().toFormat("hh:mm a"),
                    };
                });

                setAvailability(data);
            } catch (error) {
                console.log("Error while fetching availability: ", error);
            }
        };

        fetchAvailability();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                    Employee Availability 📅
                </h1>

                <div className="overflow-x-auto text-black">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="border border-gray-300 p-3">Employee ID</th>
                                <th className="border border-gray-300 p-3">Date</th>
                                <th className="border border-gray-300 p-3">Start Time</th>
                                <th className="border border-gray-300 p-3">End Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availability.length > 0 ? (
                                availability.map((item, index) => (
                                    <tr key={index} className="odd:bg-white even:bg-gray-100 hover:bg-gray-200 transition duration-200">
                                        <td className="border border-gray-300 p-3">{item.userId}</td>
                                        <td className="border border-gray-300 p-3">{item.date}</td>
                                        <td className="border border-gray-300 p-3">{item.startTime}</td>
                                        <td className="border border-gray-300 p-3">{item.endTime}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="border border-gray-300 p-3 text-gray-500 text-center">
                                        No availability records found.
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

export default AdminAvailability;