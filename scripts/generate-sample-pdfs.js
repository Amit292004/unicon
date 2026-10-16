const fs = require('fs')
const path = require('path')

function buildPdf(title, subtitle, subject, semester, author, sections) {
  // Construct content stream
  let streamContent = 'BT\n'
  
  // Header: Nagaland University
  streamContent += '/F2 12 Tf\n'
  streamContent += '50 790 Td\n'
  streamContent += '(NAGALAND UNIVERSITY - CAMPUS STUDY REPOSITORY) Tj\n'
  
  // Title
  streamContent += '/F1 18 Tf\n'
  streamContent += '0 -30 Td\n'
  const safeTitle = title.replace(/[()\\]/g, '')
  streamContent += `(${safeTitle}) Tj\n`
  
  // Meta line
  streamContent += '/F2 10 Tf\n'
  streamContent += '0 -22 Td\n'
  const metaLine = `Course: ${subject}  |  Semester ${semester}  |  Contributor: ${author}`
  streamContent += `(${metaLine.replace(/[()\\]/g, '')}) Tj\n`

  // Divider / Subtitle
  streamContent += '/F2 11 Tf\n'
  streamContent += '0 -24 Td\n'
  const safeSubtitle = subtitle.replace(/[()\\]/g, '')
  streamContent += `(${safeSubtitle.slice(0, 95)}) Tj\n`

  // Sections
  let currentYDrop = -28
  for (const sec of sections) {
    streamContent += '/F1 13 Tf\n'
    streamContent += `0 ${currentYDrop} Td\n`
    streamContent += `(${sec.heading.replace(/[()\\]/g, '')}) Tj\n`
    
    streamContent += '/F2 10 Tf\n'
    for (const line of sec.lines) {
      streamContent += '0 -16 Td\n'
      streamContent += `(${line.replace(/[()\\]/g, '')}) Tj\n`
    }
    currentYDrop = -24
  }

  // Footer
  streamContent += '/F2 9 Tf\n'
  streamContent += '0 -40 Td\n'
  streamContent += '(Generated for CampusConnect - Nagaland University Academic Resource Portal) Tj\n'
  streamContent += 'ET\n'

  const streamBuffer = Buffer.from(streamContent, 'utf-8')

  // Build objects
  const header = '%PDF-1.4\n'
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n'
  const obj4Head = `4 0 obj\n<< /Length ${streamBuffer.length} >>\nstream\n`
  const obj4Foot = '\nendstream\nendobj\n'
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n'
  const obj6 = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'

  // Calculate offsets
  const part1 = Buffer.concat([
    Buffer.from(header, 'utf-8'),
    Buffer.from(obj1, 'utf-8'),
    Buffer.from(obj2, 'utf-8'),
    Buffer.from(obj3, 'utf-8'),
    Buffer.from(obj4Head, 'utf-8'),
    streamBuffer,
    Buffer.from(obj4Foot, 'utf-8'),
    Buffer.from(obj5, 'utf-8'),
    Buffer.from(obj6, 'utf-8')
  ])

  const off1 = header.length
  const off2 = off1 + obj1.length
  const off3 = off2 + obj2.length
  const off4 = off3 + obj3.length
  const off5 = off4 + obj4Head.length + streamBuffer.length + obj4Foot.length
  const off6 = off5 + obj5.length
  const xrefOffset = part1.length

  function pad(n) {
    return String(n).padStart(10, '0')
  }

  const xref = [
    'xref\n',
    '0 7\n',
    '0000000000 65535 f \n',
    `${pad(off1)} 00000 n \n`,
    `${pad(off2)} 00000 n \n`,
    `${pad(off3)} 00000 n \n`,
    `${pad(off4)} 00000 n \n`,
    `${pad(off5)} 00000 n \n`,
    `${pad(off6)} 00000 n \n`,
    'trailer\n',
    '<< /Size 7 /Root 1 0 R >>\n',
    'startxref\n',
    `${xrefOffset}\n`,
    '%%EOF\n'
  ].join('')

  return Buffer.concat([part1, Buffer.from(xref, 'utf-8')])
}

