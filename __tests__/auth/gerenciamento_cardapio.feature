
Feature: Gerenciamento de Itens do Cardápio

  Como responsável pelo restaurante,
  Quero poder adicionar e remover itens no cardápio,
  Para que eu possa administrar os produtos oferecidos aos clientes.

  Scenario: Adicionar um novo item ao cardápio
    Given que estou autenticado como responsável pelo restaurante
    And estou na página de gerenciamento do cardápio
    When eu clico em "Adicionar item"
    And preencho os campos "Nome", "Descrição" e "Preço" com informações válidas
    And clico em "Salvar"
    Then o novo item deve aparecer na lista do cardápio
    And devo ver uma mensagem de sucesso "Item adicionado com sucesso"

  Scenario: Remover um item do cardápio
    Given que estou autenticado como responsável pelo restaurante
    And estou na página de gerenciamento do cardápio
    And existe um item chamado "Lasanha" no cardápio
    When eu clico em "Remover" ao lado do item "Lasanha"
    And confirmo a remoção
    Then o item "Lasanha" não deve mais aparecer na lista do cardápio
    And devo ver uma mensagem de sucesso "Item removido com sucesso"

  Scenario: Tentar adicionar um item com dados inválidos
    Given que estou autenticado como responsável pelo restaurante
    And estou na página de gerenciamento do cardápio
    When eu clico em "Adicionar item"
    And deixo o campo "Nome" vazio
    And clico em "Salvar"
    Then devo ver uma mensagem de erro "Nome do item é obrigatório"
    And o item não deve ser adicionado ao cardápio
