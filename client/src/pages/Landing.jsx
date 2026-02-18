import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Landing() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <div className="landing-page">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
            >
                <div className="bg-glow glow-1" />
                <div className="bg-glow glow-2" />
                <div className="bg-glow glow-3" />
            </motion.div>

            <motion.main
                className="hero-main"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="badge-new" variants={itemVariants}>
                    <span className="badge-pill">New</span>
                    <span className="badge-text">AI-Powered Document Generation</span>
                </motion.div>

                <motion.h1 className="hero-title" variants={itemVariants}>
                    Generate professional documents<br />
                    <span>in seconds.</span>
                </motion.h1>

                <motion.p className="hero-subtext" variants={itemVariants}>
                    AI-powered proposals, invoices, resumes, and more — ready to use, ready to send.
                </motion.p>

                <motion.div className="cta-container" variants={itemVariants}>
                    <motion.div
                        className="cta-glow"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <Link to="/signup">
                        <motion.button
                            className="cta-button"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Get Started • it's free
                            <div className="cta-icon">
                                <ArrowRight size={20} strokeWidth={3} />
                            </div>
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.main>
        </div>
    );
}
