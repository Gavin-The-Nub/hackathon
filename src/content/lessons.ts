import { ConceptId, LanguageId } from '../core/types';

export interface LessonCodeExample {
  title: string;
  code: string;
  explanation: string;
}

export interface QuickCheck {
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonData {
  conceptId: ConceptId;
  language: LanguageId;
  title: string;
  unitBadge: string;
  subtitle: string;
  themeColor: string;
  lipColor: string;
  analogy: {
    title: string;
    description: string;
    icon: string;
  };
  conceptsExplained: {
    term: string;
    definition: string;
    syntaxTip: string;
  }[];
  codeExamples: LessonCodeExample[];
  commonPitfalls: {
    mistake: string;
    whyItHappens: string;
    howToFix: string;
  }[];
  quickCheck: QuickCheck;
  suggestedQuestions: string[];
  offlineFaq: {
    questionPatterns: string[];
    answer: string;
  }[];
}

export const LESSONS: Record<ConceptId, LessonData> = {
  variables_types: {
    conceptId: 'variables_types',
    language: 'javascript',
    title: 'Variables & Data Types',
    unitBadge: 'UNIT 1 LESSON',
    subtitle: 'Learn how computers remember numbers, text, and compute arithmetic',
    themeColor: '#10B981',
    lipColor: '#059669',
    analogy: {
      title: 'The Labeled Storage Box',
      description:
        'Imagine your computer’s memory as a shelf of storage boxes. A variable is simply a label you stick on a box so you can find and use its contents later without having to remember the exact value.',
      icon: '📦',
    },
    conceptsExplained: [
      {
        term: 'Variable Declaration (const & let)',
        definition:
          'In JavaScript, you create a variable using "const" (for values that will not change) or "let" (for values you want to update later).',
        syntaxTip: 'const price = 25;\nlet score = 0;',
      },
      {
        term: 'Data Types (Numbers & Strings)',
        definition:
          'Numbers are raw digits used for math (e.g. 10, 3.14). Strings are letters or words wrapped in quotes (e.g. "Alice", "Apples").',
        syntaxTip: 'const age = 18;\nconst name = "Alex";',
      },
      {
        term: 'Arithmetic Operators',
        definition:
          'Computers do math using symbols: + (add), - (subtract), * (multiply), and / (divide).',
        syntaxTip: 'const total = price * quantity;',
      },
      {
        term: 'The return Statement',
        definition:
          'A function is like a calculator. When it finishes calculating, "return" hands the final answer back to whoever asked for it.',
        syntaxTip: 'return total;',
      },
    ],
    codeExamples: [
      {
        title: 'Calculating Total Item Cost',
        code: `function totalCost(price, quantity) {\n  // 1. Multiply the unit price by how many items\n  const total = price * quantity;\n\n  // 2. Return the calculated answer\n  return total;\n}`,
        explanation:
          'Notice how "price" and "quantity" are inputs (parameters). We multiply them with "*" and send the result back with "return".',
      },
      {
        title: 'Discounting a Price',
        code: `function discountedPrice(original, discount) {\n  // Subtract the discount from the original price\n  return original - discount;\n}`,
        explanation:
          'You can even return the arithmetic directly in one clean line without storing an extra variable!',
      },
    ],
    commonPitfalls: [
      {
        mistake: 'Forgetting the "return" keyword',
        whyItHappens:
          'If you calculate a value but do not return it, JavaScript defaults to returning undefined.',
        howToFix:
          'Always make sure your function ends with "return yourAnswer;" so tests can verify the result.',
      },
      {
        mistake: 'Mixing text with numbers ("5" + 5)',
        whyItHappens:
          'When one value is inside quotes, the "+" sign treats it as text and glues them together into "55" instead of 10.',
        howToFix:
          'Keep numbers unquoted when you intend to do mathematical addition.',
      },
    ],
    quickCheck: {
      question: 'What does this function return when called with multiply(4, 5)?',
      codeSnippet: `function multiply(a, b) {\n  return a * b;\n}`,
      options: ['9', '20', 'undefined', '"45"'],
      correctIndex: 1,
      explanation:
        'Correct! The asterisk (*) multiplies 4 times 5, producing 20, and "return" hands that answer back.',
    },
    suggestedQuestions: [
      'Why do we need the "return" keyword?',
      'What is the difference between let and const?',
      'Can a variable store words instead of numbers?',
      'Explain function parameters like I am 10 years old.',
    ],
    offlineFaq: [
      {
        questionPatterns: ['return', 'why return', 'what is return'],
        answer:
          'Think of a function like a baker baking bread. If the baker bakes the loaf but never hands it to you, you get nothing! The "return" keyword is the moment the function hands the finished result back to your program. Without it, your function gives "undefined".',
      },
      {
        questionPatterns: ['const', 'let', 'difference', 'const vs let'],
        answer:
          'Use "const" when the value should stay fixed once created (like your birth year). Use "let" when you plan to change or reassign the value later (like your current game score). In modern code, use const by default unless you know the value must change!',
      },
      {
        questionPatterns: ['words', 'string', 'text', 'store words'],
        answer:
          'Yes! Words and sentences are called "Strings" in programming. You store them by wrapping text in quotation marks: const greeting = "Hello, world!". Numbers do not need quotes: const count = 42.',
      },
      {
        questionPatterns: ['parameter', 'argument', 'like 10', 'kid'],
        answer:
          'Imagine a blender. The blender has a slot on top for ingredients. Those slots are "parameters"—placeholders waiting for food. When you actually drop in strawberries and bananas, those real fruits are "arguments"! The blended smoothie that pours out is your "return" value!',
      },
    ],
  },

  conditionals: {
    conceptId: 'conditionals',
    language: 'javascript',
    title: 'Conditionals & Logic',
    unitBadge: 'UNIT 2 LESSON',
    subtitle: 'Teach your code how to make smart decisions with if, else, and comparisons',
    themeColor: '#6366F1',
    lipColor: '#4F46E5',
    analogy: {
      title: 'The Fork in the Road',
      description:
        'When walking down a path, you might see a sign: "If raining, take the covered path; otherwise, walk through the park." Conditionals let your code choose different branches based on real conditions.',
      icon: '🔀',
    },
    conceptsExplained: [
      {
        term: 'The if Statement',
        definition:
          'Checks a condition inside parentheses. If that condition is true, the code inside the curly braces { } runs.',
        syntaxTip: 'if (age >= 18) {\n  return "Adult";\n}',
      },
      {
        term: 'The else Fallback',
        definition:
          'Runs automatically if the "if" condition was false. It provides the alternative path.',
        syntaxTip: 'else {\n  return "Minor";\n}',
      },
      {
        term: 'Comparison Operators (===, >, <)',
        definition:
          'Use "===" to check if two things are strictly equal. Use ">" for greater than, "<" for less than, and ">=" for greater or equal.',
        syntaxTip: 'x === 10;\nx > 5;\nx <= 20;',
      },
      {
        term: 'The else if Ladder',
        definition:
          'Allows testing multiple conditions sequentially, like grading: A, B, C, or D.',
        syntaxTip: 'else if (score >= 80) {\n  return "B";\n}',
      },
    ],
    codeExamples: [
      {
        title: 'Theme Park Ride Admission',
        code: `function canRide(height) {\n  // Must be at least 120 cm tall\n  if (height >= 120) {\n    return "Allowed";\n  } else {\n    return "Too short";\n  }\n}`,
        explanation:
          'If height is 130, the first block runs and returns "Allowed". If height is 110, the else block runs and returns "Too short".',
      },
      {
        title: 'Checking Even or Odd with Modulo (%)',
        code: `function isEven(num) {\n  // % 2 gives the remainder when divided by 2\n  if (num % 2 === 0) {\n    return true;\n  } else {\n    return false;\n  }\n}`,
        explanation:
          'The remainder operator "%" checks if a number divides cleanly. If num % 2 equals 0, it is an even number!',
      },
    ],
    commonPitfalls: [
      {
        mistake: 'Confusing single "=" with triple "==="',
        whyItHappens:
          'A single "=" assigns a value (let x = 5). Three "===" compares two values to see if they are equal (x === 5).',
        howToFix:
          'Inside if conditions, always use "===" to compare values, never a single "=".',
      },
      {
        mistake: 'Missing parentheses around conditions',
        whyItHappens:
          'Writing if x > 5 without parentheses causes a syntax error.',
        howToFix:
          'Always wrap your condition in parentheses: if (x > 5) { ... }.',
      },
    ],
    quickCheck: {
      question: 'What does checkPass(75) return?',
      codeSnippet: `function checkPass(score) {\n  if (score >= 70) {\n    return "Passed";\n  }\n  return "Failed";\n}`,
      options: ['"Passed"', '"Failed"', 'undefined', '75'],
      correctIndex: 0,
      explanation:
        'Correct! Because 75 is greater than or equal to 70, the condition is true and it immediately returns "Passed".',
    },
    suggestedQuestions: [
      'What is the difference between = and ===?',
      'When should I use else if instead of multiple ifs?',
      'What does the % (modulo) operator do?',
      'What are truthy and falsy values in JavaScript?',
    ],
    offlineFaq: [
      {
        questionPatterns: ['=', '===', 'equal', 'assignment'],
        answer:
          'A single "=" is the ASSIGNMENT operator: it puts something into a box (e.g. const x = 10). A triple "===" is the COMPARISON operator: it asks "is the left side equal to the right side?" (e.g. x === 10 gives true or false). Always use === in if conditions!',
      },
      {
        questionPatterns: ['else if', 'multiple if', 'when else if', 'if vs else', 'if or else', 'if else', 'when to use if'],
        answer:
          'Use "if" for the first check. Use "else if" if the first was false and you want to test another specific condition. Use "else" as the catch-all safety net if none of the above conditions were true!',
      },
      {
        questionPatterns: ['%', 'modulo', 'remainder'],
        answer:
          'The "%" symbol is the remainder operator (modulo). In elementary school math, 7 divided by 2 is 3 with a remainder of 1. In JavaScript, 7 % 2 gives that remainder: 1. It is frequently used to check if numbers are even or odd!',
      },
      {
        questionPatterns: ['truthy', 'falsy', 'boolean'],
        answer:
          'In JavaScript, conditions evaluate to true or false. Most values are "truthy" (like numbers 1, 42, or non-empty strings "hi"). A few values are automatically "falsy": 0, empty string "", null, undefined, and false.',
      },
    ],
  },

  loops: {
    conceptId: 'loops',
    language: 'javascript',
    title: 'Loops & Iteration',
    unitBadge: 'UNIT 3 LESSON',
    subtitle: 'Automate repetitive tasks with while and for loops without writing repeated code',
    themeColor: '#F59E0B',
    lipColor: '#D97706',
    analogy: {
      title: 'The Tireless Conveyor Belt',
      description:
        'Instead of typing the same step 1,000 times, a loop tells the computer: "Repeat this action for every item on the belt until the counter reaches the end."',
      icon: '🔁',
    },
    conceptsExplained: [
      {
        term: 'The for Loop Structure',
        definition:
          'Has 3 parts: start counter (let i = 0), stopping rule (i < limit), and increment step (i++).',
        syntaxTip: 'for (let i = 0; i < 5; i++) {\n  // runs 5 times\n}',
      },
      {
        term: 'The Accumulator Pattern',
        definition:
          'A variable declared outside the loop (like let total = 0) that collects or sums values on each round.',
        syntaxTip: 'let total = 0;\ntotal += i;',
      },
      {
        term: 'Counter Shorthand (i++)',
        definition:
          '"i++" simply means "add 1 to i". It moves the counter forward so the loop can eventually stop.',
        syntaxTip: 'i++; // same as i = i + 1',
      },
      {
        term: 'The while Loop',
        definition:
          'Repeats as long as a condition remains true. Helpful when you do not know in advance how many steps it will take.',
        syntaxTip: 'while (power < 100) {\n  power = power * 2;\n}',
      },
    ],
    codeExamples: [
      {
        title: 'Summing Numbers from 1 to N',
        code: `function sumUpTo(n) {\n  let total = 0; // Accumulator starts at 0\n\n  for (let i = 1; i <= n; i++) {\n    total += i; // Add current number to total\n  }\n\n  return total; // Return final accumulated sum\n}`,
        explanation:
          'When n = 3, the loop adds 1, then 2, then 3. The total becomes 6, which is returned at the end.',
      },
      {
        title: 'Counting Down',
        code: `function countdown(from) {\n  let result = [];\n  for (let i = from; i > 0; i--) {\n    result.push(i);\n  }\n  return result;\n}`,
        explanation:
          'Loops can count backwards using "i--", stopping when i is no longer greater than 0.',
      },
    ],
    commonPitfalls: [
      {
        mistake: 'Putting the "return" inside the loop body',
        whyItHappens:
          'If you write "return" inside the curly braces of the loop, the function exits on iteration 1 and never completes the rest of the loop!',
        howToFix:
          'Put your return statement AFTER the closing brace "}" of the loop.',
      },
      {
        mistake: 'Infinite loops (forgetting i++)',
        whyItHappens:
          'If the counter variable never changes, the condition stays true forever and the app freezes.',
        howToFix:
          'Always make sure your loop updates its counter (e.g. i++) towards the exit condition.',
      },
    ],
    quickCheck: {
      question: 'How many times does this loop execute its body?',
      codeSnippet: `for (let i = 0; i < 4; i++) {\n  // doing work\n}`,
      options: ['3 times', '4 times', '5 times', 'Infinite times'],
      correctIndex: 1,
      explanation:
        'Correct! It runs when i is 0, 1, 2, and 3 (exactly 4 times). When i reaches 4, "i < 4" becomes false and it stops.',
    },
    suggestedQuestions: [
      'How do I avoid an infinite loop?',
      'What is the difference between a for loop and a while loop?',
      'Why does i start at 0 instead of 1?',
      'Why did my loop only run once?',
    ],
    offlineFaq: [
      {
        questionPatterns: ['infinite loop', 'freeze', 'never stops'],
        answer:
          'An infinite loop occurs when the condition never becomes false! For example, if you write while (x > 0) but never decrease x, it runs forever. Always make sure your loop changes a variable on every round so it reaches the exit rule.',
      },
      {
        questionPatterns: ['for vs while', 'difference', 'while loop'],
        answer:
          'Use a "for" loop when you know how many times to repeat (e.g. counting from 1 to 10 or looping through an array). Use a "while" loop when you are waiting for a condition to change and do not know the exact number of steps in advance.',
      },
      {
        questionPatterns: ['start at 0', 'zero', 'why 0'],
        answer:
          'In computer science, counting starts at 0 because 0 represents the offset from the very beginning of computer memory! Arrays also start at index 0, so starting loops at 0 makes inspecting array items seamless.',
      },
      {
        questionPatterns: ['run once', 'only once', 'stopped'],
        answer:
          'If your loop only ran once, check if you accidentally wrote a "return" statement INSIDE the loop braces! A return statement immediately halts the entire function. Make sure your return is placed after the loop’s closing "}" brace.',
      },
    ],
  },

  functions: {
    conceptId: 'functions',
    language: 'javascript',
    title: 'Functions & Parameters',
    unitBadge: 'UNIT 4 LESSON',
    subtitle: 'Package reusable blocks of logic that accept inputs and return predictable outputs',
    themeColor: '#EC4899',
    lipColor: '#DB2777',
    analogy: {
      title: 'The Bread Toaster',
      description:
        'A toaster is a machine designed to do one job. You insert bread (the input parameter), press the lever to apply heat (the function body), and out pops toasted bread (the return value). You can toast 100 slices of bread with that one machine!',
      icon: '⚙️',
    },
    conceptsExplained: [
      {
        term: 'Function Anatomy',
        definition:
          'Consists of the "function" keyword, a descriptive name, parentheses for inputs, and curly braces containing the code to run.',
        syntaxTip: 'function greet(name) {\n  return "Hello " + name;\n}',
      },
      {
        term: 'Parameters vs Arguments',
        definition:
          'Parameters are the placeholder variables in the function declaration. Arguments are the real values you pass in when calling the function.',
        syntaxTip: '// "name" is parameter;\n// "Sarah" is argument:\ngreet("Sarah");',
      },
      {
        term: 'Variable Scope',
        definition:
          'Variables created inside a function are "local" to that function. They cannot be accidentally seen or altered by code outside.',
        syntaxTip: 'function calculate() {\n  const secret = 42;\n}',
      },
      {
        term: 'console.log vs return',
        definition:
          '"console.log" prints text to your screen for debugging. "return" hands the result back to your program so other code and tests can use it.',
        syntaxTip: 'console.log(x); // prints\nreturn x; // hands back answer',
      },
    ],
    codeExamples: [
      {
        title: 'Celsius to Fahrenheit Converter',
        code: `function toFahrenheit(celsius) {\n  // Formula: (C * 9/5) + 32\n  const fahrenheit = (celsius * 9) / 5 + 32;\n  return fahrenheit;\n}`,
        explanation:
          'Whenever you need a temperature converted, you call toFahrenheit(0) which returns 32, or toFahrenheit(100) which returns 212.',
      },
      {
        title: 'Function with Multiple Parameters',
        code: `function calculateArea(width, height) {\n  return width * height;\n}`,
        explanation:
          'Functions can accept multiple parameters separated by commas. Each parameter receives its corresponding argument in order.',
      },
    ],
    commonPitfalls: [
      {
        mistake: 'Using console.log instead of return',
        whyItHappens:
          'Learners often think console.log sends the answer back to the test grader. It does not!',
        howToFix:
          'Always use "return" to send the output back. Tests only inspect the returned value.',
      },
      {
        mistake: 'Forgetting parentheses when calling a function',
        whyItHappens:
          'Writing "calculateArea" refers to the function itself as an object, without executing it.',
        howToFix:
          'Always use parentheses with arguments to execute: calculateArea(5, 10).',
      },
    ],
    quickCheck: {
      question: 'What is the output of square(5) given this definition?',
      codeSnippet: `function square(x) {\n  console.log(x * x);\n}`,
      options: ['25', 'undefined', 'null', '5'],
      correctIndex: 1,
      explanation:
        'Careful! Even though it printed 25 with console.log, the function does not have a "return" statement, so its return value is undefined!',
    },
    suggestedQuestions: [
      'What is the difference between console.log and return?',
      'Can a function have more than one parameter?',
      'Can a function have multiple return statements?',
      'Why do programmers break code into small functions?',
    ],
    offlineFaq: [
      {
        questionPatterns: ['why return', 'need return', 'need a return', 'what does return do', 'purpose of return'],
        answer:
          'The "return" keyword is how a function sends back its finished answer to whoever called it. Without return, the function finishes its work, drops the result, and leaves you with "undefined".',
      },
      {
        questionPatterns: ['console.log', 'print vs return', 'difference'],
        answer:
          'Imagine writing a math test. "console.log" is like whispering the answer out loud to yourself. "return" is actually writing the answer on the exam paper for the teacher to grade! If you only whisper, the teacher sees a blank paper and marks it undefined.',
      },
      {
        questionPatterns: ['multiple return', 'more returns', 'two returns'],
        answer:
          'Yes! A function can have multiple return statements, usually inside if/else branches (e.g. if (x > 0) return true; else return false;). However, as soon as ANY return statement executes, the function stops immediately!',
      },
      {
        questionPatterns: ['multiple parameters', 'two inputs', 'how many'],
        answer:
          'A function can take as many parameters as you need: function blend(fruit1, fruit2, liquid, ice). Just separate them with commas inside the parentheses.',
      },
      {
        questionPatterns: ['why functions', 'benefit', 'purpose'],
        answer:
          'Functions follow the DRY principle: "Don’t Repeat Yourself". By putting logic into a function, you write and test it once, and can reuse it thousands of times across your entire app.',
      },
    ],
  },

  arrays_lists: {
    conceptId: 'arrays_lists',
    language: 'javascript',
    title: 'Arrays & Lists',
    unitBadge: 'UNIT 5 LESSON',
    subtitle: 'Group and manipulate ordered collections of items like shopping lists and user scores',
    themeColor: '#8B5CF6',
    lipColor: '#7C3AED',
    analogy: {
      title: 'The Numbered Locker Room',
      description:
        'An array is a row of lockers numbered from 0 onwards. In each locker, you can place a number, word, or boolean, and access any item directly by its locker number (index).',
      icon: '🗂️',
    },
    conceptsExplained: [
      {
        term: 'Array Syntax (Square Brackets)',
        definition:
          'Arrays are written with square brackets "[ ]", with items separated by commas.',
        syntaxTip: 'const fruits = ["apple", "banana", "orange"];',
      },
      {
        term: 'Zero-Based Indexing',
        definition:
          'The first item in an array is at index 0. The second is at index 1, and so on.',
        syntaxTip: 'fruits[0]; // "apple"\nfruits[1]; // "banana"',
      },
      {
        term: 'The .length Property',
        definition:
          'Tells you the total number of items currently in the array.',
        syntaxTip: 'fruits.length; // 3',
      },
      {
        term: 'Accessing the Last Item',
        definition:
          'Since indexes start at 0, the last item is always at index (length - 1).',
        syntaxTip: 'const last = fruits[fruits.length - 1];',
      },
    ],
    codeExamples: [
      {
        title: 'Finding the Largest Number in an Array',
        code: `function findMax(numbers) {\n  let max = numbers[0]; // Start with first item\n\n  for (let i = 1; i < numbers.length; i++) {\n    if (numbers[i] > max) {\n      max = numbers[i]; // Found a bigger number\n    }\n  }\n\n  return max;\n}`,
        explanation:
          'We inspect every number in the array using its index "i", comparing it against the biggest number seen so far.',
      },
      {
        title: 'First and Last Item Collector',
        code: `function firstAndLast(items) {\n  const first = items[0];\n  const last = items[items.length - 1];\n  return [first, last];\n}`,
        explanation:
          'You can construct and return brand new arrays by placing values inside square brackets [ ].',
      },
    ],
    commonPitfalls: [
      {
        mistake: 'Trying to access index equal to array.length',
        whyItHappens:
          'If an array has 3 items, its indexes are 0, 1, and 2. Trying to access array[3] gives undefined!',
        howToFix:
          'The last element is always at array[array.length - 1].',
      },
      {
        mistake: 'Confusing an array with its contents',
        whyItHappens:
          'Forgetting that [5] is an array containing the number 5, not the number 5 itself.',
        howToFix:
          'Use square brackets to pull the item out: arr[0].',
      },
    ],
    quickCheck: {
      question: 'In the array const colors = ["red", "green", "blue"], what is colors[1]?',
      options: ['"red"', '"green"', '"blue"', 'undefined'],
      correctIndex: 1,
      explanation:
        'Correct! Because indexing starts at 0 (colors[0] is "red"), index 1 holds the second item: "green"!',
    },
    suggestedQuestions: [
      'Why do array indexes start at 0 instead of 1?',
      'How do I get the last element of an array?',
      'Can an array hold different types of data?',
      'How do I add a new item to an array?',
    ],
    offlineFaq: [
      {
        questionPatterns: ['start at 0', 'index 0', 'why 0'],
        answer:
          'In computer memory, an array is a single continuous row of memory slots. The index indicates the "distance from the start". The very first item has a distance of 0 slots from the beginning!',
      },
      {
        questionPatterns: ['last element', 'last item', 'end of array'],
        answer:
          'To get the last item, use arr[arr.length - 1]. For example, if an array has 5 items, its length is 5, but its indexes are 0, 1, 2, 3, and 4. So index 4 (5 - 1) is the last item!',
      },
      {
        questionPatterns: ['different types', 'mixed', 'numbers and text'],
        answer:
          'Yes! In JavaScript, an array can hold mixed data types: const mixed = [42, "hello", true, 3.14]. However, in most applications, you keep arrays homogeneous (all numbers or all strings) for cleaner code.',
      },
      {
        questionPatterns: ['add item', 'push', 'new item'],
        answer:
          'You can add a new item to the end of an array using the ".push()" method: fruits.push("mango"). This increases the array’s length by 1.',
      },
    ],
  },

  operators: {
    conceptId: 'operators',
    language: 'javascript',
    title: 'Operators & Expressions',
    unitBadge: 'BONUS LESSON',
    subtitle: 'Master comparison, arithmetic, and logical operators in JavaScript',
    themeColor: '#3B82F6',
    lipColor: '#2563EB',
    analogy: {
      title: 'The Math & Logic Toolkit',
      description: 'Operators are the basic tools in your programming toolbox that let you manipulate and evaluate values.',
      icon: '🛠️',
    },
    conceptsExplained: [
      {
        term: 'Logical AND (&&)',
        definition: 'Requires BOTH sides to be true.',
        syntaxTip: 'if (age >= 18 && hasTicket) { ... }',
      },
      {
        term: 'Logical OR (||)',
        definition: 'Requires at least ONE side to be true.',
        syntaxTip: 'if (isWeekend || isHoliday) { ... }',
      },
    ],
    codeExamples: [],
    commonPitfalls: [],
    quickCheck: {
      question: 'What is true && false?',
      options: ['true', 'false', 'undefined', 'null'],
      correctIndex: 1,
      explanation: 'With &&, both sides must be true.',
    },
    suggestedQuestions: ['What is the difference between && and ||?'],
    offlineFaq: [],
  },

  strings: {
    conceptId: 'strings',
    language: 'javascript',
    title: 'Strings & Text',
    unitBadge: 'BONUS LESSON',
    subtitle: 'Learn text manipulation, string methods, and formatting',
    themeColor: '#10B981',
    lipColor: '#059669',
    analogy: {
      title: 'Beads on a String',
      description: 'A string is a sequence of characters linked together like beads on a necklace.',
      icon: '📿',
    },
    conceptsExplained: [],
    codeExamples: [],
    commonPitfalls: [],
    quickCheck: {
      question: 'What is "hello".length?',
      options: ['4', '5', '6', 'undefined'],
      correctIndex: 1,
      explanation: '"hello" has 5 characters.',
    },
    suggestedQuestions: ['How do I combine strings?'],
    offlineFaq: [],
  },

  reading_fixing_code: {
    conceptId: 'reading_fixing_code',
    language: 'javascript',
    title: 'Debugging & Fixing Code',
    unitBadge: 'BONUS LESSON',
    subtitle: 'Read error messages and fix common programming bugs',
    themeColor: '#EF4444',
    lipColor: '#DC2626',
    analogy: {
      title: 'The Code Detective',
      description: 'Debugging is reading clues (error messages and unexpected outputs) to track down bugs in code.',
      icon: '🔍',
    },
    conceptsExplained: [],
    codeExamples: [],
    commonPitfalls: [],
    quickCheck: {
      question: 'What does a SyntaxError usually mean?',
      options: ['Typo in code structure', 'Computer is too slow', 'Internet offline', 'Math mistake'],
      correctIndex: 0,
      explanation: 'SyntaxError means you wrote something that violates JavaScript grammar rules.',
    },
    suggestedQuestions: ['What should I do first when I see an error?'],
    offlineFaq: [],
  },
};
