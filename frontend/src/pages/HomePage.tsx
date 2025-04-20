import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FaShieldAlt, 
  FaLock, 
  FaKey, 
  FaUserSecret, 
  FaSearch, 
  FaChartBar, 
  FaLightbulb,
  FaRocket,
  FaArrowRight,
  FaTrophy,
  FaClock,
  FaEye,
  FaTasks,
  FaVolumeMute,
  FaVolumeUp
} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';

const HomePage: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [muted, setMuted] = React.useState(true);
  
  // Using intersection observer hooks for scroll-triggered animations
  const [featuresRef, featuresInView] = useInView({ 
    threshold: 0.2,
    triggerOnce: true
  });
  
  const [simulationsRef, simulationsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [challengesRef, challengesInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 10
      } 
    }
  };
  
  // Featured simulations
  const featuredSimulations = [
    {
      id: 'hastad-attack',
      title: 'Håstad\'s Broadcast Attack',
      description: 'Explore the vulnerability in RSA encryption when using low exponents across multiple recipients.',
      icon: <FaKey size={28} />,
      tags: ['RSA', 'Cryptography', 'Number Theory'],
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'cbc-padding-oracle',
      title: 'CBC Padding Oracle',
      description: 'Learn how padding oracles can be exploited to decrypt CBC-encrypted messages.',
      icon: <FaLock size={28} />,
      tags: ['AES', 'Block Cipher', 'Oracle Attack'],
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'mitm-attack',
      title: 'Man-in-the-Middle Attack',
      description: 'See how MITM attacks work and how protocols can be compromised.',
      icon: <FaUserSecret size={28} />,
      tags: ['Network', 'Protocol', 'TLS'],
      color: 'from-green-500 to-teal-600'
    }
  ];
  
  // Challenge mode features
  const challengeFeatures = [
    {
      icon: <FaTrophy size={28} />,
      title: 'CTF-Style Challenges',
      description: 'Test your skills with capture-the-flag style challenges using our simulation engine',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: <FaClock size={28} />,
      title: 'Timed Exercises',
      description: 'Race against the clock to complete security challenges and earn bonus points',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <FaEye size={28} />,
      title: 'Blind Scenarios',
      description: 'Identify attack types from patterns and behaviors without knowing the attack in advance',
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: <FaTasks size={28} />,
      title: 'Multi-Stage Attacks',
      description: 'Complete progressive attack scenarios that build upon previous stages',
      color: 'from-green-500 to-teal-600'
    }
  ];

  const toggleMute = () => {
    setMuted(!muted);
  };

  return (
    <div className="flex flex-col space-y-24 pb-8">
      {/* Hero Section with matrix video background */}
      <section className="relative py-20 px-4 mt-8">
        {/* Matrix video background */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl">
          <video 
            className="video-background"
            autoPlay 
            loop 
            muted={muted} 
            playsInline
          >
            <source src="/videos/47802-451812879_medium.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Video overlay to ensure text visibility */}
          <div className={`video-overlay ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}></div>
          
          {/* Sound toggle button */}
          <button 
            onClick={toggleMute} 
            className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            aria-label={muted ? "Unmute video" : "Mute video"}
          >
            {muted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-5"
          >
            <FaShieldAlt className="inline-block text-5xl mb-6 text-white" />
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight enhanced-text-visibility"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Learn Cybersecurity Through
            <span className="block text-secondary-300">Interactive Simulations</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-100 enhanced-text-visibility"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Visualize attacks, explore vulnerabilities, and master cybersecurity concepts with hands-on simulations
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/simulations">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors flex items-center shadow-lg"
              >
                <FaSearch className="mr-2" />
                Explore Simulations
              </motion.button>
            </Link>
            <Link to="/simulations/hastad-attack">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center shadow-lg"
              >
                <FaRocket className="mr-2" />
                Try Demo
              </motion.button>
            </Link>
          </motion.div>
          
          {/* Bounce indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ 
              y: [0, 10, 0],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2
            }}
          >
            <FaArrowRight className="rotate-90 text-white opacity-70" size={20} />
          </motion.div>
        </div>
      </section>

      {/* Stats counter section */}
      <section className="py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '15+', label: 'Simulations', icon: <FaLock /> },
            { value: '1200+', label: 'Users Learning', icon: <FaUserSecret /> },
            { value: '24/7', label: 'Tech Support', icon: <FaLightbulb /> },
            { value: '100%', label: 'Free Access', icon: <FaRocket /> },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-darksurface shadow-card dark:shadow-dark-card rounded-xl p-6 text-center transform transition-all duration-300 hover:translate-y-[-5px] dark:text-white"
            >
              <div className="flex justify-center mb-4 text-secondary-500">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        variants={containerVariants}
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
        className="py-12"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-3xl font-bold text-center mb-4 dark:text-white"
        >
          Why Choose Our Platform
        </motion.h2>
        
        <motion.p 
          variants={itemVariants}
          className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
        >
          Our simulation platform provides unique learning experiences through visualization and hands-on exercises
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaSearch size={36} className="text-primary-500" />,
              title: "Interactive Learning",
              description: "Learn by doing with hands-on simulations that demonstrate real-world cybersecurity concepts and attacks."
            },
            {
              icon: <FaChartBar size={36} className="text-secondary-500" />,
              title: "Advanced Visualization",
              description: "Complex cryptographic and network concepts are made easy to understand through intuitive visualizations."
            },
            {
              icon: <FaLightbulb size={36} className="text-yellow-500" />,
              title: "Practical Skills",
              description: "Develop skills that are directly applicable to real-world penetration testing and security analysis."
            }
          ].map((feature, index) => (
            <motion.div 
              key={feature.title}
              variants={itemVariants}
              className="bg-white dark:bg-darksurface rounded-xl p-8 shadow-card dark:shadow-dark-card transform transition-all duration-300 hover:translate-y-[-5px]"
            >
              <div className="flex justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Simulations */}
      <motion.section 
        ref={simulationsRef}
        variants={containerVariants}
        initial="hidden"
        animate={simulationsInView ? "visible" : "hidden"}
        className="py-12"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-3xl font-bold text-center mb-2 dark:text-white"
        >
          Featured Simulations
        </motion.h2>
        
        <motion.p 
          variants={itemVariants}
          className="text-center text-gray-600 dark:text-gray-300 mb-12"
        >
          Start exploring these popular cybersecurity simulations
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredSimulations.map((sim, index) => (
            <motion.div 
              key={sim.id}
              variants={itemVariants}
              className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-darksurface"
              whileHover={{ y: -5 }}
            >
              <div className={`bg-gradient-to-r ${sim.color} p-6 flex justify-center items-center text-white`}>
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  {sim.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 dark:text-white">{sim.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{sim.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {sim.tags.map(tag => (
                    <span key={tag} className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link to={`/simulations/${sim.id}`}>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full text-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center"
                  >
                    Launch Simulation
                    <FaArrowRight className="ml-2" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* New section: Interactive Challenge Mode */}
      <motion.section 
        ref={challengesRef}
        variants={containerVariants}
        initial="hidden"
        animate={challengesInView ? "visible" : "hidden"}
        className="py-12"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-3xl font-bold text-center mb-2 dark:text-white"
        >
          <FaTrophy className="inline-block mr-2 text-yellow-500" />
          Interactive Challenge Mode
        </motion.h2>
        
        <motion.p 
          variants={itemVariants}
          className="text-center text-gray-600 dark:text-gray-300 mb-12"
        >
          Put your skills to the test with our new gamified cybersecurity challenges
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {challengeFeatures.map((feature, index) => (
            <motion.div 
              key={feature.title}
              variants={itemVariants}
              className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-darksurface"
              whileHover={{ y: -5 }}
            >
              <div className={`bg-gradient-to-r ${feature.color} p-6 flex justify-center items-center text-white h-24`}>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  {feature.icon}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="flex justify-center mt-10"
        >
          <Link to="/challenges">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-10 rounded-lg transition-all flex items-center"
            >
              <FaTrophy className="mr-2" />
              Try Challenges Now
            </motion.button>
          </Link>
        </motion.div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-darkbg dark:to-darksurface text-white py-16 px-6 rounded-2xl shadow-xl text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Master Cybersecurity?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Dive into our comprehensive library of simulations and start learning today.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/simulations">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-bold py-3 px-10 rounded-lg transition-all flex items-center"
            >
              <FaRocket className="mr-2" />
              Explore Simulations
            </motion.button>
          </Link>
          
          <Link to="/challenges">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-10 rounded-lg transition-all flex items-center"
            >
              <FaTrophy className="mr-2" />
              Take a Challenge
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;