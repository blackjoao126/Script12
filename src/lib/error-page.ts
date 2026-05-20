export function renderErrorPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Error - Application</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .error-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 48px;
      max-width: 500px;
      text-align: center;
    }
    
    .error-code {
      font-size: 72px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 16px;
    }
    
    .error-title {
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 12px;
    }
    
    .error-message {
      font-size: 16px;
      color: #666;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    
    .error-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 32px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 16px;
      font-weight: 500;
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
      cursor: pointer;
    }
    
    .error-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
    
    .error-footer {
      margin-top: 24px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-code">500</div>
    <div class="error-title">Internal Server Error</div>
    <div class="error-message">
      Desculpe, algo deu errado. Estamos trabalhando para resolver o problema.
    </div>
    <button class="error-button" onclick="location.href='/'">
      Voltar à Página Inicial
    </button>
    <div class="error-footer">
      Se o problema persistir, tente recarregar a página.
    </div>
  </div>
</body>
</html>
  `.trim();
}
