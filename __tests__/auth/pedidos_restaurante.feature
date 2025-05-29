Feature: Controlar Pedido

  Scenario: Exibir detalhes do pedido
    Given o usuário acessa a página de controle de pedidos
    When a API retorna os pedidos do usuário autenticado
    Then devem ser exibidos os itens do pedido, status atual e valor total

  Scenario: Cancelar pedido
    Given o pedido ainda está em um status cancelável (ex: “pendente”)
    When o usuário clica em “Cancelar pedido”
    Then o frontend deve exibir uma confirmação
    And enviar a requisição de cancelamento para o backend
    And o backend deve atualizar o status do pedido no banco de dados

Feature: Fazer pedidos no ChatBot

  Scenario: Iniciar conversa com o restaurante
    Given o usuário acessa o chat do restaurante
    When o usuário digita uma mensagem como “Quero fazer um pedido”
    Then o frontend envia a mensagem e o contexto ao backend
    And o backend utiliza a API da OpenAI para gerar a resposta apropriada
    And a resposta é exibida na interface do chat

  Scenario: Adicionar item ao pedido via chat
    Given o usuário informa no chat algo como “Quero 2 pizzas de calabresa”
    When o backend recebe essa informação da IA
    Then ele extrai os dados do item (nome, quantidade, valor unitário)
    And adiciona ao estado atual do pedido
    And salva no banco de dados via Prisma

  Scenario: Confirmar pedido
    Given o pedido contém itens válidos
    When o usuário digita algo como “Pode confirmar”
    Then a IA reconhece a intenção de finalizar
    And o backend persiste o pedido completo no banco
    And retorna uma confirmação final ao frontend

Feature: Administrar Cardápio do Restaurante

  Scenario: Listar itens do cardápio
    Given o administrador acessa a área de gerenciamento
    When a API retorna os itens do banco
    Then os itens devem ser listados no frontend com opções de editar ou excluir

  Scenario: Criar novo item
    Given o administrador preenche o formulário de novo item
    When ele clica em “Salvar”
    Then o frontend valida os dados
    And envia a requisição ao backend
    And o backend cria o item no PostgreSQL via Prisma
    And a lista no frontend é atualizada instantaneamente via react-query mutation

  Scenario: Editar item existente
    Given o administrador seleciona um item do cardápio
    When ele edita os campos e clica em “Salvar”
    Then o backend valida e atualiza os dados no banco
    And o frontend reflete as alterações em tempo real

  Scenario: Deletar item do cardápio
    Given o administrador deseja remover um item
    When ele clica em “Excluir”
    Then o item é removido do banco via Prisma
    And a lista é atualizada sem recarregar a página