// db_data.js - WITH EXPLANATIONS

const DB_TOPICS_PYTHON = [
  {
    id: "variables",
    name: "1. Python Variables",
    video_main: "https://www.youtube.com/embed/TqPzwenhMj0", 
    video_reteach: "https://www.youtube.com/embed/Z1Yd7upQsXY", 
    
    questions_batch_1: [
      { q: "x = 10. What is the data type of x?", o: ["float", "int", "str", "bool"], a: 1, e: "In Python, whole numbers without decimals are Integers (int)." },
      { q: "Which function outputs text?", o: ["echo()", "print()", "log()", "write()"], a: 1, e: "print() is the standard function to output data to the console in Python." },
      { q: "Variable names cannot start with...", o: ["A letter", "An underscore", "A number", "Capital letter"], a: 2, e: "Variable names can contain numbers, but cannot START with one." },
      { q: "Which assignment is correct?", o: ["10 = x", "x -> 10", "x = 10", "int x = 10"], a: 2, e: "Python uses '=' for assignment. The variable name goes on the left, value on the right." },
      { q: "What represents a string?", o: ["'Text'", "100", "True", "3.14"], a: 0, e: "Strings are always enclosed in single (') or double (\") quotes." }
    ],
    questions_batch_2: [
      { q: "Is Python case-sensitive?", o: ["Yes", "No", "Sometimes", "Only in loops"], a: 0, e: "Yes. 'Var' and 'var' are treated as two completely different variables." },
      { q: "type(3.14) returns?", o: ["int", "float", "double", "decimal"], a: 1, e: "Numbers with decimal points are Floating Point numbers (float)." },
      { q: "Which variable name is valid?", o: ["2cool", "my-var", "my_var", "var!"], a: 2, e: "Hyphens (-) and exclamation marks (!) are not allowed. Underscores (_) are standard." },
      { q: "Can you change a variable's type?", o: ["Yes (Dynamic)", "No (Static)", "Only once", "Never"], a: 0, e: "Python is dynamically typed, so x=10 can later become x='Hello'." },
      { q: "x = True. What type is x?", o: ["int", "str", "bool", "float"], a: 2, e: "True and False are Boolean (bool) values." }
    ]
  },
  {
    id: "if_statements",
    name: "2. If/Else Statements",
    video_main: "https://www.youtube.com/embed/Zp5MuPOtsSY", 
    video_reteach: "https://www.youtube.com/embed/PqFKRqpHrjw", 

    questions_batch_1: [
      { q: "Keyword for 'Else If'?", o: ["elseif", "else if", "elif", "if else"], a: 2, e: "Python shortens 'Else If' to just 'elif'." },
      { q: "Correct syntax?", o: ["if x > 5:", "if (x > 5)", "if x > 5 then", "if x > 5;"], a: 0, e: "Python if-statements must end with a colon (:)." },
      { q: "Check equality?", o: ["=", "==", "===", "equals"], a: 1, e: "'=' assigns a value. '==' compares two values." },
      { q: "Indentation is...", o: ["Optional", "Mandatory", "Stylistic", "Ignored"], a: 1, e: "Python uses indentation (whitespace) to define blocks of code instead of curly braces." },
      { q: "Logical AND operator?", o: ["&&", "and", "&", "AND"], a: 1, e: "Python uses the English word 'and' for logical conjunction." }
    ],
    questions_batch_2: [
      { q: "Check 'not equal'?", o: ["<>", "!=", "=/=", "not="], a: 1, e: "'!=' is the standard operator for inequality." },
      { q: "Logical OR operator?", o: ["||", "or", "|", "OR"], a: 1, e: "Python uses the English word 'or'." },
      { q: "What runs if 'if' is false?", o: ["then", "else", "stop", "next"], a: 1, e: "The 'else' block executes only when the 'if' condition is False." },
      { q: "Can you nest if statements?", o: ["Yes", "No", "Only 1 level", "Never"], a: 0, e: "Yes, you can have an if statement inside another if statement." },
      { q: "True and False evaluates to?", o: ["True", "False", "Error", "None"], a: 1, e: "For 'and' to be True, BOTH sides must be True. Since one is False, the result is False." }
    ]
  }
];

