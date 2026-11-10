import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import "../index.css";

function App() {
  const [aba, setAba] = useState("jogadores");
  const [jogadores, setJogadores] = useState([]);
  const [clas, setClas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const unsubscribeJogadores = onSnapshot(
      collection(db, "jogadores"),
      (snapshot) => {
        const dados = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setJogadores(dados);
        setCarregando(false);
      },
      (error) => {
        console.error(error);
        setErro("Não foi possível carregar os jogadores.");
        setCarregando(false);
      },
    );

    const unsubscribeClas = onSnapshot(
      collection(db, "clas"),
      (snapshot) => {
        const dados = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClas(dados);
      },
      (error) => {
        console.error(error);
        setErro("Não foi possível carregar os clãs.");
      },
    );

    return () => {
      unsubscribeJogadores();
      unsubscribeClas();
    };
  }, []);

  const jogadoresOrdenados = [...jogadores].sort(
    (a, b) => Number(b.pontos || 0) - Number(a.pontos || 0),
  );

  const clasOrdenados = clas
    .map((cla) => {
      const membros = jogadores.filter((jogador) => jogador.clanId === cla.id);

      const totalPontos = membros.reduce(
        (total, jogador) => total + Number(jogador.pontos || 0),
        0,
      );

      return {
        ...cla,
        totalPontos,
        totalJogadores: membros.length,
      };
    })
    .sort((a, b) => b.totalPontos - a.totalPontos);

  return (
    <div className="app">
      <header className="topo">
        <div className="marca">
          <div className="bandeira">🇧🇷</div>
          <div>
            <h1>WARTIME GLORY</h1>
            <p>COMUNIDADE BRASILEIRA</p>
          </div>
        </div>

        <span className="temporada">RANKING NACIONAL</span>
      </header>

      <main className="container">
        <section className="apresentacao">
          <span className="etiqueta">🇧🇷 UNIÃO DOS CLÃS BRASILEIROS</span>
          <h2>Ranking da Comunidade</h2>
          <p>
            Os melhores jogadores e clãs do Wartime Glory. Acompanhe a
            classificação da nossa comunidade.
          </p>
        </section>

        <section className="resumo">
          <div className="resumo-card">
            <span>JOGADORES</span>
            <strong>{jogadores.length}</strong>
          </div>

          <div className="resumo-card">
            <span>CLÃS</span>
            <strong>{clas.length}</strong>
          </div>
        </section>

        <nav className="abas">
          <button
            className={aba === "jogadores" ? "ativa" : ""}
            onClick={() => setAba("jogadores")}
          >
            👤 Jogadores
          </button>

          <button
            className={aba === "clas" ? "ativa" : ""}
            onClick={() => setAba("clas")}
          >
            🛡️ Clãs
          </button>
        </nav>

        {erro && <p className="mensagem erro">{erro}</p>}

        {carregando ? (
          <p className="mensagem">Carregando classificação...</p>
        ) : (
          <>
            {aba === "jogadores" && (
              <section className="ranking">
                <h3>🏆 Classificação individual</h3>

                {jogadoresOrdenados.length === 0 ? (
                  <p className="mensagem">Nenhum jogador cadastrado ainda.</p>
                ) : (
                  jogadoresOrdenados.map((jogador, index) => {
                    const cla = clas.find((item) => item.id === jogador.clanId);

                    return (
                      <div className="linha" key={jogador.id}>
                        <span className="posicao">{index + 1}º</span>

                        <div className="foto">
                          <span>{jogador.icone || "👤"}</span>
                        </div>

                        <div className="identificacao">
                          <strong>{jogador.nome}</strong>
                          <small>
                            <span translate="no" className="notranslate">
                              {cla?.nome || "Sem clã"}
                            </span>
                          </small>
                        </div>

                        <div className="pontos">
                          <strong>
                            {Number(jogador.pontos || 0).toLocaleString(
                              "pt-BR",
                            )}
                          </strong>
                          <small>pontos</small>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            )}

            {aba === "clas" && (
              <section className="ranking">
                <h3>🏆 Classificação por clãs</h3>

                {clasOrdenados.length === 0 ? (
                  <p className="mensagem">Nenhum clã cadastrado ainda.</p>
                ) : (
                  clasOrdenados.map((cla, index) => (
                    <div className="linha" key={cla.id}>
                      <span className="posicao">{index + 1}º</span>

                      <div className="foto">
                        <span>{cla.icone || "🛡️"}</span>
                      </div>

                      <div className="identificacao">
                        <strong>
                          <span translate="no" className="notranslate">
                            {cla.nome}
                          </span>
                        </strong>

                        <small>
                          <span translate="no" className="notranslate">
                            {cla.sigla || "Clã"}
                          </span>{" "}
                          • {cla.totalJogadores} jogadores
                        </small>
                      </div>

                      <div className="pontos">
                        <strong>
                          {cla.totalPontos.toLocaleString("pt-BR")}
                        </strong>
                        <small>pontos</small>
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}
          </>
        )}
      </main>

      <footer>
        <p>🇧🇷 Comunidade Brasileira Wartime Glory</p>
        <small>Portal oficial de classificação</small>
      </footer>
    </div>
  );
}

export default App;
