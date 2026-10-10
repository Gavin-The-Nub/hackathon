import { Problem } from '../core/types';

export const PYTHON_PROBLEMS: Problem[] = [
  {
    "id": "py-vars-01",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "variables_types",
    "secondaryConcepts": [],
    "title": "Calculate Total Cost",
    "statement": "Write a function `total_cost(price, quantity)` that calculates and returns the total cost by multiplying price by quantity.",
    "example": "total_cost(10, 3) returns 30.",
    "starterCode": "def total_cost(price, quantity):\n    # your code here\n    pass\n",
    "functionName": "total_cost",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          10,
          3
        ],
        "expected": 30
      },
      {
        "id": "t2",
        "args": [
          5,
          0
        ],
        "expected": 0
      },
      {
        "id": "t3",
        "args": [
          7,
          4
        ],
        "expected": 28
      },
      {
        "id": "t4",
        "args": [
          12,
          1
        ],
        "expected": 12
      },
      {
        "id": "t5",
        "args": [
          25,
          4
        ],
        "expected": 100
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 100
        },
        {
          "gen": "intInRange",
          "min": 0,
          "max": 100
        }
      ],
      "edgeCases": [
        [
          0,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          50
        ],
        [
          99,
          100
        ]
      ]
    },
    "referenceSolution": "def total_cost(price, quantity):\n    return price * quantity\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Think about what math operator multiplies two numbers in Python.",
      "In Python, use the asterisk symbol to multiply two numbers.",
      "Multiply price by quantity and use return to give back the result."
    ],
    "conceptNote": "In Python, variables store values and basic arithmetic uses standard operators (+, -, *, /). Functions return their output using the return keyword.",
    "commonMistakes": [
      {
        "tag": "wrong_operator",
        "variantCode": "def total_cost(price, quantity):\n    return price + quantity\n"
      }
    ],
    "difficulty": 1,
    "order": 1
  },
  {
    "id": "py-vars-02",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "variables_types",
    "secondaryConcepts": [],
    "title": "Discounted Price",
    "statement": "Write a function `discounted_price(original_price, discount)` that returns the price after subtracting the discount.",
    "example": "discounted_price(100, 20) returns 80.",
    "starterCode": "def discounted_price(original_price, discount):\n    # your code here\n    pass\n",
    "functionName": "discounted_price",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          100,
          20
        ],
        "expected": 80
      },
      {
        "id": "t2",
        "args": [
          50,
          50
        ],
        "expected": 0
      },
      {
        "id": "t3",
        "args": [
          45,
          10
        ],
        "expected": 35
      },
      {
        "id": "t4",
        "args": [
          80,
          0
        ],
        "expected": 80
      },
      {
        "id": "t5",
        "args": [
          200,
          75
        ],
        "expected": 125
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 50,
          "max": 200
        },
        {
          "gen": "intInRange",
          "min": 0,
          "max": 50
        }
      ],
      "edgeCases": [
        [
          100,
          0
        ],
        [
          50,
          50
        ],
        [
          0,
          0
        ]
      ]
    },
    "referenceSolution": "def discounted_price(original_price, discount):\n    return original_price - discount\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "A discount reduces the starting cost. Which operator subtracts values?",
      "Take away the discount amount from the starting price.",
      "Return the starting price minus the discount."
    ],
    "conceptNote": "Subtraction in Python uses the minus operator. Be sure to subtract discount from original_price.",
    "commonMistakes": [
      {
        "tag": "wrong_operator",
        "variantCode": "def discounted_price(original_price, discount):\n    return original_price + discount\n"
      }
    ],
    "difficulty": 1,
    "order": 2,
    "variantOf": "py-vars-01"
  },
  {
    "id": "py-vars-03",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "variables_types",
    "secondaryConcepts": [],
    "title": "Minutes to Seconds",
    "statement": "Write a function `minutes_to_seconds(minutes)` that converts a count of minutes into total seconds.",
    "example": "minutes_to_seconds(3) returns 180.",
    "starterCode": "def minutes_to_seconds(minutes):\n    # your code here\n    pass\n",
    "functionName": "minutes_to_seconds",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          1
        ],
        "expected": 60
      },
      {
        "id": "t2",
        "args": [
          3
        ],
        "expected": 180
      },
      {
        "id": "t3",
        "args": [
          0
        ],
        "expected": 0
      },
      {
        "id": "t4",
        "args": [
          10
        ],
        "expected": 600
      },
      {
        "id": "t5",
        "args": [
          5
        ],
        "expected": 300
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 120
        }
      ],
      "edgeCases": [
        [
          0
        ],
        [
          1
        ],
        [
          60
        ]
      ]
    },
    "referenceSolution": "def minutes_to_seconds(minutes):\n    return minutes * 60\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "How many seconds are in a single minute?",
      "Multiply the minutes argument by 60.",
      "Convert by multiplying the minutes by the number of seconds in one minute."
    ],
    "conceptNote": "Unit conversion involves multiplying or dividing by constant conversion factors like 60.",
    "commonMistakes": [
      {
        "tag": "wrong_factor",
        "variantCode": "def minutes_to_seconds(minutes):\n    return minutes * 100\n"
      }
    ],
    "difficulty": 1,
    "order": 3
  },
  {
    "id": "py-vars-04",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "variables_types",
    "secondaryConcepts": [],
    "title": "Rectangle Area",
    "statement": "Write a function `rectangle_area(width, height)` that returns the area of a rectangle given its width and height.",
    "example": "rectangle_area(5, 4) returns 20.",
    "starterCode": "def rectangle_area(width, height):\n    # your code here\n    pass\n",
    "functionName": "rectangle_area",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          5,
          4
        ],
        "expected": 20
      },
      {
        "id": "t2",
        "args": [
          10,
          10
        ],
        "expected": 100
      },
      {
        "id": "t3",
        "args": [
          0,
          8
        ],
        "expected": 0
      },
      {
        "id": "t4",
        "args": [
          3,
          7
        ],
        "expected": 21
      },
      {
        "id": "t5",
        "args": [
          12,
          5
        ],
        "expected": 60
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 50
        },
        {
          "gen": "intInRange",
          "min": 0,
          "max": 50
        }
      ],
      "edgeCases": [
        [
          0,
          0
        ],
        [
          1,
          1
        ],
        [
          10,
          0
        ]
      ]
    },
    "referenceSolution": "def rectangle_area(width, height):\n    return width * height\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "The area of a rectangle is width multiplied by height.",
      "Use the asterisk multiplication operator between width and height.",
      "Multiply the two side lengths together and give back the result."
    ],
    "conceptNote": "Geometry formulas in Python are calculated using arithmetic operators.",
    "commonMistakes": [
      {
        "tag": "perimeter_instead",
        "variantCode": "def rectangle_area(width, height):\n    return 2 * (width + height)\n"
      }
    ],
    "difficulty": 1,
    "order": 4
  },
  {
    "id": "py-vars-05",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "variables_types",
    "secondaryConcepts": [],
    "title": "Square Number",
    "statement": "Write a function `square(n)` that returns the square of the given number n.",
    "example": "square(6) returns 36.",
    "starterCode": "def square(n):\n    # your code here\n    pass\n",
    "functionName": "square",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          6
        ],
        "expected": 36
      },
      {
        "id": "t2",
        "args": [
          0
        ],
        "expected": 0
      },
      {
        "id": "t3",
        "args": [
          1
        ],
        "expected": 1
      },
      {
        "id": "t4",
        "args": [
          9
        ],
        "expected": 81
      },
      {
        "id": "t5",
        "args": [
          12
        ],
        "expected": 144
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 30
        }
      ],
      "edgeCases": [
        [
          0
        ],
        [
          1
        ],
        [
          2
        ],
        [
          10
        ]
      ]
    },
    "referenceSolution": "def square(n):\n    return n * n\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Squaring a number means multiplying it by itself.",
      "You can do n * n or use n ** 2 in Python.",
      "Return n multiplied by n."
    ],
    "conceptNote": "In Python, exponentiation can be written with n * n or using the power operator **.",
    "commonMistakes": [
      {
        "tag": "doubled_instead",
        "variantCode": "def square(n):\n    return n * 2\n"
      }
    ],
    "difficulty": 1,
    "order": 5,
    "variantOf": "py-vars-01"
  },
  {
    "id": "py-cond-01",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "conditionals",
    "secondaryConcepts": [],
    "title": "Check Even Number",
    "statement": "Write a function `is_even(n)` that returns True if the number is even, and False otherwise.",
    "example": "is_even(4) returns True.",
    "starterCode": "def is_even(n):\n    # your code here\n    pass\n",
    "functionName": "is_even",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          4
        ],
        "expected": true
      },
      {
        "id": "t2",
        "args": [
          7
        ],
        "expected": false
      },
      {
        "id": "t3",
        "args": [
          0
        ],
        "expected": true
      },
      {
        "id": "t4",
        "args": [
          -2
        ],
        "expected": true
      },
      {
        "id": "t5",
        "args": [
          15
        ],
        "expected": false
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": -50,
          "max": 50
        }
      ],
      "edgeCases": [
        [
          0
        ],
        [
          1
        ],
        [
          2
        ],
        [
          -1
        ],
        [
          -2
        ]
      ]
    },
    "referenceSolution": "def is_even(n):\n    return n % 2 == 0\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "The modulo operator % returns the remainder when dividing by 2.",
      "An even number has a remainder of 0 when divided by 2.",
      "Return the boolean result of n % 2 == 0."
    ],
    "conceptNote": "In Python, modulo operator % checks divisibility. Booleans are True and False (capitalized).",
    "commonMistakes": [
      {
        "tag": "inverted_condition",
        "variantCode": "def is_even(n):\n    return n % 2 == 1\n"
      }
    ],
    "difficulty": 1,
    "order": 1
  },
  {
    "id": "py-cond-02",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "conditionals",
    "secondaryConcepts": [],
    "title": "Can Drive",
    "statement": "Write a function `can_drive(age)` that returns True if age is 16 or older, and False otherwise.",
    "example": "can_drive(18) returns True.",
    "starterCode": "def can_drive(age):\n    # your code here\n    pass\n",
    "functionName": "can_drive",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          16
        ],
        "expected": true
      },
      {
        "id": "t2",
        "args": [
          15
        ],
        "expected": false
      },
      {
        "id": "t3",
        "args": [
          21
        ],
        "expected": true
      },
      {
        "id": "t4",
        "args": [
          12
        ],
        "expected": false
      },
      {
        "id": "t5",
        "args": [
          70
        ],
        "expected": true
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 100
        }
      ],
      "edgeCases": [
        [
          15
        ],
        [
          16
        ],
        [
          17
        ],
        [
          0
        ]
      ]
    },
    "referenceSolution": "def can_drive(age):\n    return age >= 16\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Compare the age with the legal threshold of 16.",
      "Check if age is greater than or equal to 16.",
      "A comparison already produces True or False, so hand that result straight back."
    ],
    "conceptNote": "Comparison operators include >= (greater than or equal) and <= (less than or equal).",
    "commonMistakes": [
      {
        "tag": "strictly_greater",
        "variantCode": "def can_drive(age):\n    return age > 16\n"
      }
    ],
    "difficulty": 1,
    "order": 2,
    "variantOf": "py-cond-01"
  },
  {
    "id": "py-cond-03",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "conditionals",
    "secondaryConcepts": [],
    "title": "Max of Two",
    "statement": "Write a function `max_of_two(a, b)` that returns the larger of the two given numbers.",
    "example": "max_of_two(10, 25) returns 25.",
    "starterCode": "def max_of_two(a, b):\n    # your code here\n    pass\n",
    "functionName": "max_of_two",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          10,
          25
        ],
        "expected": 25
      },
      {
        "id": "t2",
        "args": [
          40,
          5
        ],
        "expected": 40
      },
      {
        "id": "t3",
        "args": [
          7,
          7
        ],
        "expected": 7
      },
      {
        "id": "t4",
        "args": [
          -5,
          -2
        ],
        "expected": -2
      },
      {
        "id": "t5",
        "args": [
          0,
          -10
        ],
        "expected": 0
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": -100,
          "max": 100
        },
        {
          "gen": "intInRange",
          "min": -100,
          "max": 100
        }
      ],
      "edgeCases": [
        [
          0,
          0
        ],
        [
          -5,
          -5
        ],
        [
          10,
          -10
        ]
      ]
    },
    "referenceSolution": "def max_of_two(a, b):\n    if a > b:\n        return a\n    return b\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Compare a with b using an if statement.",
      "If a is greater than b, return a; otherwise return b.",
      "Compare the two values, then give back whichever one is larger."
    ],
    "conceptNote": "Use if statements in Python to branch decision paths based on conditions.",
    "commonMistakes": [
      {
        "tag": "returns_minimum",
        "variantCode": "def max_of_two(a, b):\n    if a < b:\n        return a\n    return b\n"
      }
    ],
    "difficulty": 1,
    "order": 3
  },
  {
    "id": "py-cond-04",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "conditionals",
    "secondaryConcepts": [],
    "title": "Check Passing Score",
    "statement": "Write a function `is_passing(score)` that returns True if score is 60 or higher, and False otherwise.",
    "example": "is_passing(75) returns True.",
    "starterCode": "def is_passing(score):\n    # your code here\n    pass\n",
    "functionName": "is_passing",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          75
        ],
        "expected": true
      },
      {
        "id": "t2",
        "args": [
          60
        ],
        "expected": true
      },
      {
        "id": "t3",
        "args": [
          59
        ],
        "expected": false
      },
      {
        "id": "t4",
        "args": [
          100
        ],
        "expected": true
      },
      {
        "id": "t5",
        "args": [
          0
        ],
        "expected": false
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 100
        }
      ],
      "edgeCases": [
        [
          59
        ],
        [
          60
        ],
        [
          61
        ],
        [
          0
        ],
        [
          100
        ]
      ]
    },
    "referenceSolution": "def is_passing(score):\n    return score >= 60\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Check whether score meets or exceeds 60.",
      "Use >= to include the score 60 itself as passing.",
      "Compare the score with the passing mark and give back that True/False answer."
    ],
    "conceptNote": "Threshold checks evaluate if a numerical value is at or above a benchmark.",
    "commonMistakes": [
      {
        "tag": "strictly_greater",
        "variantCode": "def is_passing(score):\n    return score > 60\n"
      }
    ],
    "difficulty": 1,
    "order": 4
  },
  {
    "id": "py-cond-05",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "conditionals",
    "secondaryConcepts": [],
    "title": "Ticket Price by Age",
    "statement": "Write a function `ticket_price(age)` that returns 8 for children under 12, 10 for seniors 65 and up, and 15 for anyone else.",
    "example": "ticket_price(10) returns 8.",
    "starterCode": "def ticket_price(age):\n    # your code here\n    pass\n",
    "functionName": "ticket_price",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          10
        ],
        "expected": 8
      },
      {
        "id": "t2",
        "args": [
          70
        ],
        "expected": 10
      },
      {
        "id": "t3",
        "args": [
          30
        ],
        "expected": 15
      },
      {
        "id": "t4",
        "args": [
          12
        ],
        "expected": 15
      },
      {
        "id": "t5",
        "args": [
          65
        ],
        "expected": 10
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 1,
          "max": 90
        }
      ],
      "edgeCases": [
        [
          11
        ],
        [
          12
        ],
        [
          64
        ],
        [
          65
        ]
      ]
    },
    "referenceSolution": "def ticket_price(age):\n    if age < 12:\n        return 8\n    elif age >= 65:\n        return 10\n    return 15\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Use elif in Python to check multiple conditions in order.",
      "Check age < 12 first, then age >= 65, and return 15 as fallback.",
      "Return 8 if age < 12, 10 if age >= 65, else 15."
    ],
    "conceptNote": "Python uses elif (short for else if) to chain multiple conditions together.",
    "commonMistakes": [
      {
        "tag": "wrong_boundary",
        "variantCode": "def ticket_price(age):\n    if age <= 12:\n        return 8\n    elif age > 65:\n        return 10\n    return 15\n"
      }
    ],
    "difficulty": 2,
    "order": 5,
    "variantOf": "py-cond-01"
  },
  {
    "id": "py-loops-01",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "loops",
    "secondaryConcepts": [],
    "title": "Sum Up to N",
    "statement": "Write a function `sum_up_to(n)` that uses a for loop to compute the sum of all integers from 1 up to n.",
    "example": "sum_up_to(4) returns 10 (1 + 2 + 3 + 4).",
    "starterCode": "def sum_up_to(n):\n    # your code here\n    pass\n",
    "functionName": "sum_up_to",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          4
        ],
        "expected": 10
      },
      {
        "id": "t2",
        "args": [
          1
        ],
        "expected": 1
      },
      {
        "id": "t3",
        "args": [
          5
        ],
        "expected": 15
      },
      {
        "id": "t4",
        "args": [
          10
        ],
        "expected": 55
      },
      {
        "id": "t5",
        "args": [
          0
        ],
        "expected": 0
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 50
        }
      ],
      "edgeCases": [
        [
          0
        ],
        [
          1
        ],
        [
          2
        ],
        [
          20
        ]
      ]
    },
    "referenceSolution": "def sum_up_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n",
    "requiredConstructs": [
      "for_loop"
    ],
    "prewrittenHints": [
      "In Python, range stops one before its end value, so extend the end by one to include n.",
      "Accumulate each number into a running total variable initialized to 0.",
      "Loop over the numbers 1 through n and add each one to a running total."
    ],
    "conceptNote": "In Python, for i in range(start, stop) loops up to but not including stop. To include n, use n + 1.",
    "commonMistakes": [
      {
        "tag": "misses_last_number",
        "variantCode": "def sum_up_to(n):\n    total = 0\n    for i in range(1, n):\n        total += i\n    return total\n"
      }
    ],
    "difficulty": 1,
    "order": 1
  },
  {
    "id": "py-loops-02",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "loops",
    "secondaryConcepts": [],
    "title": "Countdown List",
    "statement": "Write a function `count_down(start)` using a while loop that returns a list counting down from start to 0.",
    "example": "count_down(3) returns [3, 2, 1, 0].",
    "starterCode": "def count_down(start):\n    # your code here\n    pass\n",
    "functionName": "count_down",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          3
        ],
        "expected": [
          3,
          2,
          1,
          0
        ]
      },
      {
        "id": "t2",
        "args": [
          0
        ],
        "expected": [
          0
        ]
      },
      {
        "id": "t3",
        "args": [
          1
        ],
        "expected": [
          1,
          0
        ]
      },
      {
        "id": "t4",
        "args": [
          5
        ],
        "expected": [
          5,
          4,
          3,
          2,
          1,
          0
        ]
      },
      {
        "id": "t5",
        "args": [
          2
        ],
        "expected": [
          2,
          1,
          0
        ]
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 20
        }
      ],
      "edgeCases": [
        [
          0
        ],
        [
          1
        ],
        [
          10
        ]
      ]
    },
    "referenceSolution": "def count_down(start):\n    res = []\n    while start >= 0:\n        res.append(start)\n        start -= 1\n    return res\n",
    "requiredConstructs": [
      "while_loop"
    ],
    "prewrittenHints": [
      "Initialize an empty list res = [].",
      "Keep going while the counter is not negative: save it to the list, then reduce it by one.",
      "Remember start -= 1 inside the loop to avoid an infinite loop."
    ],
    "conceptNote": "While loops repeat as long as their condition is true. Ensure the loop counter decreases each step.",
    "commonMistakes": [
      {
        "tag": "misses_zero",
        "variantCode": "def count_down(start):\n    res = []\n    while start > 0:\n        res.append(start)\n        start -= 1\n    return res\n"
      }
    ],
    "difficulty": 1,
    "order": 2,
    "variantOf": "py-loops-01"
  },
  {
    "id": "py-loops-03",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "loops",
    "secondaryConcepts": [],
    "title": "Factorial",
    "statement": "Write a function `factorial(n)` that uses a for loop to compute n! (the product of numbers from 1 to n).",
    "example": "factorial(4) returns 24 (1 * 2 * 3 * 4).",
    "starterCode": "def factorial(n):\n    # your code here\n    pass\n",
    "functionName": "factorial",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          4
        ],
        "expected": 24
      },
      {
        "id": "t2",
        "args": [
          1
        ],
        "expected": 1
      },
      {
        "id": "t3",
        "args": [
          0
        ],
        "expected": 1
      },
      {
        "id": "t4",
        "args": [
          3
        ],
        "expected": 6
      },
      {
        "id": "t5",
        "args": [
          5
        ],
        "expected": 120
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 8
        }
      ],
      "edgeCases": [
        [
          0
        ],
        [
          1
        ],
        [
          6
        ],
        [
          7
        ]
      ]
    },
    "referenceSolution": "def factorial(n):\n    total = 1\n    for i in range(1, n + 1):\n        total *= i\n    return total\n",
    "requiredConstructs": [
      "for_loop"
    ],
    "prewrittenHints": [
      "Initialize the product variable to 1, not 0.",
      "Multiply total by each integer from 1 to n.",
      "Loop over 1 through n and multiply a running product by each number."
    ],
    "conceptNote": "When accumulating products in a loop, start with 1 so you do not multiply by zero.",
    "commonMistakes": [
      {
        "tag": "initializes_to_zero",
        "variantCode": "def factorial(n):\n    total = 0\n    for i in range(1, n + 1):\n        total *= i\n    return total\n"
      }
    ],
    "difficulty": 2,
    "order": 3
  },
  {
    "id": "py-loops-04",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "loops",
    "secondaryConcepts": [],
    "title": "Repeat String",
    "statement": "Write a function `repeat_text(text, count)` using a loop that concatenates text together count times.",
    "example": "repeat_text(\"hi\", 3) returns \"hihihi\".",
    "starterCode": "def repeat_text(text, count):\n    # your code here\n    pass\n",
    "functionName": "repeat_text",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          "hi",
          3
        ],
        "expected": "hihihi"
      },
      {
        "id": "t2",
        "args": [
          "a",
          1
        ],
        "expected": "a"
      },
      {
        "id": "t3",
        "args": [
          "py",
          0
        ],
        "expected": ""
      },
      {
        "id": "t4",
        "args": [
          "!",
          4
        ],
        "expected": "!!!!"
      },
      {
        "id": "t5",
        "args": [
          "ok",
          2
        ],
        "expected": "okok"
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "asciiWord",
          "minLen": 1,
          "maxLen": 4
        },
        {
          "gen": "intInRange",
          "min": 0,
          "max": 10
        }
      ],
      "edgeCases": [
        [
          "",
          5
        ],
        [
          "abc",
          0
        ],
        [
          "x",
          1
        ]
      ]
    },
    "referenceSolution": "def repeat_text(text, count):\n    res = \"\"\n    for _ in range(count):\n        res += text\n    return res\n",
    "requiredConstructs": [
      "any_loop"
    ],
    "prewrittenHints": [
      "Initialize an empty string res = \"\".",
      "Repeat the body as many times as the count, building the text as you go.",
      "Add text to res on each iteration."
    ],
    "conceptNote": "Strings can be concatenated repeatedly inside loops using +=.",
    "commonMistakes": [
      {
        "tag": "misses_one_repetition",
        "variantCode": "def repeat_text(text, count):\n    res = \"\"\n    for _ in range(count - 1):\n        res += text\n    return res\n"
      }
    ],
    "difficulty": 1,
    "order": 4
  },
  {
    "id": "py-loops-05",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "loops",
    "secondaryConcepts": [],
    "title": "Count Evens in Range",
    "statement": "Write a function `count_evens(limit)` using a loop that counts how many even numbers exist between 1 and limit inclusive.",
    "example": "count_evens(5) returns 2 (2 and 4).",
    "starterCode": "def count_evens(limit):\n    # your code here\n    pass\n",
    "functionName": "count_evens",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          5
        ],
        "expected": 2
      },
      {
        "id": "t2",
        "args": [
          1
        ],
        "expected": 0
      },
      {
        "id": "t3",
        "args": [
          6
        ],
        "expected": 3
      },
      {
        "id": "t4",
        "args": [
          10
        ],
        "expected": 5
      },
      {
        "id": "t5",
        "args": [
          0
        ],
        "expected": 0
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 0,
          "max": 50
        }
      ],
      "edgeCases": [
        [
          0
        ],
        [
          1
        ],
        [
          2
        ],
        [
          49
        ],
        [
          50
        ]
      ]
    },
    "referenceSolution": "def count_evens(limit):\n    cnt = 0\n    for i in range(1, limit + 1):\n        if i % 2 == 0:\n            cnt += 1\n    return cnt\n",
    "requiredConstructs": [
      "for_loop"
    ],
    "prewrittenHints": [
      "Walk through every number from 1 up to and including the limit.",
      "Use if i % 2 == 0 to check if each number is even.",
      "Increment your counter whenever an even number is found."
    ],
    "conceptNote": "Combining loops and conditionals lets you filter or count specific items.",
    "commonMistakes": [
      {
        "tag": "counts_odds_instead",
        "variantCode": "def count_evens(limit):\n    cnt = 0\n    for i in range(1, limit + 1):\n        if i % 2 == 1:\n            cnt += 1\n    return cnt\n"
      }
    ],
    "difficulty": 2,
    "order": 5,
    "variantOf": "py-loops-01"
  },
  {
    "id": "py-func-01",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "functions",
    "secondaryConcepts": [],
    "title": "Personalized Greeting",
    "statement": "Write a function `greet(name)` that returns a greeting string formatted as `Hello, <name>!`.",
    "example": "greet(\"Alex\") returns \"Hello, Alex!\".",
    "starterCode": "def greet(name):\n    # your code here\n    pass\n",
    "functionName": "greet",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          "Alex"
        ],
        "expected": "Hello, Alex!"
      },
      {
        "id": "t2",
        "args": [
          "CodeChamp"
        ],
        "expected": "Hello, CodeChamp!"
      },
      {
        "id": "t3",
        "args": [
          "World"
        ],
        "expected": "Hello, World!"
      },
      {
        "id": "t4",
        "args": [
          "Python"
        ],
        "expected": "Hello, Python!"
      },
      {
        "id": "t5",
        "args": [
          "Sam"
        ],
        "expected": "Hello, Sam!"
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "asciiWord",
          "minLen": 2,
          "maxLen": 8
        }
      ],
      "edgeCases": [
        [
          "A"
        ],
        [
          "User"
        ],
        [
          "Champion"
        ]
      ]
    },
    "referenceSolution": "def greet(name):\n    return \"Hello, \" + name + \"!\"\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "You can combine strings with the + operator or an f-string.",
      "Include the comma and exclamation mark in the template.",
      "Glue a greeting word, a comma and space, the name and an exclamation mark into one string."
    ],
    "conceptNote": "In Python, string formatting is easily done with string concatenation (+) or f-strings.",
    "commonMistakes": [
      {
        "tag": "missing_exclamation",
        "variantCode": "def greet(name):\n    return \"Hello, \" + name\n"
      }
    ],
    "difficulty": 1,
    "order": 1
  },
  {
    "id": "py-func-02",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "functions",
    "secondaryConcepts": [],
    "title": "Celsius to Fahrenheit",
    "statement": "Write a function `celsius_to_fahrenheit(c)` that converts degrees Celsius to Fahrenheit using the formula (c * 9 / 5) + 32.",
    "example": "celsius_to_fahrenheit(0) returns 32.0.",
    "starterCode": "def celsius_to_fahrenheit(c):\n    # your code here\n    pass\n",
    "functionName": "celsius_to_fahrenheit",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          0
        ],
        "expected": 32
      },
      {
        "id": "t2",
        "args": [
          100
        ],
        "expected": 212
      },
      {
        "id": "t3",
        "args": [
          25
        ],
        "expected": 77
      },
      {
        "id": "t4",
        "args": [
          -40
        ],
        "expected": -40
      },
      {
        "id": "t5",
        "args": [
          10
        ],
        "expected": 50
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": -50,
          "max": 150
        }
      ],
      "edgeCases": [
        [
          0
        ],
        [
          100
        ],
        [
          -40
        ],
        [
          37
        ]
      ]
    },
    "referenceSolution": "def celsius_to_fahrenheit(c):\n    return (c * 9 / 5) + 32\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Multiply Celsius by 9, divide by 5, then add 32.",
      "Use parentheses to maintain order of operations.",
      "Scale Celsius by nine fifths, then shift by the freezing-point offset."
    ],
    "conceptNote": "Functions encapsulate math conversions so you can reuse them anywhere in your program.",
    "commonMistakes": [
      {
        "tag": "wrong_addition",
        "variantCode": "def celsius_to_fahrenheit(c):\n    return (c * 9 / 5) - 32\n"
      }
    ],
    "difficulty": 1,
    "order": 2,
    "variantOf": "py-func-01"
  },
  {
    "id": "py-func-03",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "functions",
    "secondaryConcepts": [],
    "title": "Full Name Formatter",
    "statement": "Write a function `full_name(first, last)` that joins first and last names separated by a single space.",
    "example": "full_name(\"Ada\", \"Lovelace\") returns \"Ada Lovelace\".",
    "starterCode": "def full_name(first, last):\n    # your code here\n    pass\n",
    "functionName": "full_name",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          "Ada",
          "Lovelace"
        ],
        "expected": "Ada Lovelace"
      },
      {
        "id": "t2",
        "args": [
          "Alan",
          "Turing"
        ],
        "expected": "Alan Turing"
      },
      {
        "id": "t3",
        "args": [
          "Guido",
          "van Rossum"
        ],
        "expected": "Guido van Rossum"
      },
      {
        "id": "t4",
        "args": [
          "Grace",
          "Hopper"
        ],
        "expected": "Grace Hopper"
      },
      {
        "id": "t5",
        "args": [
          "John",
          "Doe"
        ],
        "expected": "John Doe"
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "asciiWord",
          "minLen": 2,
          "maxLen": 8
        },
        {
          "gen": "asciiWord",
          "minLen": 2,
          "maxLen": 8
        }
      ],
      "edgeCases": [
        [
          "A",
          "B"
        ],
        [
          "First",
          "Last"
        ]
      ]
    },
    "referenceSolution": "def full_name(first, last):\n    return first + \" \" + last\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Add a space string between first and last name.",
      "Join the two names with a single space between them; string joining or an f-string both work.",
      "Return the joined names with a space."
    ],
    "conceptNote": "String joining in Python can be performed using addition operators with literal space strings.",
    "commonMistakes": [
      {
        "tag": "missing_space",
        "variantCode": "def full_name(first, last):\n    return first + last\n"
      }
    ],
    "difficulty": 1,
    "order": 3
  },
  {
    "id": "py-func-04",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "functions",
    "secondaryConcepts": [],
    "title": "Calculate BMI",
    "statement": "Write a function `calculate_bmi(weight, height)` that returns body mass index rounded to 1 decimal place: weight / (height * height).",
    "example": "calculate_bmi(70, 1.75) returns 22.9.",
    "starterCode": "def calculate_bmi(weight, height):\n    # your code here\n    pass\n",
    "functionName": "calculate_bmi",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          70,
          1.75
        ],
        "expected": 22.9
      },
      {
        "id": "t2",
        "args": [
          80,
          1.8
        ],
        "expected": 24.7
      },
      {
        "id": "t3",
        "args": [
          60,
          1.65
        ],
        "expected": 22
      },
      {
        "id": "t4",
        "args": [
          95,
          1.9
        ],
        "expected": 26.3
      },
      {
        "id": "t5",
        "args": [
          50,
          1.6
        ],
        "expected": 19.5
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 45,
          "max": 110
        },
        {
          "gen": "intInRange",
          "min": 140,
          "max": 200
        }
      ],
      "edgeCases": [
        [
          70,
          1.75
        ],
        [
          80,
          1.8
        ],
        [
          55,
          1.65
        ]
      ]
    },
    "referenceSolution": "def calculate_bmi(weight, height):\n    return round(weight / (height * height), 1)\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Divide weight by the square of height.",
      "Use Python built-in round(val, 1) to round to one decimal place.",
      "Divide weight by height squared, then round to one decimal place."
    ],
    "conceptNote": "The built-in round(number, ndigits) function in Python rounds floating point numbers.",
    "commonMistakes": [
      {
        "tag": "forgot_to_square",
        "variantCode": "def calculate_bmi(weight, height):\n    return round(weight / height, 1)\n"
      }
    ],
    "difficulty": 2,
    "order": 4
  },
  {
    "id": "py-func-05",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "functions",
    "secondaryConcepts": [],
    "title": "Is Divisible",
    "statement": "Write a function `is_divisible(num, divisor)` that returns True if num is evenly divisible by divisor, else False.",
    "example": "is_divisible(15, 5) returns True.",
    "starterCode": "def is_divisible(num, divisor):\n    # your code here\n    pass\n",
    "functionName": "is_divisible",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          15,
          5
        ],
        "expected": true
      },
      {
        "id": "t2",
        "args": [
          14,
          5
        ],
        "expected": false
      },
      {
        "id": "t3",
        "args": [
          100,
          10
        ],
        "expected": true
      },
      {
        "id": "t4",
        "args": [
          7,
          3
        ],
        "expected": false
      },
      {
        "id": "t5",
        "args": [
          24,
          6
        ],
        "expected": true
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intInRange",
          "min": 1,
          "max": 100
        },
        {
          "gen": "intInRange",
          "min": 1,
          "max": 20
        }
      ],
      "edgeCases": [
        [
          10,
          1
        ],
        [
          10,
          10
        ],
        [
          1,
          2
        ]
      ]
    },
    "referenceSolution": "def is_divisible(num, divisor):\n    return num % divisor == 0\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "Check if the remainder of num divided by divisor is 0.",
      "Use the modulo % operator and equality == 0.",
      "A number divides evenly when the remainder is zero, so test the remainder."
    ],
    "conceptNote": "Functions with boolean returns often evaluate equality checks directly.",
    "commonMistakes": [
      {
        "tag": "wrong_order",
        "variantCode": "def is_divisible(num, divisor):\n    return divisor % num == 0\n"
      }
    ],
    "difficulty": 1,
    "order": 5,
    "variantOf": "py-func-01"
  },
  {
    "id": "py-arr-01",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "arrays_lists",
    "secondaryConcepts": [],
    "title": "Find Maximum",
    "statement": "Write a function `find_max(numbers)` using a loop that returns the largest number in a non-empty list of numbers.",
    "example": "find_max([3, 7, 2, 9, 4]) returns 9.",
    "starterCode": "def find_max(numbers):\n    # your code here\n    pass\n",
    "functionName": "find_max",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          [
            3,
            7,
            2,
            9,
            4
          ]
        ],
        "expected": 9
      },
      {
        "id": "t2",
        "args": [
          [
            -5,
            -2,
            -10
          ]
        ],
        "expected": -2
      },
      {
        "id": "t3",
        "args": [
          [
            42
          ]
        ],
        "expected": 42
      },
      {
        "id": "t4",
        "args": [
          [
            10,
            20,
            30,
            5
          ]
        ],
        "expected": 30
      },
      {
        "id": "t5",
        "args": [
          [
            0,
            0,
            0
          ]
        ],
        "expected": 0
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intArray",
          "minLen": 1,
          "maxLen": 10,
          "min": -50,
          "max": 50
        }
      ],
      "edgeCases": [
        [
          [
            1
          ]
        ],
        [
          [
            -100
          ]
        ],
        [
          [
            5,
            5,
            5
          ]
        ],
        [
          [
            1,
            2,
            3,
            4,
            5
          ]
        ]
      ]
    },
    "referenceSolution": "def find_max(numbers):\n    max_val = numbers[0]\n    for n in numbers:\n        if n > max_val:\n            max_val = n\n    return max_val\n",
    "requiredConstructs": [
      "any_loop"
    ],
    "prewrittenHints": [
      "Initialize your max variable to the first element numbers[0].",
      "Loop through each element and update max if the current number is bigger.",
      "Return the maximum value found after the loop finishes."
    ],
    "conceptNote": "In Python, lists are indexed with [0]. You can iterate through lists directly with for item in list:.",
    "commonMistakes": [
      {
        "tag": "initializes_to_zero",
        "variantCode": "def find_max(numbers):\n    max_val = 0\n    for n in numbers:\n        if n > max_val:\n            max_val = n\n    return max_val\n"
      }
    ],
    "difficulty": 1,
    "order": 1
  },
  {
    "id": "py-arr-02",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "arrays_lists",
    "secondaryConcepts": [],
    "title": "Sum List Numbers",
    "statement": "Write a function `sum_list(numbers)` using a loop that returns the sum of all numbers in the list.",
    "example": "sum_list([1, 2, 3, 4]) returns 10.",
    "starterCode": "def sum_list(numbers):\n    # your code here\n    pass\n",
    "functionName": "sum_list",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "expected": 10
      },
      {
        "id": "t2",
        "args": [
          []
        ],
        "expected": 0
      },
      {
        "id": "t3",
        "args": [
          [
            5
          ]
        ],
        "expected": 5
      },
      {
        "id": "t4",
        "args": [
          [
            -2,
            2,
            -3,
            3
          ]
        ],
        "expected": 0
      },
      {
        "id": "t5",
        "args": [
          [
            10,
            20,
            30
          ]
        ],
        "expected": 60
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intArray",
          "minLen": 0,
          "maxLen": 10,
          "min": -20,
          "max": 20
        }
      ],
      "edgeCases": [
        [
          []
        ],
        [
          [
            0
          ]
        ],
        [
          [
            100
          ]
        ]
      ]
    },
    "referenceSolution": "def sum_list(numbers):\n    total = 0\n    for n in numbers:\n        total += n\n    return total\n",
    "requiredConstructs": [
      "any_loop"
    ],
    "prewrittenHints": [
      "Initialize a total variable to 0.",
      "Iterate over every item in numbers and add it to total.",
      "Return total after the loop completes."
    ],
    "conceptNote": "Accumulating values across a list is a fundamental algorithmic pattern in Python.",
    "commonMistakes": [
      {
        "tag": "wrong_initial_value",
        "variantCode": "def sum_list(numbers):\n    total = 1\n    for n in numbers:\n        total += n\n    return total\n"
      }
    ],
    "difficulty": 1,
    "order": 2,
    "variantOf": "py-arr-01"
  },
  {
    "id": "py-arr-03",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "arrays_lists",
    "secondaryConcepts": [],
    "title": "Filter Positive Numbers",
    "statement": "Write a function `filter_positives(numbers)` that uses a loop to return a new list containing only numbers greater than 0.",
    "example": "filter_positives([-2, 5, 0, -1, 8]) returns [5, 8].",
    "starterCode": "def filter_positives(numbers):\n    # your code here\n    pass\n",
    "functionName": "filter_positives",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          [
            -2,
            5,
            0,
            -1,
            8
          ]
        ],
        "expected": [
          5,
          8
        ]
      },
      {
        "id": "t2",
        "args": [
          [
            1,
            2,
            3
          ]
        ],
        "expected": [
          1,
          2,
          3
        ]
      },
      {
        "id": "t3",
        "args": [
          [
            -1,
            -2,
            -3
          ]
        ],
        "expected": []
      },
      {
        "id": "t4",
        "args": [
          []
        ],
        "expected": []
      },
      {
        "id": "t5",
        "args": [
          [
            0,
            10,
            -5,
            20
          ]
        ],
        "expected": [
          10,
          20
        ]
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intArray",
          "minLen": 0,
          "maxLen": 10,
          "min": -30,
          "max": 30
        }
      ],
      "edgeCases": [
        [
          []
        ],
        [
          [
            0
          ]
        ],
        [
          [
            -5
          ]
        ],
        [
          [
            5
          ]
        ]
      ]
    },
    "referenceSolution": "def filter_positives(numbers):\n    res = []\n    for n in numbers:\n        if n > 0:\n            res.append(n)\n    return res\n",
    "requiredConstructs": [
      "any_loop"
    ],
    "prewrittenHints": [
      "Initialize an empty list res = [].",
      "Check if each element n > 0 inside your loop.",
      "Collect each matching number into a new list, then give that list back."
    ],
    "conceptNote": "In Python, list.append(x) adds an item x to the end of a list.",
    "commonMistakes": [
      {
        "tag": "includes_zero",
        "variantCode": "def filter_positives(numbers):\n    res = []\n    for n in numbers:\n        if n >= 0:\n            res.append(n)\n    return res\n"
      }
    ],
    "difficulty": 2,
    "order": 3
  },
  {
    "id": "py-arr-04",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "arrays_lists",
    "secondaryConcepts": [],
    "title": "Reverse List",
    "statement": "Write a function `reverse_list(items)` that returns a new list with elements in reverse order.",
    "example": "reverse_list([1, 2, 3]) returns [3, 2, 1].",
    "starterCode": "def reverse_list(items):\n    # your code here\n    pass\n",
    "functionName": "reverse_list",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          [
            1,
            2,
            3
          ]
        ],
        "expected": [
          3,
          2,
          1
        ]
      },
      {
        "id": "t2",
        "args": [
          []
        ],
        "expected": []
      },
      {
        "id": "t3",
        "args": [
          [
            42
          ]
        ],
        "expected": [
          42
        ]
      },
      {
        "id": "t4",
        "args": [
          [
            5,
            4,
            3,
            2,
            1
          ]
        ],
        "expected": [
          1,
          2,
          3,
          4,
          5
        ]
      },
      {
        "id": "t5",
        "args": [
          [
            "a",
            "b",
            "c"
          ]
        ],
        "expected": [
          "c",
          "b",
          "a"
        ]
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intArray",
          "minLen": 0,
          "maxLen": 10,
          "min": 0,
          "max": 50
        }
      ],
      "edgeCases": [
        [
          []
        ],
        [
          [
            1
          ]
        ],
        [
          [
            1,
            2
          ]
        ]
      ]
    },
    "referenceSolution": "def reverse_list(items):\n    return items[::-1]\n",
    "requiredConstructs": [],
    "prewrittenHints": [
      "In Python, list slicing with [::-1] returns a reversed copy.",
      "You can slice with items[::-1] or build a reversed list with a loop.",
      "Slicing with a step of negative one gives you the reversed list."
    ],
    "conceptNote": "Python slice notation [start:stop:step] with step -1 reverses any sequence.",
    "commonMistakes": [
      {
        "tag": "returns_same_list",
        "variantCode": "def reverse_list(items):\n    return items\n"
      }
    ],
    "difficulty": 1,
    "order": 4
  },
  {
    "id": "py-arr-05",
    "language": "python",
    "type": "write_function",
    "primaryConcept": "arrays_lists",
    "secondaryConcepts": [],
    "title": "Count Occurrences",
    "statement": "Write a function `count_occurrences(items, target)` using a loop that counts how many times target appears in items.",
    "example": "count_occurrences([1, 2, 2, 3, 2], 2) returns 3.",
    "starterCode": "def count_occurrences(items, target):\n    # your code here\n    pass\n",
    "functionName": "count_occurrences",
    "visibleTests": [
      {
        "id": "t1",
        "args": [
          [
            1,
            2,
            2,
            3,
            2
          ],
          2
        ],
        "expected": 3
      },
      {
        "id": "t2",
        "args": [
          [
            1,
            2,
            3
          ],
          4
        ],
        "expected": 0
      },
      {
        "id": "t3",
        "args": [
          [],
          5
        ],
        "expected": 0
      },
      {
        "id": "t4",
        "args": [
          [
            7,
            7,
            7
          ],
          7
        ],
        "expected": 3
      },
      {
        "id": "t5",
        "args": [
          [
            0,
            1,
            0
          ],
          0
        ],
        "expected": 2
      }
    ],
    "hiddenTests": {
      "count": 20,
      "args": [
        {
          "gen": "intArray",
          "minLen": 0,
          "maxLen": 12,
          "min": 0,
          "max": 5
        },
        {
          "gen": "intInRange",
          "min": 0,
          "max": 5
        }
      ],
      "edgeCases": [
        [
          [],
          1
        ],
        [
          [
            1
          ],
          1
        ],
        [
          [
            1
          ],
          2
        ]
      ]
    },
    "referenceSolution": "def count_occurrences(items, target):\n    cnt = 0\n    for item in items:\n        if item == target:\n            cnt += 1\n    return cnt\n",
    "requiredConstructs": [
      "any_loop"
    ],
    "prewrittenHints": [
      "Initialize a counter to 0.",
      "Walk through the items and test each one for equality with the target.",
      "Increment counter when matched, and return counter."
    ],
    "conceptNote": "Linear frequency counting iterates over each element and increments a counter for matches.",
    "commonMistakes": [
      {
        "tag": "stops_early",
        "variantCode": "def count_occurrences(items, target):\n    cnt = 0\n    for item in items[:-1]:\n        if item == target:\n            cnt += 1\n    return cnt\n"
      }
    ],
    "difficulty": 1,
    "order": 5,
    "variantOf": "py-arr-01"
  }
];