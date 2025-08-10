// Language detection patterns - Enhanced
const languagePatterns = {
  Python: {
    keywords: ['def ', 'import ', 'from ', 'class ', 'if __name__', 'print(', 'elif ', 'lambda ', 'yield ', 'with ', 'try:', 'except:', 'finally:', 'pass', 'self.'],
    syntax: [/def\s+\w+\s*\(/, /import\s+\w+/, /from\s+\w+\s+import/, /class\s+\w+/, /if\s+__name__\s*==\s*['"']__main__['"']/, /print\s*\(/, /:\s*$/, /^\s+/],
    fileExtensions: ['.py'],
    indentationSensitive: true
  },
  JavaScript: {
    keywords: ['function ', 'const ', 'let ', 'var ', 'console.log', 'return ', 'if (', 'for (', 'while (', 'class ', '=>', 'async ', 'await ', 'require('],
    syntax: [/function\s+\w+\s*\(/, /const\s+\w+/, /let\s+\w+/, /var\s+\w+/, /console\.log\s*\(/, /=>\s*/, /\{\s*$/, /\}\s*$/, /;\s*$/],
    fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    indentationSensitive: false
  },
  Java: {
    keywords: ['public class', 'private ', 'public ', 'static ', 'void ', 'import ', 'package ', 'extends ', 'implements ', 'System.out'],
    syntax: [/public\s+class\s+\w+/, /private\s+\w+/, /public\s+\w+/, /static\s+\w+/, /void\s+\w+/, /import\s+[\w.]+/, /package\s+[\w.]+/, /System\.out/],
    fileExtensions: ['.java'],
    indentationSensitive: false
  },
  'C++': {
    keywords: ['#include', 'using namespace', 'int main', 'std::', 'cout <<', 'cin >>', 'class ', 'struct ', 'void ', 'int ', 'char ', 'double '],
    syntax: [/#include\s*[<"]/, /using\s+namespace\s+\w+/, /int\s+main\s*\(/, /std::\w+/, /cout\s*<</, /cin\s*>>/, /class\s+\w+/, /struct\s+\w+/],
    fileExtensions: ['.cpp', '.cc', '.cxx', '.c++', '.hpp', '.h'],
    indentationSensitive: false
  }
};

export const detectLanguage = (code: string): string | null => {
  if (!code.trim()) return null;

  const scores: Record<string, number> = {};
  
  // Initialize scores
  Object.keys(languagePatterns).forEach(lang => {
    scores[lang] = 0;
  });

  // Check for keywords and syntax patterns
  Object.entries(languagePatterns).forEach(([language, patterns]) => {
    // Check keywords
    patterns.keywords.forEach(keyword => {
      const keywordCount = (code.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      scores[language] += keywordCount * 2;
    });

    // Check syntax patterns
    patterns.syntax.forEach(pattern => {
      const syntaxMatches = (code.match(pattern) || []).length;
      scores[language] += syntaxMatches * 3;
    });

    // Check indentation style (Python specific)
    if (language === 'Python' && patterns.indentationSensitive) {
      const lines = code.split('\n');
      let indentedLines = 0;
      lines.forEach(line => {
        if (line.match(/^\s{4,}/) || line.match(/^\t/)) {
          indentedLines++;
        }
      });
      if (indentedLines > lines.length * 0.2) {
        scores[language] += 5;
      }
    }
  });

  // Find the language with highest score
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return null;

  const detectedLanguage = Object.keys(scores).find(lang => scores[lang] === maxScore);
  return detectedLanguage || null;
};

export const validateLanguageMatch = (code: string, selectedLanguage: string): boolean => {
  const detectedLanguage = detectLanguage(code);
  if (!detectedLanguage) return true; // If can't detect, assume it's valid
  
  return detectedLanguage === selectedLanguage;
};

// Enhanced error detection patterns for different languages
export const detectErrors = (code: string, language: string): string[] => {
  const lines = code.split('\n');
  const trimmedCode = code.trim();
  
  if (!trimmedCode) {
    return ['Code is empty - please paste some code to analyze'];
  }

  // Check if input is just plain text (not code)
  if (isPlainText(trimmedCode)) {
    return ['This appears to be plain text, not code. Please paste actual programming code for analysis.'];
  }

  // Language-specific error detection
  let errors: string[] = [];
  
  switch (language) {
    case 'Python':
      errors = detectPythonErrors(code, lines);
      break;
    case 'JavaScript':
      errors = detectJavaScriptErrors(code, lines);
      break;
    case 'Java':
      errors = detectJavaErrors(code, lines);
      break;
    case 'C++':
      errors = detectCppErrors(code, lines);
      break;
    default:
      errors = detectGenericErrors(code, lines);
      break;
  }

  // Add generic validation for all languages
  const genericErrors = detectGenericErrors(code, lines);
  errors = [...errors, ...genericErrors.filter(err => !errors.includes(err))];

  return errors;
};

// Enhanced function to detect if input is plain text vs code
const isPlainText = (text: string): boolean => {
  // More comprehensive code indicators
  const codeIndicators = [
    // Programming symbols and operators
    /[{}();=<>!&|]+/,
    // Variable declarations and keywords
    /\b(var|let|const|int|string|float|double|bool|boolean|char|void|class|def|function|public|private|protected|static|final|abstract|interface|enum|struct|union|namespace|using|import|include|require|from|as|in|is|not|and|or|if|else|elif|for|while|do|switch|case|default|break|continue|return|yield|try|catch|except|finally|throw|throws|new|delete|this|super|self|null|undefined|true|false|None|True|False)\b/,
    // Method calls and array access
    /\w+\s*\(.*\)/,
    /\w+\[.*\]/,
    /\w+\.\w+/,
    // Comments
    /\/\/|\/\*|\*\/|#|<!--/,
    // Include/import statements
    /#include|import|require|using|from.*import/,
    // String literals with quotes
    /["'`][^"'`]*["'`]/,
    // Common programming patterns
    /\+\+|--|&&|\|\||==|!=|<=|>=|=>|->|\*=|\+=|-=|\/=/,
    // Indentation patterns (Python-like)
    /^\s{4,}/m,
    // Semicolons at end of lines
    /;\s*$/m,
    // Curly braces with content
    /\{\s*\w+/,
    // Array/object literals
    /\[.*\]|\{.*\}/
  ];
  
  // Count how many code indicators are present
  const indicatorCount = codeIndicators.reduce((count, pattern) => {
    return count + (pattern.test(text) ? 1 : 0);
  }, 0);
  
  // If we have multiple indicators, it's likely code
  // Also check for minimum length to avoid false positives
  return indicatorCount < 2 && text.length < 100;
};

const detectPythonErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  let indentLevel = 0;
  let expectedIndent = false;
  
  // Check for syntax errors
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    if (!trimmedLine) return; // Skip empty lines
    
    // Missing colon after control statements
    if (line.match(/^\s*(if|for|while|def|class|elif|else|try|except|finally|with)\s+.*[^:]$/)) {
      errors.push(`Line ${lineNum}: Missing colon (:) after control statement`);
    }
    
    // Check for incorrect indentation
    const currentIndent = line.length - line.trimLeft().length;
    if (expectedIndent && currentIndent <= indentLevel && trimmedLine !== '') {
      errors.push(`Line ${lineNum}: Expected indentation after previous statement`);
    }
    
    if (line.match(/:\s*$/)) {
      expectedIndent = true;
      indentLevel = currentIndent;
    } else if (currentIndent > indentLevel) {
      expectedIndent = false;
    }
    
    // Undefined variables (basic check for print statements)
    const printMatch = line.match(/print\s*\(\s*(\w+)\s*\)/);
    if (printMatch && !code.includes(`${printMatch[1]} =`) && !code.includes(`def ${printMatch[1]}`)) {
      errors.push(`Line ${lineNum}: Variable '${printMatch[1]}' may be undefined`);
    }
    
    // Missing parentheses in function calls
    if (line.match(/print\s+\w+/) && !line.includes('(')) {
      errors.push(`Line ${lineNum}: Missing parentheses in print statement`);
    }
    
    // Incorrect equality operator
    if (line.match(/if\s+\w+\s*=\s*\w+/)) {
      errors.push(`Line ${lineNum}: Use '==' for comparison, not '=' for assignment in if statement`);
    }
  });
  
  // Check for missing imports
  if (code.includes('json.') && !code.includes('import json')) {
    errors.push('Missing import: json module used but not imported');
  }
  if (code.includes('os.') && !code.includes('import os')) {
    errors.push('Missing import: os module used but not imported');
  }
  
  return errors;
};

const detectJavaScriptErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  let bracketCount = 0;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    if (!trimmedLine) return;
    
    // Missing semicolons (more comprehensive)
    if (line.match(/^\s*(var|let|const|return)\s+.*[^;{}\s]$/) && !line.includes('//')) {
      errors.push(`Line ${lineNum}: Missing semicolon`);
    }
    
    // Function call without parentheses
    if (line.match(/console\.log\s+\w+/) && !line.includes('(')) {
      errors.push(`Line ${lineNum}: Missing parentheses in console.log`);
    }
    
    // Incorrect console.log capitalization
    if (line.match(/Console\.log/i) && !line.match(/console\.log/)) {
      errors.push(`Line ${lineNum}: Incorrect capitalization - use 'console.log'`);
    }
    
    // Using var instead of let/const
    if (line.includes('var ')) {
      errors.push(`Line ${lineNum}: Consider using 'let' or 'const' instead of 'var'`);
    }
    
    // Missing 'new' keyword for constructors
    if (line.match(/=\s*[A-Z]\w+\s*\(/)) {
      errors.push(`Line ${lineNum}: Missing 'new' keyword for constructor`);
    }
    
    // Track brackets
    bracketCount += (line.match(/\{/g) || []).length;
    bracketCount -= (line.match(/\}/g) || []).length;
  });
  
  // Check for unmatched brackets
  if (bracketCount !== 0) {
    errors.push('Unmatched curly brackets in code');
  }
  
  // Check for missing require/import statements
  if (code.includes('fs.') && !code.includes('require(\'fs\')') && !code.includes('import')) {
    errors.push('Missing require statement for fs module');
  }
  
  return errors;
};

const detectJavaErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  let hasMain = false;
  let hasClass = false;
  let bracketBalance = 0;
  let parenBalance = 0;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) return;
    
    // Check for main method
    if (line.includes('public static void main') || line.includes('static void main')) {
      hasMain = true;
    }
    
    // Check for class declaration
    if (line.match(/^\s*(public\s+)?class\s+\w+/)) {
      hasClass = true;
    }
    
    // Enhanced semicolon detection
    if (line.match(/^\s*(int|String|boolean|double|float|char|long|short|byte|Integer|Double|Float|Character|Boolean)\s+\w+.*[^;{}\s]$/) && !line.includes('//')) {
      errors.push(`Line ${lineNum}: Missing semicolon after variable declaration`);
    }
    
    // Method calls without semicolon
    if (line.match(/^\s*\w+\.\w+\([^)]*\)\s*$/) && !line.includes(';') && !line.includes('{')) {
      errors.push(`Line ${lineNum}: Missing semicolon after method call`);
    }
    
    // Assignment statements without semicolon
    if (line.match(/^\s*\w+\s*=\s*[^;{]+$/) && !line.includes(';') && !line.includes('{') && !line.includes('//')) {
      errors.push(`Line ${lineNum}: Missing semicolon after assignment statement`);
    }
    
    // Return statements without semicolon
    if (line.match(/^\s*return\s+[^;]+$/) && !line.includes(';') && !line.includes('//')) {
      errors.push(`Line ${lineNum}: Missing semicolon after return statement`);
    }
    
    // System.out statements without semicolon
    if ((line.includes('System.out.print') || line.includes('System.out.println')) && !line.includes(';')) {
      errors.push(`Line ${lineNum}: Missing semicolon after System.out statement`);
    }
    
    // Incorrect System.out capitalization
    if (line.match(/system\.out/i) && !line.match(/System\.out/)) {
      errors.push(`Line ${lineNum}: Incorrect capitalization - use 'System.out' (capital S)`);
    }
    
    // Missing access modifiers for methods (more specific)
    if (line.match(/^\s*(void|int|String|boolean|double|float|char)\s+\w+\s*\([^)]*\)\s*\{?/) && 
        !line.includes('public') && !line.includes('private') && !line.includes('protected') && !line.includes('static')) {
      errors.push(`Line ${lineNum}: Missing access modifier (public, private, or protected) for method`);
    }
    
    // Track brackets and parentheses
    bracketBalance += (line.match(/\{/g) || []).length;
    bracketBalance -= (line.match(/\}/g) || []).length;
    parenBalance += (line.match(/\(/g) || []).length;
    parenBalance -= (line.match(/\)/g) || []).length;
    
    // String comparison with == instead of .equals()
    if (line.match(/\w+\s*==\s*['"]/)) {
      errors.push(`Line ${lineNum}: Use .equals() method for string comparison, not == operator`);
    }
    
    // Scanner usage without import
    if (line.includes('Scanner') && !code.includes('import java.util.Scanner')) {
      errors.push(`Line ${lineNum}: Scanner class used but java.util.Scanner not imported`);
    }
    
    // ArrayList usage without import
    if (line.includes('ArrayList') && !code.includes('import java.util.ArrayList')) {
      errors.push(`Line ${lineNum}: ArrayList class used but java.util.ArrayList not imported`);
    }
    
    // If/while/for statements without braces (style warning)
    if (line.match(/^\s*(if|while|for)\s*\([^)]*\)\s*$/) && lines[index + 1] && !lines[index + 1].trim().startsWith('{')) {
      const nextLine = lines[index + 1].trim();
      if (nextLine && !nextLine.includes(';')) {
        errors.push(`Line ${lineNum}: Consider using braces {} for ${line.match(/^\s*(if|while|for)/)?.[1]} statement`);
      }
    }
    
    // Missing break in switch cases
    if (line.includes('case ') && lines.slice(index + 1, index + 5).some(l => l.includes('case ')) && 
        !lines.slice(index, index + 5).some(l => l.includes('break'))) {
      errors.push(`Line ${lineNum}: Missing 'break' statement in switch case`);
    }
  });
  
  // Overall structure validation
  if (!hasClass && code.length > 50) {
    errors.push('Missing public class declaration - Java programs must have a public class');
  }
  
  if (hasClass && !hasMain && code.length > 100) {
    errors.push('Missing main method - add: public static void main(String[] args)');
  }
  
  // Bracket balance validation
  if (bracketBalance !== 0) {
    if (bracketBalance > 0) {
      errors.push(`Missing ${bracketBalance} closing brace(s) '}'`);
    } else {
      errors.push(`Extra ${Math.abs(bracketBalance)} closing brace(s) '}'`);
    }
  }
  
  if (parenBalance !== 0) {
    if (parenBalance > 0) {
      errors.push(`Missing ${parenBalance} closing parenthesis ')'`);
    } else {
      errors.push(`Extra ${Math.abs(parenBalance)} closing parenthesis ')'`);
    }
  }
  
  return errors;
};

const detectCppErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  let hasMain = false;
  let hasInclude = false;
  let bracketBalance = 0;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) return;
    
    // Check for main function
    if (line.includes('int main') || line.includes('void main')) {
      hasMain = true;
    }
    
    // Check for includes
    if (line.includes('#include')) {
      hasInclude = true;
    }
    
    // Missing semicolons
    if (line.match(/^\s*(int|char|double|float|string|bool)\s+\w+.*[^;{}\s]$/) && !line.includes('//')) {
      errors.push(`Line ${lineNum}: Missing semicolon after variable declaration`);
    }
    
    // Missing std:: prefix
    if ((line.includes('cout') || line.includes('cin') || line.includes('endl')) && !line.includes('std::')) {
      errors.push(`Line ${lineNum}: Missing 'std::' prefix for standard library functions`);
    }
    
    // Incorrect cout/cin usage
    if (line.includes('cout') && !line.includes('<<')) {
      errors.push(`Line ${lineNum}: cout should use '<<' operator`);
    }
    
    if (line.includes('cin') && !line.includes('>>')) {
      errors.push(`Line ${lineNum}: cin should use '>>' operator`);
    }
    
    // Track brackets
    bracketBalance += (line.match(/\{/g) || []).length;
    bracketBalance -= (line.match(/\}/g) || []).length;
  });
  
  // Overall structure validation
  if (!hasInclude && code.length > 50) {
    errors.push('Missing #include statements - C++ programs typically need includes');
  }
  
  if (!hasMain && code.length > 100) {
    errors.push('Missing main function - C++ programs need int main() or void main()');
  }
  
  if (bracketBalance !== 0) {
    errors.push(`Unmatched curly brackets: ${bracketBalance > 0 ? 'missing closing' : 'extra closing'} braces`);
  }
  
  return errors;
};

// Enhanced generic error detection
const detectGenericErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  
  // Check for unmatched brackets/parentheses globally
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Unmatched parentheses: ${openParens} opening, ${closeParens} closing`);
  }
  
  const openBrackets = (code.match(/\{/g) || []).length;
  const closeBrackets = (code.match(/\}/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(`Unmatched curly brackets: ${openBrackets} opening, ${closeBrackets} closing`);
  }
  
  const openSquare = (code.match(/\[/g) || []).length;
  const closeSquare = (code.match(/\]/g) || []).length;
  if (openSquare !== closeSquare) {
    errors.push(`Unmatched square brackets: ${openSquare} opening, ${closeSquare} closing`);
  }
  
  // Check for very long lines
  lines.forEach((line, index) => {
    if (line.length > 120) {
      errors.push(`Line ${index + 1}: Line too long (${line.length} characters), consider breaking it down`);
    }
  });
  
  // Check for common typos in keywords
  const commonTypos = [
    { typo: /functoin/g, correct: 'function' },
    { typo: /retrun/g, correct: 'return' },
    { typo: /lenght/g, correct: 'length' },
    { typo: /widht/g, correct: 'width' },
    { typo: /heigth/g, correct: 'height' }
  ];
  
  commonTypos.forEach(({ typo, correct }) => {
    if (typo.test(code)) {
      errors.push(`Possible typo detected - did you mean '${correct}'?`);
    }
  });
  
  return errors;
};