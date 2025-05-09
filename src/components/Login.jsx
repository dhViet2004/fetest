import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { App } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/users');
      const users = await response.json();
      
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }));

        // Show center notification
        messageApi.success({
          content: (
            <div className="flex items-center">
              <FaCheckCircle className="text-2xl mr-2 text-green-500" />
              <div>
                <div className="font-semibold">Welcome back, {user.name || user.username}!</div>
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

        // Show top notification
        messageApi.success({
          content: (
            <div className="flex items-center">
              <FaCheckCircle className="text-2xl mr-2 text-green-500" />
              <div>
                <div className="font-semibold">Login Successful!</div>
                <div className="text-sm text-gray-500">Redirecting to {user.role === 'admin' ? 'admin dashboard' : 'home page'}...</div>
              </div>
            </div>
          ),
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 2,
          style: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
          },
        });

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Invalid username or password');
        messageApi.error({
          content: (
            <div className="flex items-center">
              <FaTimesCircle className="text-2xl mr-2 text-red-500" />
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

        // Show top error notification
        messageApi.error({
          content: (
            <div className="flex items-center">
              <FaTimesCircle className="text-2xl mr-2 text-red-500" />
              <div>
                <div className="font-semibold">Login Failed</div>
                <div className="text-sm text-gray-500">Please check your credentials and try again.</div>
              </div>
            </div>
          ),
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 2,
          style: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
          },
        });
      }
    } catch {
      setError('Error logging in. Please try again.');
      messageApi.error({
        content: (
          <div className="flex items-center">
            <FaTimesCircle className="text-2xl mr-2 text-red-500" />
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

      // Show top error notification
      messageApi.error({
        content: (
          <div className="flex items-center">
            <FaTimesCircle className="text-2xl mr-2 text-red-500" />
            <div>
              <div className="font-semibold">Connection Error</div>
              <div className="text-sm text-gray-500">Please check your internet connection.</div>
            </div>
          </div>
        ),
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 2,
        style: {
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 