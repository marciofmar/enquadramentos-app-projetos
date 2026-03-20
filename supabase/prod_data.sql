--
-- PostgreSQL database dump
--

\restrict wDGmPhXBql9PE5Wbloi9nuUjU3Iucb5cBRttFxan1Y4AklhIQFR0RBQIUS9bZSW

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: setores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.setores (id, codigo, nome_completo, created_at, visivel_cadastro) FROM stdin;
1	ASSEJUR	Assessoria Jurídica	2026-02-21 12:04:07.059601+00	t
2	CEAMA	Coordenadoria Estadual de Ações de Meio Ambiente	2026-02-21 12:04:07.059601+00	t
3	CEMADEN_RJ	Centro Estadual de Monitoramento e Alerta de Desastres Naturais	2026-02-21 12:04:07.059601+00	t
4	CEPEDEC	Centro de Estudos e Pesquisas em Defesa Civil	2026-02-21 12:04:07.059601+00	t
5	CESTAD	Centro Estadual de Apoio a Desastres	2026-02-21 12:04:07.059601+00	t
8	COORD_ENGENHARIA	Coordenadoria de Engenharia em Defesa Civil	2026-02-21 12:04:07.059601+00	t
10	DGAC	Diretoria-Geral de Ações Comunitárias	2026-02-21 12:04:07.059601+00	t
11	DGDEC	Diretoria-Geral de Defesa Civil	2026-02-21 12:04:07.059601+00	t
12	DREDEC	Diretoria de Regionais de Defesa Civil	2026-02-21 12:04:07.059601+00	t
13	ESDEC	Escola de Defesa Civil	2026-02-21 12:04:07.059601+00	t
15	GAB_GESTAO_PROJETOS	Gabinete de Gestão de Projetos	2026-02-21 12:04:07.059601+00	t
16	GRAC	Grupo Integrado de Ações Coordenadas	2026-02-21 12:04:07.059601+00	t
17	ICTDEC	Instituto Científico e Tecnológico de Defesa Civil	2026-02-21 12:04:07.059601+00	t
20	REDECS	Regionais de Defesa Civil	2026-02-21 12:04:07.059601+00	t
22	SUBSEGAD	Subsecretaria Administrativa	2026-02-21 12:04:07.059601+00	t
23	SUBSEGOP	Subsecretaria Operacional	2026-02-21 12:04:07.059601+00	t
24	SUOP	Superintendência Operacional	2026-02-21 12:04:07.059601+00	t
26	REDE SALVAR	Rede Salvar	2026-02-26 19:34:05.69024+00	t
27	CPRODEC	CPRODEC	2026-02-26 19:34:44.949082+00	t
28	CESTGEN	Centro Estadual para Gerenciamento de Emergência Nuclear	2026-03-06 02:47:34.223764+00	t
29	CCCEN	Centro de Coordenação e Controle de Emergência Nuclear	2026-03-06 02:48:54.909673+00	t
30	CAML	Coordenadoria de Apoio à Medicina Legal	2026-03-06 17:57:37.86797+00	t
18	ORGAOS_FINALISTICOS	Órgãos Finalísticos da SEDEC	2026-02-21 12:04:07.059601+00	f
19	ÓRGÃOS SUBORDINADOS	Órgãos Subordinados (Direções, Coordenações, REDECs e demais setores)	2026-02-21 12:04:07.059601+00	f
21	SECRETARIO	Secretário de Estado de Defesa Civil	2026-02-21 12:04:07.059601+00	f
6	CONEPDEC	Conselho Estadual de Proteção e Defesa Civil	2026-02-21 12:04:07.059601+00	f
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, email, nome, setor_id, role, ativo, created_at, updated_at, senha_zerada, reset_token) FROM stdin;
d517f36c-2a4a-41c4-85e1-3db59c7ca101	marciofmar@gmail.com	Marcio Maradei	17	admin	t	2026-02-21 13:18:02.800655+00	2026-02-21 13:28:03.902183+00	f	\N
afa77fdd-8bd3-4d6b-aef7-9b40876aaf47	marcelolvieira.cepedec@gmail.com	Ten Cel BM Marcelo Vieira	4	gestor	t	2026-03-20 11:42:17.152063+00	2026-03-20 11:42:17.152063+00	t	d2b6f165-8db1-4d27-8fda-561e94e538ae
0177f995-2c8a-42cb-8cf6-46577fff1fde	maradei.ictdec@gmail.com	Marcio Neves	11	gestor	t	2026-02-21 14:16:37.801855+00	2026-02-21 14:17:12.28667+00	f	\N
07e45e40-f83d-4896-bf79-b2ff3c84554c	matheuscouto88@gmail.com	Matheus Couto da Costa	3	gestor	t	2026-02-24 18:40:01.378889+00	2026-02-26 19:35:44.043267+00	f	\N
38b8e489-e928-4877-88e0-1bef403918b8	dribianchi@gmail.com	Adriana Aparecida Bianchi 	24	gestor	t	2026-02-24 20:11:23.093382+00	2026-02-26 19:35:03.993883+00	f	\N
b5f47fa0-4bc8-49fa-bbd2-50f99d29d6fb	alexandresf17@gmail.com	Alexandre Santos Ferreira	10	gestor	t	2026-02-26 14:34:15.751052+00	2026-02-26 19:35:05.775763+00	f	\N
113e7c05-7496-4c7e-b090-a599abc8c568	alinepossa83@gamil.com	Aline Possa Silva Anjos	26	gestor	t	2026-02-24 14:04:09.611942+00	2026-02-26 19:35:07.226098+00	f	\N
a9391f44-b141-4646-8042-fd59d5b034a3	andressamarques.cbmerj@gmail.com	Andressa Marques da Silva	3	gestor	t	2026-02-24 18:39:51.764373+00	2026-02-26 19:35:10.187769+00	f	\N
f63029cb-dd03-4e3b-b466-913b0a15e8bf	bryango@outlook.com	Bryan de Oliveira Gusmão	11	gestor	t	2026-02-25 14:30:11.195301+00	2026-02-26 19:35:11.589442+00	f	\N
afb3add1-c29a-4007-b0c2-9ee90c579b9b	carla.sprado@gmail.com	carla da silva prado cecchi de azevedo	20	gestor	t	2026-02-25 19:23:05.734338+00	2026-02-26 19:35:13.834939+00	f	\N
601fdb5b-f5ca-425c-a242-faa1c4ede53f	ceaacre.sedec@gmail.com	CEAMA	2	gestor	t	2026-02-24 14:03:24.171763+00	2026-02-26 19:35:15.431102+00	f	\N
89840d8b-8841-4059-8e69-582d165fc76c	clauciscotto@defesacivil.gov.br	Claudinei Fontes Ciscotto	10	gestor	t	2026-02-24 20:57:48.731141+00	2026-02-26 19:35:16.841292+00	f	\N
279f4e07-1fb4-467d-bccd-3f5bd55835c4	moreirasilva43@gmail.com	Claudio Moreira da Silva 	11	gestor	t	2026-02-25 14:30:24.045195+00	2026-02-26 19:35:19.29773+00	f	\N
a2deaf01-248e-479a-9302-5ef54cf14906	servicosocialdgac@gmail.com	Cristiane da Costa Lopes Roma	10	gestor	t	2026-02-25 12:11:36.285838+00	2026-02-26 19:35:21.372014+00	f	\N
b5375011-d5d6-4368-ae70-d320b7786443	edmilsonbombeiro.rj@gmail.com	Edmilson Menezes Nascimento 	24	gestor	t	2026-02-24 14:03:35.825841+00	2026-02-26 19:35:22.877005+00	f	\N
a492bdb6-c927-4363-b20f-ab30967a308d	venturafabiana1981@gmail.com	Fabiana da silva ventura	24	gestor	t	2026-02-24 14:02:25.750825+00	2026-02-26 19:35:24.451579+00	f	\N
7bc36f9c-68fd-404f-8fa9-54d1ff00355d	fguedes04@gmail.com	fabio guedes de jesus	10	gestor	t	2026-02-26 14:24:20.617925+00	2026-02-26 19:35:26.728483+00	f	\N
38bbfcef-f951-49a9-9ba3-48f007f4606e	felipeoliveira.0954@gmail.com	Felipe Oliveira	24	gestor	t	2026-02-24 17:03:37.812+00	2026-02-26 19:35:28.376657+00	f	\N
679e2b0f-5949-4ac4-8e53-21538c1fa799	flaviamsmedeiros@gmail.com	Flavia Maria Silva de Medeiros	10	gestor	t	2026-02-25 15:27:31.794692+00	2026-02-26 19:35:29.816243+00	f	\N
9109768f-dfed-4b95-9fe8-32308b049436	gabriel.heraldo@hotmail.com	Gabriel Heraldo Rodrigues Do Nascimento	11	gestor	t	2026-02-25 17:53:32.358175+00	2026-02-26 19:35:31.161587+00	f	\N
2f7a9820-7347-4076-bd48-054a48c89b68	g.diasbm@gmail.com	GILVANE DOS SANTOS DIAS 	24	gestor	t	2026-02-24 14:01:58.966154+00	2026-02-26 19:35:32.449158+00	f	\N
9cd6d711-15ee-4045-b362-8b97028d1492	eng.ivodejesus@gmail.com	IVo	10	gestor	t	2026-02-24 18:40:24.480214+00	2026-02-26 19:35:34.941571+00	f	\N
61939222-c77c-4a49-b94a-83f1611c575f	jbduartevig92@gmail.com	Jônatas Teixeira Braga Duarte 	11	gestor	t	2026-02-25 14:30:20.481438+00	2026-02-26 19:35:36.618774+00	f	\N
b0b5050c-6c87-4ee5-b7d9-215defb80465	danielbmelomaradei@gmail.com	Karl	24	gestor	t	2026-02-21 14:25:47.125786+00	2026-02-26 19:35:37.981328+00	f	\N
d52e2804-2387-4e16-8d62-fef509b99be0	adribmelo@gmail.com	Manoel Dias	23	gestor	t	2026-02-21 14:24:52.6131+00	2026-02-26 19:35:41.040508+00	f	\N
ec94f6cd-12de-4067-b5a5-535a5735d5b5	mirelacsreis@gmail.com	Mirela Carneiro dos Santos Reis	20	gestor	t	2026-02-25 19:22:38.167236+00	2026-02-26 19:35:45.281467+00	f	\N
847b8b02-38ec-42fe-b412-a6787ad12e19	mhvmn71@gmail.com	Monica Helena Vieira Marques Nascimento 	10	gestor	t	2026-02-26 17:18:10.400104+00	2026-02-26 19:35:46.557346+00	f	\N
337a3418-1893-4cf8-8835-4c8a2acff5b7	rodrigokarlsilva@gmail.com	Rodrigo Karl Silva	24	gestor	t	2026-02-24 14:02:08.872948+00	2026-02-26 19:35:47.829282+00	f	\N
f7257308-2edb-464d-b717-e6f4d21cfc60	tunay_kitazawa@hotmail.com	Tunay Ramon Araujo Kitazawa 	20	gestor	t	2026-02-25 19:03:47.430229+00	2026-02-26 19:35:49.177628+00	f	\N
26bf03a0-c3ad-4652-85af-d11c3b385b7d	cprodecrj@gmail.com	Leonardo Viana Trancoso 	27	gestor	t	2026-02-24 14:03:44.095217+00	2026-02-26 19:35:58.796339+00	f	\N
2c73efef-8678-493d-b155-0d428f827190	crisrickkelmer@gmail.com	Cristiane Kelmer Ribeiro 	30	gestor	t	2026-03-04 17:25:33.590268+00	2026-03-06 17:57:59.473832+00	f	\N
dfee39fc-f3af-451d-aaca-c163c06ac3d4	cestgen@gmail.com	Giovanni Mouta Giglio	28	gestor	t	2026-03-04 16:28:31.769794+00	2026-03-06 17:58:12.056401+00	f	\N
4f44c4c7-3985-409b-9907-b029fdcacd82	sulredec2@gmail.com	Lilian Ferreira Batista de Araujo	20	gestor	t	2026-03-03 18:32:00.385078+00	2026-03-06 17:58:24.514227+00	f	\N
7a1097fd-ab35-473b-ad95-985803d6ebe8	anagsa26@gmail.com	Ana Gabriele Santos Albuquerque 	10	gestor	t	2026-03-02 11:03:52.240193+00	2026-03-06 17:59:13.397088+00	f	\N
7259d11e-c6e0-4b7f-aa17-15ef06db748d	erica.campaneli@gmail.com	Érica Durães Campaneli	8	gestor	t	2026-03-05 00:33:22.387489+00	2026-03-06 17:59:19.178951+00	f	\N
afeed092-a24e-4300-95fb-d02b78c88cad	moreirambm@hotmail.com	FRANCISCO ALBERTO MOREIRA DA SILVA	12	gestor	t	2026-03-02 10:51:04.338607+00	2026-03-06 17:59:23.658+00	f	\N
af9735ec-c165-482f-bb57-dc1a1880258f	marceloabreu.ma@gmail.com	Marcelo Abreu	5	gestor	t	2026-03-02 12:03:31.810388+00	2026-03-06 17:59:30.441948+00	f	\N
3d906d79-dbb0-401d-95e3-f5f075638f3b	velosostalita@gmail.com	Talita de Souza Veloso Santos	10	gestor	t	2026-02-27 12:36:23.266334+00	2026-03-06 17:59:34.203626+00	f	\N
c6d67e0c-7632-4f02-b001-cab5de3e71a3	l.paiva@yahoo.com.br	Luciana Gomes Paiva Loyola	26	gestor	t	2026-03-12 17:30:58.676028+00	2026-03-19 21:39:49.315694+00	f	\N
3d14f5fd-0658-4093-8608-a29cfef63106	fmariombc@gmail.com	Fabio Mario Rodrigues Barbosa	20	gestor	t	2026-03-18 12:27:58.056836+00	2026-03-19 21:39:55.396166+00	f	\N
a782252c-a359-4c34-a3f8-1dcbfe888815	eduardocarvalho24874@gmail.com	Efuardo Barbosa Carvalho	29	gestor	t	2026-03-13 17:22:30.358355+00	2026-03-19 21:40:03.172938+00	f	\N
bcd04023-9d85-4532-b123-06c21b1fce5a	caml.sedec@gmail.com	CRISTIANE KELMER	30	gestor	t	2026-03-16 18:22:09.898301+00	2026-03-19 21:40:12.221345+00	f	\N
8fed3db6-08a8-4a5f-b20c-d6887b2ca9e0	cristianelopesroma@gamail.com	Cristiane da Costa Lopes Roma	10	gestor	t	2026-03-10 13:53:21.185986+00	2026-03-19 21:40:21.429941+00	f	\N
38880d1d-e19c-45c2-9a2a-888fd45608ab	albertomendoncamartins@gmail.com	Alberto Martins	5	gestor	t	2026-03-04 13:18:09.335299+00	2026-03-19 21:40:30.329338+00	f	\N
956aef59-7d87-4f30-827a-acee87bffee6	majanamartinez@gmail.com	Ana claudia lago martinez gerhard	15	master	t	2026-02-24 14:08:13.524852+00	2026-03-19 21:40:46.996872+00	f	\N
5f8c8df0-c481-4ab6-a36f-17b3d5d506eb	marciofmar@yahoo.com.br	Wellington Silva	17	usuario	t	2026-02-21 14:13:16.154104+00	2026-03-19 21:41:17.294086+00	f	\N
1bbbf1f2-3b0f-48af-83f4-65a20bfe5895	wellingtonsilva.ictdec@gmail.com	Maj BM Wellington Silva	17	gestor	t	2026-03-20 11:40:52.707653+00	2026-03-20 11:40:52.707653+00	t	c484785d-2d09-4fe7-b584-cc42abf31879
\.


