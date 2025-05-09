import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';
import { App, Modal } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init("7XFC_c_S4UZoF26T_"); // Public key from your EmailJS service

const LoginModal = ({ onClose, onLogin }) => {
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  });

  const [signinData, setSigninData] = useState({
    username: '',
    password: '',
  });

  const handleSignUp = async () => {
    try {
      const checkResponse = await fetch(`http://localhost:3001/users?username=${signupData.username}`);
      const existingUsers = await checkResponse.json();

      if (existingUsers.length > 0) {
        messageApi.error({
          content: 'Username already exists!',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 3,
        });
        return;
      }

      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      if (response.ok) {
        messageApi.success({
          content: 'Registration successful!',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 3,
        });
        setRightPanelActive(false);
        setSignupData({
          username: '',
          email: '',
          password: '',
          full_name: '',
          role: 'user'
        });
      } else {
        messageApi.error({
          content: 'Registration failed. Please try again.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 3,
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
      messageApi.error({
        content: 'Server connection error',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 3,
      });
    }
  };

  const handleSignIn = async () => {
    try {
      const response = await fetch(`http://localhost:3001/users?username=${signinData.username}`);
      const users = await response.json();
      
      // Kiểm tra chính xác username và password
      const user = users.find(u => 
        u.username === signinData.username && 
        u.password === signinData.password
      );

      if (user) {
        messageApi.success({
          content: (
            <div className="flex items-center">
              <UserOutlined className="text-2xl mr-2 text-green-500" />
              <div>
                <div className="font-semibold">Welcome back, {user.full_name || user.username}!</div>
                <div className="text-sm text-gray-500">You have successfully logged in.</div>
              </div>
            </div>
          ),
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 3,
          style: {
            marginTop: '20vh',
          },
        });

        // Lưu toàn bộ thông tin user vào localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        if (typeof onLogin === 'function') {
          onLogin(user);
        }
        
        onClose();
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/products');
        }
      } else {
        messageApi.error({
          content: (
            <div className="flex items-center">
              <CloseCircleOutlined className="text-2xl mr-2 text-red-500" />
              <div>
                <div className="font-semibold">Login Failed</div>
                <div className="text-sm text-gray-500">Invalid username or password.</div>
              </div>
            </div>
          ),
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 3,
          style: {
            marginTop: '20vh',
          },
        });
      }
    } catch (err) {
      console.error('Signin error:', err);
      messageApi.error({
        content: (
          <div className="flex items-center">
            <CloseCircleOutlined className="text-2xl mr-2 text-red-500" />
            <div>
              <div className="font-semibold">Connection Error</div>
              <div className="text-sm text-gray-500">Unable to connect to the server.</div>
            </div>
          </div>
        ),
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google');
        }
        
        const userInfo = await userInfoResponse.json();
        console.log('Google user info:', userInfo);
        
        const checkResponse = await fetch(`http://localhost:3001/users?email=${userInfo.email}`);
        const existingUsers = await checkResponse.json();
        
        if (existingUsers.length > 0) {
          const user = existingUsers[0];
          if (userInfo.picture && (!user.imageUrl || user.imageUrl === "https://res.cloudinary.com/dh1o42tjk/image/upload/v1744696489/293856112_700167161082539_6334980016010373075_n_po8xll.jpg")) {
            const updatedUser = {
              ...user,
              imageUrl: userInfo.picture,
              google_id: userInfo.sub
            };
            
            await fetch(`http://localhost:3001/users/${user.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedUser),
            });
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (typeof onLogin === 'function') {
              onLogin(updatedUser);
            }
          } else {
            localStorage.setItem('user', JSON.stringify(user));
            if (typeof onLogin === 'function') {
              onLogin(user);
            }
          }
          
          messageApi.success({
            content: (
              <div className="flex items-center">
                <UserOutlined className="text-2xl mr-2 text-green-500" />
                <div>
                  <div className="font-semibold">Welcome back, {user.full_name || user.username}!</div>
                  <div className="text-sm text-gray-500">You have successfully logged in with Google.</div>
                </div>
              </div>
            ),
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            duration: 3,
            style: {
              marginTop: '20vh',
            },
          });
          
          onClose();
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/products');
          }
        } else {
          const newUser = {
            username: userInfo.email.split('@')[0],
            email: userInfo.email,
            password: 'google-oauth',
            full_name: userInfo.name,
            name: userInfo.name,
            role: 'user',
            google_id: userInfo.sub,
            imageUrl: userInfo.picture || "https://res.cloudinary.com/dh1o42tjk/image/upload/v1744696489/293856112_700167161082539_6334980016010373075_n_po8xll.jpg",
            dateCreate: new Date().toISOString(),
            address: "Not provided",
            birthday: "Not provided",
            phoneNumber: "Not provided"
          };
          
          const createResponse = await fetch('http://localhost:3001/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
          });
          
          if (createResponse.ok) {
            const createdUser = await createResponse.json();
            console.log('Created user:', createdUser);
            
            localStorage.setItem('user', JSON.stringify(createdUser));
            if (typeof onLogin === 'function') {
              onLogin(createdUser);
            }
            
            messageApi.success({
              content: (
                <div className="flex items-center">
                  <UserOutlined className="text-2xl mr-2 text-green-500" />
                  <div>
                    <div className="font-semibold">Welcome, {createdUser.full_name || createdUser.username}!</div>
                    <div className="text-sm text-gray-500">Your account has been created successfully.</div>
                  </div>
                </div>
              ),
              icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              duration: 3,
              style: {
                marginTop: '20vh',
              },
            });
            
            onClose();
            navigate('/products');
          } else {
            console.error('Failed to create user:', await createResponse.text());
            messageApi.error({
              content: (
                <div className="flex items-center">
                  <CloseCircleOutlined className="text-2xl mr-2 text-red-500" />
                  <div>
                    <div className="font-semibold">Account Creation Failed</div>
                    <div className="text-sm text-gray-500">Unable to create account with Google.</div>
                  </div>
                </div>
              ),
              icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
              duration: 3,
              style: {
                marginTop: '20vh',
              },
            });
          }
        }
      } catch (error) {
        console.error('Google login error:', error);
        messageApi.error({
          content: (
            <div className="flex items-center">
              <CloseCircleOutlined className="text-2xl mr-2 text-red-500" />
              <div>
                <div className="font-semibold">Google Login Error</div>
                <div className="text-sm text-gray-500">Unable to login with Google.</div>
              </div>
            </div>
          ),
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 3,
          style: {
            marginTop: '20vh',
          },
        });
      }
    },
    onError: () => {
      messageApi.error({
        content: (
          <div className="flex items-center">
            <CloseCircleOutlined className="text-2xl mr-2 text-red-500" />
            <div>
              <div className="font-semibold">Google Login Failed</div>
              <div className="text-sm text-gray-500">Please try again later.</div>
            </div>
          </div>
        ),
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
    }
  });

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook login
    console.log('Facebook login clicked');
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      messageApi.error('Please enter your email address');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      // Check if email exists in database
      const response = await fetch(`http://localhost:3001/users?email=${forgotPasswordEmail}`);
      const users = await response.json();

      if (users.length === 0) {
        messageApi.error('Email not found in our system');
        return;
      }

      const user = users[0];
      
      // Send email using EmailJS with original password
      const templateParams = {
        to_email: forgotPasswordEmail,
        password: user.password, // Original password from database
        email: forgotPasswordEmail
      };

      await emailjs.send(
        "service_k7pkl19",
        "template_4rsezo2",
        templateParams
      );

      messageApi.success('Your password has been sent to your email');
      setForgotPasswordModalVisible(false);
      setForgotPasswordEmail('');
    } catch (error) {
      console.error('Forgot password error:', error);
      messageApi.error('Failed to send password. Please try again later.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://res.cloudinary.com/dh1o42tjk/image/upload/v1744710728/16be05d672b4da505d38cad34b1e2ddf_hgulp2.jpg")' }}>
        <div className="absolute inset-0 bg-opacity-50"></div>
      </div>
      <div className="relative w-full max-w-4xl min-h-[480px] bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-50"
        >
          <FaTimes />
        </button>

        {/* Sign Up Form */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out flex items-center justify-center ${rightPanelActive ? 'translate-x-full opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <form className="flex flex-col items-center w-4/5" onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
            <h1 className="text-2xl mb-5 text-gray-800">Create Account</h1>
            <input
              type="text"
              placeholder="Name"
              value={signupData.full_name}
              onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={signupData.username}
              onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />

            <button
              type="submit"
              className="rounded-full border border-gray-700 bg-gray-700 text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 active:scale-95 focus:outline-none hover:cursor-pointer"
            >
              Sign Up
            </button>

            {/* Social Login Buttons */}
            <div className="w-full flex flex-row justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <FcGoogle className="text-xl" />
                <span className="text-gray-700 text-sm">Google</span>
              </button>
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <FaFacebook className="text-xl text-blue-600" />
                <span className="text-gray-700 text-sm">Facebook</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out flex items-center justify-center ${rightPanelActive ? 'translate-x-full opacity-0 z-0' : 'opacity-100 z-10'}`}>
          <form className="flex flex-col items-center w-4/5" onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
            <h1 className="text-2xl mb-5 text-gray-800">Sign in</h1>
            <input
              type="text"
              placeholder="Username"
              value={signinData.username}
              onChange={(e) => setSigninData({ ...signinData, username: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signinData.password}
              onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <div className="w-full text-right">
              <button
                type="button"
                onClick={() => setForgotPasswordModalVisible(true)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            <button
              type="submit"
              className="rounded-full border border-gray-700 bg-gray-700 text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 active:scale-95 focus:outline-none hover:cursor-pointer"
            >
              Sign In
            </button>

            {/* Social Login Buttons */}
            <div className="w-full flex flex-row justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <FcGoogle className="text-xl" />
                <span className="text-gray-700 text-sm">Google</span>
              </button>
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <FaFacebook className="text-xl text-blue-600" />
                <span className="text-gray-700 text-sm">Facebook</span>
              </button>
            </div>
          </form>
        </div>

        {/* Overlay Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-50 ${rightPanelActive ? '-translate-x-full' : ''}`}>
          <div className={`relative -left-full h-full w-[200%] bg-gradient-to-r from-gray-500 to-gray-600 text-white transition-transform duration-600 ease-in-out ${rightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
            {/* Overlay Left */}
            <div className={`absolute flex flex-col items-center justify-center text-center top-0 h-full w-1/2 p-10 transition-transform duration-600 ease-in-out ${rightPanelActive ? 'translate-x-0' : '-translate-x-1/5'}`}>
              <h1 className="text-2xl mb-5">Welcome Back!</h1>
              <p className="text-sm mb-5 leading-5">To keep connected with us please login with your personal info</p>
              <button
                onClick={() => setRightPanelActive(false)}
                className="rounded-full border border-white bg-transparent text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-700 hover:cursor-pointer hover:bg-opacity-20 focus:outline-none"
              >
                Sign In
              </button>
            </div>

            {/* Overlay Right */}
            <div className={`absolute flex flex-col items-center justify-center text-center top-0 right-0 h-full w-1/2 p-10 transition-transform duration-600 ease-in-out ${rightPanelActive ? 'translate-x-1/5' : 'translate-x-0'}`}>
              <h1 className="text-2xl mb-5">Hello, Friend!</h1>
              <p className="text-sm mb-5 leading-5">Enter your personal details and start journey with us</p>
              <button
                onClick={() => setRightPanelActive(true)}
                className="rounded-full border border-white bg-transparent text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-700 hover:bg-opacity-20 focus:outline-none hover:cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        <Modal
          title="Forgot Password"
          open={forgotPasswordModalVisible}
          onCancel={() => setForgotPasswordModalVisible(false)}
          footer={null}
        >
          <div className="p-4">
            <p className="mb-4">Enter your email address and we'll send you a new password.</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
            />
            <button
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading}
              className="w-full rounded-full border border-gray-700 bg-gray-700 text-white text-xs font-medium py-3 px-11 uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 active:scale-95 focus:outline-none hover:cursor-pointer disabled:opacity-50"
            >
              {forgotPasswordLoading ? 'Sending...' : 'Reset Password'}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

const LoginModalWithApp = ({ onClose, onLogin }) => {
  return (
    <App>
      <LoginModal onClose={onClose} onLogin={onLogin} />
    </App>
  );
};

export default LoginModalWithApp; 