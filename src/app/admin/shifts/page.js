"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { DateTime } from "luxon";

const AdminShifts = () => {
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [shifts, setShifts] = useState([]);
    const [matchedEmployee, setMatchedEmployee] = useState(null);

    useEffect(() => {
        const fetchShifts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "shifts"));
                const data = querySnapshot.docs.map(doc => doc.data());
                setShifts(data);
            } catch (error) {
                console.log("Error fetching shifts:", error);
            }
        };

        fetchShifts();
    }, []);

    const findBestEmployee = async () => {
        if (!date || !startTime || !endTime) return;

        const shiftStartUTC = DateTime.fromISO(`${date}T${startTime}`, { zone: "local" }).toUTC().toISO();
        const shiftEndUTC = DateTime.fromISO(`${date}T${endTime}`, { zone: "local" }).toUTC().toISO();

        try {
            const q = query(collection(db, "availability"), where("date", "==", date));
            const querySnapshot = await getDocs(q);
            const availableEmployees = querySnapshot.docs.map(doc => doc.data());

            const bestEmployee = availableEmployees.find(avail =>
                shiftStartUTC >= avail.startTimeUTC &&
                shiftEndUTC <= avail.endTimeUTC
            );

            if (bestEmployee) {
                setMatchedEmployee(bestEmployee.userId);
            } else {
                setMatchedEmployee(null);
                alert("No available employees for this shift.");
            }
        } catch (error) {
            console.log("Error finding employees:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!matchedEmployee) {
            alert("No employee is available for this shift.");
            return;
        }

        const shiftStartUTC = DateTime.fromISO(`${date}T${startTime}`, { zone: "local" }).toUTC().toISO();
        const shiftEndUTC = DateTime.fromISO(`${date}T${endTime}`, { zone: "local" }).toUTC().toISO();

        const hasOverlap = shifts.some(shift =>
            shift.employeeId === matchedEmployee &&
            shift.date === date &&
            !(
                shiftEndUTC <= shift.startTimeUTC ||
                shiftStartUTC >= shift.endTimeUTC
            )
        );

        if (hasOverlap) {
            alert("Shift overlaps with an existing shift for this employee!");
            return;
        }

        try {
            await addDoc(collection(db, "shifts"), {
                employeeId: matchedEmployee,
                date,
                startTimeUTC: shiftStartUTC,
                endTimeUTC: shiftEndUTC,
            });

            alert("Shift assigned successfully!");

            setShifts([...shifts, {
                employeeId: matchedEmployee,
                date,
                startTimeUTC: shiftStartUTC,
                endTimeUTC: shiftEndUTC,
            }]);

        } catch (error) {
            alert("Error assigning shifts: " + error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg text-center">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">Auto-Match Employees to Shifts</h1>

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
                        type="button"
                        onClick={findBestEmployee}
                        className="bg-gray-600 text-white p-3 rounded-md hover:bg-gray-700 transition duration-300"
                    >
                        Find Best Employee
                    </button>

                    {matchedEmployee && (
                        <div className="mt-2 text-gray-700 font-semibold">
                            <strong>Matched Employee:</strong> {matchedEmployee}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Assign Shift
                    </button>
                </form>

                <h2 className="text-2xl font-semibold text-gray-800 mt-8">Assigned Shifts</h2>

                <div className="overflow-x-auto mt-4">
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
                            {shifts.length > 0 ? (
                                shifts.map((shift, index) => (
                                    <tr key={index} className="odd:bg-white even:bg-gray-100 hover:bg-gray-200 transition duration-200 text-black">
                                        <td className="border border-gray-300 p-3">{shift.employeeId}</td>
                                        <td className="border border-gray-300 p-3">{shift.date}</td>
                                        <td className="border border-gray-300 p-3">
                                            {DateTime.fromISO(shift.startTimeUTC, { zone: "utc" }).toLocal().toFormat("hh:mm a")}
                                        </td>
                                        <td className="border border-gray-300 p-3">
                                            {DateTime.fromISO(shift.endTimeUTC, { zone: "utc" }).toLocal().toFormat("hh:mm a")}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="border border-gray-300 p-3 text-gray-500 text-center">
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

export default AdminShifts;