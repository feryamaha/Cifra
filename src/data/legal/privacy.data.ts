export const PRIVACY_TITLE = 'Política de Privacidade';

export const PRIVACY_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: '1. Quem somos',
    body: 'O Cifra Tom é um site de cifras para violão. Esta política explica, em linguagem direta, quais dados tratamos, por quê, por quanto tempo e quais são os seus direitos, em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).',
  },
  {
    heading: '2. Dados que coletamos',
    body: 'Navegação anônima: nenhum cadastro é exigido para ler cifras e nenhum dado pessoal é coletado. Conta (opcional): nome, e-mail e hash da senha (a senha nunca é armazenada em texto). Login social Google, quando habilitado, entrega apenas nome, e-mail e foto, via Auth.js. Conteúdo e interações: cifras enviadas, favoritos, histórico autenticado, comentários e votos.',
  },
  {
    heading: '3. Para que usamos os dados',
    body: 'Autenticar a conta, publicar e moderar cifras enviadas, manter favoritos e histórico, responder solicitações e melhorar o serviço. Bases legais: execução do serviço solicitado (art. 7º, V da LGPD) e legítimo interesse na segurança e prevenção de abuso (art. 7º, IX). Não fazemos perfilamento comercial nem venda de dados.',
  },
  {
    heading: '4. Histórico local (sem conta)',
    body: 'Visitantes anônimos podem ter o histórico de cifras visitadas gravado apenas em localStorage, no próprio dispositivo. Esse dado não chega aos nossos servidores e pode ser apagado limpando os dados do navegador.',
  },
  {
    heading: '5. Cookies',
    body: 'Usamos somente cookies estritamente necessários: sessão de usuário (Auth.js) e sessão administrativa no painel de moderação. Não usamos cookies de rastreamento de terceiros, pixels de publicidade nem analytics invasivos.',
  },
  {
    heading: '6. Microfone (afinador)',
    body: 'O afinador usa o microfone apenas no seu navegador, após a sua permissão explícita, para detectar a altura da nota. O áudio é processado localmente e nunca é gravado nem enviado aos nossos servidores. Ao sair da página, a captura é encerrada.',
  },
  {
    heading: '7. Onde os dados ficam',
    body: 'Os dados de conta e conteúdo ficam em provedores de nuvem contratados (hospedagem da aplicação e banco de dados gerenciado), que atuam como operadores sob contrato e podem manter servidores fora do Brasil, sempre com salvaguardas adequadas de segurança.',
  },
  {
    heading: '8. Compartilhamento',
    body: 'Não vendemos nem alugamos dados pessoais. Compartilhamos apenas o mínimo necessário com os provedores de infraestrutura citados acima e com autoridades, quando houver obrigação legal.',
  },
  {
    heading: '9. Retenção e exclusão',
    body: 'Dados de conta permanecem enquanto a conta existir. Você pode solicitar a exclusão da conta e dos dados associados a qualquer momento; cifras publicadas podem permanecer no catálogo de forma anonimizada, por interesse legítimo de preservação do acervo.',
  },
  {
    heading: '10. Seus direitos (LGPD)',
    body: 'Você pode solicitar confirmação de tratamento, acesso, correção, portabilidade, anonimização, exclusão e informação sobre compartilhamentos, além de revogar consentimentos. Se entender que seus direitos não foram atendidos, você também pode peticionar à ANPD (Autoridade Nacional de Proteção de Dados).',
  },
  {
    heading: '11. Menores de idade',
    body: 'O site pode ser lido por qualquer pessoa, mas a criação de conta é destinada a maiores de 13 anos; entre 13 e 18 anos, com ciência dos responsáveis. Não coletamos dados de crianças de forma consciente e removeremos contas identificadas em desacordo.',
  },
  {
    heading: '12. Segurança e incidentes',
    body: 'Aplicamos cabeçalhos de segurança, criptografia de senha, controle de acesso ao painel administrativo e princípio do menor privilégio. Em caso de incidente de segurança com risco relevante aos titulares, comunicaremos os afetados e a ANPD nos prazos da LGPD.',
  },
  {
    heading: '13. Encarregado e contato',
    body: 'As funções de encarregado pelo tratamento de dados (DPO) são exercidas pela administração do Cifra Tom. Para exercer seus direitos ou tirar dúvidas: use as mensagens da conta autenticada ou o canal de contato publicado no rodapé do site.',
  },
];
