import React, { useState, useEffect } from "react";
import BackButton from "../Components/BackButton";
import { useToast } from "../Context/ToastContext.js";
import { Link, useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Breadcrumb } from "react-bootstrap";

function getByUsernameAndPassword(username, password) {
  // Recuperar la lista de usuarios de localStorage
  const usuarios = JSON.parse(localStorage.getItem('usuarios'));

  // Buscar el usuario por su username
  const usuario = usuarios.find(usuario => usuario.username === username && usuario.password === password);

  // Retornar el usuario encontrado o null si no se encuentra
  return usuario || null;
}

function LoginPage() {
  useEffect(() => {
    document.title = "Login";
  }, []);

  const [usuario, setusuario] = useState(null);
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (usuario) {
      navigate("/"); // Redirigir después de que se actualice el estado de usuario
    }
  }, [usuario, navigate]);

  const [showPassword, setShowPassword] = useState(false);

  const login = (e) => {
    e.preventDefault();

    // Validar credenciales, por ejemplo:
    const usuario = getByUsernameAndPassword(username, password);
    if (usuario) {
      usuario.lastConnection = new Date().toLocaleString();
      localStorage.setItem("usuario", JSON.stringify(usuario));
      setusuario(usuario);
      localStorage.setItem("usuarios", JSON.stringify(
        JSON.parse(localStorage.getItem("usuarios")).map((u) =>
          u.username === usuario.username ? usuario : u
        )
      
      ));
      showToast("Inicio de sesión correcto.", "bg-success");
    } else {
      alert("Nombre de usuario o contraseña incorrectos.");
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center border border-dark-subtle bg-light"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div
        className="p-4"
        style={{
          maxWidth: "400px",
          background: "#ececec",
          borderRadius: "8px",
          boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
        }}
      >
      <Breadcrumb className="custom-breadcrumb">
      <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item active aria-label="enlace_a_login">
          Login
        </Breadcrumb.Item>
      </Breadcrumb>
        <form className="row col-12 g-3" onSubmit={login}>
          <div className="login-container text-center">
          <label style={{ fontSize: "2.5rem" }}>Bienvenido</label>
          <label style={{ fontSize: "1rem", paddingBottom: "25px" }}>Por favor, inica sesión para continuar.</label>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-control form-control-sm"
                aria-label="nombre_de_usuario"
                required
                value={username}
                onChange={(e) => setusername(e.target.value)}
                style={{
                  marginBottom: "0.5rem",
                  width: "300px",
                  margin: "0 auto",
                }}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div
                className="input-group"
                style={{
                  marginBottom: "0.5rem",
                  width: "300px",
                  margin: "0 auto",
                }}
              >
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control form-control-sm"
                  aria-label="contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="tooltip-create">
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </Tooltip>
                  }
                >
                  <button
                    type="button"
                    className={
                      showPassword
                        ? "bi bi-eye btn btn-outline-secondary"
                        : "bi bi-eye-slash btn btn-outline-secondary"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="toggle_password_visibility"
                  ></button>
                </OverlayTrigger>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary text-secondary border border-secondary-subtle m-3"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="btn btn-primary text-secondary border border-secondary-subtle m-3"
            >
              Registrarse
            </button>
            <BackButton />
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
