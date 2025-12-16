import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import css from "../styles/Login.module.css";

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin({ email, pass });
    };

    return (
        <div className={css.wrapper}>
            <div className={css.card}>
                <h2 className={css.title}>Dukandar Login</h2>

                <form className={css.form} onSubmit={handleSubmit}>
                    <div className={css.field}>
                        <FaUser className={css.icon} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={css.field}>
                        <FaLock className={css.icon} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            required
                        />
                    </div>

                    <button className={css.btn} type="submit">
                        Login
                    </button>

                    <p className={css.forgot}>Forgot password?</p>

                    {/* CREATE ACCOUNT BUTTON */}
                    <button
                        type="button"
                        className={css.createBtn}
                        onClick={() => navigate("create-account")}
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
