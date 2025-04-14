import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import './styles/App.css';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard/Dashboard';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

function AuthForm({ theme }) {
  const [isSignInMode, setIsSignInMode] = useState(false);
  const [signUpData, setSignUpData] = useState({
    fullName: '', dob: '', country: '', email: '', password: '', hobbies: ''
  });
  const [countrySearch, setCountrySearch] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { email, password } = signUpData;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/welcome');
    } catch (error) {
      alert('Sign-in failed: ' + error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { fullName, dob, country, email, password, hobbies } = signUpData;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        fullName, dob, country, email, hobbies, createdAt: new Date().toISOString()
      });
      navigate('/welcome');
    } catch (error) {
      alert('Sign-up failed: ' + error.message);
    }
  };

  const handleForgotPassword = async () => {
    const email = signUpData.email;
    if (!email) return alert('Please enter your email first.');
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent. Check your inbox.');
    } catch (error) {
      alert('Failed to send reset email: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const switchToSignIn = () => setIsSignInMode(true);
  const switchToSignUp = () => setIsSignInMode(false);

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia',
    'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus',
    'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
    'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
    'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
    'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
    'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
    'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
    'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
    'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali',
    'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
    'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
    'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
    'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
    'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
    'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
    'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
    'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
    'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
    'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
    'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="auth-modal">
      <form className="modern-form" onSubmit={isSignInMode ? handleSignIn : handleSignUp}>
        <h2>{isSignInMode ? 'Sign In' : 'Sign Up'}</h2>
        {!isSignInMode && (
          <>
            <div className="form-group">
              <input type="text" name="fullName" value={signUpData.fullName} onChange={handleInputChange} placeholder="Full Name" required />
            </div>
            <div className="form-group">
              <input type="date" name="dob" value={signUpData.dob} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Search Country" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
              <select name="country" value={signUpData.country} onChange={handleInputChange} required size={Math.min(filteredCountries.length, 5)}>
                <option value="">Select Country</option>
                {filteredCountries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="form-group">
          <input type="email" name="email" value={signUpData.email} onChange={handleInputChange} placeholder="Email" required />
        </div>
        <div className="form-group">
          <input type="password" name="password" value={signUpData.password} onChange={handleInputChange} placeholder="Password" required />
        </div>
        {!isSignInMode && (
          <div className="form-group">
            <input type="text" name="hobbies" value={signUpData.hobbies} onChange={handleInputChange} placeholder="Hobbies (optional)" />
          </div>
        )}
        <div className="form-group">
          <button className="auth-submit" type="submit">{isSignInMode ? 'Sign In' : 'Sign Up'}</button>
        </div>
        {isSignInMode && (
          <p className="forgot-password">
            <button type="button" onClick={handleForgotPassword}>Forgot Password?</button>
          </p>
        )}
        <p className="auth-switch">
          {isSignInMode ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={isSignInMode ? switchToSignUp : switchToSignIn}>
            {isSignInMode ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </form>
    </div>
  );
}

function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/" />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className={`app ${theme}`}>
        <Routes>
          <Route path="/" element={<AuthForm theme={theme} />} />
          <Route path="/welcome" element={<WelcomePage theme={theme} />} />
          <Route path="/signin" element={<SignIn navigate={useNavigate} />} />
          <Route path="/signup" element={<SignUp navigate={useNavigate} />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute user={user}>
                <Dashboard user={user} navigate={useNavigate} theme={theme} setTheme={setTheme} />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute user={user}>
                <Dashboard user={user} navigate={useNavigate} theme={theme} setTheme={setTheme} initialSection="profile" />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;