// Abre a página de gerenciamento ao clicar no ícone da extensão
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Inicialização opcional: cria um script de exemplo se não houver nenhum
chrome.runtime.onInstalled.addListener(async () => {
  const { scripts } = await chrome.storage.local.get('scripts');
  if (!scripts || scripts.length === 0) {
    const exemplo = {
      id: crypto.randomUUID(),
      name: "Exemplo: Alert on GitHub",
      enabled: true,
      matches: ["*://github.com/*"],
      runAt: "document-end",
      code: `// Alerta ao entrar no GitHub
console.log("Userscript executado no GitHub!");
alert("Bem-vindo ao GitHub - Userscript ativo!");`
    };
    await chrome.storage.local.set({ scripts: [exemplo] });
  }
});
