import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L22 10L28 4V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V4L10 10L16 4Z" fill="#7C3AED" />
        <path d="M10 12L16 6L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function Navbar() {
    return (
        <motion.nav
            className="navbar"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link to="/" className="logo-group">
                <LogoIcon />
                <span className="logo-text">MM Docs</span>
            </Link>

            <div className="nav-links">
                <motion.a href="#" className="nav-link" whileHover={{ y: -2 }}>About</motion.a>
                <motion.a href="#" className="nav-link" whileHover={{ y: -2 }}>Features</motion.a>
                <motion.a href="#" className="nav-link" whileHover={{ y: -2 }}>Templates</motion.a>
                <motion.a href="#" className="nav-link" whileHover={{ y: -2 }}>Brand Kit</motion.a>
                <motion.a href="#" className="nav-link" whileHover={{ y: -2 }}>API</motion.a>
            </div>

            <div className="auth-group">
                <Link to="/login" className="login-link">
                    Login
                </Link>
                <Link to="/signup">
                    <motion.button
                        className="get-started-btn-nav"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started
                    </motion.button>
                </Link>
            </div>
        </motion.nav>
    );
}
