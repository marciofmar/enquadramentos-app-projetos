PARA A ÁREA DE INSERÇÃO, EDIÇÃO E CONTROLE DE PROJETOS

1) Criar um campo de preenchimento opcional na etapa de cadastramento de projeto chamado 'Responsável pelo projeto'. Será um campo texto comum.
2) Após o campo de seleção de ações estratégicas prioritárias, insira um campo opcional para o usuário selecionar o tipo de ação em que aquele projeto se enquadra (prevenção; mitigação; preparação; resposta; recuperação; gestão/governança)
3) Para cada entrega, coloque um campo texto obrigatório chamado 'Critérios de aceite' e coloque um texto de orientação no próprio campo que apaga assim que usuário começa a digitar no campo. Esse exemplo pode ser 'Minuta apresentada e aprovada pelo Superintendente'.
4) Próximo ao campo 'Dependências críticas', coloque a seguinte mensagem de orientação: 'Caso haja alguma dependência crítica que dependa de outro setor, ajuste com ele antes de inserí-la.'.
5) Abaixo do campo 'Problema que ele soluciona - Por quê', insira um campo opcional para que o usuário insira uma sugestão de indicador de sucesso. O campo deve se chamar 'Indicador de sucesso'.

---

AJUSTES NAS REGRAS DE PERMISSÃO E CONFIGURAÇÃO DO SISTEMA

1) No módulo de projetos, separe as configurações de permissão de cadastro e alteração de projetos, entregas e atividades, de forma a ser possível controlar projeto/entregas e atividades de forma independente. Ao final, teremos 6 configurações: 'Permitir cadastro de projetos/entregas'; 'Permitir edição/exclusão de projetos/entregas'; 'Permitir cadastro de atividades'; 'Permitir edição/exclusão de atividades'; 'Permitir edição de quinzenas das entregas' e 'Permitir edição de datas das atividades'.
2) Criação de uma nova entidade de nível de acesso chamada 'Master'. Essa entidade terá acesso igual ao admin apenas em todas as configurações do módulo de projetos, no módulo de gestão de projetos e no log de alterações. Para o resto do sistema (ações estratégicas, editar setores, administrar observações, gerir usuários), apenas o admin terá acesso.
3) Quando liberadas ná área de configurações, apenas o setor dono do projeto poderá editar/excluir dados dos projetos/entregas/atividades. Os participantes das entregas poderão editar/excluir dados dessas entregas e suas respectivas atividades. No entanto, essas alterações devem ser feitas em duas etapas: Primeiro o dono do projeto/entrega (conforme regra acima) faz a edição/exclusão, mas o sistema grava essa operação, mas não a realiza. Apenas informa que a solicitação foi enviada para ao Gabinete de Gestão de Projetos (usuário master e admin) para avaliação e decisão. Na segunda etapa, o gabinete de gestão de projetos recebe em área própria para avaliação dessas solicitações. Ele pode deferir ou indeferir e isso ficará no histórico do projeto. Essa área de gestão de solicitações deve ser organizada no padrão da área de gestão de observações (staus: em análise, deferida, indeferida, todas). Todos os usuários devem ter acesso a essa informação sobre status de sua demanda no painel de projetos e na área de visualização do projeto. Apenas o usuário dono do projeto/entregas deve ter acesso aos detalhes da solicitação (organize dentro do layout do projeto para não ficar muito poluído). Não será possível solicitar demanda de edição/exclusão no projeto/entrega/demanda enquanto houver solcitação pendente de análise.

------

AJUSTES NO PAINEL DE PROJETOS

1) Acrescentar ao painel dec ontrole de projetos um módulo que indique quantidade de projetos (separados por finalizados e em andamento. Não entram os que foram abortados) relacionados a cada tipo de ação (prevenção; mitigação; preparação; resposta; recuperação; gestão/governança).

----

Caso não entenda algo ou perceba alguma inconsistência ou risco que gere necessidade de adaptação do prompt, me avise. Mesmo que não tenha nada a perguntar ou sugerir, não execute imediatamente, me dê o seu plano de execução.