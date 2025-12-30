'use client'
import './Form.css'
import LoginForm from '@/sections/Login/page'
import RegisterForm from '@/sections/Register/page'
import { useState } from 'react'

export default function RegisterLoginPage() {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className={`container ${isActive ? 'active' : ''}`}>

            <LoginForm />

            <RegisterForm />

            <div className="toggle-box">
                <div className="toggle-panel toggle-left">
                    <h1>Hello, Welcome!</h1>
                    <p>Don't have an account?</p>
                    <button className="btn register-btn" onClick={() => setIsActive(true)}>Register</button>
                </div>

                <div className="toggle-panel toggle-right">
                    <h1>Welcome Back!</h1>
                    <p>Already have an account?</p>
                    <button className="btn login-btn" onClick={() => setIsActive(false)}>Login</button>
                </div>
            </div>
        </div>
    )
}