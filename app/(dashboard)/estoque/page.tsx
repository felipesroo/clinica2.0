"use client";

import { useState, useEffect } from "react";
import { getEstoque, createEstoqueProduto, ajustarEstoque, deleteEstoqueProduto, EstoqueProdutoData } from "../../actions/inventory";

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<EstoqueProdutoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAjusteModalOpen, setIsAjusteModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<EstoqueProdutoData | null>(null);

  // Formulário Novo Produto
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [quantidade, setQuantidade] = useState(0);
  const [unidade, setUnidade] = useState("un.");

  // Formulário Ajuste
  const [ajusteQtd, setAjusteQtd] = useState(0);
  const [ajusteTipo, setAjusteTipo] = useState<"ENTRADA" | "SAIDA">("ENTRADA");

  async function carregarEstoque() {
    setIsLoading(true);
    const data = await getEstoque();
    setProdutos(data);
    setIsLoading(false);
  }

  useEffect(() => {
    carregarEstoque();
  }, []);

  const totalItens = produtos.reduce((acc, curr) => acc + curr.quantidade, 0);
  const estoqueBaixo = produtos.filter(p => p.status === "Estoque Baixo").length;
  const esgotados = produtos.filter(p => p.status === "Esgotado").length;

  const handleCreateProduct = async () => {
    if (!nome.trim()) return;
    await createEstoqueProduto({ nome, categoria, quantidade, unidade });
    setIsModalOpen(false);
    setNome("");
    setQuantidade(0);
    await carregarEstoque();
  };

  const handleAjustarEstoque = async () => {
    if (!selectedProduto || ajusteQtd <= 0) return;
    const variacao = ajusteTipo === "ENTRADA" ? ajusteQtd : -ajusteQtd;
    await ajustarEstoque(selectedProduto.id, variacao, ajusteTipo);
    setIsAjusteModalOpen(false);
    setAjusteQtd(0);
    setSelectedProduto(null);
    await carregarEstoque();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente apagar este produto?")) {
      await deleteEstoqueProduto(id);
      await carregarEstoque();
    }
  };

  const openAjuste = (prod: EstoqueProdutoData) => {
    setSelectedProduto(prod);
    setAjusteQtd(0);
    setAjusteTipo("ENTRADA");
    setIsAjusteModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto pb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-on-background mb-2">
            Gestão de Estoque
          </h1>
          <p className="text-base text-on-surface-variant max-w-2xl">
            Acompanhe os níveis de produtos, gerencie reabastecimentos e garanta que sua clínica opere com excelência.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-primary-fixed text-on-primary-fixed text-sm font-medium hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Adicionar Item
          </button>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm p-6 rounded-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container/30 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Total de Itens (Qtd)
              </p>
              <h3 className="font-serif text-2xl text-on-background">{totalItens}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">inventory</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm p-6 rounded-xl relative overflow-hidden border-l-4 border-l-secondary-fixed">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container/30 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Estoque Baixo
              </p>
              <h3 className="font-serif text-2xl text-on-background">{estoqueBaixo}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">warning</span>
            </div>
          </div>
          {estoqueBaixo > 0 && (
            <div className="flex items-center gap-2 text-secondary">
              <span className="text-sm font-medium">Requer atenção imediata</span>
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm p-6 rounded-xl relative overflow-hidden border-l-4 border-l-error">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-error-container/30 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Esgotados
              </p>
              <h3 className="font-serif text-2xl text-on-background">{esgotados}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined">error</span>
            </div>
          </div>
          {esgotados > 0 && (
            <div className="flex items-center gap-2 text-error">
              <span className="text-sm font-medium">Ação necessária</span>
            </div>
          )}
        </div>
      </div>

      {/* Inventory List Section */}
      <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-xl overflow-hidden p-4 sm:p-0">
        {/* Mobile View: Item Cards */}
        <div className="block sm:hidden space-y-3">
          <h3 className="font-serif text-lg font-semibold text-primary mb-3">Lista de Produtos</h3>
          {isLoading && (
            <div className="p-6 text-center text-sm text-on-surface-variant">Carregando estoque...</div>
          )}
          {!isLoading && produtos.length === 0 && (
            <div className="p-6 text-center text-sm text-on-surface-variant">Nenhum produto cadastrado no estoque.</div>
          )}
          {produtos.map(prod => (
            <div key={prod.id} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container/30 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[20px]">vaccines</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-on-background">{prod.nome}</h4>
                    <p className="text-xs text-on-surface-variant">{prod.categoria} • {prod.unidade}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0
                  ${prod.status === 'Em Estoque' ? 'bg-tertiary-container text-on-tertiary-container' : ''}
                  ${prod.status === 'Estoque Baixo' ? 'bg-secondary-container text-on-secondary-container' : ''}
                  ${prod.status === 'Esgotado' ? 'bg-error-container text-on-error-container' : ''}
                `}>
                  {prod.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <div className="text-xs">
                  <span className="text-on-surface-variant">Quantidade: </span>
                  <span className="font-bold text-sm text-primary">{prod.quantidade}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openAjuste(prod)}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-xs font-medium text-primary transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    Ajustar
                  </button>
                  <button 
                    onClick={() => handleDelete(prod.id)}
                    className="p-1.5 hover:bg-error/10 rounded-lg text-error transition-colors"
                    title="Excluir produto"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-surface-container-lowest/30 border-b border-outline-variant/30">
                <th className="p-4 text-sm text-on-surface-variant font-semibold">Produto</th>
                <th className="p-4 text-sm text-on-surface-variant font-semibold">Categoria</th>
                <th className="p-4 text-sm text-on-surface-variant font-semibold">Qtd</th>
                <th className="p-4 text-sm text-on-surface-variant font-semibold">Status</th>
                <th className="p-4 text-sm text-on-surface-variant font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {isLoading && (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Carregando estoque...</td></tr>
              )}
              {!isLoading && produtos.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Nenhum produto cadastrado no estoque.</td></tr>
              )}
              {produtos.map(prod => (
                <tr key={prod.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-container/30 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">vaccines</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-background">{prod.nome}</p>
                        <p className="text-xs text-on-surface-variant">{prod.unidade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-on-surface-variant">{prod.categoria}</td>
                  <td className="p-4 text-sm font-medium text-on-background">{prod.quantidade}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${prod.status === 'Em Estoque' ? 'bg-tertiary-container text-on-tertiary-container' : ''}
                      ${prod.status === 'Estoque Baixo' ? 'bg-secondary-container text-on-secondary-container' : ''}
                      ${prod.status === 'Esgotado' ? 'bg-error-container text-on-error-container' : ''}
                    `}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => openAjuste(prod)}
                      className="px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-medium text-primary transition-colors"
                    >
                      Ajustar
                    </button>
                    <button 
                      onClick={() => handleDelete(prod.id)}
                      className="px-2 py-1 hover:bg-error/10 rounded-lg text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-6 shadow-xl relative border border-white/20">
            <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
              Novo Produto
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Ex: Ácido Hialurônico"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Categoria</label>
                  <select 
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Preenchedores">Preenchedores</option>
                    <option value="Toxinas">Toxinas</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Descartáveis">Descartáveis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Unidade</label>
                  <input
                    type="text"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    placeholder="Ex: Ampolas"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Quantidade Inicial</label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors rounded-lg"
              >
                Adicionar Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajuste Estoque */}
      {isAjusteModalOpen && selectedProduto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-6 shadow-xl relative border border-white/20">
            <h2 className="font-serif text-xl font-semibold text-primary mb-2">
              Ajustar Estoque
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">{selectedProduto.nome}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Tipo de Ajuste</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAjusteTipo("ENTRADA")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border ${ajusteTipo === 'ENTRADA' ? 'bg-primary-container text-on-primary-container border-primary' : 'border-outline-variant/40'}`}
                  >
                    Entrada
                  </button>
                  <button 
                    onClick={() => setAjusteTipo("SAIDA")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border ${ajusteTipo === 'SAIDA' ? 'bg-error-container text-on-error-container border-error' : 'border-outline-variant/40'}`}
                  >
                    Saída
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={ajusteQtd}
                  onChange={(e) => setAjusteQtd(Number(e.target.value))}
                  className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => setIsAjusteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAjustarEstoque}
                className="px-4 py-2 bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors rounded-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
