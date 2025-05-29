Feature: Enviar feedback após pedido

  Como usuário,
  Gostaria de enviar um feedback rápido e simples após realizar meu pedido,
  Para que assim eu possa avaliar o funcionamento e a qualidade do mesmo.

  Scenario: Enviar feedback com nota e comentário
    Given que o pedido foi concluído com sucesso
    When o sistema solicita a avaliação do usuário
    And o usuário seleciona 4 estrelas
    And insere o comentário "Entrega rápida e comida excelente"
    Then o sistema deve registrar o feedback com nota 4
    And armazenar o comentário do usuário

  Scenario: Enviar apenas a nota sem comentário
    Given que o pedido foi concluído com sucesso
    When o sistema solicita a avaliação do usuário
    And o usuário seleciona 5 estrelas
    Then o sistema deve registrar o feedback com nota 5
    And o campo de comentário deve permanecer vazio

  Scenario: Não enviar feedback
    Given que o pedido foi concluído com sucesso
    When o sistema solicita a avaliação do usuário
    And o usuário ignora ou fecha a solicitação
    Then o sistema não deve registrar nenhuma avaliação
    And o fluxo de uso deve prosseguir normalmente
  
