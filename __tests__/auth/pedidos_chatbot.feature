Feature: Realização de pedidos através do chatbot

  Como usuário,
  Gostaria de realizar meus pedidos através de um chatbot,
  Para que eu pudesse realizar esses de maneira mais fácil e intuitiva.

  Background:
    Given o chatbot está disponível na interface do restaurante
    And é exibida a mensagem "faça seu pedido aqui" no início da conversa

  Scenario: Iniciar pedido através do chatbot
    When o usuário digita "Quero fazer um pedido"
    Then o chatbot deve responder com a primeira mensagem do fluxo definido no script
    And deve exibir o resumo atual do pedido com status "em andamento"

  Scenario: Adicionar itens ao pedido
    Given o usuário iniciou um pedido
    When o usuário seleciona "Pizza de Calabresa"
    And seleciona "Refrigerante"
    Then o chatbot deve confirmar a adição dos itens
    And deve exibir um resumo com "Pizza de Calabresa", "Refrigerante", pagamento não definido, status "em andamento"

  Scenario: Escolher forma de pagamento
    Given o usuário adicionou itens ao pedido
    When o usuário seleciona "Pagamento em dinheiro"
    Then o chatbot deve atualizar o resumo do pedido incluindo a forma de pagamento como "dinheiro"
    And status "em andamento"

  Scenario: Concluir o pedido
    Given o usuário adicionou itens e selecionou a forma de pagamento
    When o usuário confirma o pedido
    Then o chatbot deve exibir o resumo final com status "concluído"
    And deve informar o tempo estimado de entrega conforme script

  Scenario: Cancelar o pedido
    Given o usuário iniciou um pedido
    When o usuário digita "Cancelar pedido"
    Then o chatbot deve confirmar o cancelamento
    And deve exibir o resumo do pedido com status "cancelado"