--
-- Data for Name: projetos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projetos (id, nome, descricao, problema_resolve, setor_lider_id, criado_por, created_at, updated_at, indicador_sucesso, tipo_acao, dependencias_projetos, data_inicio, responsavel_id) FROM stdin;
3	Estruturação da Rede de Estudos e Pesquisas em Proteção e Defesa Civil – SEDEC-RJ	Estabelecer parcerias de cooperação técnico-científicas com Instituições de Ensino Superior (IES) e Instituições de Ciência e Tecnologia (ICT) Organizações da Sociedade Civil, visando o desenvolvimento de soluções colaborativas voltadas à resiliência e gestão de riscos. Por meio da estruturação de uma rede integrada de saberes e práticas, a iniciativa pretende fortalecer a produção de conhecimento aplicado e otimizar a identificação de meios para a captação de recursos financeiros e tecnológicos. Essa articulação estratégica não apenas potencializa a inovação no setor, mas também viabiliza a sustentabilidade de projetos que protegem a sociedade e modernizam a atuação da Defesa Civil no estado.	Falta de meios e rede influência para captação de recursos para desenvolvimento de estudos e pesquisa;\nAusência de meios para endereçar ideias e demandas para serem desenvolvidas e construir soluções;\nInexistência de uma rede articulada e integrada de produção de conhecimento na área de gestão integrada de risco de desastre	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-12 18:41:21.038056+00	2026-03-13 16:45:07.54984+00	Formalização do documento que materializa a rede estadual integrada de produção de conhecimento em Gestão Integrada de Risco e Desastre (confirmar o tipo de documento após a primeira entrega)\nDiversidade de campos de conhecimento que se integraram à carta de intenção. Podendo ser enquadrado em três níveis: saúde, assistência social e defesa civil, sendo o básico; havendo mais 4 a 6 campos, entende-se como diversidade média e a partir de 7 campos, entende-se como alta. A meta para 2026 é de diversidade alta.	{"Ação de Integração"}	\N	\N	\N
6	Implantação da Metodologia de Elaboração dos Planos Setoriais no Ramo SUBSEGOP – Ciclo 2026	Implantação da Metodologia de Planos Setoriais junto a todos os órgãos do ramo SUBSEGOP, seguindo as 5 etapas definidas: enquadramento estratégico, desdobramento orientado, planejamento operacional, pactuação e execução monitorada. O ICTDEC conduz as oficinas presenciais por grupos de afinidade, orienta o cadastramento no P2E e produz os relatórios consolidados para decisão da SUOP. O ciclo 2026 constitui a edição inaugural de implantação.	A ausência de planos tático-operacionais setoriais formalizados torna difícil monitorar o progresso das iniciativas, ajustar rotas ao longo do ciclo e demonstrar, com evidências, os resultados produzidos pela estrutura.	24	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 14:20:58.409543+00	2026-03-19 21:36:07.699116+00	Percentual de setores do ramo SUBSEGOP com plano setorial cadastrado e validado no P2E dentro do prazo\nNúmero de oficinas realizadas conforme cronograma\nPercentual de projetos cadastrados com ao menos uma entrega registrada para 2026	{Gestão/Governança,Inovação}	\N	\N	\N
4	Implantação do Curso GEGIRD-RJ: Formação de Gestores Estaduais com Foco em Gestão Integrada de Riscos e Desastres	O GEGIRD-RJ responde a essa lacuna oferecendo uma trilha de formação estruturada para gestores estaduais de proteção e defesa civil. O curso não visa formar especialistas nas disciplinas que alimentam o campo — meteorologia, geotecnia, planejamento urbano, direito público — mas desenvolver profissionais capazes de transitar por essas áreas com profundidade suficiente para conduzir discussões entre especialistas, formar consensos em ambientes multisetoriais e tomar decisões fundamentadas em contextos de risco e desastre.	A proteção e defesa civil estadual exige um perfil de atuação que transcende o domínio técnico-operacional: o gestor estadual precisa conduzir discussões entre especialistas de áreas distintas, negociar com secretarias setoriais, apoiar municípios na tomada de decisão em contextos de risco e sustentar posições institucionais em ambientes políticos complexos. Essas competências não se desenvolvem pela experiência operacional isolada — e tampouco são objeto de formação sistemática disponível no setor. O resultado é uma lacuna estrutural no repertório do efetivo: o sistema não dispõe de um conjunto consolidado de profissionais formados para assumir essas funções quando demandado.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-12 19:29:35.159396+00	2026-03-20 11:41:20.965103+00	Número de blocos prontos para implementação no prazo de 12 meses a partir do aceite da proposta pela alta gestão. (5)\nPercentual de vagas preenchidas no bloco principal do curso, na primeira edição. (>90%)\nPercentual de alunos que se inscreveram no bloco principal e que se inscreveram em outros blocos do curso. (>70%)\nPercentual de alunos que se inscreveram no bloco principal e que se inscreveram em todos os blocos. (>50%)\nPercentual de aprovados ao final de cada bloco. (>70%)	{Gestão/Governança,Inovação}	\N	2026-02-12	1bbbf1f2-3b0f-48af-83f4-65a20bfe5895
7	SEDEC 360 | Institucionalização dos Processos Finalísticos do Ramo SUBSEGOP: Mapeamento, Atribuições e Proposição de Melhorias – Ciclo 2026	Mapeamento dos processos finalísticos dos órgãos do ramo SUBSEGOP, com definição de atribuições por função, identificação de oportunidades de melhoria e formalização da documentação correspondente. O objetivo é que o conhecimento acumulado pelas equipes seja convertido em patrimônio institucional, garantindo continuidade e qualidade nas entregas independentemente de mudanças de pessoal. Constitui a Fase 2 do Programa SEDEC 360.	Em organizações com alta rotatividade de pessoal e forte tradição de atuação baseada na experiência individual, é comum que os processos de trabalho ainda não estejam formalizados de maneira que garantam continuidade e qualidade independente das pessoas que os executam. Esse cenário, embora natural em fases anteriores de desenvolvimento institucional, representa hoje uma oportunidade de salto qualitativo na capacidade de entrega.	24	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 14:28:34.989105+00	2026-03-16 14:28:34.989105+00	Percentual de setores com ao menos 1 processo finalístico mapeado, documentado e validado\nNúmero de melhorias propostas e implementadas a partir do mapeamento\nEvolução qualitativa da continuidade operacional registrada nas avaliações de ciclo	{Inovação,Gestão/Governança}	\N	\N	\N
9	Implantação do Repositório de Memória Técnica e Documental da Defesa Civil Estadual	Estruturação e implantação de repositório institucional centralizado para armazenamento, organização e acesso à memória técnica e documental da Defesa Civil Estadual. Inclui definição de taxonomia documental, fluxos de alimentação, política de acesso e produção de sistema próprio. Transforma experiências acumuladas em patrimônio institucional acessível e duradouro.	Ao longo dos anos, a Defesa Civil Estadual acumulou um volume expressivo de conhecimento técnico e experiências operacionais que, por não terem sido sistematicamente registrados e organizados, ainda não estão plenamente acessíveis à instituição e ao público externo como um todo. Essa condição dificulta a distribuição, acesso e utilização, tanto pelo público externo quanto pela própria instituição dos produtos desenvolvidos internamente.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 14:47:25.172601+00	2026-03-16 14:47:25.172601+00	Repositório implantado e acessível\nNúmero de documentos técnicos indexados no primeiro ciclo\nPercentual de setores que alimentaram o repositório com ao menos um documento no período	{Gestão/Governança}	\N	\N	\N
11	Implantação da Gestão por Competências – Fase 1: Mapeamento de Funções e Perfis	Primeira fase da implantação da gestão por competências no ramo SUBSEGOP: mapeamento e delimitação clara das funções existentes, definição dos perfis de competência correspondentes — conhecimentos, habilidades e atitudes necessários para o bom exercício de cada função — e aplicação do diagnóstico de lacunas com a matriz Habilidade x Motivação. O produto orienta tanto o desenvolvimento das pessoas quanto a adequação das alocações, aproximando cada servidor das funções em que pode contribuir de forma mais qualificada e satisfatória.	Quando as funções existentes em uma organização não estão claramente delimitadas e as competências necessárias para bem exercê-las não estão formalmente definidas, surgem dois efeitos simultâneos e interdependentes: as atribuições tendem a ser executadas de forma incompleta ou inconsistente, e as pessoas alocadas nessas funções têm dificuldade de perceber onde e como podem contribuir com o melhor do seu potencial. Esse desalinhamento, comum em organizações em processo de amadurecimento gerencial, reduz tanto a qualidade das entregas quanto o engajamento das equipes — um custo que recai sobre a organização e sobre as pessoas ao mesmo tempo.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 16:41:50.31484+00	2026-03-16 16:41:50.31484+00	Percentual de funções do ramo SUBSEGOP com perfil de competências definido\nMetodologia para identificar competências no efetivo entregue\nMetodologia aplicada no efetivo\nRelatório de lacunas e oportunidades de realocação elaborado e entregue à SUOP para subsidiar decisões de desenvolvimento e alocação de pessoal	{Gestão/Governança,Inovação}	\N	\N	\N
12	Elaboração do Manual Técnico de Planejamento e Execução de Simulados em Proteção e Defesa Civil	Elaboração de manual técnico que padronize o planejamento, execução e avaliação de simulados em proteção e defesa civil para uso dos órgãos estaduais e municipais. Inclui tipologia de simulados, roteiro de planejamento, definição de papéis e responsabilidades, checklists de execução, critérios de avaliação de efetividade e instrumento padronizado de registro de lições aprendidas.	A realização de simulados sem referencial metodológico padronizado expõe a organização a um conjunto encadeado de riscos que vão muito além da variação de qualidade entre exercícios. No plano direto, simulados conduzidos sem roteiro estruturado tendem a não testar os cenários mais relevantes, a gerar confusão de papéis durante a execução e a encerrar sem avaliação sistemática — o que impede a identificação de falhas reais nos planos de resposta. Um exercício mal conduzido pode, inclusive, criar uma percepção equivocada de preparação: a comunidade ou o órgão acredita estar pronto quando, na prática, lacunas críticas nunca foram testadas. Esse risco se amplifica significativamente nos exercícios que envolvem múltiplos órgãos do GRAC estadual, nos quais a ausência de metodologia compartilhada compromete a coordenação interinstitucional e pode gerar desalinhamentos visíveis entre os participantes — situação que fragiliza a imagem de liderança técnica que cabe à SEDEC-RJ exercer nesses momentos. Da mesma forma, a inexistência de um manual impede que a Secretaria ocupe, de forma sistemática e replicável, o papel de referência metodológica para os municípios fluminenses e para outros órgãos estaduais de defesa civil do país — uma oportunidade de posicionamento técnico nacional que se renova a cada exercício realizado sem esse suporte.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 16:54:04.489187+00	2026-03-16 16:54:04.489187+00	Manual elaborado, validado tecnicamente e publicado\nManual utilizado em ao menos 1 simulado no ciclo 2026\nAvaliação comparativa de qualidade entre simulados realizados com e sem o manual, registrada em instrumento padronizado de avaliação pós-exercício	{Preparação}	\N	\N	\N
13	Diagnóstico e Proposta de Estrutura Organizacional Ideal para o Ramo da Defesa Civil Estadual	Elaboração de diagnóstico técnico da estrutura organizacional atual do ramo da Defesa Civil Estadual, com análise comparativa entre as funções formalmente previstas no organograma, as atribuições efetivamente exercidas pelos órgãos e o conjunto de funções que a missão institucional exige — incluindo aquelas ainda não cobertas adequadamente pela estrutura vigente. A partir desse diagnóstico, será produzida proposta de estrutura organizacional ideal, com definição clara de funções, delimitação de atribuições, eliminação de sobreposições, cobertura de lacunas identificadas e estabelecimento de interfaces entre os órgãos.	Estruturas organizacionais que se consolidaram de forma incremental ao longo do tempo tendem a apresentar sobreposições e lacunas que só se tornam visíveis com um olhar técnico estruturado. Quando não identificadas e corrigidas, essas distorções se traduzem em problemas concretos do cotidiano: atribuições disputadas entre órgãos, demandas que não encontram responsável claro e esforços duplicados em algumas frentes e sem esforços em outras. Há ainda um efeito menos visível, mas igualmente relevante: funções que a organização precisa exercer para cumprir sua missão e que, por não estarem refletidas no organograma formal, acabam sendo executadas de forma improvisada, distribuídas informalmente entre quem se dispõe a absorvê-las, ou simplesmente não realizadas a contento. Esse conjunto de distorções faz com que a organização não se desenvolva em toda a sua plenitude e que consuma energia institucional gerenciando ambiguidades.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 17:24:50.979083+00	2026-03-16 17:24:50.979083+00	Proposta de estrutura ideal elaborada, contemplando cobertura das lacunas identificadas e eliminação das sobreposições mapeadas\nProposta entregue à SUBSEGOP e adotada como referência para a criação de novo organograma institucional	{Gestão/Governança}	\N	\N	\N
14	Elaboração da Arquitetura Operacional do Gabinete Integrado de Gestão de Desastres – AO/GIGD	Elaboração do conjunto completo de documentação operacional do GIGD, estruturada em torno de suas três funções simultâneas — Gestão da Informação com suporte à tomada de decisão (DINT), Endereçamento de Soluções (DATA) e Comunicação Externa — e de sua dimensão física de campo. O produto inclui: regulamento interno de funcionamento, fluxogramas de acionamento e escalada modular, protocolos operacionais por divisão e seção, matrizes de competência por função, artefatos padronizados de trabalho (sistemas, planilhas, formulários, modelos de boletins e relatórios situacionais), especificações tecnológicas com previsão de operação em modo offline, e programa de treinamento para as equipes. O produto entregue viabiliza a operação padronizada e replicável do gabinete em qualquer cenário de desastre.	Em situações de desastre, a coordenação eficaz do apoio estadual aos municípios depende de fluxos de informação claros, papéis bem definidos e protocolos previamente acordados entre os múltiplos órgãos envolvidos. Na ausência de documentação operacional formalizada para o GIGD, cada ativação tende a ser conduzida de forma improvisada, com risco de sobreposição de esforços entre as divisões, ambiguidade sobre quem detém autoridade para endereçar cada tipo de demanda e falhas na comunicação com os públicos externos — imprensa, população e órgãos de controle. Esse cenário decorre, fundamentalmente, do fato de o GIGD ainda não dispor de arquitetura operacional estruturada: não há regulamentos que definam seu funcionamento interno, fluxos que orientem o acionamento e a escalada modular, protocolos que padronizem a atuação de cada divisão, matrizes que delimitem competências por função, nem artefatos de trabalho que garantam a continuidade das operações inclusive em ambientes sem conectividade. Sem esse conjunto de instrumentos, a capacidade de resposta coordenada permanece dependente da experiência individual de quem está presente em cada ativação, em vez de estar ancorada em doutrina institucional consolidada.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 17:48:12.997112+00	2026-03-16 17:48:12.997112+00	Conjunto documental AO/GIGD concluído, contemplando todos os componentes previstos\nAO/GIGD submetida à aprovação da SUOP e adotada como referência operacional do GIGD\nAo menos uma ativação ou exercício simulado do GIGD realizado com base na AO/GIGD, com registro de avaliação pós-ativação	{Resposta,Preparação}	\N	\N	\N
15	Desenvolvimento de Metodologia de Integração entre Planejamento Estratégico e Ciclo Orçamentário (PLOA/PPPA) – SEDEC-RJ	Desenvolvimento de metodologia que estruture a integração entre o ciclo de planejamento estratégico da SEDEC-RJ e os ciclos orçamentários estaduais (PLOA e PPPA). Inclui mapeamento dos pontos de interface, proposta de calendário integrado, critérios de priorização orçamentária e instrumentos de rastreabilidade entre ação estratégica e dotação.	A desconexão entre ciclos de planejamento estratégico e ciclos orçamentários é uma das principais limitações à execução de planos de longo prazo na administração pública brasileira. Quando esses ciclos não são integrados por metodologia explícita, há risco de que ações prioritárias não encontrem dotação adequada e que recursos sejam alocados sem ancoragem clara nos objetivos estratégicos definidos.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 17:57:58.291642+00	2026-03-16 17:57:58.291642+00	Metodologia documentada e aprovada pela SUBSEGOP e área de orçamento\nPercentual de AEs prioritárias 2027 com dotação orçamentária identificada e rastreável\nMetodologia aplicada no ciclo de elaboração do PLOA 2027	{Gestão/Governança}	\N	\N	\N
17	Regulamentação do CONEPDEC – Preparação para Implantação no Ciclo 2027	Elaboração da regulamentação operacional do CONEPDEC: regimento interno, normas de funcionamento, estrutura de pauta, fluxo de deliberação e critérios de composição. Prepara a implantação efetiva do conselho para o ciclo 2027, garantindo base jurídica e viabilidade operacional antes do lançamento.	O CONEPDEC existe como estrutura prevista no arcabouço normativo da defesa civil estadual, mas não dispõe de regulamentação operacional que defina como deve funcionar na prática. Sem essa regulamentação, a estrutura permanece inativa como instância de articulação sistêmica, não cumprindo o papel integrador que lhe é atribuído pela Lei 12.608/2012. As causas são a ausência de um regimento interno que estabeleça periodicidade, composição, quórum e fluxo de deliberações, e a inexistência de um processo formal que conduza sua implantação de forma planejada — o que faz com que a ativação do conselho, quando demandada, não encontre base operacional para se concretizar.	23	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 18:10:31.799167+00	2026-03-16 18:10:31.799167+00	Regulamentação elaborada e submetida à aprovação institucional\nProposta aprovada e pronta para publicação até o final do ciclo 2026 ou início de 2027	{Prevenção,Mitigação,Preparação,Recuperação,Resposta,Integração}	\N	\N	\N
18	Reorientação do SIGDEC como Repositório Institucional de Iniciativas e Atividades Estratégicas	Reorientação funcional do SIGDEC para que opere como repositório institucional centralizado das iniciativas e atividades estratégicas da SEDEC-RJ. Inclui redefinição do escopo de uso, revisão de campos e categorias de registro e definição de fluxos de alimentação por setor.	O SIGDEC não cumpre função estratégica efetiva para a gestão da Secretaria. As informações registradas no sistema não se traduzem em inteligência para decisão, e o uso da plataforma entre os setores é heterogêneo e sem critério comum. Esse problema decorre da ausência de um escopo de uso claramente definido: não há orientação sobre o que deve ser registrado, em que formato e com qual finalidade, o que resulta em alimentação irregular, campos subutilizados e dados incomparáveis entre órgãos. Sem essa definição, o sistema acumula registros sem padrão que não podem ser consolidados nem utilizados como base para análise ou prestação de contas — e o efetivo despende tempo e esforço na inserção de informações que não geram retorno para a gestão nem para o próprio setor que as registra, representando um custo operacional sem contrapartida de valor.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 18:29:28.40394+00	2026-03-16 18:29:28.40394+00	Proposta de reorientação validada pela SUBSEGOP e equipe responsável pelo SIGDEC\nPercentual de órgãos utilizando o SIGDEC conforme o novo escopo após implantação\nRelatórios com valor agregado explícito e com menor necessidade de intervenções manuais de limpeza e estruturação dos dados	{Gestão/Governança}	\N	\N	\N
20	Elaboração de Estratégia e Plano de Ação para Transferência da Manutenção dos Sistemas de Alerta e Alarme por Sirenes aos Municípios	Elaboração de estratégia e plano de ação para a transferência gradual e responsável da manutenção dos sistemas de alerta e alarme por sirenes aos municípios, restabelecendo a distribuição de responsabilidades prevista na Lei 12.608/2012. O projeto compreende: diagnóstico do estado atual dos sistemas instalados e das capacidades técnicas e orçamentárias municipais para absorver sua manutenção; elaboração de modelo de transição com definição de etapas, critérios de priorização de municípios, forma e prazo do apoio transitório do estado; elaboração do arcabouço jurídico necessário para formalizar a transferência, incluindo minuta de decreto estadual que institua a política de transferência, modelos de termo de transferência de patrimônio e de convênio de transição, e orientações para adequação orçamentária e normativa municipal; plano de capacitação municipal para habilitação técnica e orçamentária dos órgãos receptores; e análise de alternativas tecnológicas que sejam capazes de exercer as mesmas funções de alerta e produzir nível equivalente de proteção às comunidades, a custos compatíveis com a realidade orçamentária municipal — contemplando a possibilidade de substituição dos sistemas atuais por soluções mais adequadas ao contexto de cada município. O produto é a estratégia e o plano de ação — a execução da transferência constitui etapa subsequente, dependente de aprovação institucional e articulação com os municípios.	A produção de alertas antecipados por meio de sirenes é competência atribuída aos municípios pelo Art. 8º, V-B da Lei 12.608/2012, com redação dada pela Lei 14.750/2023. A articulação com União e Estados prevista nesse dispositivo refere-se à produção dos alertas em si — não à manutenção da infraestrutura que os viabiliza, que permanece como responsabilidade municipal. Quando recursos financeiros estaduais são direcionados ao custeio permanente da manutenção de sistemas de sirenes instalados em território municipal, o que deveria ser apoio transitório converte-se em substituição continuada de uma responsabilidade que é do município — com recursos que deixam de estar disponíveis para o financiamento das competências próprias do estado, entre elas o monitoramento meteorológico, hidrológico e geológico previsto no Art. 7º, V. A causa está na ausência de uma estratégia formalizada de transição: não há diagnóstico consolidado das capacidades municipais para absorver essa função, não há modelo que defina etapas, condições e forma de apoio transitório do estado, e não há marco jurídico complementar que oriente a distribuição prática de responsabilidades entre os entes — o que mantém o estado na posição de financiador permanente de função municipal, sem horizonte definido de saída e com crescente comprometimento orçamentário das suas atribuições finalísticas.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 19:56:28.49329+00	2026-03-16 19:56:28.49329+00	Estratégia e plano de ação elaborados, validados pela SUBSEGOP e formalizados em documento institucional\nModelo de transição definido, com etapas, critérios de priorização, forma de apoio transitório e prazo de saída do estado claramente estabelecidos\nMarco jurídico complementar identificado e minuta de instrumento normativo elaborada	{Preparação,Gestão/Governança}	\N	\N	\N
16	Elaboração de Metodologia e Produção de Regimentos Internos dos Órgãos do Ramo SUBSEGOP	Elaboração de metodologia padronizada para construção e revisão de regimentos internos dos órgãos do ramo SUBSEGOP, seguida da produção dos regimentos de cada órgão com base nessa metodologia. Garante consistência entre os documentos e resolve lacunas normativas existentes.	Os órgãos do ramo SUBSEGOP operam com regimentos internos desatualizados e que, em muitos casos, não refletem suas atribuições reais e suas interfaces com os demais órgãos da estrutura. Essa lacuna gera consequências práticas relevantes:  sem um documento que formalize o que cada órgão deve fazer, como deve fazer e em que situações deve interagir com outros setores, as atribuições são interpretadas de forma variável por cada chefia, os limites de atuação entre órgãos tornam-se difusos e a responsabilização por resultados fica fragilizada. As causas dessa situação são múltiplas: a elaboração de regimentos internos é um processo técnico que exige metodologia específica e disponibilidade de tempo que as equipes operacionais raramente têm; não há metodologia padronizada que oriente e simplifique esse processo para os órgãos; e as mudanças organizacionais ocorridas ao longo do tempo não foram acompanhadas da atualização correspondente dos instrumentos normativos internos, tornando os documentos existentes progressivamente descolados da realidade operacional.	24	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 18:04:25.624513+00	2026-03-16 22:17:29.544675+00	Metodologia de elaboração de regimentos concluída e validada\nRegimento do ICTDEC concluído, validado e publicado\nPercentual de órgãos do ramo SUBSEGOP com regimento atualizado até o final do ciclo 2026 (100%)	{Gestão/Governança}	Depende do projeto de mapeamento de processos dos órgãos	\N	\N
8	Implantação de Metodologia de Monitoramento e Avaliação dos Planos Setoriais	Desenvolvimento e implantação de metodologia de monitoramento e acompanhamento para os planos setoriais, desenvolvida pelo ICTDEC, incluindo modelo de relatório trimestral padronizado, fluxo de análise crítica e painel de acompanhamento no P2E. A metodologia deve ser calibrada à capacidade operacional atual dos setores, evitando sobrecarga.	A elaboração de planos sem instrumentos estruturados de acompanhamento é um desafio reconhecido na gestão pública brasileira. Sem metodologia de monitoramento e avaliação, torna-se difícil identificar desvios no momento adequado, aprender com os ciclos anteriores e demonstrar à sociedade e à alta gestão os resultados produzidos pelas iniciativas planejadas.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-16 14:36:52.020507+00	2026-03-17 11:59:31.355626+00	Metodologia documentada e aprovada pela SUOP\nPercentual de setores que entregaram relatório trimestral dentro do prazo no primeiro ciclo\nPainel de acompanhamento funcional e atualizado no P2E	{Gestão/Governança}	\N	\N	\N
2	SEDEC 360 | Fortalecimento de Cultura Institucional	Programa que abrigará diversas iniciativas, se iniciando por uma palestra para identificação dos nós críticos para o desenvolvimento institucional (falta de continuidade, dependência de heróis, baixo alinhamento entre outros); apresentação de conceitos relacionados à Cultura Institucional e Planejamento Estratégico; e da metodologia para elaboração dos planos setoriais rumo à visão estratégica da instituição. Será um programa, portanto será perene e abrigará diversas entregas que serão formuladas ao longo do tempo.	Lacuna de desenvolvimento da cultura institucional, causando uma percepção coletiva e criação de padrões mentais prejudiciais às atividades e posturas cotidianas responsáveis pela condução da evolução/involução institucional.\nFalta de direcionamento institucional para a condução e desenvolvimento de iniciativas alinhadas à missão da Secretaria.\nFalta de uma metodologia padronizada de construção de planos setoriais.	23	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-12 15:06:08.103111+00	2026-03-17 12:16:55.17909+00	Planos setoriais cadastrados para todos os órgãos dentro da metodologia proposta.\nRetorno positivo em pesquisa de opinião sobre a palestra e os temas abordados.	{Gestão/Governança,Inovação}	\N	\N	\N
21	SEDEC 360 | Fortalecimento de Aspectos de Gestão Estratégica	Fortalecimento das práticas de gestão estratégica no ramo da Defesa Civil Estadual por meio da estruturação e formalização de rotinas de acompanhamento do Plano Estratégico 2024–2035: definição de calendário institucional de reuniões periódicas de análise crítica, estabelecimento de fluxo de coleta e consolidação de indicadores estratégicos, criação de processo de revisão anual de prioridades e desenvolvimento de instrumentos de comunicação interna dos resultados obtidos. O objetivo é ampliar a capacidade da organização de identificar desvios, reconhecer avanços e ajustar o curso com base em dados, fortalecendo o vínculo entre o planejamento de longo prazo e as decisões do ciclo corrente.	O Plano Estratégico 2024–2035 representa um avanço institucional significativo, mas sua capacidade de orientar efetivamente as decisões ao longo do tempo depende da existência de rotinas estruturadas de acompanhamento que complementem e deem sustentação à sua execução. Sem um calendário institucional formalizado de análise crítica de desempenho, sem fluxo definido de coleta e consolidação de indicadores e sem processo estruturado de revisão periódica das prioridades à luz dos resultados obtidos, há risco de que o intervalo entre os ciclos de planejamento não seja aproveitado para correções de rota baseadas em evidências. Esse cenário é agravado pela natureza da rotina operacional da defesa civil, que tende a concentrar a atenção gerencial nas demandas imediatas, tornando ainda mais relevante a existência de mecanismos institucionalizados que reservem espaço regular para a análise estratégica.	23	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-17 12:30:21.707503+00	2026-03-17 14:27:09.450367+00	Instituição de metodologia e rotina padronizadas para acompanhamento estratégico da instituição\nPublicação de nota com ações estratégicas prioritárias para o ciclo vigente\nFluxo de coleta e consolidação de indicadores estratégicos definido e operacional\nRelatório de acompanhamento estratégico produzido em períodos institucionalmente definidos	{Gestão/Governança}	\N	\N	\N
22	Desenvolvimento de Metodologias e Ferramentas de Produtividade para o Ramo SUBSEGOP	Desenvolvimento e disseminação de metodologias e ferramentas de produtividade adaptadas à realidade do ramo SUBSEGOP, cobrindo duas dimensões complementares. A primeira, de natureza tecnológica, abrange ferramentas de gestão de tarefas e acompanhamento de prazos e de organização e proteção da agenda de trabalho, com seleção orientada pelas restrições orçamentárias do órgão e pelo nível de maturidade tecnológica atual, priorizando soluções acessíveis e de fácil adoção. A segunda, de natureza metodológica, abrange a condução estruturada de reuniões e o registro padronizado de decisões e encaminhamentos, por meio de instrumentos como roteiro de pauta, definição de papéis e modelo de ata. As metodologias são adaptadas ao contexto operacional e hierárquico da Secretaria, garantindo aderência à rotina dos setores sem gerar sobrecarga de implantação. Produto do DDO/ICTDEC com atuação transversal.	Tarefas se perdem, prazos são descumpridos por falta de visibilidade e reuniões não geram registro de decisões acionáveis. Esse padrão compromete a coordenação entre setores e reduz a capacidade de entrega da estrutura como um todo. A causa central é a ausência de metodologias e ferramentas mínimas compartilhadas para a gestão da rotina de trabalho: cada gestor organiza suas demandas com critérios próprios, o que torna a colaboração mais custosa e o acompanhamento de compromissos entre setores praticamente inviável. Contribui para esse cenário a inexistência de orientação institucional sobre quais ferramentas adotar e como utilizá-las dentro das restrições orçamentárias do órgão.	17	d517f36c-2a4a-41c4-85e1-3db59c7ca101	2026-03-17 15:11:29.77775+00	2026-03-17 15:11:29.77775+00	Guia de ferramentas e metodologias elaborado e disponibilizado aos setores\nPercentual de gestores que adotaram ao menos 1 ferramenta padronizada após o ciclo de disseminação\nAvaliação qualitativa de melhoria na coordenação e registro de decisões entre ciclos	{Gestão/Governança,Inovação}	\N	\N	\N
\.


