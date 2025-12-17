import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { loginWeb, loginKiosk } from "../store/store";
import { useLocation, useNavigate } from "react-router-dom";
import css from "../styles/Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const isKiosk = location.pathname.startsWith("/kiosk-interface")

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let result;

    if (isKiosk) {
      result = await dispatch(
        loginKiosk({ email, password: pass })
      ).unwrap();
    } else {
      result = await dispatch(
        loginWeb({ email, password: pass })
      ).unwrap();

      console.log("Login: ", result);
      
    }

    if(result)
    {
        navigate("chat");
    }
    else
    {
        alert("Invalid Credentials");
    }

  } catch (err) {
    console.error("Login failed:", err);
    // show error message here
  }
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
