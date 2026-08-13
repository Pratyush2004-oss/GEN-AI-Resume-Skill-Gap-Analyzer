import { Eye, EyeClosed, Loader } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import '../auth.form.scss';
import { useLoginMutation } from '../mutations';
const Login = () => {
    const [showPassword, setshowPassword] = useState(false);
    const loginMutation = useLoginMutation();
    const navigate = useNavigate();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        // Call the mutation instance created at component scope.
        loginMutation.mutate({ email, password }, {
            onSuccess: () => {
                // redirect to home page if login is successful.
                navigate('/');
            },
            onSettled: () => {
                // reset the form fields
                e.currentTarget.reset();
            },
        });
    }
    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
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
                        disabled={loginMutation.isPending}
                        type='submit' className='btn primary-btn'>{loginMutation.isPending ? (
                            <span className='loader-container'>
                                <Loader className='loader' />
                                <span>Loading...</span>
                            </span>
                        ) : "Login"}</button>
                </form>
                <p className='navigate-link'>Don't have an account? <span onClick={() => navigate('/signup')}>Register</span></p>
            </div>
        </main>
    )
}

export default Login