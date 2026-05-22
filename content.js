// Converte padrão wildcard (*) para RegExp
function patternToRegex(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexStr = escaped.replace(/\\\*/g, '.*');
  return new RegExp(`^${regexStr}$`);
}

// Verifica se a URL atual corresponde a um padrão
function matchesPattern(url, pattern) {
  try {
    const regex = patternToRegex(pattern);
    return regex.test(url);
  } catch (e) {
    console.error("Erro no padrão:", pattern, e);
    return false;
  }
}

// Injeta o código do script na página
function injectScript(code) {
  const script = document.createElement('script');
  script.textContent = code;
  // Adiciona um identificador opcional para depuração
  script.setAttribute('data-userscript', 'true');
  (document.head || document.documentElement).appendChild(script);
  script.remove(); // Limpa após execução
}

// Obtém scripts ativos do storage
async function getActiveScripts() {
  const { scripts } = await chrome.storage.local.get('scripts');
  if (!scripts) return [];
  return scripts.filter(s => s.enabled === true);
}

// Executa scripts conforme o runAt
async function runScripts() {
  const activeScripts = await getActiveScripts();
  const currentUrl = window.location.href;
  
  // Separa scripts por runAt
  const startScripts = [];
  const endScripts = [];
  const idleScripts = [];
  
  for (const script of activeScripts) {
    const matchesAny = script.matches.some(pattern => matchesPattern(currentUrl, pattern));
    if (!matchesAny) continue;
    
    switch (script.runAt) {
      case 'document-start':
        startScripts.push(script);
        break;
      case 'document-end':
        endScripts.push(script);
        break;
      case 'document-idle':
      default:
        idleScripts.push(script);
        break;
    }
  }
  
  // Executa document-start imediatamente
  for (const script of startScripts) {
    try {
      injectScript(script.code);
    } catch (err) {
      console.error(`Erro ao executar script "${script.name}":`, err);
    }
  }
  
  // Executa document-end após DOMContentLoaded
  if (endScripts.length > 0) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        for (const script of endScripts) {
          try {
            injectScript(script.code);
          } catch (err) {
            console.error(`Erro ao executar script "${script.name}":`, err);
          }
        }
      });
    } else {
      for (const script of endScripts) injectScript(script.code);
    }
  }
  
  // Executa document-idle após load
  if (idleScripts.length > 0) {
    if (document.readyState === 'complete') {
      for (const script of idleScripts) injectScript(script.code);
    } else {
      window.addEventListener('load', () => {
        for (const script of idleScripts) injectScript(script.code);
      });
    }
  }
}

// Inicia o processo
runScripts();
