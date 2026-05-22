// Listener para receber mensagens da página de opções
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeScript') {
    const scriptCode = request.code;
    // Remove scripts antigos para evitar duplicação (simplificação)
    chrome.userScripts.unregister();

    // Registra um novo script
    chrome.userScripts.register([{
      id: 'user-script-1',
      matches: ['<all_urls>'],
      js: [{ code: scriptCode }],
      runAt: 'document_idle' // ou 'document_start', 'document_end'
    }], () => {
      sendResponse({ status: 'Script registrado e será executado!' });
    });
    return true; // Necessário para resposta assíncrona
  }
});
