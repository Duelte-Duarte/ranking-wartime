
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { auth, db } from "../services/firebase";

function ProtectedRoute({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCarregando(true);

      if (!user) {
        setUsuario(null);
        setAutorizado(false);
        setCarregando(false);
        return;
      }

      try {
        const referencia = doc(db, "administradores", user.uid);
        const resultado = await getDoc(referencia);

        setUsuario(user);
        setAutorizado(
          resultado.exists() && resultado.data().ativo === true
        );
      } catch (error) {
        console.error("Erro ao verificar administrador:", error);
        setUsuario(user);
        setAutorizado(false);
      } finally {
        setCarregando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (carregando) {
    return <p className="mensagem">Verificando acesso...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!autorizado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
