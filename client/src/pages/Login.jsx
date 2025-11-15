import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-page">
      {/* Move the title outside the container */}
      <h1 className="login-title">Login / Sign up</h1>
      
      <div className="login-container">
        <form className="login-form">
          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS</label>
            <input 
              type="email" 
              placeholder="enter email address"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input 
              type="password" 
              placeholder="enter password"
              className="form-input"
            />
          </div>
          
          <button type="submit" className="login-button">
            Login / Sign up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;