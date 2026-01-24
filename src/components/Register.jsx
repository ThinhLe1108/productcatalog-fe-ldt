import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Register = ({ onToggle }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    roleName: 'ADMIN'
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
      const response = await fetch('/api/accounts/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          roleName: 'CUSTOMER'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.message || 'Đăng ký thất bại!');
      }
    } catch (error) {
      setMessage('Lỗi kết nối! Vui lòng thử lại.');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng Ký</h2>

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

          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="form-group">
            <label htmlFor="roleName">Vai trò</label>
            <select
              id="roleName"
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              required
            >
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="toggle-form">
          <p>
            Đã có tài khoản?
            <span onClick={onToggle}> Đăng nhập ngay</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
