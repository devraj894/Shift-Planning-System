"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/app/firebase/firebaseConfig";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";

const EmployeeAvailability = () => {
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [availability, setAvailability] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchAvailability = async () => {
            const user = auth.currentUser;
            if (!user) return router.push("/auth/login");

            try {
                const q = query(collection(db, "availability"), where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => {
                    const item = doc.data();
                    return {
                        date: item.date,
                        startTimeUTC: item.startTimeUTC,
                        endTimeUTC: item.endTimeUTC,
                        startTime: DateTime.fromISO(item.startTimeUTC, { zone: "utc" }).toLocal().toFormat("hh:mm a"),
                        endTime: DateTime.fromISO(item.endTimeUTC, { zone: "utc" }).toLocal().toFormat("hh:mm a"),
                    };
                });

                setAvailability(data);
            } catch (error) {
                console.error("Error fetching availability:", error);
            }
        };

        fetchAvailability();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) return;

        const localStartTime = DateTime.fromISO(`${date}T${startTime}`, { zone: "local" });
        const utcStartTime = localStartTime.toUTC();
        const utcEndTime = DateTime.fromISO(`${date}T${endTime}`, { zone: "local" }).toUTC();

        const hasOverlap = availability.some(item => {
            if (date !== item.date) return false;

            const existingStartUTC = DateTime.fromISO(item.startTimeUTC, { zone: "utc" });
            const existingEndUTC = DateTime.fromISO(item.endTimeUTC, { zone: "utc" });

            return (
                (utcStartTime >= existingStartUTC && utcStartTime < existingEndUTC) || 
                (utcEndTime > existingStartUTC && utcEndTime <= existingEndUTC) ||     
                (utcStartTime <= existingStartUTC && utcEndTime >= existingEndUTC)     
            );
        });

        if (hasOverlap) {
            alert("Overlapping availability detected! Please select a different time.");
            return;
        }

        try {
            await addDoc(collection(db, "availability"), {
                userId: user.uid,
                date,
                startTimeUTC: utcStartTime.toISO(),
                endTimeUTC: utcEndTime.toISO(),
            });

            alert("Availability saved!");

            setAvailability([...availability, {
                date,
                startTimeUTC: utcStartTime.toISO(),
                endTimeUTC: utcEndTime.toISO(),
                startTime: utcStartTime.toLocal().toFormat("hh:mm a"),
                endTime: utcEndTime.toLocal().toFormat("hh:mm a"),
            }]);

        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg text-center">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">Set Your Availability</h1>

                <form onSubmit={handleSubmit} className="flex flex-col space-y-4 text-black">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <button
                        type="submit"
                        className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Save Availability
                    </button>
                </form>

                <h2 className="text-2xl font-semibold text-gray-800 mt-8">Your Availability</h2>

                <div className="overflow-x-auto mt-4 text-black">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 p-3">Date</th>
                                <th className="border border-gray-300 p-3">Start Time</th>
                                <th className="border border-gray-300 p-3">End Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availability.length > 0 ? (
                                availability.map((item, index) => (
                                    <tr key={index} className="odd:bg-white even:bg-gray-100">
                                        <td className="border border-gray-300 p-3">{item.date}</td>
                                        <td className="border border-gray-300 p-3">{item.startTime}</td>
                                        <td className="border border-gray-300 p-3">{item.endTime}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="border border-gray-300 p-3 text-gray-500">
                                        No availability set yet.
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

export default EmployeeAvailability;