const docsDir = path.resolve(__dirname, '../public/docs/samples')
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true })
}

const sampleNotes = [
  {
    fileName: 'eng_maths_1_handbook.pdf',
    title: 'Engineering Mathematics I - Calculus & Linear Algebra',
    subtitle: 'Comprehensive study manual covering eigenvalues, Cayley-Hamilton, partial derivatives and series.',
    subject: 'Engineering Mathematics I',
    semester: 1,
    author: 'Alex Chen',
    sections: [
      {
        heading: 'Module 1: Matrix Theory and Linear Systems',
        lines: [
          '* Rank of a matrix using echelon reduction and normal forms.',
          '* Characteristic equations, Eigenvalues and Eigenvectors properties.',
          '* Cayley-Hamilton theorem and application in computing inverse matrices.'
        ]
      },
      {
        heading: 'Module 2: Differential Calculus & Taylor Expansions',
        lines: [
          '* Eulers theorem on homogeneous functions and successive differentiation.',
          '* Taylor and Maclaurin expansions for multi-variable functions.',
          '* Maxima, minima, and Lagranges method of undetermined multipliers.'
        ]
      },
      {
        heading: 'Module 3: Exam Tips & Formula Shortcuts',
        lines: [
          '* Always verify trace = sum of eigenvalues and determinant = product of eigenvalues.',
          '* For homogeneous equations AX = 0, non-trivial solutions exist if and only if det(A) = 0.'
        ]
      }
    ]
  },
  {
    fileName: 'c_programming_notes.pdf',
    title: 'Problem Solving & C Programming Fundamentals',
    subtitle: 'From pointers and dynamic memory allocation to struct alignments and file I/O operations.',
    subject: 'C Programming',
    semester: 1,
    author: 'Priya Sharma',
    sections: [
      {
        heading: 'Core Concept 1: Pointers & Pointer Arithmetic',
        lines: [
          '* Understanding l-values, r-values, and memory address operators (& and *).',
          '* Pointer arithmetic: incrementing ptr shifts by sizeof(*ptr) bytes.',
          '* Array decay and passing 2D arrays to functions using pointer to arrays.'
        ]
      },
      {
        heading: 'Core Concept 2: Dynamic Memory & Structure Padding',
        lines: [
          '* malloc vs calloc vs realloc with proper free() and dangling pointer avoidance.',
          '* Structure memory layout, boundary alignment, and packing pragmas.',
          '* Self-referential structures: foundational linked list node definitions.'
        ]
      },
      {
        heading: 'Important Exam Gotchas',
        lines: [
          '* Never return pointer to automatic local stack variable.',
          '* Always check malloc return against NULL before dereferencing.'
        ]
      }
    ]
  },
  {
    fileName: 'physics_semiconductor_optics.pdf',
    title: 'Engineering Physics - Semiconductor Physics & Laser Optics',
    subtitle: 'Band theory, Hall effect, Einsteins coefficients, and optical fiber attenuation parameters.',
    subject: 'Engineering Physics',
    semester: 2,
    author: 'Rohan Verma',
    sections: [
      {
        heading: 'Unit 1: Quantum Mechanics & Energy Bands',
        lines: [
          '* De Broglie hypothesis, Heisenberg uncertainty, and 1D time-independent Schrodinger equation.',
          '* Kronig-Penney model and formation of conduction and valence energy bands.',
          '* Direct vs indirect bandgap semiconductors and Fermi-Dirac distribution function.'
        ]
      },
      {
        heading: 'Unit 2: Lasers & Fiber Optics',
        lines: [
          '* Population inversion, stimulated emission, and resonant cavity feedback.',
          '* Numerical aperture (NA) and acceptance angle derivations for step-index fibers.',
          '* Intermodal dispersion and Rayleigh scattering attenuation mechanisms.'
        ]
      }
    ]
  },
  {
    fileName: 'basic_electronics_circuits.pdf',
    title: 'Basic Electrical & Electronics Engineering Essentials',
    subtitle: 'Kirchhoff laws, Thevenin Norton theorems, BJT biasing, and Operational Amplifiers.',
    subject: 'Basic Electronics',
    semester: 2,
    author: 'Imlirenla Jamir',
    sections: [
      {
        heading: 'Network Theorems Summary',
        lines: [
          '* Thevenin theorem: open-circuit voltage Vth and looking-in resistance Rth.',
          '* Maximum Power Transfer theorem: condition RL = Rth (or RL = Zth conjugate).',
          '* Superposition theorem applicability to linear bilateral networks.'
        ]
      },
      {
        heading: 'Semiconductor Diodes & Op-Amps',
        lines: [
          '* PN junction V-I characteristics, Zener voltage regulator breakdown mechanisms.',
          '* Ideal Op-Amp properties: infinite input impedance, zero output impedance, virtual ground.',
          '* Inverting and non-inverting amplifier closed-loop gain formulas.'
        ]
      }
    ]
  },
  {
    fileName: 'dsa_trees_and_graphs.pdf',
    title: 'Data Structures & Algorithms - Trees, Graphs & Heaps',
    subtitle: 'AVL rotations, Red-Black balancing, Dijkstra shortest path, and Disjoint Set Union.',
    subject: 'Data Structures',
    semester: 3,
    author: 'Alex Chen',
    sections: [
      {
        heading: 'Section 1: Balanced Binary Search Trees',
        lines: [
          '* AVL balance factors (-1, 0, +1): LL, RR, LR, and RL rotation mechanics.',
          '* Red-Black tree properties: root blackness, red node black children, black-height invariance.',
          '* Binary Heap: array indexing parent/left/right, heapify down/up in O(log N).'
        ]
      },
      {
        heading: 'Section 2: Graph Algorithms & Minimum Spanning Trees',
        lines: [
          '* BFS for unweighted shortest path, DFS for cycle detection and topological sort.',
          '* Dijkstras algorithm with priority queue in O((V + E) log V).',
          '* Kruskals MST using Disjoint Set Union with path compression and rank union.'
        ]
      }
    ]
  },
  {
    fileName: 'digital_logic_design.pdf',
    title: 'Digital Electronics & Finite State Machine Design',
    subtitle: 'K-map minimization, flip-flop conversions, synchronous counters, and race-around conditions.',
    subject: 'Digital Electronics',
    semester: 3,
    author: 'Rohan Verma',
    sections: [
      {
        heading: 'Combinational Logic Optimization',
        lines: [
          '* Karnaugh maps for 4 and 5 variables with don\'t care conditions.',
          '* Quine-McCluskey tabular reduction method for multiple output circuits.',
          '* Decoders, encoders, multiplexer trees, and full-adder design with NAND gates.'
        ]
      },
      {
        heading: 'Sequential Circuits & State Machines',
        lines: [
          '* JK Flip-Flop race-around elimination via Master-Slave and edge-triggering.',
          '* Excitation tables for SR, JK, D, and T flip-flops.',
          '* Mealy vs Moore state machine models and state diagram synthesis.'
        ]
      }
    ]
  },
  {
    fileName: 'os_virtual_memory_handbook.pdf',
    title: 'Operating Systems - Virtual Memory & Page Replacement',
    subtitle: 'Complete notes with diagrams on FIFO, LRU, Optimal page replacement, and TLB mechanisms.',
    subject: 'Operating Systems',
    semester: 4,
    author: 'Alex Chen',
    sections: [
      {
        heading: 'Module 1: Virtual Memory Architecture',
        lines: [
          '* Logical vs physical address translation through Multi-level Page Tables.',
          '* Translation Lookaside Buffer (TLB) hit ratios and Effective Memory Access Time (EMAT).',
          '* Page faults handling sequence: interrupt, disk swap, frame allocation, page table update.'
        ]
      },
      {
        heading: 'Module 2: Page Replacement Algorithms & Beladys Anomaly',
        lines: [
          '* FIFO algorithm demonstration of Beladys Anomaly on 3 vs 4 frames.',
          '* LRU approximation using reference bits, second-chance (clock) algorithm.',
          '* Optimal (Bélády) page replacement as theoretical benchmark.'
        ]
      },
      {
        heading: 'Module 3: Thrashing & Working Set Model',
        lines: [
          '* Thrashing definition: system spends more time paging than executing instructions.',
          '* Working-set strategy based on locality of reference parameter delta.'
        ]
      }
    ]
  },
  {
    fileName: 'dbms_normalization_guide.pdf',
    title: 'Database Management Systems - Normalization & Indexing',
    subtitle: 'Step-by-step decomposition examples with functional dependency preservation proofs.',
    subject: 'Database Systems',
    semester: 4,
    author: 'Priya Sharma',
    sections: [
      {
        heading: 'Unit 1: Functional Dependencies & Closure',
        lines: [
          '* Armstrongs Axioms: Reflexivity, Augmentation, Transitivity, and Union.',
          '* Attribute closure computation and finding candidate keys algorithm.',
          '* Canonical cover derivation for minimal functional dependency sets.'
        ]
      },
      {
        heading: 'Unit 2: Normal Forms (1NF, 2NF, 3NF, BCNF)',
        lines: [
          '* 1NF: Atomic attribute values; 2NF: No partial dependency on candidate keys.',
          '* 3NF: For X -> A, either X is superkey or A is prime attribute.',
          '* BCNF: For every non-trivial dependency X -> A, X must be a superkey.',
          '* Lossless join decomposition testing and dependency preservation criteria.'
        ]
      }
    ]
  },
  {
    fileName: 'coa_pipelining_notes.pdf',
    title: 'Computer Organization & Architecture - Pipelining & Memory Hierarchy',
    subtitle: '5-stage RISC pipeline, structural data and control hazards, forwarding, and cache mapping.',
    subject: 'Computer Architecture',
    semester: 4,
    author: 'Imlirenla Jamir',
    sections: [
      {
        heading: 'Pipeline Execution & Performance',
        lines: [
          '* Standard 5 stages: Instruction Fetch (IF), Decode (ID), Execute (EX), Memory (MEM), Writeback (WB).',
          '* Speedup calculation: S = n * k / (k + n - 1) approaching k as n becomes large.',
          '* Structural hazards (resource conflicts) and solutions with separated I-cache and D-cache.'
        ]
      },
      {
        heading: 'Data Hazards & Cache Organization',
        lines: [
          '* RAW (Read-After-Write) hazards, pipeline stalls, and hardware forwarding bypassing paths.',
          '* Direct-mapped, Fully Associative, and N-Way Set-Associative cache mapping formulas.',
          '* Cache hit time, miss penalty, and write-through vs write-back policies.'
        ]
      }
    ]
  },
  {
    fileName: 'discrete_math_guide.pdf',
    title: 'Discrete Mathematics & Graph Theory Foundations',
    subtitle: 'Propositional logic, recurrence relations, generating functions, and Euler Hamiltonian graphs.',
    subject: 'Discrete Mathematics',
    semester: 4,
    author: 'Alex Chen',
    sections: [
      {
        heading: 'Logic & Relations',
        lines: [
          '* Equivalence relations, partial orders, Hasse diagrams, and Poset lattices.',
          '* Pigeonhole principle and generalized pigeonhole applications in combinatorics.',
          '* Solving linear recurrence relations with characteristic roots.'
        ]
      },
      {
        heading: 'Graph Theory Highlights',
        lines: [
          '* Handshaking lemma: sum of degrees of all vertices equals 2 * |E|.',
          '* Planar graphs: Eulers formula V - E + F = 2 and Kuratowskis theorem (K5 and K3,3).',
          '* Euler circuits (all even vertex degrees) vs Hamiltonian cycles (NP-complete).'
        ]
      }
    ]
  },
  {
    fileName: 'daa_dp_greedy_notes.pdf',
    title: 'Design & Analysis of Algorithms - Dynamic Programming & Greedy',
    subtitle: 'Optimal substructure, memoization, 0/1 Knapsack, Bellman-Ford, and Master Theorem.',
    subject: 'Algorithms',
    semester: 5,
    author: 'Alex Chen',
    sections: [
      {
        heading: 'Asymptotic Analysis & Recurrences',
        lines: [
          '* Big-O, Omega, and Theta formal definitions with limit evaluation.',
          '* Masters theorem for divide-and-conquer recurrences T(n) = aT(n/b) + f(n).',
          '* Substitution method and recursion tree method for complex recurrences.'
        ]
      },
      {
        heading: 'Dynamic Programming Patterns',
        lines: [
          '* 0/1 Knapsack problem: 2D table state transitions vs fractional greedy approach.',
          '* Longest Common Subsequence (LCS) and Matrix Chain Multiplication optimal parenthesization.',
          '* Floyd-Warshall all-pairs shortest paths algorithm in O(V^3).'
        ]
      }
    ]
  },
  {
    fileName: 'cn_tcp_ip_guide.pdf',
    title: 'Computer Networks - TCP/IP Protocol Architecture',
    subtitle: 'IPv4 CIDR subnetting, TCP 3-way handshake, sliding window flow control, and DNS hierarchy.',
    subject: 'Computer Networks',
    semester: 5,
    author: 'Priya Sharma',
    sections: [
      {
        heading: 'Transport Layer Protocols',
        lines: [
          '* TCP 3-way handshake (SYN, SYN-ACK, ACK) and 4-way termination handshake (FIN, ACK).',
          '* TCP Congestion control: Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery.',
          '* Go-Back-N vs Selective Repeat sliding window protocols efficiency comparisons.'
        ]
      },
      {
        heading: 'Network Layer & Subnetting',
        lines: [
          '* CIDR notation, subnet mask calculations, and broadcast address derivations.',
          '* Distance Vector Routing (Bellman-Ford, Count-to-Infinity) vs Link State Routing (OSPF/Dijkstra).',
          '* NAT (Network Address Translation) and private IP ranges (RFC 1918).'
        ]
      }
    ]
  },
  {
    fileName: 'compiler_parsing_reference.pdf',
    title: 'Compiler Design - Lexical Analysis & Syntax Parsing',
    subtitle: 'NFA to DFA subset construction, LL(1) First & Follow sets, LR(0), SLR(1), and LALR parser tables.',
    subject: 'Compiler Design',
    semester: 6,
    author: 'Rohan Verma',
    sections: [
      {
        heading: 'Lexical Analysis & Regular Expressions',
        lines: [
          '* Thompsons construction of NFA from regular expressions.',
          '* Powerset subset construction for NFA to DFA conversion.',
          '* Hopcrofts DFA state minimization algorithm.'
        ]
      },
      {
        heading: 'Syntax Analysis & Parsing Tables',
        lines: [
          '* Left recursion elimination and left factoring for top-down LL(1) parsers.',
          '* Computation of First and Follow sets with formal rules.',
          '* Bottom-up LR parsing: LR(0) items, closure and goto functions, shift-reduce conflict resolution.'
        ]
      }
    ]
  },
  {
    fileName: 'software_engineering_agile.pdf',
    title: 'Software Engineering - Agile Methodologies & System Architecture',
    subtitle: 'Scrum ceremonies, user stories, Clean Architecture, SOLID principles, and CI/CD pipelines.',
    subject: 'Software Engineering',
    semester: 6,
    author: 'Imlirenla Jamir',
    sections: [
      {
        heading: 'Agile & DevOps Lifecycle',
        lines: [
          '* Scrum roles (Product Owner, Scrum Master, Team) and sprint iterations.',
          '* User story format: As a [user], I want [feature], so that [business value].',
          '* Continuous Integration & Continuous Delivery (CI/CD) pipelines with automated testing.'
        ]
      },
      {
        heading: 'Software Design Patterns & Clean Code',
        lines: [
          '* SOLID principles: Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion.',
          '* Creational patterns: Factory, Singleton, Builder.',
          '* Structural & Behavioral patterns: Adapter, Observer, Strategy, and MVC architectures.'
        ]
      }
    ]
  },
  {
    fileName: 'machine_learning_handbook.pdf',
    title: 'Machine Learning Foundations - Supervised & Unsupervised Models',
    subtitle: 'Gradient descent, logistic regression, SVMs, decision trees, random forests, and k-means clustering.',
    subject: 'Machine Learning',
    semester: 7,
    author: 'Alex Chen',
    sections: [
      {
        heading: 'Supervised Learning Algorithms',
        lines: [
          '* Linear regression with mean squared error (MSE) cost function and gradient descent optimization.',
          '* Logistic regression, sigmoid activation, and cross-entropy loss function.',
          '* Support Vector Machines (SVM): maximum margin hyperplane, soft margin slack, kernel trick.'
        ]
      },
      {
        heading: 'Model Evaluation & Overfitting',
        lines: [
          '* Bias-Variance tradeoff: high bias (underfitting) vs high variance (overfitting).',
          '* Regularization techniques: L1 (Lasso, feature selection) and L2 (Ridge, weight shrinkage).',
          '* Evaluation metrics: Confusion matrix, Precision, Recall, F1-Score, and ROC-AUC curve.'
        ]
      }
    ]
  },
  {
    fileName: 'cloud_microservices_notes.pdf',
    title: 'Cloud Computing Architecture & Microservices Deployment',
    subtitle: 'IaaS vs PaaS vs SaaS, Docker containerization, Kubernetes pods and services, and CAP theorem.',
    subject: 'Cloud Computing',
    semester: 7,
    author: 'Priya Sharma',
    sections: [
      {
        heading: 'Cloud Service Models & Virtualization',
        lines: [
          '* NIST cloud characteristics: on-demand self-service, broad network access, resource pooling.',
          '* Hypervisor Type-1 (bare-metal) vs Type-2 (hosted) virtualization.',
          '* CAP Theorem: Consistency, Availability, Partition Tolerance trade-offs in distributed systems.'
        ]
      },
      {
        heading: 'Containerization & Orchestration',
        lines: [
          '* Docker namespaces and cgroups for process isolation and resource limits.',
          '* Kubernetes architectural components: API server, etcd, scheduler, kubelet, and pods.',
          '* Deployments, Services (ClusterIP, NodePort, LoadBalancer), and Horizontal Pod Autoscaling (HPA).'
        ]
      }
    ]
  },
  {
    fileName: 'cryptography_security_guide.pdf',
    title: 'Cryptography & Network Security Essentials',
    subtitle: 'Symmetric ciphers (AES), Asymmetric crypto (RSA, ECC), Diffie-Hellman key exchange, and SHA-256.',
    subject: 'Cryptography',
    semester: 8,
    author: 'Rohan Verma',
    sections: [
      {
        heading: 'Symmetric & Asymmetric Cryptography',
        lines: [
          '* AES block cipher round structure: SubBytes, ShiftRows, MixColumns, AddRoundKey.',
          '* RSA algorithm: prime generation, Euler totient phi(n), modular exponentiation, and decryption.',
          '* Diffie-Hellman key exchange protocol and vulnerability to Man-In-The-Middle without authentication.'
        ]
      },
      {
        heading: 'Cryptographic Hashes & Digital Signatures',
        lines: [
          '* SHA-256 properties: pre-image resistance, second pre-image resistance, collision resistance.',
          '* Digital Signature Algorithm (DSA) providing integrity, authenticity, and non-repudiation.',
          '* Public Key Infrastructure (PKI), X.509 certificate authorities, and TLS 1.3 handshake.'
        ]
      }
    ]
  },
  {
    fileName: 'iot_edge_systems.pdf',
    title: 'Internet of Things & Edge Computing Architecture',
    subtitle: 'MQTT vs CoAP protocols, sensor interfacing, ESP32 microcontrollers, and edge AI inference.',
    subject: 'Internet of Things',
    semester: 8,
    author: 'Imlirenla Jamir',
    sections: [
      {
        heading: 'IoT Communication Protocols',
        lines: [
          '* MQTT publish/subscribe messaging: broker architecture, QoS levels 0, 1, 2, and keep-alive pings.',
          '* CoAP (Constrained Application Protocol): RESTful UDP-based communication for low-power nodes.',
          '* LoRaWAN, Zigbee, and BLE long-range low-power sensor network standards.'
        ]
      },
      {
        heading: 'Edge Computing & Hardware Interfaces',
        lines: [
          '* GPIO, I2C, SPI, and UART serial communication bus protocols and clock timing.',
          '* Edge computing vs centralized cloud: latency reduction, bandwidth conservation, and privacy.',
          '* TinyML and quantized neural network deployment on microcontrollers.'
        ]
      }
    ]
  }
]

