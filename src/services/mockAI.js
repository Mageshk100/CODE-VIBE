/**
 * Mock AI explanation generator and contextual follow-up chat simulator
 * Strictly adheres to the 5-part structured format:
 * 1. Code Overview
 * 2. Line-by-Line Explanation
 * 3. Logic Breakdown
 * 4. Execution Flow
 * 5. Example Walkthrough
 */

export function generateSessionTitle(language, code) {
  const langDisplay = language.toUpperCase() === 'CPP' ? 'C++' : language.charAt(0).toUpperCase() + language.slice(1);
  const trimmed = code.trim();

  // Pattern checks for common titles
  if (/binary.?search/i.test(trimmed)) return `${langDisplay} – Binary Search`;
  if (/two.?sum|2.?sum/i.test(trimmed)) return `${langDisplay} – Two Sum`;
  if (/reverse.*list|linked.?list/i.test(trimmed)) return `${langDisplay} – Reverse Linked List`;
  if (/quick.?sort|merge.?sort/i.test(trimmed)) return `${langDisplay} – Sorting Algorithm`;
  if (/fibonacci|fib/i.test(trimmed)) return `${langDisplay} – Fibonacci Sequence`;
  if (/palindrome/i.test(trimmed)) return `${langDisplay} – Palindrome Validator`;
  if (/tree|bfs|dfs/i.test(trimmed)) return `${langDisplay} – Tree Traversal`;
  if (/factorial/i.test(trimmed)) return `${langDisplay} – Factorial Calculator`;
  if (/matrix|grid/i.test(trimmed)) return `${langDisplay} – Matrix Operations`;

  // Look for primary function or class name
  const funcMatch = trimmed.match(/(?:def|function|void|int|public\s+class)\s+([a-zA-Z0-9_]+)/);
  if (funcMatch && funcMatch[1]) {
    const rawName = funcMatch[1].replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
    const formatted = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    return `${langDisplay} – ${formatted}`;
  }

  return `${langDisplay} – Logic Explanation`;
}

