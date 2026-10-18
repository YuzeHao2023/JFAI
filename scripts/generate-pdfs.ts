import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createAcademicPdf(
  outputPath: string,
  meta: {
    title: string;
    subtitle?: string;
    author: string;
    affiliation: string;
    email: string;
    date: string;
    abstract: string;
    keywords: string[];
    sections: { title: string; content: string[] }[];
    references: string[];
  }
) {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 54; // 0.75 inch margin
  const pageWidth = 595.28; // A4 standard
  const pageHeight = 841.89;
  const contentWidth = pageWidth - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  let pageNumber = 1;

  function checkPageBreak(neededHeight: number) {
    if (y - neededHeight < margin + 30) {
      // Add footer to current page
      drawFooter(currentPage, pageNumber);
      pageNumber++;
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      drawHeader(currentPage);
    }
  }

  function drawHeader(page: typeof currentPage) {
    page.drawText('Journal of Financial Artificial Intelligence (JFAI) | Vol. 1, Issue 1 (2026)', {
      x: margin,
      y: pageHeight - 36,
      size: 8,
      font: timesItalic,
      color: rgb(0.35, 0.35, 0.35),
    });
    page.drawLine({
      start: { x: margin, y: pageHeight - 40 },
      end: { x: pageWidth - margin, y: pageHeight - 40 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
  }

  function drawFooter(page: typeof currentPage, num: number) {
    page.drawLine({
      start: { x: margin, y: margin + 20 },
      end: { x: pageWidth - margin, y: margin + 20 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    const pageStr = `${num}`;
    const textWidth = timesRoman.widthOfTextAtSize(pageStr, 9);
    page.drawText(pageStr, {
      x: (pageWidth - textWidth) / 2,
      y: margin + 8,
      size: 9,
      font: timesRoman,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // Header of first page
  drawHeader(currentPage);

  // Title
  const titleLines = wrapText(meta.title, timesBold, 15, contentWidth);
  for (const line of titleLines) {
    const w = timesBold.widthOfTextAtSize(line, 15);
    currentPage.drawText(line, {
      x: (pageWidth - w) / 2,
      y,
      size: 15,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 20;
  }

  if (meta.subtitle) {
    y -= 4;
    const subLines = wrapText(meta.subtitle, timesItalic, 11, contentWidth);
    for (const line of subLines) {
      const w = timesItalic.widthOfTextAtSize(line, 11);
      currentPage.drawText(line, {
        x: (pageWidth - w) / 2,
        y,
        size: 11,
        font: timesItalic,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 15;
    }
  }

  y -= 12;

  // Author
  const authorWidth = timesRoman.widthOfTextAtSize(meta.author, 11);
  currentPage.drawText(meta.author, {
    x: (pageWidth - authorWidth) / 2,
    y,
    size: 11,
    font: timesRoman,
    color: rgb(0.15, 0.15, 0.15),
  });
  y -= 15;

  // Affiliation
  const affilWidth = timesItalic.widthOfTextAtSize(meta.affiliation, 9.5);
  currentPage.drawText(meta.affiliation, {
    x: (pageWidth - affilWidth) / 2,
    y,
    size: 9.5,
    font: timesItalic,
    color: rgb(0.25, 0.25, 0.25),
  });
  y -= 14;

  // Email
  const emailWidth = timesRoman.widthOfTextAtSize(meta.email, 9);
  currentPage.drawText(meta.email, {
    x: (pageWidth - emailWidth) / 2,
    y,
    size: 9,
    font: timesRoman,
    color: rgb(0.25, 0.25, 0.25),
  });
  y -= 14;

  // Date
  const dateWidth = timesRoman.widthOfTextAtSize(meta.date, 9.5);
  currentPage.drawText(meta.date, {
    x: (pageWidth - dateWidth) / 2,
    y,
    size: 9.5,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 22;

  // Abstract Box
  const absMargin = margin + 24;
  const absWidth = contentWidth - 48;

  const absHeadWidth = timesBold.widthOfTextAtSize('Abstract', 10.5);
  currentPage.drawText('Abstract', {
    x: (pageWidth - absHeadWidth) / 2,
    y,
    size: 10.5,
    font: timesBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 16;

  const absLines = wrapText(meta.abstract, timesRoman, 9, absWidth);
  for (const line of absLines) {
    checkPageBreak(12);
    currentPage.drawText(line, {
      x: absMargin,
      y,
      size: 9,
      font: timesRoman,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 12;
  }

  y -= 8;
  const kwText = `Keywords: ${meta.keywords.join('; ')}`;
  const kwLines = wrapText(kwText, timesItalic, 8.5, absWidth);
  for (const line of kwLines) {
    checkPageBreak(12);
    currentPage.drawText(line, {
      x: absMargin,
      y,
      size: 8.5,
      font: timesItalic,
      color: rgb(0.25, 0.25, 0.25),
    });
    y -= 11;
  }

  y -= 18;

  // Sections
  for (const sec of meta.sections) {
    checkPageBreak(35);
    y -= 8;
    currentPage.drawText(sec.title, {
      x: margin,
      y,
      size: 11.5,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 16;

    for (const para of sec.content) {
      const paraLines = wrapText(para, timesRoman, 9.5, contentWidth);
      for (const line of paraLines) {
        checkPageBreak(13);
        currentPage.drawText(line, {
          x: margin,
          y,
          size: 9.5,
          font: timesRoman,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= 13;
      }
      y -= 8; // paragraph spacing
    }
  }

  // References
  if (meta.references && meta.references.length > 0) {
    checkPageBreak(35);
    y -= 10;
    currentPage.drawText('References', {
      x: margin,
      y,
      size: 12,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 16;

    for (let idx = 0; idx < meta.references.length; idx++) {
      const ref = `[${idx + 1}] ${meta.references[idx]}`;
      const refLines = wrapText(ref, timesRoman, 8.5, contentWidth);
      for (const rline of refLines) {
        checkPageBreak(11);
        currentPage.drawText(rline, {
          x: margin,
          y,
          size: 8.5,
          font: timesRoman,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 11;
      }
      y -= 5;
    }
  }

  // Final page footer
  drawFooter(currentPage, pageNumber);

  const pdfBytes = await pdfDoc.save();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Saved ${outputPath} (${pdfBytes.length} bytes, ${pageNumber} pages)`);
}

async function run() {
  const paper1 = {
    title: 'SCOPE-Fin: Budget-Aware Orchestration of Retrieval, Quantitative Reasoning, and Risk Triage for Financial Research',
    subtitle: 'A Selective-Routing Framework and Evaluation Protocol',
    author: 'Xiang Zhang',
    affiliation: 'College of Computer Science, Sichuan University',
    email: '2024324022023@stu.scu.edu.cn',
    date: 'October 2026',
    abstract:
      'Financial research assistants face heterogeneous requests: some need a single fact lookup, others require multi-document synthesis, numerical calculation, or temporal transaction analysis. Applying the most expensive model to every request wastes computation, while routing every request through a lightweight model risks inaccurate or unsupported answers. This paper proposes SCOPE-Fin (Selective Cost-aware Orchestration for Processing Evidence in Finance), a framework that selects specialist reasoning routes according to task type, expected information gain, evidence quality, and a per-request budget. Its route library combines direct retrieval, multi-hop financial RAG, symbolic numerical execution, and temporal risk scoring; a quality-cost gate either accepts a supported draft, invokes another route, or escalates the case for analyst review. The design synthesizes ideas from three supplied papers on blockchain anomaly detection, financial document QA, and modular mathematical reasoning, but shifts the research question from evidence integration to selective allocation of computation and human attention. We formalize the routing objective, define a benchmark-based evaluation protocol, and state testable hypotheses concerning answer quality, cost, and review burden.',
    keywords: [
      'financial research',
      'adaptive routing',
      'computational budget',
      'retrieval-augmented generation',
      'symbolic reasoning',
      'human-AI collaboration',
      'selective prediction',
    ],
    sections: [
      {
        title: '1 Introduction',
        content: [
          'Financial research systems are asked to perform tasks with very different computational demands. Looking up a dated disclosure may require only targeted retrieval, while reconciling values across a report may need multiple retrieval hops and executable arithmetic. A transaction-risk question can instead require temporal modeling over a sequence of events. Treating all of these requests as one generic text-generation problem can spend computation on easy cases and under-serve difficult ones.',
          'Retrieval-augmented generation (RAG) provides a way to condition model output on external documents [5]. Financial QA benchmarks such as FinQA and TAT-QA illustrate that answering questions over reports can involve both numerical operations and mixed text-table evidence [6, 7]. Meanwhile, blockchain transaction analysis involves different inputs and objectives: methods such as the Elliptic graph-learning work and the uploaded GAM-CoT paper focus on identifying suspicious temporal or relational patterns [4, 1]. A single pipeline is unlikely to be the most economical route for every task.',
          'This paper proposes SCOPE-Fin, a selective orchestration framework for a financial research assistant. It uses a task profiler to estimate the request type and difficulty, a policy to choose a subset of specialist routes, and a quality-cost gate to decide whether to stop, spend more computation, or request human review.',
        ],
      },
      {
        title: '2 Background and Motivation',
        content: [
          '2.1 Specialist components in financial AI: The GAM-CoT paper describes feature- and time-aware attention for transaction anomaly detection. Its target is a structured event sequence, not a general document question [1]. The FinLLaMA-RAG preprint instead describes dense retrieval, iterative multi-hop reasoning, and context aggregation for document-level financial QA [2]. MetaMath-LLaMA proposes a modular scheduler and a symbolic-neural computation path for interpretable multi-step mathematics [3].',
          '2.2 Selective prediction and human review: Selective prediction studies systems that may withhold an answer when confidence is insufficient, trading answer coverage against risk [11]. Human-AI interaction guidance emphasizes keeping people informed about system limitations and providing a way to correct or override automated behavior [10]. SCOPE-Fin applies these ideas operationally: an answer is not accepted solely because a language model is confident; route evidence, calculation checks, and task-specific validation contribute to the stopping decision.',
          '2.3 Source-reported ablation evidence: The supplied FinLLaMA-RAG preprint reports a full-model ablation table with four metrics. Its table lists nDCG@10 of 0.62, BLEU of 30.5, ROUGE-L of 35.2, and F1 of 0.75 for the full system; its retrieval-only and generation-only rows report lower scores on each listed metric.',
        ],
      },
      {
        title: '3 Problem Definition',
        content: [
          'Let a request be q, available evidence be x, and remaining computation budget be B. SCOPE-Fin has a finite route set R = {r0, r1, r2, r3}: direct evidence lookup, multi-hop document QA, symbolic quantitative reasoning, and temporal transaction-risk analysis.',
          'A policy pi maps the request and current state to the next action: invoke a route, return a draft, or escalate to an analyst. We define the objective as: pi* = arg max_pi E_{q,x}[U(y, q, x) - lambda_c C(pi) - lambda_h H(pi)] subject to C(pi) <= B, Runsupported(pi) <= delta, where U is task utility, C is computational cost, H is human-review effort, and Runsupported is the rate of unsupported claims among accepted answers.',
        ],
      },
      {
        title: '4 SCOPE-Fin Architecture',
        content: [
          '4.1 Task profiler and route library: The task profiler extracts a compact feature vector psi(q, x): requested output type, presence of numeric operators, number of apparent source entities, temporal span, retrieval ambiguity, and impact category. It assigns a provisional route distribution, not a final answer.',
          'Route Library includes: (1) Direct lookup: one fact, known source, low ambiguity, low cost. (2) Multi-hop document QA: cross-section or cross-document synthesis, medium to high cost. (3) Symbolic quantitative reasoning: arithmetic, comparison, unit conversion, or constraint check, low to medium cost. (4) Temporal risk analysis: ordered transaction or event sequence with risk labels, medium to high cost. (5) Analyst escalation: conflicting sources, insufficient support, or high-impact uncertainty.',
          '4.2 Value-of-computation routing: For candidate route r at state zt, let Delta U(r | q, zt) estimate expected improvement in task utility, Delta C(r) estimate incremental computational cost, and Delta H(r) estimate the effect on review effort. The score is V(r | q, zt) = Delta U - lambda_c Delta C - lambda_h Delta H.',
        ],
      },
      {
        title: '5 Evaluation Protocol and Hypotheses',
        content: [
          'The evaluation separates route quality from route-selection quality. Elliptic is used for temporal transaction-risk tasks, while FinQA and TAT-QA are used for financial numerical and text-table QA [4, 6, 7]. A new mixed-request test set is needed to evaluate routing decisions across task types.',
          'Hypothesis H1: At a pre-specified non-inferiority margin, selective routing uses less computation than the always-on policy while preserving task quality.',
          'Hypothesis H2: Routing numerical questions to symbolic execution reduces arithmetic error versus direct generation.',
          'Hypothesis H3: Escalation improves selective accuracy at matched answer coverage on mixed-request tasks.',
        ],
      },
      {
        title: '6 Discussion, Limitations and Conclusion',
        content: [
          'SCOPE-Fin treats computation as an allocatable resource rather than an unlimited background service. The approach is most useful where requests vary substantially in difficulty and where a human analyst can review the uncertain tail.',
          'Limitations: Route-value estimates can be miscalibrated, and a policy may systematically under-allocate effort to unfamiliar or minority cases. Benchmarks do not capture every reporting convention, jurisdiction, or analyst workflow.',
          'Conclusion: This paper proposed SCOPE-Fin, a budget-aware routing framework for financial research tasks. Selective orchestration should be evaluated on the quality-cost frontier and on human review burden, rather than presumed effective because specialist components perform well in isolation.',
        ],
      },
    ],
    references: [
      'X. Huang, C. Zhao, X. Li, C. Feng, and W. Zhang, "GAM-CoT Transformer: Hierarchical Attention Networks for Anomaly Detection in Blockchain Transactions," Journal of Emerging Applied Artificial Intelligence, 2025.',
      'X. Huang, Z. Lin, F. Sun, W. Zhang, K. Tong, and Y. Liu, "Enhancing Document-Level Question Answering via Multi-Hop Retrieval-Augmented Generation with LLaMA 3," TechRxiv preprint, 2025.',
      'X. Huang, Z. Wang, X. Liu, Y. Tian, and Q. Leng, "Towards Interpretable and Consistent Multi-Step Mathematical Reasoning in Large Language Models," manuscript provided by the authors, 2025.',
      'M. Weber, G. Domeniconi, J. Chen, et al., "Anti-Money Laundering in Bitcoin: Experimenting with Graph Convolutional Networks for Financial Forensics," arXiv:1908.02591, 2019.',
      'P. Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," NeurIPS, 2020.',
      'Z. Chen et al., "FinQA: A Dataset of Numerical Reasoning over Financial Data," EMNLP, pp. 3697–3711, 2021.',
      'F. Zhu et al., "TAT-QA: A Question Answering Benchmark on a Hybrid of Tabular and Textual Content in Finance," ACL-IJCNLP, pp. 3277–3287, 2021.',
      'J. Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models," NeurIPS, 2022.',
      'S. Yao et al., "ReAct: Synergizing Reasoning and Acting in Language Models," ICLR, 2023.',
      'S. Amershi et al., "Guidelines for Human-AI Interaction," CHI, pp. 1–13, 2019.',
      'Y. Geifman and R. El-Yaniv, "Selective Classification for Deep Neural Networks," NeurIPS, 2017.',
    ],
  };

  const paper2 = {
    title: 'TRACE-Fin: Evidence-Grounded Financial Investigation with Multi-Hop Retrieval, Temporal Risk Analysis, and Symbolic Verification',
    subtitle: 'A Research Framework and Evaluation Protocol',
    author: 'Xiang Zhang',
    affiliation: 'College of Computer Science, Sichuan University',
    email: '2024324022023@stu.scu.edu.cn',
    date: 'October 2026',
    abstract:
      'Financial investigations often require analysts to connect evidence dispersed across narrative reports, tables, and time-ordered transaction records. A language model that produces a fluent answer is not sufficient: investigators also need verifiable source attribution, numerically correct calculations, sensitivity to rare suspicious behavior, and a clear indication of uncertainty. This paper proposes TRACE-Fin (Trustworthy Retrieval, Analysis, and Citation Evidence for Finance), a modular framework that combines (i) query decomposition and iterative document retrieval, (ii) temporal transaction-risk scoring with feature- and time-level attention, (iii) adaptive routing to symbolic operations for numerical claims, and (iv) claim-level evidence links with calibrated abstention. The design synthesizes multi-hop financial question answering, hierarchical temporal anomaly detection, and modular symbolic-neural reasoning, while adapting them to a single auditable investigation workflow.',
    keywords: [
      'financial investigation',
      'retrieval-augmented generation',
      'multi-hop reasoning',
      'anomaly detection',
      'symbolic verification',
      'evidence attribution',
      'large language models',
    ],
    sections: [
      {
        title: '1 Introduction',
        content: [
          'Financial investigations are evidence-integration problems. An analyst may need to identify a transaction pattern, locate a related explanation in a report, combine values from a table, and explain how each source supports a conclusion. These tasks span different representations and time scales.',
          'Recent language models and retrieval-augmented generation (RAG) systems can retrieve external material and synthesize answers, but grounding alone does not ensure that each claim follows from its cited evidence or that a calculation is correct [5]. For financial use, systems must distinguish a model-generated risk signal from verified evidence and expose uncertainty rather than convert incomplete information into an unqualified accusation.',
          'This paper develops TRACE-Fin, a proposed framework for auditable financial investigation. Its design draws on three uploaded papers: Huang et al.s GAM-CoT Transformer [1]; Huang et al.s multi-hop LLaMA 3 RAG design [2]; and Huang et al.s MetaMath-LLaMA proposal [3].',
        ],
      },
      {
        title: '2 Related Work and Design Foundations',
        content: [
          '2.1 Temporal transaction analysis: Blockchain AML research has studied both transaction-level classification and graph-based forensic methods. The Elliptic dataset provides time-indexed Bitcoin transaction data [4]. The uploaded GAM-CoT paper proposes a Global Attention Module (GAM) to reweight feature channels and time steps [1].',
          '2.2 Financial RAG and multi-hop retrieval: RAG combines a language model with non-parametric retrieved evidence [5]. Financial QA benchmarks such as FinQA and TAT-QA test questions over financial reports, including numerical reasoning over text and tables [6, 7]. TRACE-Fin extends this pattern by tracking evidence coverage across hops and requiring every material answer claim to resolve to source spans.',
          '2.3 Modular and symbolic reasoning: Chain-of-thought prompting established intermediate reasoning steps [8]. Tool-using approaches such as ReAct interleave reasoning and actions [9]. TRACE-Fin adapts these ideas to select among retrieval, temporal analysis, and deterministic calculation.',
        ],
      },
      {
        title: '3 Problem Formulation',
        content: [
          'Let an investigation request be q. The available evidence consists of document collection D = {dj}, transaction sequences X = {Xi}, and optional structured tables T = {Tk}. A system response is a set of answer claims A = {am} accompanied by a support ledger E = {(am, em, vm)}, where em identifies supporting evidence and vm records validation status.',
          'The objective jointly optimizes answer utility, source support, calculation validity, and calibrated uncertainty: max_A [U(A, q) - lambda_u U_unsupported(A) - lambda_c C_invalid(A) - lambda_a C_abstain(A)].',
        ],
      },
      {
        title: '4 TRACE-Fin Framework Architecture',
        content: [
          '4.1 Architecture overview: TRACE-Fin has five cooperating modules: an evidence normalizer, an investigation planner, a temporal risk encoder, a multi-hop retriever, and a verifier with a response composer. Evidence identifiers persist from ingestion through the final answer.',
          '4.2 Evidence normalization and planning: Each ingested item receives a stable identifier and typed metadata: source name, location, timestamp, entity identifiers, and extraction confidence. The planner maps a query to typed subquestions Q and selects required operations O.',
          '4.3 Temporal transaction-risk encoder: Gating mechanisms calculate global feature relevance and time-step relevance: gf = sigma(Wf meant(Hi,t) + bf), gt = sigma(Hi wt + bt), and composite gated representations with grouped temporal convolution.',
          '4.4 Multi-hop retrieval: Candidate passages are ranked using a hybrid score s(q, d) = alpha s_lex(q, d) + (1-alpha) cos(q, d). Normalized context fusion weights beta_j = exp(s_j/tau)/Sigma exp(s_k/tau) guide multi-hop queries.',
          '4.5 Symbolic verification: Claims are decomposed and typed as factual, numerical, temporal, relational, or model-derived. Support status vm in {supported, partially-supported, contradicted, unverified}.',
        ],
      },
      {
        title: '5 Research Questions and Hypotheses',
        content: [
          'RQ1: Does feature- and time-aware temporal modeling improve illicit-class recall at a fixed false-positive rate over non-sequential baselines?',
          'RQ2: Does iterative, coverage-guided retrieval improve evidence recall and citation support over one-hop retrieval?',
          'RQ3: Does symbolic checking reduce arithmetic and unit errors relative to direct language-model generation?',
          'RQ4: Does the integrated workflow improve supported-answer quality without imposing unacceptable latency or excessive abstention?',
          'Hypotheses H1-H3 are preregistered for empirical verification with rigorous leakage control on Elliptic, FinQA, and TAT-QA benchmarks.',
        ],
      },
      {
        title: '6 Discussion, Limitations and Conclusion',
        content: [
          'TRACE-Fin treats answer correctness, source support, numerical validity, risk ranking, and abstention as distinct outcomes. If validated, its modular architecture could help investigators move from an alert to a traceable explanation while preserving the difference between model-derived risk and source-established fact.',
          'Conclusion: TRACE-Fin provides an evidence-grounded framework linking transaction sequences, financial documents, and symbolic verification into an auditable investigation workflow.',
        ],
      },
    ],
    references: [
      'X. Huang, C. Zhao, X. Li, C. Feng, and W. Zhang, "GAM-CoT Transformer: Hierarchical Attention Networks for Anomaly Detection in Blockchain Transactions," Journal of Emerging Applied Artificial Intelligence, 2025.',
      'X. Huang, Z. Lin, F. Sun, W. Zhang, K. Tong, and Y. Liu, "Enhancing Document-Level Question Answering via Multi-Hop Retrieval-Augmented Generation with LLaMA 3," TechRxiv preprint, 2025.',
      'X. Huang, Z. Wang, X. Liu, Y. Tian, and Q. Leng, "Towards Interpretable and Consistent Multi-Step Mathematical Reasoning in Large Language Models," manuscript provided by the authors, 2025.',
      'M. Weber, G. Domeniconi, J. Chen, et al., "Anti-Money Laundering in Bitcoin: Experimenting with Graph Convolutional Networks for Financial Forensics," arXiv:1908.02591, 2019.',
      'P. Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," NeurIPS, 2020.',
      'Z. Chen et al., "FinQA: A Dataset of Numerical Reasoning over Financial Data," EMNLP, 2021.',
      'F. Zhu et al., "TAT-QA: A Question Answering Benchmark on a Hybrid of Tabular and Textual Content in Finance," ACL-IJCNLP, 2021.',
      'J. Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models," NeurIPS, 2022.',
      'S. Yao et al., "ReAct: Synergizing Reasoning and Acting in Language Models," ICLR, 2023.',
      'S. Amershi et al., "Guidelines for Human-AI Interaction," CHI, 2019.',
      'Y. Geifman and R. El-Yaniv, "Selective Classification for Deep Neural Networks," NeurIPS, 2017.',
    ],
  };

  // Write to both ./pdf/ and ./public/pdf/ so both express static and vite can serve them
  const targets = [
    { out: path.resolve('./pdf/scope-fin.pdf'), meta: paper1 },
    { out: path.resolve('./public/pdf/scope-fin.pdf'), meta: paper1 },
    { out: path.resolve('./pdf/trace-fin.pdf'), meta: paper2 },
    { out: path.resolve('./public/pdf/trace-fin.pdf'), meta: paper2 },
  ];

  for (const t of targets) {
    await createAcademicPdf(t.out, t.meta);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