--
-- Data for Name: entregas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entregas (id, projeto_id, nome, descricao, dependencias_criticas, data_final_prevista, status, motivo_status, created_at, updated_at, criterios_aceite, orgao_responsavel_setor_id, responsavel_entrega_id, data_inicio) FROM stdin;
14	4	Seleção do corpo docente para o bloco principal	Após definição do modelo, realização de contato com os especialistas que ministrarão cada módulo ou tópico. Cada docente receberá o tópico correspondente, a justificativa pedagógica e o perfil do aluno.	Disponibilidade de tempo para captar parceiros dispostos a participar do projeto com as limitações financeiras atuais para remuneração dos docentes.\nContinuidade do quadro que está participando do projeto.	2026-04-30	aberta	Aguardando avaliação do CEPEDEC e Maj BM Wellington	2026-03-16 12:01:02.220561+00	2026-03-16 12:43:50.644386+00	Entrega ao diretor do ICTDEC de documento que formalize compromisso dos docentes com a aplicação de suas disciplinas.	\N	\N	\N
11	4	Montagem dos materiais de apoio do bloco principal	Desenvolvimento dos materiais de apoio para os módulos do bloco obrigatório: planos de aula, apresentações, casos práticos e exercícios. O bloco é pré-requisito para qualquer outro bloco e define o nível de referência conceitual do curso	Tempo reservado para a equipe desenvolver o material.\nApoio financeiro para a aquisição de artefatos ou serviços eventualmente necessários para produção do material de apoio.	\N	aberta	Aguardando avaliação do CEPEDEC e Maj BM Wellington	2026-03-16 11:14:01.362622+00	2026-03-16 11:28:51.331356+00	Aceite do diretor do ICTDEC de todo o material de apoio para o bloco principal.	\N	\N	\N
4	2	Apresentação da palestra para todos os setores	Apresentação no auditório A do QCG para todos os órgãos da estrutura da SUBSEGOP	Apoio do Secretário;\nDisponibilização de estrutura física e material necessário para realizar o encontro;	2026-03-31	em_andamento	Aguardando sistematização do estudo de percepção pelo CEPEDEC.	2026-03-12 15:09:18.977537+00	2026-03-12 19:55:34.425154+00	Apresentação realizada com todos os setores, pesquisa de opinião respondida e devolutiva do estudo de percepção.	\N	\N	\N
5	3	Entrega da arquitetura e modelo ideal	Estudo de modelos possíveis de construção da rede e análise de riscos para apresentação ao diretor do ICTDEC. 	Tempo disponível para os envolvidos desenvolverem o estudo e o relatório. 	\N	aberta	Aguardando confecção do relatório. 	2026-03-12 18:41:29.719667+00	2026-03-15 21:47:52.532885+00	Apresentação de relatório com modelos possíveis e análise de riscos para cada modelo\nDecisão do Diretor sobre qual modelo apresentar à SUOP para aprovação.	\N	\N	\N
12	4	 Montagem dos materiais de apoio dos blocos de especialização	Desenvolvimento dos materiais para os quatro blocos de especialização. Pode ocorrer em paralelo com a montagem do material do bloco principal, distribuindo a carga entre diferentes docentes participantes do projeto.	Tempo reservado para a equipe desenvolver o material.\nApoio financeiro para a aquisição de artefatos ou serviços eventualmente necessários para produção do material de apoio.	\N	aberta	Aguardando avaliação do CEPEDEC e Maj BM Wellington	2026-03-16 11:29:15.374097+00	2026-03-16 11:33:36.168125+00	Aceite do diretor do ICTDEC de todo o material de apoio para os blocos de especialização.	\N	\N	\N
10	4	Definição do Modelo de Governança Acadêmica do Curso	Definir o modelo institucional que regerá a criação, execução e continuidade do GEGIRD-RJ: como o curso se relaciona com docentes e instituições parceiras, como o conteúdo é produzido e atualizado, e como a qualidade é assegurada ao longo do tempo. O modelo deve ser viável dentro das limitações operacionais e orçamentárias da SEDEC-RJ, sustentável no longo prazo sem depender de arranjos informais, e robusto o suficiente para garantir padrão de qualidade mesmo com a rotatividade natural do efetivo.	Disponibilidade de agenda com o diretor do ICTDEC para definição do modelo\nDisponibilidade de agenda com alta gestão para definição do modelo	2026-04-15	aberta	Aguardando avaliação do CEPEDEC e do Maj BM Wellington Silva	2026-03-16 11:03:07.592103+00	2026-03-16 12:43:27.982787+00	Aprovação da proposta de modelo pelo Diretor do ICTDEC\nAprovação da proposta de modelo pela SEDEC.	\N	\N	\N
16	4	Revisão da Ementa e Preparação para Expansão	Com base nos dados coletados durante o piloto, revisar ementa, materiais e grade. Paralelamente, iniciar a preparação do modelo de expansão para outros estados, identificando quais tópicos requerem adaptação e quais são universalmente aplicáveis.	Primeira edição de todos os blocos do curso já rodados.\nColeta qualificada de dados durante o piloto.	\N	aberta	\N	2026-03-16 12:49:20.096443+00	2026-03-16 12:55:36.892939+00	Ementa e estratégia de expansão do curso apresentadas ao Diretor do ICTDEC.	\N	\N	\N
15	4	Edição-Piloto (Turma Interna SEDEC-RJ)	Primeira turma do curso focada em público interno. O piloto de cada bloco pode ser feito em momentos diferentes. No entanto, é preferível que sejam feitos de forma contínua.	Disponibilidade de pessoal da SEDEC para inscrição e participação nos horários das aulas.	\N	aberta	\N	2026-03-16 12:46:51.911171+00	2026-03-16 12:57:54.305462+00	Disponibilização de vagas para inscrição do público interno no curso	\N	\N	\N
18	6			\N	\N	aberta	\N	2026-03-16 14:21:13.272848+00	2026-03-16 14:21:13.272848+00	\N	\N	\N	\N
6	4	Proposta de programa do curso para avaliação da alta gestão	Criação de uma proposta de ementa para o curso que alcance os objetivos previstos. Essa proposta deve ser acompanhada de uma apresentação clara e concisa do projeto para exposição à alta gestão.	\N	2026-03-31	em_andamento	Em fase de acabamento da minuta do programa. Aguardando retorno do Maj BM Wellington e TC Marcelo Vieira. 	2026-03-12 19:29:42.854727+00	2026-03-20 11:42:33.625091+00	Proposta e apresentação entregues e aprovadas pelo diretor do ICTDEC.	4	afa77fdd-8bd3-4d6b-aef7-9b40876aaf47	\N
20	21	Elaboração do Caderno de Indicadores Estratégicos	Elaboração do Caderno de Indicadores Estratégicos do ramo SUBSEGOP, complementando a arquitetura do Plano Estratégico 2024–2035 com a formalização das métricas de acompanhamento de cada objetivo estratégico. Para cada indicador são definidos: conceituação, fórmula de cálculo, fonte de dados, responsável pela coleta, periodicidade de aferição e metas por ciclo.	\N	\N	aberta	\N	2026-03-17 14:19:53.362371+00	2026-03-17 14:19:53.362371+00	Caderno elaborado, validado pela SUOP/SUBSEGOP e publicado como Caderno II do Plano Estratégico\nTodos os dez objetivos estratégicos com ao menos um indicador definido, com fonte de dados viável e responsável designado\nCaderno utilizado como referência nas primeiras reuniões de análise crítica do ciclo 2026	\N	\N	\N
21	21	Desenvolvimento de painel de monitoramento de indicadores estratégicos	A Secretaria precisará de ferramenta para acompanhamento dos indicadores, com vistas a identificar necessidades de ajustes de rotas.	Pessoal técnico para desenvolvimento do painel\nTempo disponível para desenvolvimento\nPossibilidade de hospedagem na DGTI	\N	aberta	\N	2026-03-17 14:26:26.119956+00	2026-03-17 14:26:26.119956+00	Painel desenvolvido e entregue para utilização do órgão de acompanhamento estratégico (DAEAD/ICTDEC)	\N	\N	\N
22	21	Elaboração de metodologia de priorização de ações estratégicas para o ano corrente	Elaboração de metodologia técnica que estabeleça critérios objetivos e ponderados para seleção e priorização de ações estratégicas no ciclo anual de planejamento. Inclui definição de critérios (transversalidade, potencial transformador, viabilidade, alinhamento ao Plano Estratégico), instrumentos de aplicação e registro da fundamentação das escolhas. Serve de base procedimental para os ciclos subsequentes, conferindo maior transparência e consistência técnica às decisões.	Revisão e aprovação pela SUOP, SUBSEGOP e SEDEC	2026-02-15	resolvida	\N	2026-03-17 14:37:09.286357+00	2026-03-17 14:43:17.726372+00	Metodologia documentada, validada e aprovada pela SUOP/SUBSEGOP\nMetodologia publicada e aplicada no ciclo de priorização 2026\nAdesão da secretaria à metodologia durante o ano\nNota de priorização publicada em boletim ostensivo da SEDEC/CBMERJ	\N	\N	\N
23	21	Desenvolvimento e publicação de modelo de nota padrão	Desenvolvimento e publicação de modelo de nota padrão para os órgãos do ramo SUBSEGOP. Ela deve conduzir os setores a fazer o enquadramento de suas iniciativas conforme o enquadramento estratégico e as prioridades para o ano corrente.	Revisão e aceite da SUBSEGOP	2026-03-31	em_andamento	\N	2026-03-17 14:54:13.55605+00	2026-03-17 14:54:13.55605+00	Modelo de nota padrão publicado em boletim ostensivo da SEDEC/CBMERJ	\N	\N	\N
\.


