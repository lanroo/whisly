import { Link } from 'react-router-dom';
import { MaterialIcon } from '../components/MaterialIcon';

export function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">Wishly</p>
          <h1>Welcome Back</h1>
          <p className="auth-card__subtitle">
            Log in to continue curating your dreams.
          </p>
        </div>

        <form className="auth-form">
          <label className="field">
            <span>Email Address</span>
            <div className="field__control">
              <MaterialIcon className="field__icon" name="mail" />
              <input placeholder="name@example.com" type="email" />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="field__meta">
              <a href="/">Forgot Password?</a>
            </div>
            <div className="field__control">
              <MaterialIcon className="field__icon" name="lock" />
              <input placeholder="••••••••" type="password" />
            </div>
          </label>

          <Link className="primary-button" to="/home">
            <span>Login</span>
            <MaterialIcon name="arrow_forward" />
          </Link>
        </form>

        <div className="separator">
          <span>Or continue with</span>
        </div>

        <div className="social-actions">
          <button className="secondary-button" type="button">
            <MaterialIcon filled name="apps" />
            <span>Continue with Apple</span>
          </button>
          <button className="secondary-button" type="button">
            <MaterialIcon className="google-accent" filled name="google" />
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="auth-card__footer">
          Don&apos;t have an account? <a href="/">Sign Up</a>
        </p>
      </section>
    </main>
  );
}
