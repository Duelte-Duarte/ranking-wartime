
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resultado = await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      navigate("/admin");
    } catch (error) {
      console.error(error);
      setErro("E-mail ou senha incorretos.");
    } finally {
      setCarregando(false);
    }
  }

  if (auth.currentUser) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={entrar}>
        <div className="login-bandeira">🇧🇷</div>

        <h1>Área administrativa</h1>
        <p>Comunidade Brasileira Wartime Glory</p>

        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          required
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Sua senha"
          required
        />

        {erro && <div className="erro-login">{erro}</div>}

        <button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <a href="/">Voltar ao ranking</a>
      </form>
    </div>
  );
}

export default Login;
