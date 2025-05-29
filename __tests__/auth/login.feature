Funcionalidade: Login do usuário

  Como um usuário da plataforma
  Eu quero realizar login com e-mail, senha e captcha
  Para que eu possa acessar o sistema e realizar meus pedidos

  Cenário: Login bem-sucedido com e-mail, senha e captcha válidos
    Dado que o usuário está na página de login
    E informa um e-mail válido
    E informa uma senha correta
    E resolve corretamente o captcha
    Quando o usuário envia o formulário de login
    Então ele deve ser redirecionado para a página inicial
    E deve visualizar uma mensagem de boas-vindas

  Cenário: Login falha por captcha incorreto
    Dado que o usuário está na página de login
    E informa um e-mail válido
    E informa uma senha correta
    E resolve incorretamente o captcha
    Quando o usuário envia o formulário de login
    Então ele deve visualizar uma mensagem de erro sobre o captcha

  Cenário: Login falha por credenciais inválidas
    Dado que o usuário está na página de login
    E informa um e-mail inválido ou uma senha incorreta
    E resolve corretamente o captcha
    Quando o usuário envia o formulário de login
    Então ele deve visualizar uma mensagem de erro sobre e-mail ou senha inválidos