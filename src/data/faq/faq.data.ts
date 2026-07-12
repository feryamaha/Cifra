export type FaqCategory = 'produto' | 'ferramentas' | 'conta' | 'anuncios';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
  produto: 'Sobre o Cifra Tom',
  ferramentas: 'Recursos e ferramentas',
  conta: 'Conta e envios',
  anuncios: 'Anúncios e Premium',
};

export const FAQ_CATEGORY_ORDER: FaqCategory[] = ['produto', 'ferramentas', 'conta', 'anuncios'];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'o-que-e',
    category: 'produto',
    question: 'O que é o Cifra Tom e o que ele tem de diferente?',
    answer:
      'É um site de cifras feito exclusivamente para violão. Três diferenças na prática: a cifra é limpa e padronizada, sem anúncio no meio da música; todo acorde mostra o shape no hover, com várias posições no braço; e você pode ler a progressão em números da escala (graus), um método de estudo que nenhum outro site de cifras oferece.',
  },
  {
    id: 'metodo-numerico',
    category: 'produto',
    question: 'Como funciona a leitura por números da escala (graus)?',
    answer:
      'Em vez de decorar acordes soltos, você enxerga a função de cada acorde no tom. Em C maior, a sequência C, Am, F, G vira 1, 6m, 4, 5. Se a música mudar para G, os mesmos números valem: G, Em, C, D. É assim que músicos de estúdio se comunicam. Abra qualquer cifra, toque em Controles e troque a notação para números; a cifra inteira é convertida na hora.',
  },
  {
    id: 'transposicao',
    category: 'ferramentas',
    question: 'Como mudo o tom de uma música para a minha voz?',
    answer:
      'Abra a cifra e toque em Controles. Você pode subir ou descer por semitons ou escolher o tom alvo direto. Todos os acordes, inclusive baixos invertidos como G/B, são recalculados na hora. O tom original nunca se perde: zere a transposição e a cifra volta ao que era.',
  },
  {
    id: 'capo',
    category: 'ferramentas',
    question: 'O site calcula o capotraste para mim?',
    answer:
      'Sim, e mostra a informação mais importante: com capo, o tom que soa e o desenho que a mão faz são coisas diferentes. Defina a casa do capo em Controles e o Cifra Tom recalcula os shapes mantendo o som no tom da música. No topo da cifra você vê os dois: o tom real e o shape que você monta.',
  },
  {
    id: 'shapes',
    category: 'ferramentas',
    question: 'Como vejo as posições de um acorde no braço do violão?',
    answer:
      'De dois jeitos. Na cifra: passe o mouse ou toque no acorde e o diagrama aparece ao lado, com até 10 variações de shape para deslizar. No dicionário (menu Acordes): digite qualquer acorde em notação brasileira, como C, Dm7, F7M ou Bm7(b5), e veja até 16 posições, dos shapes clássicos de braço até variações calculadas para explorar o braço inteiro, com indicação de casa (3ª, 5ª, 8ª) e modo canhoto.',
  },
  {
    id: 'afinacoes',
    category: 'ferramentas',
    question: 'Toco em Drop D ou open tuning. O site me atende?',
    answer:
      'Sim. Em Controles você troca a afinação (Drop D, DADGAD, Open G e outras) e todos os shapes da cifra são recalculados para as cordas da afinação escolhida, não é só uma legenda. O dicionário de acordes e o afinador também trabalham com essas afinações.',
  },
  {
    id: 'ferramentas',
    category: 'ferramentas',
    question: 'Que ferramentas de estudo existem além das cifras?',
    answer:
      'Três, todas gratuitas e sem cadastro: afinador pelo microfone com detecção de nota e desvio em cents, metrônomo com tap tempo, acentos e compassos variados, e dicionário de acordes com dezenas de posições por acorde. Ficam no menu principal.',
  },
  {
    id: 'auto-rolagem',
    category: 'ferramentas',
    question: 'Dá para tocar sem tirar a mão do violão para rolar a página?',
    answer:
      'Sim. Ative a auto-rolagem na página da cifra e escolha a velocidade que acompanha o andamento da música. A página desce sozinha enquanto você toca; desligue no mesmo botão quando terminar.',
  },
  {
    id: 'imprimir-baixar',
    category: 'ferramentas',
    question: 'Posso imprimir ou levar a cifra para fora do site?',
    answer:
      'Pode. Cada cifra tem botão de imprimir (sai um PDF limpo, sem menus nem anúncios, pela impressão do navegador) e de baixar em TXT. A impressão respeita o tom e o capo que você configurou.',
  },
  {
    id: 'login',
    category: 'conta',
    question: 'Preciso de conta para usar o site?',
    answer:
      'Para ler, nunca. Cifras, ferramentas e dicionário são públicos e anônimos. A conta é opcional e serve para enviar cifras ao catálogo, salvar favoritos, sincronizar seu histórico entre dispositivos e acompanhar a moderação dos seus envios.',
  },
  {
    id: 'envio',
    category: 'conta',
    question: 'Como envio uma cifra e por que ela passa por revisão?',
    answer:
      'Com a conta criada, use Adicionar: digite a cifra, cole em formato ChordPro ou suba TXT, DOCX e PDF (o site converte). Todo envio passa por revisão humana antes de publicar, para manter o padrão de qualidade das cifras. Você acompanha o status e recebe feedback em Meus envios.',
  },
  {
    id: 'anuncios',
    category: 'anuncios',
    question: 'Qual é a política de anúncios?',
    answer:
      'Regra permanente: anúncio nunca aparece no meio da cifra. Publicidade existe apenas no rodapé e no outdoor da home, fora do seu campo de leitura enquanto toca. O plano Premium remove até isso.',
  },
  {
    id: 'premium',
    category: 'anuncios',
    question: 'O que o Premium oferece?',
    answer:
      'Navegação sem nenhum anúncio e limites ampliados de histórico e listas. O pagamento online será liberado em uma próxima etapa; o plano já está previsto no produto.',
  },
  {
    id: 'erro-cifra',
    category: 'conta',
    question: 'Achei um erro em uma cifra. O que eu faço?',
    answer:
      'Use os comentários da própria cifra para apontar o erro, ou envie uma versão corrigida pelo Adicionar. Correções passam pela mesma revisão e substituem a versão publicada quando aprovadas.',
  },
];