const DB_TOPICS_JAVA = [
  {
    id: "variables_java",
    name: "1. Java Variables",
    video_main: "https://www.youtube.com/embed/ra8b5_MvFik",
    video_reteach: "https://www.youtube.com/embed/D-P4CbAfDK4",
    
    questions_batch_1: [
      { q: "Keyword to declare a class in Java?", o: ["class", "struct", "new", "type"], a: 0, e: "Every Java application begins with a class definition using the 'class' keyword." },
      { q: "Data type for whole numbers?", o: ["float", "String", "int", "boolean"], a: 2, e: "'int' is the standard primitive type for integers." },
      { q: "Which must end with a semicolon?", o: ["class declaration", "if condition", "method signature", "variable assignment"], a: 3, e: "Java statements (like assignments) must end with ';'. Class/Method blocks do not." },
      { q: "Output text in Java?", o: ["System.out.print()", "Console.write()", "print()", "echo"], a: 0, e: "System.out.print() or println() is the standard output method." },
      { q: "Entry point for Java app?", o: ["main()", "start()", "public static void main", "run()"], a: 2, e: "The JVM looks for 'public static void main(String[] args)' to start the program." }
    ],
    questions_batch_2: [
      { q: "Not a primitive data type?", o: ["byte", "long", "String", "char"], a: 2, e: "String is a Class (Reference Type), not a primitive. That's why it starts with a capital 'S'." },
      { q: "Size of an `int`?", o: ["8 bits", "16 bits", "32 bits", "64 bits"], a: 2, e: "In Java, an int is always 32 bits (4 bytes)." },
      { q: "Prevent variable modification?", o: ["static", "final", "abstract", "private"], a: 1, e: "'final' makes a variable a constant; it cannot be reassigned." },
      { q: "Default boolean value?", o: ["true", "false", "0", "null"], a: 1, e: "Instance boolean variables default to 'false'." },
      { q: "Result of `5 / 2` (int division)?", o: ["2.5", "2", "3", "Error"], a: 1, e: "Integer division truncates the decimal. 5/2 is 2, not 2.5." }
    ]
  },
  {
    id: "conditionals_java",
    name: "2. Java Conditionals",
    video_main: "https://www.youtube.com/embed/74Q7POjS7mQ",
    video_reteach: "https://www.youtube.com/embed/fGeE6JFqNU8",

    questions_batch_1: [
      { q: "Keyword for 'else if'?", o: ["elseif", "else if", "elif", "else-if"], a: 1, e: "Java uses two words: 'else if'." },
      { q: "Group code blocks with?", o: ["()", "[]", "{}", "<>"], a: 2, e: "Curly braces {} are used to define the scope of loops, methods, and if-statements." },
      { q: "Operator for 'equal to'?", o: ["=", "==", "===", "!="], a: 1, e: "'==' checks equality. '=' is for assignment." },
      { q: "Result: (5 > 3) && (10 < 2)?", o: ["true", "false", "Error", "5"], a: 1, e: "True AND False = False." },
      { q: "Result: (3 == 3) || (1 == 0)?", o: ["true", "false", "Error", "3"], a: 0, e: "True OR False = True. Only one side needs to be true." }
    ],
    questions_batch_2: [
      { q: "Not a logical operator?", o: ["&&", "||", "!", "+"], a: 3, e: "'+' is an arithmetic operator (addition), not logical." },
      { q: "Stop switch execution?", o: ["stop", "break", "continue", "exit"], a: 1, e: "'break' prevents the code from falling through to the next case." },
      { q: "Boolean evaluates to?", o: ["true/false", "0/1", "null/void", "Yes/No"], a: 0, e: "Java booleans are strictly true or false, not numbers." },
      { q: "instanceof checks?", o: ["Type", "Inheritance", "Creation", "Length"], a: 0, e: "It tests if an object is an instance of a specific class or subclass." },
      { q: "Inequality operator?", o: ["!=", "><", "==", "=!"], a: 0, e: "'!=' means Not Equal." }
    ]
  }
];
