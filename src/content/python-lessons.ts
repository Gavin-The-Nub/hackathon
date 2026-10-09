import { ConceptId } from '../core/types';
import { LessonData } from './lessons';

export const PYTHON_LESSONS: Record<ConceptId, LessonData> = {
  "variables_types": {
    "conceptId": "variables_types",
    "language": "python",
    "title": "Variables & Data Types",
    "unitBadge": "UNIT 1 LESSON",
    "subtitle": "Learn how Python remembers numbers, text, and computes arithmetic",
    "themeColor": "#10B981",
    "lipColor": "#059669",
    "analogy": {
      "title": "The Labeled Storage Box",
      "description": "Imagine your computer memory as a shelf of labeled storage boxes. In Python, you store a value into a variable name with the = symbol, like price = 25.",
      "icon": "📦"
    },
    "conceptsExplained": [
      {
        "term": "Variable Assignment (=)",
        "definition": "In Python, you create a variable directly by assigning it a value with =. No keywords like let or var are needed.",
        "syntaxTip": "price = 25\nscore = 0"
      },
      {
        "term": "Data Types (Numbers & Strings)",
        "definition": "Numbers are raw digits (e.g. 10, 3.14). Strings are text wrapped in quotes (e.g. \"CodeChamp\", 'Python').",
        "syntaxTip": "name = \"Alex\"\nage = 18"
      },
      {
        "term": "Arithmetic Operators",
        "definition": "Computers do math using +, -, *, / (float division), and // (integer division).",
        "syntaxTip": "total = price * quantity"
      },
      {
        "term": "The return Statement",
        "definition": "Inside a function, return hands the calculated result back to the caller.",
        "syntaxTip": "return total"
      }
    ],
    "codeExamples": [
      {
        "title": "Basic Variables & Math",
        "code": "price = 10\nquantity = 3\ntotal = price * quantity\nprint(total)  # Outputs: 30",
        "explanation": "Multiplies price and quantity and stores the result in total."
      },
      {
        "title": "Writing a Function with Return",
        "code": "def total_cost(price, quantity):\n    return price * quantity",
        "explanation": "Defines a reusable function that calculates and returns total cost."
      }
    ],
    "commonPitfalls": [
      {
        "mistake": "Printing instead of returning",
        "whyItHappens": "print() only displays text on screen; tests check the returned function value.",
        "howToFix": "Use return price * quantity instead of print()."
      },
      {
        "mistake": "Misidentifying case-sensitive names",
        "whyItHappens": "Python is case-sensitive: Total and total are different variables.",
        "howToFix": "Always match spelling and casing exactly."
      }
    ],
    "quickCheck": {
      "question": "How do you create a variable named score with value 10 in Python?",
      "options": [
        "score = 10",
        "let score = 10",
        "const score = 10",
        "var score = 10"
      ],
      "correctIndex": 0,
      "explanation": "Python assigns variables directly with the = operator without extra keywords."
    },
    "suggestedQuestions": [
      "Why don't we need let or const in Python?",
      "What is the difference between print() and return?",
      "How do floating point numbers work in Python?"
    ],
    "offlineFaq": [
      {
        "questionPatterns": [
          "let",
          "const",
          "var",
          "declare"
        ],
        "answer": "In Python, you do not use let or var! Simply write variable_name = value."
      },
      {
        "questionPatterns": [
          "print",
          "return",
          "output"
        ],
        "answer": "print() shows text to a human on the screen, but return hands the value back to the test runner so it can verify your solution."
      },
      {
        "questionPatterns": [
          "indent",
          "indentation",
          "whitespace",
          "spaces"
        ],
        "answer": "Python uses indentation (4 spaces) to define code blocks instead of curly braces {}. Consistent indentation is mandatory in Python syntax!"
      }
    ]
  },
  "conditionals": {
    "conceptId": "conditionals",
    "language": "python",
    "title": "Conditionals & Logic",
    "unitBadge": "UNIT 2 LESSON",
    "subtitle": "Make decisions with if, elif, else, and boolean expressions",
    "themeColor": "#6366F1",
    "lipColor": "#4F46E5",
    "analogy": {
      "title": "The Fork in the Road",
      "description": "A conditional is a junction in your program: if a statement is True, follow one road; if False, take the other.",
      "icon": "🔀"
    },
    "conceptsExplained": [
      {
        "term": "if, elif, and else",
        "definition": "Use if to test a condition, elif to check another if the first was False, and else as the fallback.",
        "syntaxTip": "if age < 12:\n    return 8\nelif age >= 65:\n    return 10\nelse:\n    return 15"
      },
      {
        "term": "Colons & Indentation",
        "definition": "In Python, every conditional header ends with a colon (:), and the body must be indented 4 spaces.",
        "syntaxTip": "if score >= 60:\n    return True"
      },
      {
        "term": "Booleans & Comparisons",
        "definition": "Booleans in Python are True and False (capitalized). Comparisons include ==, !=, <, >, <=, >=.",
        "syntaxTip": "is_even = n % 2 == 0"
      }
    ],
    "codeExamples": [
      {
        "title": "Even Number Check",
        "code": "def is_even(n):\n    if n % 2 == 0:\n        return True\n    return False",
        "explanation": "Returns True if remainder when dividing by 2 is 0."
      }
    ],
    "commonPitfalls": [
      {
        "mistake": "Forgetting the colon at the end of the if line",
        "whyItHappens": "Python requires : after if, elif, and else statements.",
        "howToFix": "Always append : after your condition."
      },
      {
        "mistake": "Using = instead of == for comparison",
        "whyItHappens": "= assigns a variable, while == tests equality.",
        "howToFix": "Use == when checking if two values are equal."
      }
    ],
    "quickCheck": {
      "question": "Which keyword is used for 'else if' in Python?",
      "options": [
        "elif",
        "else if",
        "elseif",
        "then if"
      ],
      "correctIndex": 0,
      "explanation": "Python combines 'else if' into the keyword elif."
    },
    "suggestedQuestions": [
      "What is the difference between = and ==?",
      "Why does indentation matter in Python?",
      "What does the modulo % operator do?"
    ],
    "offlineFaq": [
      {
        "questionPatterns": [
          "elif",
          "else if"
        ],
        "answer": "Python uses 'elif' instead of 'else if'. It allows you to chain multiple tests together cleanly."
      },
      {
        "questionPatterns": [
          "=",
          "==",
          "equal",
          "assignment"
        ],
        "answer": "In Python, = assigns a variable (x = 5), while == compares two values for equality (x == 5)."
      }
    ]
  },
  "loops": {
    "conceptId": "loops",
    "language": "python",
    "title": "Loops & Iteration",
    "unitBadge": "UNIT 3 LESSON",
    "subtitle": "Automate repetitive actions using for and while loops",
    "themeColor": "#F59E0B",
    "lipColor": "#D97706",
    "analogy": {
      "title": "The Assembly Line",
      "description": "Loops let you process repetitive tasks without writing the same line over and over.",
      "icon": "🔁"
    },
    "conceptsExplained": [
      {
        "term": "for ... in range()",
        "definition": "range(start, stop) generates numbers up to but not including stop. Use range(1, n + 1) to include n.",
        "syntaxTip": "for i in range(1, n + 1):\n    total += i"
      },
      {
        "term": "while Loops",
        "definition": "A while loop runs as long as its condition remains True. Be sure to update your loop counter!",
        "syntaxTip": "while count > 0:\n    count -= 1"
      },
      {
        "term": "Accumulator Pattern",
        "definition": "Initialize a counter (total = 0) before the loop, add values inside, then return after the loop.",
        "syntaxTip": "total = 0\nfor x in items:\n    total += x\nreturn total"
      }
    ],
    "codeExamples": [
      {
        "title": "Summing 1 to N",
        "code": "def sum_up_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total",
        "explanation": "Loops through 1, 2, 3... n and sums them together."
      }
    ],
    "commonPitfalls": [
      {
        "mistake": "Off-by-one with range(1, n)",
        "whyItHappens": "range(1, n) stops at n - 1.",
        "howToFix": "Use range(1, n + 1) to include n."
      },
      {
        "mistake": "Returning inside the loop on the first iteration",
        "whyItHappens": "Placing return inside the loop terminates it after one step.",
        "howToFix": "Indent return outside the loop so it runs after all iterations."
      }
    ],
    "quickCheck": {
      "question": "Which numbers does range(1, 4) generate?",
      "options": [
        "1, 2, 3",
        "1, 2, 3, 4",
        "0, 1, 2, 3",
        "2, 3, 4"
      ],
      "correctIndex": 0,
      "explanation": "range(start, stop) stops right before the stop number, generating 1, 2, and 3."
    },
    "suggestedQuestions": [
      "Why does range() stop before the last number?",
      "How do I prevent an infinite while loop?",
      "When should I use for vs while?"
    ],
    "offlineFaq": [
      {
        "questionPatterns": [
          "range",
          "stop",
          "end"
        ],
        "answer": "range(start, stop) is half-open: it includes start, but excludes stop. To count to 5 inclusive, use range(1, 6)."
      },
      {
        "questionPatterns": [
          "infinite",
          "forever",
          "while"
        ],
        "answer": "An infinite loop occurs when a while condition never becomes False. Always increment or decrement your loop variable so the loop terminates!"
      }
    ]
  },
  "functions": {
    "conceptId": "functions",
    "language": "python",
    "title": "Functions & Scope",
    "unitBadge": "UNIT 4 LESSON",
    "subtitle": "Package reusable logic, accept arguments, and return answers",
    "themeColor": "#0EA5E9",
    "lipColor": "#0284C7",
    "analogy": {
      "title": "The Recipe Card",
      "description": "A function is a recipe: give it ingredients (arguments), it executes steps, and serves the finished dish (return value).",
      "icon": "⚙️"
    },
    "conceptsExplained": [
      {
        "term": "def Keyword",
        "definition": "In Python, def introduces a function definition followed by the name and parameters.",
        "syntaxTip": "def greet(name):\n    return f\"Hello, {name}!\""
      },
      {
        "term": "Parameters & Arguments",
        "definition": "Parameters are placeholders defined in the function header; arguments are the real values passed in.",
        "syntaxTip": "def add(a, b):\n    return a + b"
      },
      {
        "term": "f-strings (Formatted Strings)",
        "definition": "Prefix strings with f to embed variables directly using curly braces {var}.",
        "syntaxTip": "return f\"Hello, {name}!\""
      }
    ],
    "codeExamples": [
      {
        "title": "Greeting Function",
        "code": "def greet(name):\n    return \"Hello, \" + name + \"!\"",
        "explanation": "Accepts a name string and returns a customized welcome message."
      }
    ],
    "commonPitfalls": [
      {
        "mistake": "Forgetting the colon after function header",
        "whyItHappens": "Every def name(args): requires a colon at the end.",
        "howToFix": "Add : at the end of the def line."
      }
    ],
    "quickCheck": {
      "question": "Which keyword defines a function in Python?",
      "options": [
        "def",
        "function",
        "fn",
        "func"
      ],
      "correctIndex": 0,
      "explanation": "Python uses 'def' (short for define) to declare functions."
    },
    "suggestedQuestions": [
      "What are f-strings in Python?",
      "Can a function take multiple parameters?",
      "What happens if a function has no return statement?"
    ],
    "offlineFaq": [
      {
        "questionPatterns": [
          "def",
          "function"
        ],
        "answer": "Use def function_name(param1, param2): to define functions in Python. Indent the function body by 4 spaces."
      },
      {
        "questionPatterns": [
          "return",
          "none",
          "output"
        ],
        "answer": "In Python, a function without a return statement automatically returns None. Always return your calculated result!"
      }
    ]
  },
  "arrays_lists": {
    "conceptId": "arrays_lists",
    "language": "python",
    "title": "Lists & Collections",
    "unitBadge": "UNIT 5 LESSON",
    "subtitle": "Store, inspect, search, and transform lists of items",
    "themeColor": "#EC4899",
    "lipColor": "#DB2777",
    "analogy": {
      "title": "The Train Cars",
      "description": "A list is like coupled train cars: items are stored in order, starting with index 0 at the front.",
      "icon": "🚃"
    },
    "conceptsExplained": [
      {
        "term": "List Creation & Indexing",
        "definition": "Lists use square brackets []. First item is at index 0.",
        "syntaxTip": "fruits = [\"apple\", \"banana\"]\nfirst = fruits[0]"
      },
      {
        "term": "Appending Items (.append)",
        "definition": "Use list.append(item) to insert a new item at the end of the list.",
        "syntaxTip": "fruits.append(\"cherry\")"
      },
      {
        "term": "Iterating through Lists",
        "definition": "Loop through items directly using for item in list:.",
        "syntaxTip": "for n in numbers:\n    total += n"
      },
      {
        "term": "List Slicing (e.g. Reverse)",
        "definition": "items[::-1] returns a new list in reverse order.",
        "syntaxTip": "reversed_list = items[::-1]"
      }
    ],
    "codeExamples": [
      {
        "title": "Finding Maximum",
        "code": "def find_max(numbers):\n    max_val = numbers[0]\n    for n in numbers:\n        if n > max_val:\n            max_val = n\n    return max_val",
        "explanation": "Traverses list and keeps track of the greatest element."
      }
    ],
    "commonPitfalls": [
      {
        "mistake": "Using .push() instead of .append()",
        "whyItHappens": ".push is JavaScript. In Python, the method is .append().",
        "howToFix": "Use my_list.append(item)."
      },
      {
        "mistake": "IndexError: list index out of range",
        "whyItHappens": "Accessing an index >= len(list).",
        "howToFix": "Ensure index is strictly less than the length of the list."
      }
    ],
    "quickCheck": {
      "question": "How do you add an item to the end of a list in Python?",
      "options": [
        "list.append(x)",
        "list.push(x)",
        "list.add(x)",
        "list.insert(x)"
      ],
      "correctIndex": 0,
      "explanation": "In Python, list.append(x) adds an item to the end of the list."
    },
    "suggestedQuestions": [
      "How is a Python list different from a JavaScript array?",
      "What does list.append() do?",
      "How does slicing with [::-1] reverse a list?"
    ],
    "offlineFaq": [
      {
        "questionPatterns": [
          "push",
          "append",
          "add"
        ],
        "answer": "JavaScript uses .push(), but Python uses .append() to add an element to the end of a list."
      },
      {
        "questionPatterns": [
          "slice",
          "reverse",
          "slicing"
        ],
        "answer": "Python list slicing allows extracting portions of a list: items[start:end:step]. For instance, items[::-1] creates a reversed copy of the list."
      }
    ]
  },
  "operators": {
    "conceptId": "operators",
    "language": "python",
    "title": "Python Operators",
    "unitBadge": "BONUS LESSON",
    "subtitle": "Explore Python arithmetic, comparison, and logical operators",
    "themeColor": "#8B5CF6",
    "lipColor": "#7C3AED",
    "analogy": {
      "title": "The Math Toolbelt",
      "description": "Operators perform computations.",
      "icon": "🛠️"
    },
    "conceptsExplained": [],
    "codeExamples": [],
    "commonPitfalls": [],
    "quickCheck": {
      "question": "What does // do in Python?",
      "options": [
        "Integer division",
        "Comment",
        "Floor float",
        "Power"
      ],
      "correctIndex": 0,
      "explanation": "// performs floor integer division."
    },
    "suggestedQuestions": [],
    "offlineFaq": []
  },
  "strings": {
    "conceptId": "strings",
    "language": "python",
    "title": "Python Strings",
    "unitBadge": "BONUS LESSON",
    "subtitle": "Working with text and formatting in Python",
    "themeColor": "#06B6D4",
    "lipColor": "#0891B2",
    "analogy": {
      "title": "String of Beads",
      "description": "Text is a chain of characters.",
      "icon": "📿"
    },
    "conceptsExplained": [],
    "codeExamples": [],
    "commonPitfalls": [],
    "quickCheck": {
      "question": "How do you find the length of a string s?",
      "options": [
        "len(s)",
        "s.length",
        "s.size()",
        "count(s)"
      ],
      "correctIndex": 0,
      "explanation": "Python uses built-in len(s)."
    },
    "suggestedQuestions": [],
    "offlineFaq": []
  },
  "reading_fixing_code": {
    "conceptId": "reading_fixing_code",
    "language": "python",
    "title": "Debugging Python Code",
    "unitBadge": "BONUS LESSON",
    "subtitle": "Reading Python tracebacks and fixing errors",
    "themeColor": "#EF4444",
    "lipColor": "#DC2626",
    "analogy": {
      "title": "The Python Detective",
      "description": "Read tracebacks to fix bugs.",
      "icon": "🔍"
    },
    "conceptsExplained": [],
    "codeExamples": [],
    "commonPitfalls": [],
    "quickCheck": {
      "question": "What does IndentationError mean?",
      "options": [
        "Spaces/tabs are inconsistent",
        "Variable not defined",
        "Math error",
        "Import failed"
      ],
      "correctIndex": 0,
      "explanation": "IndentationError means code lines are misaligned."
    },
    "suggestedQuestions": [],
    "offlineFaq": []
  }
};