--
-- Data for Name: atividades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.atividades (id, entrega_id, nome, descricao, created_at, updated_at, data_prevista, status, motivo_status, responsavel_atividade_id) FROM stdin;
8	6	Criação da 2ª versão da minuta	Criação da primeira versão da minuta para análise e revisão técnica do CEPEDEC e da DFPC/ICTDEC	2026-03-12 19:46:34.329494+00	2026-03-17 13:40:57.056239+00	2026-03-11	resolvida	Apresentada para os revisores	\N
17	22	Reunião para definição de metodologia e lista preliminar de ações estratégicas prioritárias	Reunião entre ICTDEC e CEPEDEC para definição de metodologia e lista preliminar de ações estratégicas prioritárias	2026-03-17 14:42:12.685205+00	2026-03-17 14:43:45.756071+00	2025-12-16	resolvida	\N	\N
18	22	Reunião para apresentação de metodologia e lista preliminar	Reunião com SUOP e SUBSEGOP para apresentação de metodologia e lista propostas	2026-03-17 14:45:41.560211+00	2026-03-17 14:45:41.560211+00	2026-01-15	resolvida	\N	\N
6	4	Reunião de brainstorm para desenvolvimento de metodologia da palestra	Discussão sobre caminhos possíveis e técnicas a serem utilizadas	2026-03-12 15:30:18.892162+00	2026-03-12 15:30:18.892162+00	2026-01-14	resolvida	\N	\N
19	22	Publicação de nota com ações estratégicas prioritárias	Publicação de nota SUBSEGOP com ações estratégicas prioritárias	2026-03-17 14:46:47.259415+00	2026-03-17 14:46:47.259415+00	2026-02-12	resolvida	\N	\N
20	23	Desenvolvimento de minuta	Avaliação de aspectos necessários no conteúdo padronizado das notas para atingimento do objetivo da entrega.	2026-03-17 14:56:02.502562+00	2026-03-17 14:56:02.502562+00	2026-01-13	resolvida	\N	\N
9	6	Criação da 1ª versão da minuta	Reunião de brainstorm e apresentação do esboço do programa do curso.	2026-03-12 19:51:07.848899+00	2026-03-12 19:51:07.848899+00	2026-02-12	resolvida	Participação da ESDEC, CEPEDEC e ICTDEC	\N
21	23	Publicação do modelo de nota	Publicação em boletim ostensivo do modelo de nota	2026-03-17 14:58:15.43698+00	2026-03-17 14:58:15.43698+00	2026-03-30	em_andamento	Minuta ainda não encaminhada	\N
11	4	Sistematização do estudo de percepção	Sistematização da pesquisa de opinião rodada após o evento "Nosso papel na missão" com o objetivo de dar feedback aos participantes e estimular iniciativas nos setores, com base nos resultados.	2026-03-15 13:47:28.771007+00	2026-03-15 13:47:28.771007+00	2026-03-30	aberta	Aguardando sistematização pelo CEPEDEC	\N
7	5	Brainstorming e gestão de riscos	Reunião para avaliar modelos possíveis e riscos envolvidos	2026-03-12 18:42:50.294273+00	2026-03-15 21:49:37.133283+00	2026-03-30	aberta	\N	\N
13	14	Visita	Visita a parceiro	2026-03-16 12:44:46.344254+00	2026-03-16 12:44:46.344254+00	2026-04-08	aberta	\N	\N
12	10	Reunião para Definição do Modelo de Governança Acadêmica do Curso	Definir o modelo institucional que regerá a criação, execução e continuidade do GEGIRD-RJ: como o curso se relaciona com docentes e instituições parceiras, como o conteúdo é produzido e atualizado, e como a qualidade é assegurada ao longo do tempo. O modelo deve ser viável dentro das limitações operacionais e orçamentárias da SEDEC-RJ, sustentável no longo prazo sem depender de arranjos informais, e robusto o suficiente para garantir padrão de qualidade mesmo com a rotatividade natural do efetivo.	2026-03-16 11:55:43.506972+00	2026-03-16 12:45:54.341508+00	2026-04-01	aberta	Aguardando avaliação do CEPEDEC e do Maj BM Wellington Silva	\N
10	6	Revisão técnica e finalização da minuta	Revisão técnica e finalização da minuta com proposta de apresentação	2026-03-12 19:54:00.710828+00	2026-03-17 11:52:14.272195+00	2026-03-27	em_andamento	Aguardando revisão do TC Marcelo Vieira e Maj Wellington Silva. Deve ser entregue às 8:00h para dar tempo de ser revisada ainda no mesmo dia.	\N
\.


