import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faSun, faMoon, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Import icons

function Login({ login }) {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // For login success feedback
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const passwordInputRef = useRef(null); // Ref for password input
    const [theme, setTheme] = useState('light'); // Light/dark theme

    useEffect(() => {
        // Load rememberMe from localStorage on component mount
        const storedRememberMe = localStorage.getItem('rememberMe') === 'true';
        setRememberMe(storedRememberMe);

        if (storedRememberMe) {
            // Optionally, pre-fill email if remembered
            const storedEmail = localStorage.getItem('email');
            if (storedEmail) {
                setCredentials(prev => ({ ...prev, email: storedEmail }));
            }
        }

        // Load theme from local storage
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.body.setAttribute('data-theme', storedTheme);

    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
    };


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        setError(''); // Clear error on typing
    };

    const handleRememberMeChange = () => {
        setRememberMe(!rememberMe);
    };

    const validateInputs = () => {
        const { email, password } = credentials;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !password) return 'Please fill in all fields.';
        if (!emailRegex.test(email)) return 'Invalid email format.';
        if (password.length < 6) return 'Password must be at least 6 characters.';
        return '';
    };

    const simulatePasswordHash = (password) => {
        // In reality, you would NEVER do this on the client-side.
        // This is purely for demonstration.  Use a proper server-side hashing algorithm.
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            hash = (hash << 5) - hash + password.charCodeAt(i);
        }
        return hash.toString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError('');  // Clear any previous errors
        setSuccessMessage('');

        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const adminUser = { email: 'admin@rift.com', password: simulatePasswordHash('admin123'), summonerName: 'Admin' };  // Hashed password

            // Admin Credentials Check
            if (credentials.email === adminUser.email && simulatePasswordHash(credentials.password) === adminUser.password) {
                handleLogin('admin-token', adminUser.summonerName, '/admin-dashboard');
                return;
            }

            // Regular User Credentials Check
            const hashedPassword = simulatePasswordHash(credentials.password);
            const user = users.find(
                (u) => u.email === credentials.email && u.password === hashedPassword
            );

            if (user) {
                handleLogin('user-token', user.summonerName, '/dashboard');
                setSuccessMessage('Login successful!'); // Display success message
            } else {
                setError('Invalid email or password.');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (token, summonerName, path) => {
        login(token);
        localStorage.setItem('summonerName', summonerName);

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('email', credentials.email); //Remember email
        } else {
            localStorage.removeItem('rememberMe'); // Clear if not checked
            localStorage.removeItem('email');
        }

        navigate(path);
    };

    return (
        <div className="login-container">
            <div className="card">
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
                </button>
                <h2>Welcome to the Rift</h2>
                <p>Log in to your summoner account.</p>

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="success-message" role="alert">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Summoner Email"
                            value={credentials.email}
                            onChange={handleChange}
                            aria-label="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group password-input-container">
                        <label htmlFor="password">Password:</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            id="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={handleChange}
                            aria-label="Enter your password"
                            required
                            ref={passwordInputRef} // Attach ref
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>

                    <div className="remember-me">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={handleRememberMeChange}
                        />
                        <label htmlFor="rememberMe">Remember Me</label>
                    </div>

                    <button type="submit" disabled={isLoading} className="login-button">
                        {isLoading ? (
                            <>
                                Entering the Rift...
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <p>
                    Not a summoner yet? <a href="/signup">Join the League</a>
                </p>
            </div>
        </div>
    );
}

export default Login;
