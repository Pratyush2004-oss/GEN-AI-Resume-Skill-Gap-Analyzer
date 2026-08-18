import { Eye, EyeClosed, Loader } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import "../auth.form.scss";
import { useSignupMutation } from '../mutations';
const Signup = () => {
  const [showPassword, setshowPassword] = useState(false);
  const signupMutation = useSignupMutation();
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("userName"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    // Call the mutation instance created at component scope.
    signupMutation.mutate({ username, email, password }, {
      onSuccess: () => {
        // redirect to home page if login is successful.
        navigate('/');
      },
      onSettled: () => {
        // reset the form fields
        e.currentTarget.reset();
      }
    });
  };
  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="userName">Username</label>
            <input type="text" name="userName" id="userName" required placeholder='Enter Username' />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" required placeholder='Enter email address' />
          </div>
          <div className="input-group password">
            <label htmlFor="password">Password</label>
            <button type="button" className='password-btn' onClick={() => setshowPassword(!showPassword)}>
              {
                showPassword ? <Eye /> : <EyeClosed />
              }
            </button>
            <input type={!showPassword ? "text" : "password"} name="password" id="password" required placeholder='Enter password' />
          </div>
          <button
            disabled={signupMutation.isPending}
            type='submit' className='btn primary-btn'>{signupMutation.isPending ? (
              <span className='loader-container'>
                <Loader className='loader' />
                <span>Loading...</span>
              </span>
            ) : "Signup"}</button>
        </form>
        <p className='navigate-link'>Already have an account? <span onClick={() => navigate('/login')}>Login</span></p>
      </div>
    </main>
  )
}

export default Signup