// Also ensure legacy files are generated / preserved
const existingOldFiles = [
  {
    fileName: 'os_virtual_memory.pdf',
    title: 'Operating Systems - Virtual Memory and Page Replacement',
    subtitle: 'Covers FIFO LRU Optimal page replacement and TLB mechanisms with diagrams',
    subject: 'Operating Systems',
    semester: 4,
    author: 'Alex Chen',
    sections: [
      {
        heading: 'Key Concepts',
        lines: [
          '* FIFO LRU Optimal page replacement techniques.',
          '* Translation Lookaside Buffer (TLB) mechanisms and memory address translation.'
        ]
      }
    ]
  },
  {
    fileName: 'dbms_normalization.pdf',
    title: 'Database Management Systems - Normalization Guide',
    subtitle: 'Step-by-step decomposition examples with functional dependency preservation proofs.',
    subject: 'Database Systems',
    semester: 4,
    author: 'Priya Sharma',
    sections: [
      {
        heading: 'Key Concepts',
        lines: [
          '* 1NF, 2NF, 3NF, BCNF decomposition examples.',
          '* Functional dependency closure and lossless join verification.'
        ]
      }
    ]
  },
  {
    fileName: 'dsa_endsem_2025.pdf',
    title: 'Data Structures and Algorithms End-Semester Examination 2025',
    subtitle: 'Nagaland University Department of Computer Science & Engineering official exam archive.',
    subject: 'Data Structures',
    semester: 3,
    author: 'Alex Chen',
    sections: [
      {
        heading: 'Question Paper Outline',
        lines: [
          '* Section A: 10 short concept questions (Trees, Heaps, Graph traversals).',
          '* Section B: Dynamic Programming and Minimum Spanning Trees proofs.'
        ]
      }
    ]
  },
  {
    fileName: 'cn_midsem_2024.pdf',
    title: 'Computer Networks Mid-Semester Examination 2024',
    subtitle: 'Nagaland University Department of Computer Science & Engineering official exam archive.',
    subject: 'Computer Networks',
    semester: 5,
    author: 'Priya Sharma',
    sections: [
      {
        heading: 'Question Paper Outline',
        lines: [
          '* Section A: IPv4 Subnetting and CIDR address calculation questions.',
          '* Section B: TCP Congestion Control and sliding window derivations.'
        ]
      }
    ]
  }
]

let count = 0
for (const note of [...sampleNotes, ...existingOldFiles]) {
  const filePath = path.join(docsDir, note.fileName)
  const pdfBytes = buildPdf(note.title, note.subtitle, note.subject, note.semester, note.author, note.sections)
  fs.writeFileSync(filePath, pdfBytes)
  count++
  console.log(`Generated: ${note.fileName} (${pdfBytes.length} bytes)`)
}

console.log(`\nSuccessfully generated ${count} valid downloadable PDF sample files in public/docs/samples!`)
