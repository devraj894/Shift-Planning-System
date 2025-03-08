"use client"

import { useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("employee");
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email,
                role
            });

            alert("Registration Successfully..!");
            router.push("/auth/login");

        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Create an Account</h1>

                <form onSubmit={handleRegister} className="flex flex-col space-y-4 text-black">
                    <input
                        type="email"
                        placeholder="Enter Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Enter Your Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-4">
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-blue-600 hover:underline">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}