--
-- Data for Name: atividade_participantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.atividade_participantes (id, atividade_id, setor_id, tipo_participante, papel, created_at) FROM stdin;
10	6	17	setor	Líder	2026-03-12 15:30:19.300003+00
11	6	4	setor	Participante	2026-03-12 15:30:19.300003+00
12	8	17	setor	Criação	2026-03-12 19:49:38.853458+00
15	10	17	setor	Maj BM Wellington	2026-03-15 13:28:08.577334+00
16	10	4	setor	TC BM Marcelo Vieira	2026-03-15 13:28:08.577334+00
23	17	17	setor	Condução	2026-03-17 14:43:46.234628+00
24	17	4	setor	Desenvolvimento	2026-03-17 14:43:46.234628+00
25	17	13	setor	Desenvolvimento	2026-03-17 14:43:46.234628+00
26	18	17	setor	Apresentação do material	2026-03-17 14:45:41.888716+00
27	18	24	setor	Decisão e ajustes	2026-03-17 14:45:41.888716+00
28	18	23	setor	Decisão e ajustes	2026-03-17 14:45:41.888716+00
29	21	17	setor	Encaminhamento de minuta, via SEI	2026-03-17 14:58:15.788952+00
30	21	23	setor	Publicação da nota	2026-03-17 14:58:15.788952+00
\.


