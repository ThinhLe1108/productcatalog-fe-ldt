import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import API_BASE_URL from '../config.js';

const Login = ({ onToggle }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.status !== 401) {
        setMessage('Đăng nhập thành công!');
        
            let token = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
            let name = data.fullName || data.data?.fullName;
            let role = data.roleName || data.data?.roleName || '';
        
        // Nếu không có trong body, lấy từ header Authorization
        if (!token) {
          const authHeader = response.headers.get("Authorization");
          if (authHeader) {
            token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
          }
        }
        
        // Lưu token vào localStorage
        if (token) {
          const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
          localStorage.setItem('token', cleanToken);
          console.log('Token saved:', cleanToken);
        }
            // Lưu fullName và roleName vào localStorage
            localStorage.setItem('fullName', name || '');
            localStorage.setItem('roleName', role || '');
        
        console.log('Login successful:', data);
        
        navigate('/home');
      } else {
        // Hiển thị message lỗi từ backend
        setMessage(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      setMessage('Lỗi kết nối! Vui lòng thử lại.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng Nhập</h2>
        
        {message && (
          <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="toggle-form">
          <p>
            Chưa có tài khoản?
            <span onClick={onToggle}> Đăng ký ngay</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
