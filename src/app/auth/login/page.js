"use client"

import { useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                localStorage.setItem("role", userData.role);

                if (userData.role === "admin") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/employee/dashboard");
                }
            } else {
                alert("User data not found...!");
            }

        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Welcome Back</h1>

                <form onSubmit={handleLogin} className="flex flex-col space-y-4 text-black">
                    <input
                        type="email"
                        placeholder="Enter Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Enter Your Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />

                    <button
                        type="submit"
                        className="bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition duration-300"
                    >
                        Login
                    </button>
                </form>

                <div className="text-center mt-4">
                    <a href="#" className="text-gray-600 text-sm hover:underline">
                        Forgot Password?
                    </a>
                </div>

                <p className="text-center text-gray-600 mt-3">
                    Don't have an account?{" "}
                    <a href="/auth/register" className="text-green-600 hover:underline">
                        Register here
                    </a>
                </p>
            </div>
        </div>
    );
}