--
-- Data for Name: entrega_participantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entrega_participantes (id, entrega_id, setor_id, tipo_participante, papel, created_at) FROM stdin;
12	4	17	setor	Construção de metodologia dos planos setoriais, da apresentação e execução	2026-03-12 19:55:34.800199+00
13	4	4	setor	Sistematização do estudo de percepção	2026-03-12 19:55:34.800199+00
15	5	4	setor	Realizar o estudo de modelos e análise de riscos	2026-03-15 21:47:53.380007+00
27	11	17	setor	Desenvolvimento do material	2026-03-16 11:28:51.765467+00
28	11	4	setor	Desenvolvimento do material	2026-03-16 11:28:51.765467+00
29	11	13	setor	Desenvolvimento do material	2026-03-16 11:28:51.765467+00
30	12	17	setor	Desenvolvimento do material	2026-03-16 11:33:36.696664+00
31	12	4	setor	Desenvolvimento do material	2026-03-16 11:33:36.696664+00
32	12	13	setor	Desenvolvimento do material	2026-03-16 11:33:36.696664+00
42	10	17	setor	Busca de parceiros	2026-03-16 12:43:28.608147+00
43	10	4	setor	Busca de parceiros	2026-03-16 12:43:28.608147+00
44	10	13	setor	Busca de parceiros	2026-03-16 12:43:28.608147+00
45	14	17	setor	Captação de corpo docente	2026-03-16 12:43:51.003557+00
46	14	4	setor	Captação de corpo docente	2026-03-16 12:43:51.003557+00
47	14	13	setor	Captação de corpo docente	2026-03-16 12:43:51.003557+00
49	15	13	setor	Operacionalização do curso	2026-03-16 12:57:54.64352+00
56	20	17	setor	Desenvolvimento da minuta do caderno	2026-03-17 14:19:53.541744+00
57	20	23	setor	Revisão e aprovação do material	2026-03-17 14:19:53.541744+00
58	20	24	setor	Coordenação dos esforços para definição dos fluxos e responsáveis pela coleta de dados nos órgãos subordinados	2026-03-17 14:19:53.541744+00
59	20	19	setor	Designação de responsáveis por coleta de dados e revisão dos indicadores que dependem de seu órgão	2026-03-17 14:19:53.541744+00
60	21	17	setor	Desenvolvimento do painel	2026-03-17 14:26:26.31534+00
61	21	\N	externo_subsegop	DGTI: hospedagem da aplicação	2026-03-17 14:26:26.31534+00
70	22	17	setor	Elaboração da metodologia e construção da lista preliminar de ações prioritárias	2026-03-17 14:43:18.177349+00
71	22	4	setor	Elaboração da metodologia e construção da lista preliminar de ações prioritárias	2026-03-17 14:43:18.177349+00
72	22	24	setor	Revisão e aceite	2026-03-17 14:43:18.177349+00
73	22	23	setor	Revisão, aceite e publicação	2026-03-17 14:43:18.177349+00
74	22	13	setor	Elaboração da metodologia e construção da lista preliminar de ações prioritárias	2026-03-17 14:43:18.177349+00
75	23	17	setor	Desenvolvimento de padrão e minuta de nota	2026-03-17 14:54:13.985248+00
76	23	23	setor	Revisão, ajustes e publicação da nota	2026-03-17 14:54:13.985248+00
77	6	4	setor	Revisão técnica	2026-03-20 11:42:33.991818+00
78	6	17	setor	Liderança, orientação e revisão	2026-03-20 11:42:33.991818+00
\.


