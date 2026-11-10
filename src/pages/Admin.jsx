
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";

import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

function Admin() {
  const [aba, setAba] = useState("jogadores");
  const [jogadores, setJogadores] = useState([]);
  const [clas, setClas] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editandoJogador, setEditandoJogador] = useState(null);

  const [nomeJogador, setNomeJogador] = useState("");
  const [clanJogador, setClanJogador] = useState("");
  const [iconeJogador, setIconeJogador] = useState("👤");

  const [nomeCla, setNomeCla] = useState("");
  const [siglaCla, setSiglaCla] = useState("");
  const [iconeCla, setIconeCla] = useState("🛡️");

  const [jogadorPontuacao, setJogadorPontuacao] = useState("");
  const [quantidadePontos, setQuantidadePontos] = useState("");
  const [tipoMovimentacao, setTipoMovimentacao] = useState("adicionar");
  const [motivoMovimentacao, setMotivoMovimentacao] = useState("");

  const iconesJogadores = [
    "👤",
    "🦁",
    "🐺",
    "🐉",
    "💀",
    "⚔️",
    "🎖️",
    "🔥",
    "👑",
    "🦅",
    "🐯",
    "🦂",
    "🤖",
    "🥷",
    "🏹",
  ];

  const iconesClas = [
    "🛡️",
    "⚔️",
    "🦁",
    "🐺",
    "🐉",
    "💀",
    "🔥",
    "👑",
    "🦅",
    "🐯",
    "🏴",
    "☠️",
    "🌟",
    "🔱",
    "🦂",
  ];

  useEffect(() => {
    const unsubJogadores = onSnapshot(
      collection(db, "jogadores"),
      (snapshot) => {
        setJogadores(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      },
    );

    const unsubClas = onSnapshot(collection(db, "clas"), (snapshot) => {
      setClas(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });

    return () => {
      unsubJogadores();
      unsubClas();
    };
  }, []);

  function iniciarEdicaoJogador(jogador) {
    setEditandoJogador(jogador.id);
    setNomeJogador(jogador.nome);
    setClanJogador(jogador.clanId || "");
    setIconeJogador(jogador.icone || "👤");
    setAba("jogadores");
    setMensagem("");
    setErro("");
  }

  async function salvarEdicaoJogador(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setSalvando(true);

    try {
      await updateDoc(doc(db, "jogadores", editandoJogador), {
        nome: nomeJogador.trim(),
        clanId: clanJogador,
        icone: iconeJogador,
      });

      setEditandoJogador(null);
      setNomeJogador("");
      setClanJogador("");
      setIconeJogador("👤");

      setMensagem("Jogador atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      setErro("Erro ao atualizar jogador.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirJogador(jogador) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o jogador ${jogador.nome}?`,
    );

    if (!confirmar) return;

    setMensagem("");
    setErro("");

    try {
      await deleteDoc(doc(db, "jogadores", jogador.id));

      setMensagem("Jogador excluído com sucesso!");
    } catch (error) {
      console.error(error);
      setErro("Erro ao excluir jogador.");
    }
  }

  async function cadastrarJogador(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setSalvando(true);

    try {
      await addDoc(collection(db, "jogadores"), {
        nome: nomeJogador.trim(),
        clanId: clanJogador,
        pontos: 0,
        icone: iconeJogador,
        criadoEm: serverTimestamp(),
      });

      setNomeJogador("");
      setClanJogador("");
      setIconeJogador("👤");

      setMensagem("Jogador cadastrado com sucesso!");
    } catch (error) {
      console.error(error);
      setErro("Erro ao cadastrar jogador. Verifique as permissões.");
    } finally {
      setSalvando(false);
    }
  }

  async function cadastrarCla(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setSalvando(true);

    try {
      await addDoc(collection(db, "clas"), {
        nome: nomeCla.trim(),
        sigla: siglaCla.trim().toUpperCase(),
        icone: iconeCla,
        criadoEm: serverTimestamp(),
      });

      setNomeCla("");
      setSiglaCla("");
      setIconeCla("🛡️");

      setMensagem("Clã cadastrado com sucesso!");
    } catch (error) {
      console.error(error);
      setErro("Erro ao cadastrar clã. Verifique as permissões.");
    } finally {
      setSalvando(false);
    }
  }

  async function registrarPontos(e) {
    e.preventDefault();

    setMensagem("");
    setErro("");

    const quantidade = Number(quantidadePontos);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      setErro("Informe uma quantidade de pontos válida.");
      return;
    }

    if (!motivoMovimentacao.trim()) {
      setErro("Informe o motivo da movimentação.");
      return;
    }

    setSalvando(true);

    try {
      const jogadorRef = doc(db, "jogadores", jogadorPontuacao);
      const movimentacaoRef = doc(collection(db, "movimentacoes"));

      await runTransaction(db, async (transaction) => {
        const resultado = await transaction.get(jogadorRef);

        if (!resultado.exists()) {
          throw new Error("Jogador não encontrado.");
        }

        const jogador = resultado.data();
        const pontosAntes = Number(jogador.pontos) || 0;

        const pontosDepois =
          tipoMovimentacao === "adicionar"
            ? pontosAntes + quantidade
            : pontosAntes - quantidade;

        if (pontosDepois < 0) {
          throw new Error("O jogador não possui pontos suficientes.");
        }

        transaction.update(jogadorRef, {
          pontos: pontosDepois,
        });

        transaction.set(movimentacaoRef, {
          jogadorId: jogadorPontuacao,
          jogadorNome: jogador.nome,
          tipo: tipoMovimentacao,
          quantidade,
          pontosAntes,
          pontosDepois,
          motivo: motivoMovimentacao.trim(),
          criadoEm: serverTimestamp(),
        });
      });

      setJogadorPontuacao("");
      setQuantidadePontos("");
      setTipoMovimentacao("adicionar");
      setMotivoMovimentacao("");

      setMensagem("Pontuação atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao atualizar pontuação.");
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    await signOut(auth);
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1>🇧🇷 Wartime Glory</h1>
          <p>Painel administrativo</p>
        </div>

        <button onClick={sair}>Sair</button>
      </header>

      <main className="admin-content">
        <h2>Gerenciar comunidade</h2>

        <p>Cadastre jogadores e clãs da comunidade brasileira.</p>

        <div className="admin-resumo">
          <div>
            <strong>{jogadores.length}</strong>
            <span>Jogadores</span>
          </div>

          <div>
            <strong>{clas.length}</strong>
            <span>Clãs</span>
          </div>
        </div>

        <div className="admin-abas">
          <button
            className={aba === "jogadores" ? "selecionada" : ""}
            onClick={() => {
              setAba("jogadores");
              setMensagem("");
              setErro("");
            }}
          >
            👤 Jogadores
          </button>

          <button
            className={aba === "clas" ? "selecionada" : ""}
            onClick={() => {
              setAba("clas");
              setMensagem("");
              setErro("");
            }}
          >
            🛡️ Clãs
          </button>
        </div>

        {mensagem && <div className="sucesso">{mensagem}</div>}
        {erro && <div className="erro-login">{erro}</div>}

        {aba === "jogadores" && (
          <section className="admin-card">
            <h3>
              {editandoJogador ? "✏️ Editar jogador" : "👤 Cadastrar jogador"}
            </h3>

            <form
              onSubmit={
                editandoJogador ? salvarEdicaoJogador : cadastrarJogador
              }
            >
              <label>Nome do jogador</label>

              <input
                value={nomeJogador}
                onChange={(e) => setNomeJogador(e.target.value)}
                placeholder="Ex: General BR"
                required
                maxLength={50}
              />

              <label>Clã do jogador</label>

              <select
                value={clanJogador}
                onChange={(e) => setClanJogador(e.target.value)}
                required
              >
                <option value="">Selecione um clã</option>

                {clas.map((cla) => (
                  <option key={cla.id} value={cla.id}>
                    {cla.nome}
                  </option>
                ))}
              </select>

              <label>Escolha a figurinha</label>

              <div className="icones">
                {iconesJogadores.map((icone) => (
                  <button
                    type="button"
                    key={icone}
                    className={iconeJogador === icone ? "icone-ativo" : ""}
                    onClick={() => setIconeJogador(icone)}
                  >
                    {icone}
                  </button>
                ))}
              </div>

              <button
                className="botao-salvar"
                type="submit"
                disabled={salvando || clas.length === 0}
              >
                {salvando
                  ? "Salvando..."
                  : editandoJogador
                    ? "Salvar alterações"
                    : "Cadastrar jogador"}
              </button>

              {editandoJogador && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoJogador(null);
                    setNomeJogador("");
                    setClanJogador("");
                    setIconeJogador("👤");
                  }}
                >
                  Cancelar edição
                </button>
              )}

              {clas.length === 0 && (
                <small>Cadastre um clã antes de cadastrar jogadores.</small>
              )}
            </form>

            <section className="admin-card">
              <h3>📋 Jogadores cadastrados</h3>

              {jogadores.length === 0 ? (
                <p>Nenhum jogador cadastrado.</p>
              ) : (
                jogadores.map((jogador) => {
                  const cla = clas.find((item) => item.id === jogador.clanId);

                  return (
                    <div className="linha" key={jogador.id}>
                      <div className="foto">
                        <span>{jogador.icone || "👤"}</span>
                      </div>

                      <div className="identificacao">
                        <strong>{jogador.nome}</strong>
                        <small>{cla?.nome || "Sem clã"}</small>
                      </div>

                      <button
                        type="button"
                        onClick={() => iniciarEdicaoJogador(jogador)}
                      >
                        ✏️ Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => excluirJogador(jogador)}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  );
                })
              )}
            </section>

            {/* FORMULÁRIO DE GERENCIAMENTO DE PONTUAÇÃO */}
            <section className="admin-card">
              <h3>🏆 Gerenciar pontuação</h3>

              <form onSubmit={registrarPontos}>
                <label>Selecione o jogador</label>

                <select
                  value={jogadorPontuacao}
                  onChange={(e) => setJogadorPontuacao(e.target.value)}
                  required
                >
                  <option value="">Selecione um jogador</option>

                  {jogadores.map((jogador) => (
                    <option key={jogador.id} value={jogador.id}>
                      {jogador.nome} — {jogador.pontos || 0} pontos
                    </option>
                  ))}
                </select>

                <label>Tipo de movimentação</label>

                <select
                  value={tipoMovimentacao}
                  onChange={(e) => setTipoMovimentacao(e.target.value)}
                >
                  <option value="adicionar">➕ Adicionar pontos</option>
                  <option value="retirar">➖ Retirar pontos</option>
                </select>

                <label>Quantidade de pontos</label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantidadePontos}
                  onChange={(e) => setQuantidadePontos(e.target.value)}
                  placeholder="Ex: 100"
                  required
                />

                <label>Motivo da movimentação</label>

                <input
                  type="text"
                  value={motivoMovimentacao}
                  onChange={(e) => setMotivoMovimentacao(e.target.value)}
                  placeholder="Ex: Vitória em campeonato"
                  maxLength={150}
                  required
                />

                <button
                  type="submit"
                  className="botao-salvar"
                  disabled={salvando || jogadores.length === 0}
                >
                  {salvando ? "Salvando..." : "Registrar pontuação"}
                </button>
              </form>
            </section>
          </section>
        )}

        {aba === "clas" && (
          <section className="admin-card">
            <h3>🛡️ Cadastrar clã</h3>

            <form onSubmit={cadastrarCla}>
              <label>Nome do clã</label>

              <input
                value={nomeCla}
                onChange={(e) => setNomeCla(e.target.value)}
                placeholder="Ex: Clã Alpha"
                required
                maxLength={50}
              />

              <label>Sigla do clã</label>

              <input
                value={siglaCla}
                onChange={(e) => setSiglaCla(e.target.value)}
                placeholder="Ex: ALP"
                required
                maxLength={8}
              />

              <label>Escolha o emblema</label>

              <div className="icones">
                {iconesClas.map((icone) => (
                  <button
                    type="button"
                    key={icone}
                    className={iconeCla === icone ? "icone-ativo" : ""}
                    onClick={() => setIconeCla(icone)}
                  >
                    {icone}
                  </button>
                ))}
              </div>

              <button
                className="botao-salvar"
                type="submit"
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Cadastrar clã"}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default Admin;
