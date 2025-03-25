import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faTrophy, faChartBar, faGamepad, faUsers, faExclamationTriangle, faCoins, faBolt, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

function Dashboard({ logout }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        gamesPlayed: 0,
        winRate: 0,
        rank: 'Unranked',
        masteryScore: 0,
        lp: 0, // League Points
        kda: '0.00',
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(''); // To display error messages
    const summonerName = localStorage.getItem('summonerName') || 'Summoner';
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.body.setAttribute('data-theme', storedTheme);

        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError('');

            try {
                const response = await fakeDashboardApi();
                setStats(response.stats);
                setRecentActivity(response.recentActivity);
                setFriends(response.friends); // Populate friends list
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('summonerName');
        logout();
        navigate('/login');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
    };

    const fakeDashboardApi = async () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Remove or comment out the following lines:
                /*if (Math.random() < 0.2) {
                    reject(new Error('Simulated API Error'));
                    return;
                }*/

                resolve({
                    stats: {
                        gamesPlayed: 127,
                        winRate: 62,
                        rank: 'Gold II',
                        masteryScore: 134,
                        lp: 42,
                        kda: '3.15',
                    },
                    recentActivity: [
                        "Played a match on Summoner's Rift as Ahri",
                        "Unlocked the 'Quick Reflexes' achievement",
                        "Ranked up to Gold II with a decisive victory",
                        "Claimed daily login rewards",
                    ],
                    friends: [ // Sample friends list
                        { name: 'RiftWalker', online: true },
                        { name: 'ShadowBlade7', online: false },
                        { name: 'StarGuardian', online: true },
                        { name: 'NovaStrike', online: true },
                        { name: 'MysticSage', online: false },
                    ],
                });
            }, 1000);
        });
    };

    return (
        <div className="dashboard-container">
            <aside className="profile-sidebar">
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
                </button>

                <div className="profile-header">
                    <img src="/images/profile-bg.jpg" alt="Summoner Profile" className="profile-bg" />
                    <div className="profile-info">
                        <h2 className="summoner-name">{summonerName}</h2>
                        <p className="rank">
                            <FontAwesomeIcon icon={faTrophy} /> Rank: {stats.rank}
                        </p>
                    </div>
                </div>

                <div className="profile-stats">
                    <h3>Summoner Stats</h3>
                    <p>
                        <FontAwesomeIcon icon={faGamepad} /> Games Played: {stats.gamesPlayed}
                    </p>
                    <p>
                        <FontAwesomeIcon icon={faChartBar} /> Win Rate: {stats.winRate}%
                    </p>
                    <p>
                        <FontAwesomeIcon icon={faCoins} /> LP: {stats.lp}
                    </p>
                    <p>
                        <FontAwesomeIcon icon={faBolt} /> KDA: {stats.kda}
                    </p>
                    <p>Mastery Score: {stats.masteryScore}</p>
                </div>

                <div className="friends-list">
                    <h3>
                        <FontAwesomeIcon icon={faUsers} /> Friends
                    </h3>
                    <ul>
                        {friends.map((friend) => (
                            <li key={friend.name} className={`friend ${friend.online ? 'online' : 'offline'}`}>
                                {friend.name} - {friend.online ? 'Online' : 'Offline'}
                            </li>
                        ))}
                    </ul>
                </div>

                <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
            </aside>

            <main className="dashboard-content">
                <section className="welcome-banner card">
                    <h2>Welcome back to the Rift, {summonerName}!</h2>
                    <p>Check out your latest stats and recent activity below.</p>
                </section>

                <section className="card">
                    <h2>Recent Activity</h2>
                    {isLoading ? (
                        <div className="loading-message">Loading summoner data...</div>
                    ) : error ? (
                        <div className="error-message" role="alert">
                            <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
                        </div>
                    ) : (
                        <ul className="recent-activity-list">
                            {recentActivity.map((activity, index) => (
                                <li key={index}>
                                    <FontAwesomeIcon icon={faBolt} /> {activity}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