--
-- Data for Name: projeto_acoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projeto_acoes (id, projeto_id, acao_estrategica_id) FROM stdin;
19	3	2
20	3	10
21	3	12
22	3	14
23	3	15
24	3	16
25	3	17
26	3	18
27	3	30
48	7	6
49	7	8
50	7	17
51	7	19
52	7	22
55	9	19
56	9	22
59	11	6
60	11	9
61	11	17
62	12	17
63	12	26
64	12	27
65	13	3
66	13	6
67	14	17
68	14	27
69	15	2
70	15	3
72	17	30
73	18	12
74	18	22
78	20	24
79	16	7
80	8	4
81	8	6
82	2	3
83	2	4
84	2	6
85	2	17
91	21	3
92	21	12
93	21	13
94	21	17
95	21	6
96	22	6
97	22	12
98	22	17
99	6	3
100	6	4
101	6	5
102	6	6
103	6	12
104	6	17
105	4	10
106	4	6
\.


--
-- Name: atividade_participantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.atividade_participantes_id_seq', 30, true);


--
-- Name: atividades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.atividades_id_seq', 21, true);


--
-- Name: entrega_participantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entrega_participantes_id_seq', 78, true);


--
-- Name: entregas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entregas_id_seq', 23, true);


--
-- Name: projeto_acoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projeto_acoes_id_seq', 106, true);


--
-- Name: projetos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projetos_id_seq', 22, true);


--
-- Name: setores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.setores_id_seq', 30, true);


--
-- PostgreSQL database dump complete
--

\unrestrict wDGmPhXBql9PE5Wbloi9nuUjU3Iucb5cBRttFxan1Y4AklhIQFR0RBQIUS9bZSW

