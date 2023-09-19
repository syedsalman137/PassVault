import React, { useState, useEffect, useRef } from "react";
import "./login.css";
import { useDispatch } from "react-redux";

import { loginActions } from "../../state/loginSlice";

import { invoke } from "@tauri-apps/api";

function LoginPage() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [showGeneratePassword, setShowGeneratePassword] = useState(false);
  const [safePassword, setSafePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const generateRandomPasswordRef = useRef(null);
  const dispatch = useDispatch();

  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword);
    const inputElement = document.getElementById("login__form_password");
    inputElement.focus();
    const inputValue = inputElement.value;
    inputElement.focus();
    inputElement.value = "";
    setTimeout(() => {
      inputElement.value = inputValue;
    }, 0);
  };

  const handleOutsideClick = (event) => {
    if (
      generateRandomPasswordRef.current &&
      !generateRandomPasswordRef.current.contains(event.target)
    ) {
      setShowGeneratePassword(false);
    }
  };

  const generateRandomPassword = () => {
    let buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    const length = (buffer[0] % 9) + 8;
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = [];
    buffer = new Uint32Array(length);

    window.crypto.getRandomValues(buffer);

    for (let i = 0; i < length; i++) {
      password.push(charset[buffer[i] % charset.length]);
    }
    console.log(password);

    return password.join("");
  };

  const handlePasswordFocus = () => {
    if (isNewUser) {
      setSafePassword(generateRandomPassword());
      setShowGeneratePassword(true);
    }
  };

  const handleClickGeneratePassword = (password) => {
    console.log(document.getElementById("login__form"));
    document.getElementById("login__form").password.value = password;
    setShowGeneratePassword(false);
  };

  const handleInvalidPassword = () => {
    document.getElementById("invalid-password-dialog").showModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.target.login__form_button.disabled = true;
    try {
      let result = await invoke("authenticate", {
        masterPassword: e.target.password.value,
      });
      console.log(result);
      if (result) {
        sessionStorage.setItem("isLoggedIn", "true");
        dispatch(loginActions.setIsLoggedIn(true));
      } else {
        handleInvalidPassword();
      }
    } catch (error) {
      console.error(error);
    }
    e.target.login__form_button.disabled = false;
  };

  useEffect(() => {
    const start_app = async () => {
      try {
        let response = await invoke("start_app", {});
        if (response.is_new_user) {
          setIsNewUser(true);
        } else if (response.altered) {
        }
      } catch (error) {
        console.error(error);
      }
    };
    start_app();
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div id="Login">
      <div className="login__container">
        <dialog
          id="invalid-password-dialog"
          className="invalid-password-dialog"
        >
          <p>Invalid password</p>
          <form method="dialog" type="submit">
            <button className="invalid-password-dialog__form-button">Ok</button>
          </form>
        </dialog>
        <form id="login__form" className="login__form" onSubmit={handleSubmit}>
          <div className="login__form-input-container">
            {isNewUser ? (
              <label className="login__form-input-label">
                Create your account
              </label>
            ) : (
              <label className="login__form-input-label">
                Enter your password
              </label>
            )}
            <div className="login__form__input-container">
              <input
                id="login__form_password"
                className="login__form_password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                onChange={handlePasswordFocus}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    if (!showGeneratePassword) {
                      setSafePassword(generateRandomPassword());
                      setShowGeneratePassword(true);
                    }
                    console.log(
                      document.getElementById("login__form").password_suggest
                    );
                    generateRandomPasswordRef.current.focus();
                  }
                }}
                autoFocus
                required
              />
              <span
                className="login__form__toggle-password"
                onClick={handleToggleShowPassword}
              >
                <i className="material-icons">
                  {showPassword ? "visibility_off" : "visibility"}
                </i>
              </span>
              <div
                ref={generateRandomPasswordRef}
                className="suggest-password"
                style={{ display: showGeneratePassword ? "block" : "none" }}
                tabIndex={0}
                onClick={() => handleClickGeneratePassword(safePassword)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleClickGeneratePassword(safePassword);
                  }
                  if (e.key === "ArrowDown") {
                    document.getElementById("login__form").password.focus();
                  }
                  if (e.key === "ArrowUp") {
                    document.getElementById("login__form").password.focus();
                  }
                }}
              >
                Use Secure Password:{` ${safePassword}`}
              </div>
            </div>
          </div>
          <div className="login__form-button-container">
            <button
              className="login__form-button"
              name="login__form_button"
              type="submit"
            >
              {isNewUser ? "Create" : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
