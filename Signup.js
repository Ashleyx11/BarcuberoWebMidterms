import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle, faEye, faEyeSlash, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

// Constants for regions and classes
const CHAMPION_REGIONS = [
    { id: 'demacia', name: 'Demacia' },
    { id: 'noxus', name: 'Noxus' },
    { id: 'ionia', name: 'Ionia' },
    { id: 'freljord', name: 'Freljord' },
    { id: 'shurima', name: 'Shurima' },
    { id: 'piltover', name: 'Piltover' },
    { id: 'zaun', name: 'Zaun' },
    { id: 'targon', name: 'Mount Targon' },
    { id: 'bilgewater', name: 'Bilgewater' },
    { id: 'shadowisles', name: 'Shadow Isles' },
];

const CHAMPION_CLASSES = [
    { id: 'assassin', name: 'Assassin' },
    { id: 'fighter', name: 'Fighter' },
    { id: 'mage', name: 'Mage' },
    { id: 'marksman', name: 'Marksman' },
    { id: 'support', name: 'Support' },
    { id: 'tank', name: 'Tank' },
];

// Custom hook for managing summoner name availability
function useSummonerNameCheck(summonerName) {
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);

    useEffect(() => {
        if (summonerName.length >= 3) {
            setIsChecking(true);
            const checkNameAvailability = async () => {
                await new Promise(resolve => setTimeout(resolve, 800));
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const nameExists = users.some(user => {
                    return user.summonerName && user.summonerName.toLowerCase() === summonerName.toLowerCase();
                });
                setIsAvailable(!nameExists);
                setIsChecking(false);
            };
            checkNameAvailability();
        } else {
            setIsAvailable(null);
        }
    }, [summonerName]);

    return { isChecking, isAvailable };
}

// Custom hook for password strength calculation
function usePasswordStrength(password) {
    const [strength, setStrength] = useState({
        score: 0,
        message: 'Password strength',
    });

    useEffect(() => {
        if (!password) return setStrength({ score: 0, message: 'Password strength' });

        let score = 0;
        let message = '';
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        const finalScore = Math.min(4, Math.floor(score / 2));

        switch (finalScore) {
            case 0: message = 'Very weak'; break;
            case 1: message = 'Weak'; break;
            case 2: message = 'Medium'; break;
            case 3: message = 'Strong'; break;
            case 4: message = 'Very strong'; break;
            default: message = 'Password strength';
        }

        setStrength({ score: finalScore, message });
    }, [password]);

    return strength;
}

const simulatePasswordHash = (password) => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = (hash << 5) - hash + password.charCodeAt(i);
    }
    return hash.toString();
};

