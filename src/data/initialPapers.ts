import { Paper } from '../types';

export const INITIAL_PAPERS: Paper[] = [
  {
    id: "scope-fin",
    slug: "scope-fin",
    title: "SCOPE-Fin: Budget-Aware Orchestration of Retrieval, Quantitative Reasoning, and Risk Triage for Financial Research",
    subtitle: "A Selective-Routing Framework and Evaluation Protocol",
    journalTitle: "Journal of Financial Artificial Intelligence",
    issn: "2984-5120",
    volume: 1,
    issue: 1,
    firstPage: 1,
    lastPage: 9,
    publishedDate: "2026-10-01",
    doi: "10.59281/jfai.2026.1.1.001",
    category: "Financial Intelligence & Adaptive RAG",
    articleType: "Research Article",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    authors: [
      {
        name: "Xiang Zhang",
        affiliation: "College of Computer Science, Sichuan University, Chengdu 610065, China",
        email: "2024324022023@stu.scu.edu.cn",
        isCorresponding: true,
        orcid: "0009-0004-8192-3810"
      }
    ],
    abstract: "Financial research assistants face heterogeneous requests: some need a single fact lookup, others require multi-document synthesis, numerical calculation, or temporal transaction analysis. Applying the most expensive model to every request wastes computation, while routing every request through a lightweight model risks inaccurate or unsupported answers. This paper proposes SCOPE-Fin (Selective Cost-aware Orchestration for Processing Evidence in Finance), a framework that selects specialist reasoning routes according to task type, expected information gain, evidence quality, and a per-request budget. Its route library combines direct retrieval, multi-hop financial RAG, symbolic numerical execution, and temporal risk scoring; a quality-cost gate either accepts a supported draft, invokes another route, or escalates the case for analyst review. The design synthesizes ideas from three supplied papers on blockchain anomaly detection, financial document QA, and modular mathematical reasoning, but shifts the research question from evidence integration to selective allocation of computation and human attention. We formalize the routing objective, define a benchmark-based evaluation protocol, and state testable hypotheses concerning answer quality, cost, and review burden. A heatmap summarizes the ablation values reported in the supplied FinLLaMA-RAG preprint as contextual evidence only. This manuscript reports no new SCOPE-Fin experiments; source-reported values are not presented as results for the proposed framework. The intended use is analyst decision support, with explicit escalation for uncertain or high-impact cases.",
    keywords: [
      "financial research",
      "adaptive routing",
      "computational budget",
      "retrieval-augmented generation",
      "symbolic reasoning",
      "human-AI collaboration",
      "selective prediction"
    ],
    pdfFileName: "scope-fin.pdf",
    pdfUrl: "/pdf/scope-fin.pdf",
    pdfSize: "9.8 KB",
    status: "published",
    metrics: {
      views: 482,
      downloads: 194,
      citations: 2
    },
    sections: [
      {
        id: "sec-1",
        title: "1 Introduction",
        content: [
          "Financial research systems are asked to perform tasks with very different computational demands. Looking up a dated disclosure may require only targeted retrieval, while reconciling values across a report may need multiple retrieval hops and executable arithmetic. A transaction-risk question can instead require temporal modeling over a sequence of events. Treating all of these requests as one generic text-generation problem can spend computation on easy cases and under-serve difficult ones.",
          "Retrieval-augmented generation (RAG) provides a way to condition model output on external documents [5]. Financial QA benchmarks such as FinQA and TAT-QA illustrate that answering questions over reports can involve both numerical operations and mixed text-table evidence [6, 7]. Meanwhile, blockchain transaction analysis involves different inputs and objectives: methods such as the Elliptic graph-learning work and the uploaded GAM-CoT paper focus on identifying suspicious temporal or relational patterns [4, 1]. A single pipeline is unlikely to be the most economical route for every task.",
          "This paper proposes SCOPE-Fin, a selective orchestration framework for a financial research assistant. It uses a task profiler to estimate the request type and difficulty, a policy to choose a subset of specialist routes, and a quality-cost gate to decide whether to stop, spend more computation, or request human review. The route library draws on the three supplied papers: temporal risk scoring from GAM-CoT [1], multi-hop retrieval and context fusion from the FinLLaMA-RAG preprint [2], and modular symbolic-neural problem decomposition from MetaMath-LLaMA [3]. In contrast to a fixed end-to-end workflow, SCOPE-Fin makes resource allocation and escalation policy the central design questions.",
          "The proposed work makes four contributions: (1) It formulates financial assistant routing as a constrained decision problem over answer quality, computation cost, and human-review effort. (2) It defines four specialist routes and a quality-cost gate that can add analysis selectively instead of invoking every tool on every request. (3) It specifies an evaluation protocol that measures quality at matched compute budgets, including selective accuracy and analyst review burden. (4) It separates the proposal from prior reported data: the included ablation visualization transcribes a supplied paper's table and does not claim a SCOPE-Fin result."
        ]
      },
      {
        id: "sec-2",
        title: "2 Background and Motivation",
        content: [
          "2.1 Specialist components in financial AI: The GAM-CoT paper describes feature- and time-aware attention for transaction anomaly detection. Its target is a structured event sequence, not a general document question [1]. The FinLLaMA-RAG preprint instead describes dense retrieval, iterative multi-hop reasoning, and context aggregation for document-level financial QA [2]. MetaMath-LLaMA proposes a modular scheduler and a symbolic-neural computation path for interpretable multi-step mathematics [3]. These papers motivate complementary specialists, but their task settings do not by themselves define when a deployed assistant should pay for each route.",
          "The evaluation datasets also remain task-specific. Elliptic-style transaction labels measure transaction risk classification; FinQA and TAT-QA measure question answering over financial reports. They should not be collapsed into one score because they assess different outputs and error costs [4, 6, 7]. SCOPE-Fin therefore treats route selection as a separate, measurable layer above the task-specific models.",
          "2.2 Selective prediction and human review: Selective prediction studies systems that may withhold an answer when confidence is insufficient, trading answer coverage against risk [11]. Human-AI interaction guidance emphasizes keeping people informed about system limitations and providing a way to correct or override automated behavior [10]. SCOPE-Fin applies these ideas operationally: an answer is not accepted solely because a language model is confident; route evidence, calculation checks, and task-specific validation contribute to the stopping decision.",
          "2.3 Source-reported ablation evidence: The supplied FinLLaMA-RAG preprint reports a full-model ablation table with four metrics. Its table lists nDCG@10 of 0.62, BLEU of 30.5, ROUGE-L of 35.2, and F1 of 0.75 for the full system; its retrieval-only and generation-only rows report lower scores on each listed metric."
        ]
      },
      {
        id: "sec-3",
        title: "3 Problem Definition",
        content: [
          "Let a request be q, available evidence be x, and remaining computation budget be B. SCOPE-Fin has a finite route set R = {r0, r1, r2, r3}: direct evidence lookup, multi-hop document QA, symbolic quantitative reasoning, and temporal transaction-risk analysis. A request may invoke one route or a compatible sequence of routes. After each route, the system observes an intermediate state z_t containing retrieved evidence, operation results, estimated support, and spent cost.",
          "A policy π maps the request and current state to the next action: invoke a route, return a draft, or escalate to an analyst. We define the objective as: π* = arg max_π E_{q,x}[U(y, q, x) - λ_c C(π) - λ_h H(π)] subject to C(π) ≤ B, R_unsupported(π) ≤ δ, where U is task utility, C is computational cost, H is human-review effort, and R_unsupported is the rate of unsupported claims among accepted answers. The weights λ_c and λ_h encode deployment priorities, while δ is a pre-specified safety tolerance."
        ]
      },
      {
        id: "sec-4",
        title: "4 SCOPE-Fin Architecture",
        content: [
          "4.1 Task profiler and route library: The task profiler extracts a compact feature vector ψ(q, x): requested output type, presence of numeric operators, number of apparent source entities, temporal span, retrieval ambiguity, and impact category. It assigns a provisional route distribution, not a final answer. Each specialist returns a structured result with its inputs, output, cost, and route-specific diagnostics.",
          "Route Library Table: (1) Direct lookup: Typical trigger: One fact, known source, low ambiguity. Output: Source-linked fact or request for clarification. Cost: Low. (2) Multi-hop document QA: Typical trigger: Cross-section or cross-document synthesis. Output: Answer with retrieved passages and hop trace. Cost: Medium to high. (3) Symbolic quantitative reasoning: Typical trigger: Arithmetic, comparison, unit conversion, constraint check. Output: Executable expression and validated value. Cost: Low to medium. (4) Temporal risk analysis: Typical trigger: Ordered transaction or event sequence with risk labels. Output: Risk score and salient temporal window. Cost: Medium to high. (5) Analyst escalation: Typical trigger: Conflicting sources, insufficient support, or high-impact uncertainty. Output: Human decision, correction, or additional evidence request.",
          "4.2 Value-of-computation routing: For candidate route r at state z_t, let ΔU(r | q, z_t) estimate expected improvement in task utility, ΔC(r) estimate incremental computational cost, and ΔH(r) estimate the effect on review effort. A budget-aware decision score is V(r | q, z_t) = ΔU(r | q, z_t) - λ_c ΔC(r) - λ_h ΔH(r). The policy selects a compatible route with positive value, subject to remaining budget.",
          "4.3 Acceptance, continuation, and escalation: The gate maintains separate signals: evidence coverage, source agreement, numeric execution validity, route confidence, and impact level. A numerical answer requires a reproducible expression and unit check. A document claim requires cited source spans. A temporal score remains explicitly marked as model-derived and is not converted into a factual allegation."
        ]
      },
      {
        id: "sec-5",
        title: "5 Evaluation Protocol & Hypotheses",
        content: [
          "5.1 Tasks and datasets: The evaluation separates route quality from route-selection quality. Elliptic is used for temporal transaction-risk tasks, while FinQA and TAT-QA are used for financial numerical and text-table QA [4, 6, 7]. A new mixed-request test set is needed to evaluate routing decisions across task types.",
          "5.2 Comparators and ablations: Compare five policies: (1) low-cost single-route baseline; (2) always-on pipeline invoking every relevant specialist; (3) fixed rule-based router; (4) learned SCOPE-Fin policy; and (5) oracle policy with gold route labels.",
          "5.3 Metrics and statistical analysis: Report answer quality separately by task: execution accuracy and exact match for numerical QA, evidence-supported answer F1 for document QA, and AUPRC plus minority-class recall for transaction risk.",
          "5.4 Research questions and hypotheses: RQ1: Can SCOPE-Fin reduce computation at matched answer quality compared with an always-on specialist pipeline? RQ2: Which observable request features best predict when an additional retrieval or symbolic step changes the answer? RQ3: Does selective escalation improve supported-answer reliability without transferring excessive workload to analysts? Hypotheses H1-H3 are preregistered for testing."
        ]
      },
      {
        id: "sec-6",
        title: "6 Discussion, Limitations and Conclusion",
        content: [
          "SCOPE-Fin treats computation as an allocatable resource rather than an unlimited background service. The source-reported ablation profile suggests that combining retrieval and generation can be useful, while the route policy asks whether that combination is necessary for a given request.",
          "Limitations: Route-value estimates can be miscalibrated, and a policy may systematically under-allocate effort to unfamiliar or minority cases. Benchmarks do not capture every reporting convention, jurisdiction, or analyst workflow.",
          "Conclusion: This paper proposed SCOPE-Fin, a budget-aware routing framework for financial research tasks. It combines direct lookup, multi-hop financial RAG, symbolic quantitative execution, and temporal risk analysis, then decides whether to stop, invoke another route, or escalate to an analyst."
        ]
      }
    ],
    references: [
      "X. Huang, C. Zhao, X. Li, C. Feng, and W. Zhang, 'GAM-CoT Transformer: Hierarchical Attention Networks for Anomaly Detection in Blockchain Transactions,' Journal of Emerging Applied Artificial Intelligence, 2025.",
      "X. Huang, Z. Lin, F. Sun, W. Zhang, K. Tong, and Y. Liu, 'Enhancing Document-Level Question Answering via Multi-Hop Retrieval-Augmented Generation with LLaMA 3,' TechRxiv preprint, posted June 25, 2025, doi: 10.36227/techrxiv.175086164.45839186/v1.",
      "X. Huang, Z. Wang, X. Liu, Y. Tian, and Q. Leng, 'Towards Interpretable and Consistent Multi-Step Mathematical Reasoning in Large Language Models,' manuscript provided by the authors, 2025.",
      "M. Weber, G. Domeniconi, J. Chen, D. K. I. Weidele, C. Bellei, T. Robinson, and C. E. Leiserson, 'Anti-Money Laundering in Bitcoin: Experimenting with Graph Convolutional Networks for Financial Forensics,' arXiv:1908.02591, 2019.",
      "P. Lewis et al., 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,' in Advances in Neural Information Processing Systems, vol. 33, 2020.",
      "Z. Chen et al., 'FinQA: A Dataset of Numerical Reasoning over Financial Data,' in Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, pp. 3697–3711, 2021, doi: 10.18653/v1/2021.emnlp-main.300.",
      "F. Zhu, W. Lei, Y. Huang, C. Wang, S. Zhang, J. Lv, F. Feng, and T.-S. Chua, 'TAT-QA: A Question Answering Benchmark on a Hybrid of Tabular and Textual Content in Finance,' in Proceedings of the 59th Annual Meeting of ACL, pp. 3277–3287, 2021.",
      "J. Wei et al., 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models,' in Advances in Neural Information Processing Systems, vol. 35, 2022.",
      "S. Yao et al., 'ReAct: Synergizing Reasoning and Acting in Language Models,' in International Conference on Learning Representations, 2023.",
      "S. Amershi et al., 'Guidelines for Human-AI Interaction,' in Proceedings of CHI, paper 3, pp. 1–13, 2019, doi: 10.1145/3290605.3300233.",
      "Y. Geifman and R. El-Yaniv, 'Selective Classification for Deep Neural Networks,' in Advances in Neural Information Processing Systems, vol. 30, 2017."
    ]
  },
  {
    id: "trace-fin",
    slug: "trace-fin",
    title: "TRACE-Fin: Evidence-Grounded Financial Investigation with Multi-Hop Retrieval, Temporal Risk Analysis, and Symbolic Verification",
    subtitle: "A Research Framework and Evaluation Protocol",
    journalTitle: "Journal of Financial Artificial Intelligence",
    issn: "2984-5120",
    volume: 1,
    issue: 1,
    firstPage: 10,
    lastPage: 19,
    publishedDate: "2026-10-01",
    doi: "10.59281/jfai.2026.1.1.002",
    category: "Forensic Analytics & Risk Verification",
    articleType: "Research Article",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    authors: [
      {
        name: "Xiang Zhang",
        affiliation: "College of Computer Science, Sichuan University, Chengdu 610065, China",
        email: "2024324022023@stu.scu.edu.cn",
        isCorresponding: true,
        orcid: "0009-0004-8192-3810"
      }
    ],
    abstract: "Financial investigations often require analysts to connect evidence dispersed across narrative reports, tables, and time-ordered transaction records. A language model that produces a fluent answer is not sufficient: investigators also need verifiable source attribution, numerically correct calculations, sensitivity to rare suspicious behavior, and a clear indication of uncertainty. This paper proposes TRACE-Fin (Trustworthy Retrieval, Analysis, and Citation Evidence for Finance), a modular framework that combines (i) query decomposition and iterative document retrieval, (ii) temporal transaction-risk scoring with feature- and time-level attention, (iii) adaptive routing to symbolic operations for numerical claims, and (iv) claim-level evidence links with calibrated abstention. The design synthesizes multi-hop financial question answering, hierarchical temporal anomaly detection, and modular symbolic-neural reasoning, while adapting them to a single auditable investigation workflow. We define the architecture, its evidence representation, learning objectives, falsifiable hypotheses, and an evaluation protocol using separate public benchmarks for transaction classification and financial document reasoning, supplemented by a newly annotated cross-source investigation set. No new experiments are reported in this manuscript; source-paper metrics are shown only as contextual evidence and are not presented as TRACE-Fin results. The proposed protocol emphasizes temporal leakage prevention, minority-class performance, answer correctness, citation support, calibration, and operational cost. TRACE-Fin is intended as decision support for human investigators, not as an autonomous determination of criminality.",
    keywords: [
      "financial investigation",
      "retrieval-augmented generation",
      "multi-hop reasoning",
      "anomaly detection",
      "symbolic verification",
      "evidence attribution",
      "large language models"
    ],
    pdfFileName: "trace-fin.pdf",
    pdfUrl: "/pdf/trace-fin.pdf",
    pdfSize: "8.9 KB",
    status: "published",
    metrics: {
      views: 539,
      downloads: 221,
      citations: 3
    },
    sections: [
      {
        id: "sec-1",
        title: "1 Introduction",
        content: [
          "Financial investigations are evidence-integration problems. An analyst may need to identify a transaction pattern, locate a related explanation in a report, combine values from a table, and explain how each source supports a conclusion. These tasks span different representations and time scales. The growth of public blockchain data, for example, enables transaction-level analysis but does not remove challenges such as pseudonymous entities, evolving behavior, and sparse illicit labels [4]. Financial reports present a complementary challenge: a question may require locating both a textual statement and one or more table cells before performing arithmetic [6, 7].",
          "Recent language models and retrieval-augmented generation (RAG) systems can retrieve external material and synthesize answers, but grounding alone does not ensure that each claim follows from its cited evidence or that a calculation is correct [5]. Multi-hop retrieval can connect information across sections and documents, while explicit reasoning tools can improve the handling of multi-step tasks [2, 8]. For financial use, such systems must also distinguish a model-generated risk signal from verified evidence and must expose uncertainty rather than convert incomplete information into an unqualified accusation.",
          "This paper develops TRACE-Fin, a proposed framework for auditable financial investigation. Its design draws on three uploaded papers: Huang et al.'s GAM-CoT Transformer for temporal blockchain anomaly detection [1]; Huang et al.'s multi-hop LLaMA 3 RAG design for document-level question answering [2]; and Huang et al.'s MetaMath-LLaMA proposal for modular, interpretable multi-step reasoning with symbolic-neural components [3].",
          "The paper makes four contributions: (1) It specifies a modular workflow that links transaction sequences, financial documents, and answer-level evidence without treating any one signal as proof of wrongdoing. (2) It defines a typed evidence ledger and a symbolic verification path for numerical and relational claims. (3) It proposes evaluation questions, baselines, metrics, and leakage controls suitable for testing each component and the integrated system. (4) It distinguishes the proposed system from empirical findings: the present manuscript reports no newly run experiments and introduces no fabricated benchmark scores."
        ]
      },
      {
        id: "sec-2",
        title: "2 Related Work and Design Foundations",
        content: [
          "2.1 Temporal transaction analysis: Blockchain AML research has studied both transaction-level classification and graph-based forensic methods. The Elliptic dataset provides time-indexed Bitcoin transaction data and has supported comparative study of conventional and graph-learning approaches [4]. The uploaded GAM-CoT paper proposes a Global Attention Module (GAM) to reweight feature channels and time steps, together with a contextual block for short-range temporal dependencies [1].",
          "2.2 Financial RAG and multi-hop retrieval: RAG combines a language model with non-parametric retrieved evidence, improving access to updateable external knowledge and supporting attribution to retrieved passages [5]. Financial QA benchmarks such as FinQA and TAT-QA test questions over financial reports, including numerical reasoning over text and tables [6, 7].",
          "2.3 Modular and symbolic reasoning: Chain-of-thought prompting established a widely studied approach for eliciting intermediate reasoning steps, but a textual reasoning trace alone does not guarantee the validity of a conclusion [8]. Tool-using approaches such as ReAct interleave reasoning and actions [9].",
          "2.4 Reported baseline comparison in the GAM-CoT source study: The uploaded GAM-CoT paper reports a comparison of six classifiers on its blockchain transaction task. GAM-CoT has the highest reported recall (0.932) and F1 score (0.936) among the listed models, while Random Forest has higher reported precision (0.965 versus 0.939)."
        ]
      },
      {
        id: "sec-3",
        title: "3 Problem Formulation",
        content: [
          "Let an investigation request be q. The available evidence consists of a document collection D = {dj}, transaction sequences X = {Xi}, and optional structured tables T = {Tk}. A system response is a set of answer claims A = {am} accompanied by a support ledger E = {(am, em, vm)}, where em identifies the supporting evidence and vm records validation status.",
          "We define the task as producing a response that jointly optimizes answer utility, source support, calculation validity, and calibrated uncertainty: max_A [U(A, q) - λ_u U_unsupported(A) - λ_c C_invalid(A) - λ_a C_abstain(A)], where U measures task usefulness, U_unsupported penalizes unsupported claims, C_invalid penalizes invalid calculations or constraints, and C_abstain captures the cost of withholding an answer when adequate evidence exists."
        ]
      },
      {
        id: "sec-4",
        title: "4 TRACE-Fin Framework Architecture",
        content: [
          "4.1 Architecture overview: TRACE-Fin has five cooperating modules: an evidence normalizer, an investigation planner, a temporal risk encoder, a multi-hop retriever, and a verifier with a response composer. Evidence identifiers persist from ingestion through the final answer.",
          "4.2 Evidence normalization and planning: Each ingested item receives a stable identifier and typed metadata: source name, source location, timestamp or reporting period, entity identifiers, unit (if numeric), and extraction confidence. The planner maps a query to a set of typed subquestions Q = {q1, ..., qs} and selects required operations O.",
          "4.3 Temporal transaction-risk encoder: For transaction entity i, let Xi in R^{L x F} denote a sequence of L observations and F features. A projection gives Hi = Xi We. To express global feature relevance and time-step relevance separately, TRACE-Fin defines gates gf = sigma(Wf meant(Hi,t) + bf), gt = sigma(Hi wt + bt), and composite gated representations with grouped temporal convolution.",
          "4.4 Multi-hop retrieval and context fusion: The retriever ranks candidate passages using a hybrid score combining lexical and semantic relevance: s(q, d) = alpha s_lex(q, d) + (1-alpha) cos(q, d). Normalized weights beta_j = exp(s_j/tau) / sum_k exp(s_k/tau) guide context fusion.",
          "4.5 Symbolic verification and claim-level support: The verifier decomposes a draft response into atomic claims typed as factual, numerical, temporal, relational, or model-derived. Support state vm in {supported, partially-supported, contradicted, unverified}.",
          "4.6 Training objective: L = lambda_r L_retrieval + lambda_g L_generation + lambda_t L_transaction + lambda_v L_verification."
        ]
      },
      {
        id: "sec-5",
        title: "5 Research Questions and Hypotheses",
        content: [
          "RQ1: Does feature- and time-aware temporal modeling improve illicit-class recall at a fixed false-positive rate over non-sequential baselines?",
          "RQ2: Does iterative, coverage-guided retrieval improve evidence recall and citation support over one-hop retrieval?",
          "RQ3: Does symbolic checking reduce arithmetic and unit errors relative to direct language-model generation?",
          "RQ4: Does the integrated workflow improve supported-answer quality without imposing unacceptable latency or excessive abstention?",
          "Hypotheses H1-H3 are preregistered for testing against Elliptic, FinQA, and TAT-QA benchmarks with strict leakage controls."
        ]
      },
      {
        id: "sec-6",
        title: "6 Expected Contributions, Limitations and Conclusion",
        content: [
          "TRACE-Fin is expected to make financial QA research more measurable by treating answer correctness, source support, numerical validity, risk ranking, and abstention as distinct outcomes.",
          "Limitations: Transaction labels can be incomplete or delayed; document extraction can introduce errors; citations do not guarantee entailment; and a temporal anomaly score is not proof of criminal conduct.",
          "Conclusion: TRACE-Fin provides a rigorous framework for evidence-grounded financial investigation. The next step is empirical testing across cross-source evaluation sets."
        ]
      }
    ],
    references: [
      "X. Huang, C. Zhao, X. Li, C. Feng, and W. Zhang, 'GAM-CoT Transformer: Hierarchical Attention Networks for Anomaly Detection in Blockchain Transactions,' Journal of Emerging Applied Artificial Intelligence, 2025.",
      "X. Huang, Z. Lin, F. Sun, W. Zhang, K. Tong, and Y. Liu, 'Enhancing Document-Level Question Answering via Multi-Hop Retrieval-Augmented Generation with LLaMA 3,' TechRxiv preprint, posted June 25, 2025, doi: 10.36227/techrxiv.175086164.45839186/v1.",
      "X. Huang, Z. Wang, X. Liu, Y. Tian, and Q. Leng, 'Towards Interpretable and Consistent Multi-Step Mathematical Reasoning in Large Language Models,' manuscript provided by the authors, 2025.",
      "M. Weber, G. Domeniconi, J. Chen, D. K. I. Weidele, C. Bellei, T. Robinson, and C. E. Leiserson, 'Anti-Money Laundering in Bitcoin: Experimenting with Graph Convolutional Networks for Financial Forensics,' arXiv:1908.02591, 2019.",
      "P. Lewis et al., 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,' in Advances in Neural Information Processing Systems, vol. 33, 2020.",
      "Z. Chen et al., 'FinQA: A Dataset of Numerical Reasoning over Financial Data,' in Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, pp. 3697–3711, 2021.",
      "F. Zhu, W. Lei, Y. Huang, C. Wang, S. Zhang, J. Lv, F. Feng, and T.-S. Chua, 'TAT-QA: A Question Answering Benchmark on a Hybrid of Tabular and Textual Content in Finance,' in Proceedings of the 59th Annual Meeting of ACL, pp. 3277–3287, 2021.",
      "J. Wei et al., 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models,' in Advances in Neural Information Processing Systems, vol. 35, 2022.",
      "S. Yao et al., 'ReAct: Synergizing Reasoning and Acting in Language Models,' in International Conference on Learning Representations, 2023."
    ]
  }
];

export function getLocalStoredPapers(): Paper[] {
  try {
    const raw = localStorage.getItem('jfai_local_papers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse jfai_local_papers from localStorage', e);
  }
  return INITIAL_PAPERS;
}

export function saveLocalStoredPapers(papers: Paper[]): void {
  try {
    localStorage.setItem('jfai_local_papers', JSON.stringify(papers));
  } catch (e) {
    console.warn('Failed to save jfai_local_papers to localStorage', e);
  }
}
