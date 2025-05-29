Funcionalidade: Cadastro do usuário

  Como um usuário da plataforma
  Eu quero realizar meu cadastro de maneira simples e intuitiva
  Para que eu possa realizar o meu login posteriormente

  Cenário: Cadastro realizado com sucesso
    Dado que o usuário está na página de cadastro
    E informa um nome válido
    E informa um e-mail válido
    E informa uma senha segura
    E aceita os termos de uso
    Quando o usuário envia o formulário de cadastro
    Então ele deve visualizar uma mensagem de sucesso
    E deve ser redirecionado para a página de login

  Cenário: Cadastro falha por e-mail já existente
    Dado que o usuário está na página de cadastro
    E informa um e-mail que já está cadastrado
    Quando o usuário envia o formulário de cadastro
    Então ele deve visualizar uma mensagem de erro informando que o e-mail já está em uso

  Cenário: Cadastro falha por campos obrigatórios em branco
    Dado que o usuário está na página de cadastro
    E deixa de preencher um ou mais campos obrigatórios
    Quando o usuário tenta enviar o formulário
    Então ele deve visualizar mensagens de erro indicando os campos que precisam ser preenchidos