export function generateStructuredExplanation(language, code) {
  const langDisplay = language.toUpperCase() === 'CPP' ? 'C++' : language.charAt(0).toUpperCase() + language.slice(1);
  const codeLines = code.split('\n');

  // Check if it matches a known classic pattern or construct dynamic structured explanation
  const isBinarySearch = /binarySearch|binary_search|low.*high.*mid/i.test(code);
  const isTwoSum = /twoSum|two_sum|target.*complement/i.test(code);
  const isLinkedList = /ListNode|linked_list|next|head/i.test(code);
  const isFibonacci = /fibonacci|fib\(|n\s*<=\s*1/i.test(code);

  if (isBinarySearch) {
    return {
      overview: `This program implements a **Binary Search** algorithm in ${langDisplay}. It searches for a target value within a sorted array by repeatedly dividing the search interval in half. Because the elements are already ordered, the algorithm eliminates half of the remaining elements in each step, achieving an optimal **O(log n)** time complexity.`,
      lineByLine: [
        {
          lines: "Lines 1–3",
          code: language === 'python' ? "def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1" : "int low = 0, high = arr.length - 1;",
          explanation: "Initializes two pointer indices: `low` pointing to the start of the collection (index 0) and `high` pointing to the end of the collection."
        },
        {
          lines: "Lines 4–6",
          code: "while low <= high:\n    mid = (low + high) // 2",
          explanation: "Main search loop runs as long as the search window is valid (`low <= high`). Calculates the middle index `mid` to inspect the center element."
        },
        {
          lines: "Lines 7–10",
          code: "if arr[mid] == target: return mid\nelif arr[mid] < target: low = mid + 1\nelse: high = mid - 1",
          explanation: "Three-way comparison: if the middle element matches target, return its index. If `target` is greater, shift search to the right half (`low = mid + 1`). Otherwise, shift to the left half (`high = mid - 1`)."
        },
        {
          lines: "Line 11",
          code: "return -1",
          explanation: "Executes if the loop terminates without finding the target, signaling that the element does not exist in the collection."
        }
      ],
      logicBreakdown: [
        "**Divide-and-Conquer Principle**: Halves the search space on each iteration rather than scanning sequentially.",
        "**Invariant Maintenance**: At the beginning of each loop pass, if the target is in `arr`, its index is guaranteed to be within the range `[low, high]`.",
        "**Termination Guarantee**: Each iteration strictly increments `low` or decrements `high`, ensuring the window narrows until `low > high`.",
        "**Space & Time Bounds**: Operates in **O(1)** auxiliary space and **O(log n)** time."
      ],
      executionFlow: [
        "1. Function is invoked with a sorted array and target query value.",
        "2. Pointers `low` and `high` mark the active search boundary.",
        "3. Loop condition `low <= high` is evaluated.",
        "4. Midpoint index `mid` is computed.",
        "5. Comparison evaluates `arr[mid]` against `target`.",
        "6. Boundary adjusts accordingly, or returns immediately upon match.",
        "7. If boundary closes (`low > high`), function returns `-1`."
      ],
      exampleWalkthrough: {
        input: `Array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], Target: 23`,
        steps: [
          "Pass 1: low = 0, high = 9. mid = 4 -> arr[4] = 16. Since 16 < 23, target is in right half. low becomes 5.",
          "Pass 2: low = 5, high = 9. mid = 7 -> arr[7] = 56. Since 56 > 23, target is in left half. high becomes 6.",
          "Pass 3: low = 5, high = 6. mid = 5 -> arr[5] = 23. Match found! Returns index 5."
        ],
        output: "Index: 5"
      }
    };
  }

  if (isTwoSum) {
    return {
      overview: `This program solves the **Two Sum** problem in ${langDisplay}. Given an array of integers and a target value, it identifies the two distinct indices whose elements sum exactly to the target. It leverages a hash map (dictionary) for **O(n)** linear-time efficiency.`,
      lineByLine: [
        {
          lines: "Line 1",
          code: "seen = {}  // hash map to record complement lookups",
          explanation: "Initializes an empty hash table where keys will be seen numbers and values will be their corresponding array indices."
        },
        {
          lines: "Lines 2–3",
          code: "for i, num in enumerate(nums):\n    complement = target - num",
          explanation: "Iterates through the list while computing `complement`, the exact value needed to combine with `num` to equal `target`."
        },
        {
          lines: "Lines 4–6",
          code: "if complement in seen:\n    return [seen[complement], i]\nseen[num] = i",
          explanation: "Checks if `complement` was previously encountered. If found, returns both indices immediately. Otherwise, saves the current number and index."
        }
      ],
      logicBreakdown: [
        "**Complement Arithmetic**: Rephrases `a + b = target` into `b = target - a` to turn a quadratic nested search into a direct lookup.",
        "**Instant Lookups**: Hash tables provide expected **O(1)** time retrieval for previously checked numbers.",
        "**Single Pass**: Solves the entire problem in one single traversal through the dataset."
      ],
      executionFlow: [
        "1. Allocate an empty hash map store.",
        "2. Step through each element with its index.",
        "3. Subtract current element from target to determine the required complement.",
        "4. Query hash map for complement key.",
        "5. If present, produce pair of indices and terminate.",
        "6. If absent, record `num: index` into map and advance."
      ],
      exampleWalkthrough: {
        input: `nums = [2, 7, 11, 15], target = 9`,
        steps: [
          "i=0, num=2: complement = 9 - 2 = 7. '7' not in seen. Record seen[2] = 0.",
          "i=1, num=7: complement = 9 - 7 = 2. '2' is found in seen with index 0!",
          "Result returned immediately: [0, 1]."
        ],
        output: "[0, 1]"
      }
    };
  }

  // Dynamic intelligent extraction for general user code
  const nonBlank = codeLines.filter(l => l.trim().length > 0);
  const sampleLines = nonBlank.slice(0, 4).map((line, idx) => ({
    lines: `Step ${idx + 1}`,
    code: line.trim(),
    explanation: line.includes('(')
      ? "Function or method invocation handling core application logic and parameter evaluation."
      : line.includes('=')
      ? "State assignment or initialization variable required for runtime calculations."
      : "Control structure managing branching or iteration flow."
  }));

  return {
    overview: `This ${langDisplay} snippet defines a targeted programming solution. It processes input parameters through structured operations, applying control flow and state transformations to arrive at the desired result with clean computational steps.`,
    lineByLine: sampleLines.length > 0 ? sampleLines : [
      {
        lines: "Code Block",
        code: code.slice(0, 120),
        explanation: "Main execution block defining operations, variables, and logic flow."
      }
    ],
    logicBreakdown: [
      "**Variable Initialization & Scope**: Defines dedicated variables to track intermediate computation states.",
      "**Control Flow Management**: Evaluates boundary conditions and conditions to ensure reliable processing.",
      "**Clean Data Transformation**: Steps progressively through inputs without unnecessary memory overhead."
    ],
    executionFlow: [
      "1. Program begins by setting up input parameters and local variables.",
      "2. Evaluates conditional checks or enters iterative blocks.",
      "3. Computes transformed state step-by-step.",
      "4. Delivers the final evaluated result or return value."
    ],
    exampleWalkthrough: {
      input: "Typical valid input according to program signature",
      steps: [
        "Step 1: Input values are received and verified.",
        "Step 2: Core processing executes the defined logic pipeline.",
        "Step 3: Intermediate values resolve to final output."
      ],
      output: "Expected evaluated result"
    }
  };
}

export function generateFollowUpResponse(question, code, language) {
  const q = question.toLowerCase();

  if (q.includes('time complexity') || q.includes('big o') || q.includes('runtime')) {
    return `### Time & Space Complexity Analysis
- **Time Complexity**: Typically **O(n)** or **O(log n)** depending on whether linear traversal or divide-and-conquer is used. In this ${language} code, loops and operations execute sequentially without deep nesting.
- **Space Complexity**: **O(1)** auxiliary space if modified in-place, or **O(n)** if auxiliary data structures (like arrays, hash tables, or recursive call stacks) are allocated.`;
  }

  if (q.includes('overflow') || q.includes('boundary') || q.includes('edge case') || q.includes('empty')) {
    return `### Edge Case Considerations
1. **Empty / Null Input**: Always verify that the input contains at least one valid element before indexing.
2. **Single Element**: Test the logic with arrays of length 1 to ensure loop boundaries don't skip single elements.
3. **Integer Overflow**: In languages like C, C++, or Java, computing midpoints using \`low + (high - low) / 2\` avoids 32-bit integer overflow that could occur with \`(low + high) / 2\`.`;
  }

  if (q.includes('line') || q.includes('what does')) {
    return `### Line Details
In this code section, the statement ensures variables maintain valid states before entering subsequent operations. By isolating state transitions into dedicated statements, the code stays maintainable and avoids unexpected side-effects.`;
  }

  if (q.includes('optimize') || q.includes('improve') || q.includes('faster')) {
    return `### Optimization Opportunities
- **Early Exits**: If the target condition is met early, returning immediately prevents redundant iterations.
- **Memory Reuse**: Avoid allocating duplicate temporary collections inside loop bodies.
- **Language Idioms**: In ${language}, idiomatic lookup structures or built-in iterators offer compiler-level optimization.`;
  }

  return `### AI Explanation Note
That is a great question regarding this ${language} implementation.

- **Key Takeaway**: The code relies on predictable state transitions. Keeping track of variable invariants across iterations ensures correctness.
- **Recommended Practice**: When studying this pattern, trace the variables on paper with 3 sample values (minimum boundary, typical case, maximum boundary) to solidify your mental model.`;
}