// Main Signup Form Component
function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        summonerName: '',
        email: '',
        password: '',
        confirmPassword: '',
        region: '',
        championClass: '',
        agreedToTerms: false,
    });
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [theme, setTheme] = useState('light');

    const { isChecking, isAvailable } = useSummonerNameCheck(formData.summonerName);
    const passwordStrength = usePasswordStrength(formData.password);

    useEffect(() => {
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

    const validateStep1 = () => {
        const errors = {};
        if (!formData.summonerName) errors.summonerName = 'Summoner name is required';
        else if (formData.summonerName.length < 3) errors.summonerName = "Summoner name must be at least 3 characters.";

        if (!formData.email) errors.email = 'Email is required';
        else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.([^.\s@]+\.)?([^.\s@]+)?$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = "Invalid email format (max 2 dots).";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = () => {
        const errors = {};
        if (!formData.password) errors.password = 'Password is required';
        else if (passwordStrength.score < 2) errors.password = "Password is too weak.";
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep3 = () => {
        const errors = {};
        if (!formData.region) errors.region = 'Please select a region';
        if (!formData.championClass) errors.championClass = 'Please select a champion class';
        if (!formData.agreedToTerms) errors.agreedToTerms = 'You must agree to the Terms of Service';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        let isValid = false;
        switch (currentStep) {
            case 1:
                isValid = validateStep1();
                break;
            case 2:
                isValid = validateStep2();
                break;
            case 3:
                isValid = validateStep3();
                break;
            default:
                isValid = false;
        }
        if (isValid) setFormErrors({});
        if (isValid) setCurrentStep(prevStep => prevStep + 1);
    };

    const prevStep = () => {
        setFormErrors({});
        setCurrentStep(prevStep => prevStep - 1);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setFormErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep === 3 && !validateStep3()) return;
        setIsLoading(true);
        setFormErrors({});
        setSignupSuccess(false);

        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(user => user.email === formData.email)) {
                setFormErrors({ email: 'Email already exists' });
                setIsLoading(false);
                return;
            }
            if (users.some(user => user.summonerName && user.summonerName.toLowerCase() === formData.summonerName.toLowerCase())) {
                setFormErrors({ summonerName: 'Summoner Name already exists' });
                setIsLoading(false);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 1200));

            const hashedPassword = simulatePasswordHash(formData.password);
            const newUser = { ...formData, password: hashedPassword, confirmPassword: hashedPassword, createdAt: new Date().toISOString() };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            setSignupSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error("Signup error:", err);
            setFormErrors({ general: 'An unexpected error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Account</span>
            </div>
            <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Password</span>
            </div>
            <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Preferences</span>
            </div>
            <div className="progress-line">
                <div className="progress" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
            </div>
        </div>
    );

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="signup-container">
            <div className="card">
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                  <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
                </button>
                <h1>Create an Account</h1>
                 <p>
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
                {renderStepIndicator()}
                <form onSubmit={handleSubmit}>
                    {currentStep === 1 && (
                        <>
                            <InputField
                                name="summonerName"
                                label="Summoner Name"
                                value={formData.summonerName}
                                onChange={handleChange}
                                error={formErrors.summonerName}
                                isChecking={isChecking}
                                isAvailable={isAvailable}
                                placeholder="Choose your summoner name"
                            />
                            <InputField
                                name="email"
                                label="Email"
                                value={formData.email}
                                onChange={handleChange}
                                error={formErrors.email}
                                placeholder="Enter your email address"
                                type="email"
                            />
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <PasswordField
                                name="password"
                                label="Password"
                                value={formData.password}
                                onChange={handleChange}
                                error={formErrors.password}
                                strength={passwordStrength}
                                showPassword={showPassword}
                                togglePasswordVisibility={togglePasswordVisibility}
                                FontAwesomeIcon={FontAwesomeIcon}
                                faEye={faEye}
                                faEyeSlash={faEyeSlash}

                            />
                            <PasswordField
                                name="confirmPassword"
                                label="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={formErrors.confirmPassword}
                                showPassword={showConfirmPassword}
                                togglePasswordVisibility={toggleConfirmPasswordVisibility}
                                FontAwesomeIcon={FontAwesomeIcon}
                                faEye={faEye}
                                faEyeSlash={faEyeSlash}
                            />
                        </>
                    )}
                    {currentStep === 3 && (
                        <>
                            <SelectField
                                name="region"
                                label="Region"
                                value={formData.region}
                                onChange={handleChange}
                                options={CHAMPION_REGIONS}
                                error={formErrors.region}
                            />
                            <SelectField
                                name="championClass"
                                label="Champion Class"
                                value={formData.championClass}
                                onChange={handleChange}
                                options={CHAMPION_CLASSES}
                                error={formErrors.championClass}
                            />
                            <CheckboxField
                                name="agreedToTerms"
                                label="I agree to the Terms of Service"
                                checked={formData.agreedToTerms}
                                onChange={handleChange}
                                error={formErrors.agreedToTerms}
                            />
                        </>
                    )}

                    <div className="form-actions">
                        {currentStep > 1 && (
                            <button type="button" onClick={prevStep} className="back-button">
                                Back
                            </button>
                        )}
                        {currentStep < 3 ? (
                            <button type="button" onClick={nextStep} className="next-button">
                                Next
                            </button>
                        ) : (
                            <button type="submit" disabled={isLoading} className="signup-button">
                                {isLoading ? (
                                    <>
                                        Creating Account...
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </button>
                        )}
                    </div>
                </form>
                {formErrors.general && (
                    <div className="error-message" role="alert">
                        {formErrors.general}
                    </div>
                )}
                {signupSuccess && (
                    <div className="success-message" role="alert">
                        Signup Successful! Redirecting...
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                )}
            </div>
        </div>
    );
}

// Reusable Input Field Component
function InputField({ label, error, isChecking, isAvailable, ...props }) {
    return (
        <div className="form-group">
            <label>{label}</label>
            <input {...props} className={`input ${error ? 'input-error' : ''}`} />
            {isChecking && (
                <span className="status-message checking">
                    Checking... <FontAwesomeIcon icon={faSpinner} spin />
                </span>
            )}
            {isAvailable === true && !isChecking && (
                <span className="status-message available">
                    Available <FontAwesomeIcon icon={faCheckCircle} />
                </span>
            )}
            {isAvailable === false && !isChecking && (
                <span className="status-message unavailable">
                    Unavailable <FontAwesomeIcon icon={faTimesCircle} />
                </span>
            )}
            {error && <span className="error-text">{error}</span>}
        </div>
    );
}

// Reusable Password Field Component
function PasswordField({ label, strength, error, showPassword, togglePasswordVisibility, FontAwesomeIcon, faEye, faEyeSlash, ...props }) {
    return (
        <div className="form-group password-input-container">
            <label>{label}</label>
            <input {...props} type={showPassword ? "text" : "password"} className={`input ${error ? 'input-error' : ''}`} />
            <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
            {error && <span className="error-text">{error}</span>}
            {strength && (
                <div className="password-strength">
                    <div className={`strength-bar strength-${strength.score}`} />
                    <span>{strength.message}</span>
                </div>
            )}
        </div>
    );
}

// Reusable Select Field Component
function SelectField({ label, options, error, ...props }) {
    return (
        <div className="form-group">
            <label>{label}</label>
            <select {...props} className={`input ${error ? 'input-error' : ''}`}>
                <option value="">Select an option</option>
                {options.map(option => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
            {error && <span className="error-text">{error}</span>}
        </div>
    );
}

// Reusable Checkbox Component
function CheckboxField({ label, error, ...props }) {
    return (
        <div className="form-group">
            <label className="checkbox-label">
                <input {...props} type="checkbox" /> {label}
            </label>
            {error && <span className="error-text">{error}</span>}
        </div>
    );
}

// Run this code ONCE to migrate existing localStorage data (in development only!)
const migrateLocalStorageData = () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const updatedUsers = users.map(user => {
        if (!user.summonerName) {
            return { ...user, summonerName: 'Unknown Summoner' };
        }
        return user;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    console.log('LocalStorage data migrated.');
};

// migrateLocalStorageData();

export default Signup;
