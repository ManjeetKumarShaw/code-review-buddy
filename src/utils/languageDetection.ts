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

// Safe helper function to execute regex operations
const safeRegexTest = (pattern: RegExp, text: string): boolean => {
  try {
    return pattern.test(text);
  } catch (error) {
    console.warn('Regex test failed:', error);
    return false;
  }
};

// Safe helper function to execute regex match operations
const safeRegexMatch = (pattern: RegExp | string, text: string): RegExpMatchArray | null => {
  try {
    if (typeof pattern === 'string') {
      return text.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    }
    return text.match(pattern);
  } catch (error) {
    console.warn('Regex match failed:', error);
    return null;
  }
};

// Safe helper function to split text into lines
const safeTextSplit = (text: string): string[] => {
  try {
    if (typeof text !== 'string') {
      return [];
    }
    return text.split('\n');
  } catch (error) {
    console.warn('Text split failed:', error);
    return [];
  }
};

export const detectLanguage = (code: string): string | null => {
  try {
    // Input validation
    if (!code || typeof code !== 'string') {
      return null;
    }

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return null;
    }

    const scores: Record<string, number> = {};
    
    // Initialize scores safely
    try {
      Object.keys(languagePatterns).forEach(lang => {
        scores[lang] = 0;
      });
    } catch (error) {
      console.warn('Score initialization failed:', error);
      return null;
    }

    // Check for keywords and syntax patterns with error handling
    Object.entries(languagePatterns).forEach(([language, patterns]) => {
      try {
        // Check keywords safely
        if (Array.isArray(patterns.keywords)) {
          patterns.keywords.forEach(keyword => {
            try {
              const matches = safeRegexMatch(keyword, code);
              const keywordCount = matches ? matches.length : 0;
              scores[language] += keywordCount * 2;
            } catch (error) {
              console.warn(`Keyword check failed for ${language}:`, error);
            }
          });
        }

        // Check syntax patterns safely
        if (Array.isArray(patterns.syntax)) {
          patterns.syntax.forEach(pattern => {
            try {
              const matches = safeRegexMatch(pattern, code);
              const syntaxMatches = matches ? matches.length : 0;
              scores[language] += syntaxMatches * 3;
            } catch (error) {
              console.warn(`Syntax check failed for ${language}:`, error);
            }
          });
        }

        // Check indentation style (Python specific) safely
        if (language === 'Python' && patterns.indentationSensitive) {
          try {
            const lines = safeTextSplit(code);
            let indentedLines = 0;
            lines.forEach(line => {
              try {
                if (safeRegexTest(/^\s{4,}/, line) || safeRegexTest(/^\t/, line)) {
                  indentedLines++;
                }
              } catch (error) {
                console.warn('Indentation check failed:', error);
              }
            });
            if (lines.length > 0 && indentedLines > lines.length * 0.2) {
              scores[language] += 5;
            }
          } catch (error) {
            console.warn('Python indentation analysis failed:', error);
          }
        }
      } catch (error) {
        console.warn(`Language pattern check failed for ${language}:`, error);
      }
    });

    // Find the language with highest score safely
    try {
      const scoreValues = Object.values(scores);
      if (scoreValues.length === 0) {
        return null;
      }
      
      const maxScore = Math.max(...scoreValues);
      if (maxScore === 0) {
        return null;
      }

      const detectedLanguage = Object.keys(scores).find(lang => scores[lang] === maxScore);
      return detectedLanguage || null;
    } catch (error) {
      console.warn('Score analysis failed:', error);
      return null;
    }
  } catch (error) {
    console.error('Language detection failed:', error);
    return null;
  }
};

export const validateLanguageMatch = (code: string, selectedLanguage: string): boolean => {
  try {
    // Input validation
    if (!code || typeof code !== 'string' || !selectedLanguage || typeof selectedLanguage !== 'string') {
      return true; // Assume valid if inputs are invalid
    }

    const detectedLanguage = detectLanguage(code);
    if (!detectedLanguage) {
      return true; // If can't detect, assume it's valid
    }
    
    return detectedLanguage === selectedLanguage;
  } catch (error) {
    console.warn('Language validation failed:', error);
    return true; // Assume valid on error
  }
};

// ULTRA-COMPREHENSIVE ERROR DETECTION SYSTEM
export const detectErrors = (code: string, language: string): string[] => {
  try {
    // Input validation
    if (!code || typeof code !== 'string') {
      return ['Invalid input: Code must be a valid string'];
    }

    if (!language || typeof language !== 'string') {
      return ['Invalid input: Language must be specified'];
    }

    const lines = safeTextSplit(code);
    const trimmedCode = code.trim();
    
    if (!trimmedCode) {
      return ['Code is empty - please paste some code to analyze'];
    }

    // Check if input is just plain text (not code) safely
    try {
      if (isPlainText(trimmedCode)) {
        return ['This appears to be plain text, not code. Please paste actual programming code for analysis.'];
      }
    } catch (error) {
      console.warn('Plain text detection failed:', error);
    }

    // Start comprehensive error detection
    let errors: string[] = [];
    
    // 1. Universal syntax errors (all languages)
    try {
      errors = [...errors, ...detectUniversalSyntaxErrors(code, lines)];
    } catch (error) {
      console.warn('Universal syntax detection failed:', error);
    }

    // 2. Language-specific errors
    try {
      switch (language) {
        case 'Python':
          errors = [...errors, ...detectComprehensivePythonErrors(code, lines)];
          break;
        case 'JavaScript':
          errors = [...errors, ...detectComprehensiveJavaScriptErrors(code, lines)];
          break;
        case 'Java':
          errors = [...errors, ...detectComprehensiveJavaErrors(code, lines)];
          break;
        case 'C++':
          errors = [...errors, ...detectComprehensiveCppErrors(code, lines)];
          break;
        default:
          errors = [...errors, ...detectGenericErrors(code, lines)];
          break;
      }
    } catch (error) {
      console.warn(`Language-specific error detection failed for ${language}:`, error);
    }

    // 3. Security vulnerabilities
    try {
      errors = [...errors, ...detectSecurityVulnerabilities(code, language)];
    } catch (error) {
      console.warn('Security vulnerability detection failed:', error);
    }

    // 4. Performance issues
    try {
      errors = [...errors, ...detectPerformanceIssues(code, language, lines)];
    } catch (error) {
      console.warn('Performance issue detection failed:', error);
    }

    // 5. Code quality issues
    try {
      errors = [...errors, ...detectCodeQualityIssues(code, language, lines)];
    } catch (error) {
      console.warn('Code quality detection failed:', error);
    }

    // 6. Logical errors
    try {
      errors = [...errors, ...detectLogicalErrors(code, language, lines)];
    } catch (error) {
      console.warn('Logical error detection failed:', error);
    }

    // Remove duplicates and return
    const uniqueErrors = [...new Set(errors)].filter(err => err && err.trim() !== '');
    return uniqueErrors.length > 0 ? uniqueErrors : ['No errors detected'];
  } catch (error) {
    console.error('Complete error detection failed:', error);
    return ['Error detection encountered issues, but analysis completed'];
  }
};

// UNIVERSAL SYNTAX ERRORS (ALL LANGUAGES)
const detectUniversalSyntaxErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  
  try {
    // 1. Bracket/Parentheses/Quote matching
    const brackets = { '{': '}', '[': ']', '(': ')' };
    const quotes = ['"', "'", '`'];
    
    // Check unmatched brackets
    Object.entries(brackets).forEach(([open, close]) => {
      try {
        const openCount = (code.match(new RegExp(`\\${open}`, 'g')) || []).length;
        const closeCount = (code.match(new RegExp(`\\${close}`, 'g')) || []).length;
        if (openCount !== closeCount) {
          errors.push(`Unmatched ${open}${close}: ${openCount} opening, ${closeCount} closing`);
        }
      } catch (error) {
        console.warn(`Bracket matching failed for ${open}${close}:`, error);
      }
    });

    // Check unmatched quotes
    quotes.forEach(quote => {
      try {
        const matches = code.match(new RegExp(`\\${quote}`, 'g'));
        if (matches && matches.length % 2 !== 0) {
          errors.push(`Unmatched ${quote} quotes - found ${matches.length} occurrences`);
        }
      } catch (error) {
        console.warn(`Quote matching failed for ${quote}:`, error);
      }
    });

    // 2. Line-specific syntax errors
    lines.forEach((line, index) => {
      try {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) return;

        // Empty statements
        if (trimmed === ';') {
          errors.push(`Line ${lineNum}: Empty statement - unnecessary semicolon`);
        }

        // Trailing whitespace
        if (line !== line.trimRight()) {
          errors.push(`Line ${lineNum}: Trailing whitespace detected`);
        }

        // Very long lines
        if (line.length > 120) {
          errors.push(`Line ${lineNum}: Line too long (${line.length} chars) - consider breaking it down`);
        }

        // Mixed indentation
        if (line.match(/^\t/) && code.includes('    ')) {
          errors.push(`Line ${lineNum}: Mixed indentation - tabs and spaces`);
        }
        if (line.match(/^    /) && code.includes('\t')) {
          errors.push(`Line ${lineNum}: Mixed indentation - spaces and tabs`);
        }

        // TODO/FIXME comments without description
        if (safeRegexTest(/\/\/\s*(TODO|FIXME)\s*$/i, line) || safeRegexTest(/#\s*(TODO|FIXME)\s*$/i, line)) {
          errors.push(`Line ${lineNum}: TODO/FIXME comment without description`);
        }

        // Hardcoded values that should be constants
        if (safeRegexTest(/=\s*["'](?:localhost|127\.0\.0\.1|password|secret|key)["']/i, line)) {
          errors.push(`Line ${lineNum}: Hardcoded sensitive value - consider using environment variables`);
        }

      } catch (error) {
        console.warn(`Universal line analysis failed for line ${index + 1}:`, error);
      }
    });

    // 3. Universal typos
    const universalTypos = [
      { pattern: /\bfunctoin\b/g, correct: 'function' },
      { pattern: /\bretrun\b/g, correct: 'return' },
      { pattern: /\blenght\b/g, correct: 'length' },
      { pattern: /\bwidht\b/g, correct: 'width' },
      { pattern: /\bheigth\b/g, correct: 'height' },
      { pattern: /\bcalss\b/g, correct: 'class' },
      { pattern: /\bpubilc\b/g, correct: 'public' },
      { pattern: /\bprivae\b/g, correct: 'private' },
      { pattern: /\bimort\b/g, correct: 'import' },
      { pattern: /\binclud\b/g, correct: 'include' },
      { pattern: /\bstirng\b/g, correct: 'string' },
      { pattern: /\bbooelan\b/g, correct: 'boolean' },
      { pattern: /\bconsloe\b/g, correct: 'console' },
      { pattern: /\bdocument\b/g, correct: 'document' }
    ];

    universalTypos.forEach(({ pattern, correct }) => {
      try {
        const matches = code.match(pattern);
        if (matches) {
          errors.push(`Typo detected: '${matches[0]}' should be '${correct}'`);
        }
      } catch (error) {
        console.warn(`Universal typo check failed for ${correct}:`, error);
      }
    });

  } catch (error) {
    console.warn('Universal syntax error detection failed:', error);
  }

  return errors;
};

// COMPREHENSIVE PYTHON ERROR DETECTION
const detectComprehensivePythonErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  
  try {
    let indentLevel = 0;
    let expectedIndent = false;
    let inFunction = false;
    let inClass = false;
    let hasReturn = false;
    
    // Python syntax patterns
    const pythonErrorPatterns = [
      // Missing colons
      { pattern: /\b(if|elif|else|for|while|def|class|try|except|finally|with)\s+[^:]*[^:]$/, message: 'Missing colon (:) after control statement' },
      // Print without parentheses (Python 2 vs 3)
      { pattern: /\bprint\s+[^(]/, message: 'Use print() with parentheses (Python 3 syntax)' },
      // Assignment in if condition
      { pattern: /if\s+\w+\s*=\s*\w+/, message: 'Use == for comparison, not = for assignment' },
      // Missing self parameter
      { pattern: /def\s+\w+\s*\(\s*\)\s*:/, message: 'Instance method missing self parameter' },
      // Incorrect indentation
      { pattern: /^\s*(if|for|while|def|class|try|except|finally|with).*:\s*$/, message: 'Expected indented block after colon' },
      // Missing imports
      { pattern: /json\.|os\.|sys\.|random\.|math\./, message: 'Module used but not imported' },
      // Undefined variables (basic patterns)
      { pattern: /print\s*\(\s*(\w+)\s*\)/, message: 'Variable may be undefined' }
    ];

    // All possible Python typos
    const pythonTypos = [
      { pattern: /\bpirnt\b/g, correct: 'print' },
      { pattern: /\bpritn\b/g, correct: 'print' },
      { pattern: /\bprtin\b/g, correct: 'print' },
      { pattern: /\bprnt\b/g, correct: 'print' },
      { pattern: /\bimort\b/g, correct: 'import' },
      { pattern: /\bimprot\b/g, correct: 'import' },
      { pattern: /\bipmort\b/g, correct: 'import' },
      { pattern: /\bfom\b/g, correct: 'from' },
      { pattern: /\bfrom\s+\w+\s+imort\b/g, correct: 'import' },
      { pattern: /\brnage\b/g, correct: 'range' },
      { pattern: /\brnge\b/g, correct: 'range' },
      { pattern: /\braneg\b/g, correct: 'range' },
      { pattern: /\brang\b/g, correct: 'range' },
      { pattern: /\binput\b/g, correct: 'input' },
      { pattern: /\binpt\b/g, correct: 'input' },
      { pattern: /\bstr\b/g, correct: 'str' },
      { pattern: /\bint\b/g, correct: 'int' },
      { pattern: /\bfloat\b/g, correct: 'float' },
      { pattern: /\blist\b/g, correct: 'list' },
      { pattern: /\bdict\b/g, correct: 'dict' },
      { pattern: /\btuple\b/g, correct: 'tuple' },
      { pattern: /\bset\b/g, correct: 'set' },
      { pattern: /\blen\b/g, correct: 'len' },
      { pattern: /\bappned\b/g, correct: 'append' },
      { pattern: /\bapend\b/g, correct: 'append' },
      { pattern: /\bappend\b/g, correct: 'append' }
    ];

    lines.forEach((line, index) => {
      try {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        if (!trimmed || trimmed.startsWith('#')) return;

        // Check all Python typos
        pythonTypos.forEach(({ pattern, correct }) => {
          try {
            if (pattern.test(line)) {
              errors.push(`Line ${lineNum}: Typo detected - use '${correct}'`);
            }
          } catch (error) {
            console.warn(`Python typo check failed:`, error);
          }
        });

        // Check syntax patterns
        pythonErrorPatterns.forEach(({ pattern, message }) => {
          try {
            if (safeRegexTest(pattern, line)) {
              errors.push(`Line ${lineNum}: ${message}`);
            }
          } catch (error) {
            console.warn(`Python pattern check failed:`, error);
          }
        });

        // Indentation checking
        try {
          const currentIndent = line.length - line.trimStart().length;
          
          if (expectedIndent && currentIndent <= indentLevel && trimmed !== '') {
            errors.push(`Line ${lineNum}: Expected indentation after previous statement`);
          }
          
          if (line.endsWith(':')) {
            expectedIndent = true;
            indentLevel = currentIndent;
            
            if (line.includes('def ')) {
              inFunction = true;
              hasReturn = false;
            }
            if (line.includes('class ')) inClass = true;
          } else if (currentIndent > indentLevel) {
            expectedIndent = false;
          }

          // Check for return statement in functions
          if (line.includes('return')) hasReturn = true;
        } catch (error) {
          console.warn('Python indentation check failed:', error);
        }

        // Function/class specific checks
        if (inFunction && line.includes('def ') && !hasReturn && !line.includes('yield')) {
          // Will check at end of function
        }

        // Variable assignment patterns
        if (safeRegexTest(/^\s*\w+\s*=/, line)) {
          // Check for common assignment errors
          if (safeRegexTest(/=\s*$/, line)) {
            errors.push(`Line ${lineNum}: Incomplete assignment - missing value`);
          }
        }

        // Import checks
        if (line.includes('import')) {
          if (safeRegexTest(/import\s*$/, line)) {
            errors.push(`Line ${lineNum}: Incomplete import statement`);
          }
        }

      } catch (error) {
        console.warn(`Python line analysis failed for line ${index + 1}:`, error);
      }
    });

    // Module usage without imports
    const moduleChecks = [
      { usage: 'json.', import: 'import json' },
      { usage: 'os.', import: 'import os' },
      { usage: 'sys.', import: 'import sys' },
      { usage: 'random.', import: 'import random' },
      { usage: 'math.', import: 'import math' },
      { usage: 'datetime.', import: 'import datetime' },
      { usage: 're.', import: 'import re' },
      { usage: 'urllib.', import: 'import urllib' },
      { usage: 'requests.', import: 'import requests' },
      { usage: 'numpy.', import: 'import numpy' },
      { usage: 'pandas.', import: 'import pandas' }
    ];

    moduleChecks.forEach(({ usage, import: importStmt }) => {
      if (code.includes(usage) && !code.includes(importStmt) && !code.includes(`from ${usage.slice(0, -1)}`)) {
        errors.push(`Missing import: ${usage.slice(0, -1)} module used but not imported`);
      }
    });

  } catch (error) {
    console.warn('Python comprehensive error detection failed:', error);
  }

  return errors;
};

// COMPREHENSIVE JAVASCRIPT ERROR DETECTION
const detectComprehensiveJavaScriptErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  
  try {
    let bracketCount = 0;
    let parenCount = 0;
    let hasStrictMode = code.includes('"use strict"') || code.includes("'use strict'");
    
    // JavaScript error patterns
    const jsErrorPatterns = [
      // Missing semicolons
      { pattern: /^\s*(var|let|const|return)\s+.*[^;{}\s]$/, message: 'Missing semicolon' },
      { pattern: /^\s*\w+\s*=\s*[^;{}\s]+$/, message: 'Missing semicolon after assignment' },
      { pattern: /^\s*\w+\.\w+\([^)]*\)\s*$/, message: 'Missing semicolon after function call' },
      // Console.log errors
      { pattern: /console\.log\s+[^(]/, message: 'Missing parentheses in console.log' },
      { pattern: /Console\.log/i, message: 'Incorrect capitalization - use console.log' },
      // Variable declaration errors
      { pattern: /const\s+\w+\s*(?!=)/, message: 'const declaration must be initialized' },
      { pattern: /let\s+\w+\s*=\s*$/, message: 'Incomplete let assignment' },
      // Function errors
      { pattern: /function\s+\w+\s*[^(]/, message: 'Missing parentheses in function declaration' },
      { pattern: /function\s+\w+\([^)]*\)\s*[^{]/, message: 'Missing opening brace in function' },
      // Constructor errors
      { pattern: /=\s*[A-Z]\w+\s*\(/, message: 'Missing new keyword for constructor' },
      // Comparison errors
      { pattern: /if\s*\([^)]*=\s*[^=]/, message: 'Assignment in if condition - use == or ===' }
    ];

    // All possible JavaScript typos
    const jsTypos = [
      { pattern: /\bconsoel\b/g, correct: 'console' },
      { pattern: /\bconsloe\b/g, correct: 'console' },
      { pattern: /\bconosle\b/g, correct: 'console' },
      { pattern: /\bcnosole\b/g, correct: 'console' },
      { pattern: /\bfunctoin\b/g, correct: 'function' },
      { pattern: /\bfunciton\b/g, correct: 'function' },
      { pattern: /\bfucntion\b/g, correct: 'function' },
      { pattern: /\bfuntcion\b/g, correct: 'function' },
      { pattern: /\bretrun\b/g, correct: 'return' },
      { pattern: /\bretrn\b/g, correct: 'return' },
      { pattern: /\bretunr\b/g, correct: 'return' },
      { pattern: /\bvra\b/g, correct: 'var' },
      { pattern: /\bvar\b/g, correct: 'var' },
      { pattern: /\bif\b/g, correct: 'if' },
      { pattern: /\belse\b/g, correct: 'else' },
      { pattern: /\bfor\b/g, correct: 'for' },
      { pattern: /\bwhile\b/g, correct: 'while' },
      { pattern: /\btrue\b/g, correct: 'true' },
      { pattern: /\bfalse\b/g, correct: 'false' },
      { pattern: /\bnull\b/g, correct: 'null' },
      { pattern: /\bundefined\b/g, correct: 'undefined' }
    ];

    lines.forEach((line, index) => {
      try {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

        // Check all JavaScript typos
        jsTypos.forEach(({ pattern, correct }) => {
          try {
            if (pattern.test(line) && !safeRegexTest(new RegExp(`\\b${correct}\\b`), line)) {
              errors.push(`Line ${lineNum}: Typo detected - check spelling of '${correct}'`);
            }
          } catch (error) {
            console.warn(`JavaScript typo check failed:`, error);
          }
        });

        // Check error patterns
        jsErrorPatterns.forEach(({ pattern, message }) => {
          try {
            if (safeRegexTest(pattern, line) && !line.includes('//')) {
              errors.push(`Line ${lineNum}: ${message}`);
            }
          } catch (error) {
            console.warn(`JavaScript pattern check failed:`, error);
          }
        });

        // Variable declaration checks
        if (line.includes('var ') && !hasStrictMode) {
          errors.push(`Line ${lineNum}: Consider using 'let' or 'const' instead of 'var'`);
        }

        // Bracket tracking
        try {
          bracketCount += (line.match(/\{/g) || []).length;
          bracketCount -= (line.match(/\}/g) || []).length;
          parenCount += (line.match(/\(/g) || []).length;
          parenCount -= (line.match(/\)/g) || []).length;
        } catch (error) {
          console.warn('JavaScript bracket tracking failed:', error);
        }

      } catch (error) {
        console.warn(`JavaScript line analysis failed for line ${index + 1}:`, error);
      }
    });

    // Final bracket checks
    if (bracketCount !== 0) {
      errors.push(`Unmatched curly brackets: ${bracketCount > 0 ? 'missing closing' : 'extra closing'} braces`);
    }
    if (parenCount !== 0) {
      errors.push(`Unmatched parentheses: ${parenCount > 0 ? 'missing closing' : 'extra closing'} parentheses`);
    }

    // Module import checks
    const moduleChecks = [
      { usage: 'fs.', require: "require('fs')" },
      { usage: 'path.', require: "require('path')" },
      { usage: 'http.', require: "require('http')" },
      { usage: 'express', require: "require('express')" },
      { usage: 'axios', require: "require('axios')" }
    ];

    moduleChecks.forEach(({ usage, require }) => {
      if (code.includes(usage) && !code.includes(require) && !code.includes(`import`)) {
        errors.push(`Missing module import: ${usage.replace('.', '')} used but not imported`);
      }
    });

  } catch (error) {
    console.warn('JavaScript comprehensive error detection failed:', error);
  }

  return errors;
};

// COMPREHENSIVE JAVA ERROR DETECTION
const detectComprehensiveJavaErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  
  try {
    let hasMain = false;
    let hasClass = false;
    let bracketBalance = 0;
    let parenBalance = 0;
    
    // Java error patterns - FIXED to not flag valid Java code
    const javaErrorPatterns = [
      // System.out errors - FIXED patterns
      { pattern: /System\.out\.printl(?!n)\b/, message: 'Typo: use println instead of printl' },
      { pattern: /System\.out\.prinln\b/, message: 'Typo: use println instead of prinln' },
      { pattern: /system\.out/i, message: 'Incorrect capitalization - use System.out (capital S)', exclude: /System\.out/ },
      { pattern: /System\.out\.print\s+[^(]/, message: 'Missing parentheses in System.out.print' },
      // Missing semicolons
      { pattern: /^\s*(int|String|boolean|double|float|char)\s+\w+\s*=\s*[^;]+[^;{}\s]$/, message: 'Missing semicolon after declaration' },
      { pattern: /^\s*\w+\.\w+\([^)]*\)\s*[^;]$/, message: 'Missing semicolon after method call', exclude: /\{\s*$/ },
      { pattern: /^\s*return\s+[^;]+[^;]$/, message: 'Missing semicolon after return' },
      // Constructor errors
      { pattern: /Scanner\s+\w+\s*=\s*Scanner\s*\(/, message: 'Missing new keyword for Scanner' },
      // String comparison
      { pattern: /\w+\s*==\s*["']/, message: 'Use .equals() for string comparison, not ==' },
      // Access modifiers - only flag if clearly missing
      { pattern: /^\s*(void|int|String|boolean)\s+main\s*\(/, message: 'Missing access modifier for main method - should be public static' }
    ];

    // All possible Java typos - FIXED to not flag correct spelling
    const javaTypos = [
      { pattern: /\bpubilc\b/g, correct: 'public' },
      { pattern: /\bpubilc\b/g, correct: 'public' },
      { pattern: /\bprivae\b/g, correct: 'private' },
      { pattern: /\bproteted\b/g, correct: 'protected' },
      { pattern: /\bstaic\b/g, correct: 'static' },
      { pattern: /\bvodi\b/g, correct: 'void' },
      { pattern: /\bStrign\b/g, correct: 'String' },
      { pattern: /\bbooelan\b/g, correct: 'boolean' },
      { pattern: /\bretrun\b/g, correct: 'return' },
      { pattern: /\bimort\b/g, correct: 'import' },
      { pattern: /\bpackge\b/g, correct: 'package' },
      { pattern: /\bnextint\b/g, correct: 'nextInt' },
      { pattern: /\bnextstring\b/g, correct: 'next or nextLine' },
      { pattern: /\bScaner\b/g, correct: 'Scanner' },
      { pattern: /\bsystem\b/g, correct: 'System' }
    ];

    lines.forEach((line, index) => {
      try {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

        // Check for main and class
        if (line.includes('public static void main') || line.includes('static void main')) {
          hasMain = true;
        }
        if (safeRegexTest(/^\s*(public\s+)?class\s+\w+/, line)) {
          hasClass = true;
        }

        // Check all Java typos - only flag actual typos
        javaTypos.forEach(({ pattern, correct }) => {
          try {
            const wrongMatches = line.match(pattern);
            if (wrongMatches) {
              // Only flag if the correct version is NOT present in the same line
              const correctPattern = new RegExp(`\\b${correct}\\b`);
              if (!correctPattern.test(line)) {
                errors.push(`Line ${lineNum}: Typo detected - '${wrongMatches[0]}' should be '${correct}'`);
              }
            }
          } catch (error) {
            console.warn(`Java typo check failed:`, error);
          }
        });

        // Check error patterns - FIXED to exclude valid cases
        javaErrorPatterns.forEach(({ pattern, message, exclude }) => {
          try {
            if (safeRegexTest(pattern, line)) {
              // If there's an exclude pattern, check it
              if (exclude && safeRegexTest(exclude, line)) {
                return; // Skip this error as it's excluded
              }
              errors.push(`Line ${lineNum}: ${message}`);
            }
          } catch (error) {
            console.warn(`Java pattern check failed:`, error);
          }
        });

        // Track brackets
        try {
          bracketBalance += (line.match(/\{/g) || []).length;
          bracketBalance -= (line.match(/\}/g) || []).length;
          parenBalance += (line.match(/\(/g) || []).length;
          parenBalance -= (line.match(/\)/g) || []).length;
        } catch (error) {
          console.warn('Java bracket tracking failed:', error);
        }

      } catch (error) {
        console.warn(`Java line analysis failed for line ${index + 1}:`, error);
      }
    });

    // Structure validation
    if (!hasClass && code.length > 50) {
      errors.push('Missing public class declaration - Java programs must have a public class');
    }
    if (hasClass && !hasMain && code.length > 100) {
      errors.push('Missing main method - add: public static void main(String[] args)');
    }

    // Bracket validation
    if (bracketBalance !== 0) {
      errors.push(`Unmatched curly brackets: ${bracketBalance > 0 ? `missing ${bracketBalance} closing` : `extra ${Math.abs(bracketBalance)} closing`} brace(s)`);
    }
    if (parenBalance !== 0) {
      errors.push(`Unmatched parentheses: ${parenBalance > 0 ? `missing ${parenBalance} closing` : `extra ${Math.abs(parenBalance)} closing`} parenthesis`);
    }

    // Import checks
    const importChecks = [
      { usage: 'Scanner', import: 'import java.util.Scanner' },
      { usage: 'ArrayList', import: 'import java.util.ArrayList' },
      { usage: 'HashMap', import: 'import java.util.HashMap' },
      { usage: 'Random', import: 'import java.util.Random' }
    ];

    importChecks.forEach(({ usage, import: importStmt }) => {
      if (code.includes(usage) && !code.includes(importStmt)) {
        errors.push(`Missing import: ${usage} class used but ${importStmt} not found`);
      }
    });

  } catch (error) {
    console.warn('Java comprehensive error detection failed:', error);
  }

  return errors;
};

// COMPREHENSIVE C++ ERROR DETECTION
const detectComprehensiveCppErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  
  try {
    let hasMain = false;
    let hasInclude = false;
    let bracketBalance = 0;
    let hasUsingNamespace = false;
    
    // C++ error patterns
    const cppErrorPatterns = [
      // cout/cin errors
      { pattern: /cout\s+[^<]/, message: 'cout requires << operator' },
      { pattern: /cin\s+[^>]/, message: 'cin requires >> operator' },
      { pattern: /cout\s*[^<]/, message: 'Missing << operator with cout' },
      { pattern: /cin\s*[^>]/, message: 'Missing >> operator with cin' },
      // Include errors
      { pattern: /#includ\b/, message: 'Typo: use #include' },
      { pattern: /include\s*</, message: 'Missing # before include' },
      // Namespace errors
      { pattern: /using\s+namspace\b/, message: 'Typo: use namespace' },
      { pattern: /using\s+namespace\s+std\b(?!;)/, message: 'Missing semicolon after using namespace std' },
      // Main function errors
      { pattern: /int\s+main\s*\(\s*\)\s*(?!\{)/, message: 'Missing opening brace after main()' },
      // Missing semicolons
      { pattern: /^\s*(int|char|double|float|string|bool)\s+\w+.*[^;{}\s]$/, message: 'Missing semicolon' },
      { pattern: /^\s*cout\s*<<.*[^;]$/, message: 'Missing semicolon after cout' },
      { pattern: /^\s*cin\s*>>.*[^;]$/, message: 'Missing semicolon after cin' },
      { pattern: /^\s*return\s+[^;]+$/, message: 'Missing semicolon after return' }
    ];

    // All possible C++ typos
    const cppTypos = [
      { pattern: /\bcout\b/g, correct: 'cout' },
      { pattern: /\bcin\b/g, correct: 'cin' },
      { pattern: /\bendl\b/g, correct: 'endl' },
      { pattern: /\binclude\b/g, correct: 'include' },
      { pattern: /\busing\b/g, correct: 'using' },
      { pattern: /\bnamespace\b/g, correct: 'namespace' },
      { pattern: /\bstd\b/g, correct: 'std' },
      { pattern: /\bint\b/g, correct: 'int' },
      { pattern: /\bchar\b/g, correct: 'char' },
      { pattern: /\bdouble\b/g, correct: 'double' },
      { pattern: /\bfloat\b/g, correct: 'float' },
      { pattern: /\bstring\b/g, correct: 'string' },
      { pattern: /\bbool\b/g, correct: 'bool' },
      { pattern: /\bvoid\b/g, correct: 'void' },
      { pattern: /\bretrun\b/g, correct: 'return' },
      { pattern: /\bmain\b/g, correct: 'main' }
    ];

    lines.forEach((line, index) => {
      try {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

        // Check for main, include, namespace
        if (line.includes('int main') || line.includes('void main')) hasMain = true;
        if (line.includes('#include')) hasInclude = true;
        if (line.includes('using namespace')) hasUsingNamespace = true;

        // Check all C++ typos
        cppTypos.forEach(({ pattern, correct }) => {
          try {
            const wrongMatches = line.match(pattern);
            if (wrongMatches && !safeRegexTest(new RegExp(`\\b${correct}\\b`), line)) {
              errors.push(`Line ${lineNum}: Check spelling of '${correct}'`);
            }
          } catch (error) {
            console.warn(`C++ typo check failed:`, error);
          }
        });

        // Check error patterns
        cppErrorPatterns.forEach(({ pattern, message }) => {
          try {
            if (safeRegexTest(pattern, line)) {
              errors.push(`Line ${lineNum}: ${message}`);
            }
          } catch (error) {
            console.warn(`C++ pattern check failed:`, error);
          }
        });

        // std:: prefix check
        if (!hasUsingNamespace && !code.includes('using namespace std')) {
          if ((line.includes('cout') || line.includes('cin') || line.includes('endl')) && !line.includes('std::')) {
            errors.push(`Line ${lineNum}: Missing std:: prefix (or add using namespace std;)`);
          }
        }

        // Track brackets
        try {
          bracketBalance += (line.match(/\{/g) || []).length;
          bracketBalance -= (line.match(/\}/g) || []).length;
        } catch (error) {
          console.warn('C++ bracket tracking failed:', error);
        }

      } catch (error) {
        console.warn(`C++ line analysis failed for line ${index + 1}:`, error);
      }
    });

    // Structure validation
    if (!hasInclude && code.length > 50) {
      errors.push('Missing #include statements - C++ programs need #include <iostream>');
    }
    if (!hasMain && code.length > 100) {
      errors.push('Missing main function - C++ programs need int main()');
    }
    if (bracketBalance !== 0) {
      errors.push(`Unmatched curly brackets: ${bracketBalance > 0 ? 'missing' : 'extra'} closing braces`);
    }

  } catch (error) {
    console.warn('C++ comprehensive error detection failed:', error);
  }

  return errors;
};

// SECURITY VULNERABILITY DETECTION
const detectSecurityVulnerabilities = (code: string, language: string): string[] => {
  const errors: string[] = [];

  try {
    // Common security issues across all languages
    const securityPatterns = [
      { pattern: /password\s*=\s*["'][^"']+["']/i, message: 'Hardcoded password detected - use environment variables' },
      { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/i, message: 'Hardcoded API key detected - use secure storage' },
      { pattern: /secret\s*=\s*["'][^"']+["']/i, message: 'Hardcoded secret detected - use secure configuration' },
      { pattern: /token\s*=\s*["'][^"']+["']/i, message: 'Hardcoded token detected - use secure storage' },
      { pattern: /127\.0\.0\.1|localhost/i, message: 'Hardcoded localhost - consider configuration' },
      { pattern: /\.innerHTML\s*=/, message: 'Potential XSS vulnerability - validate input' },
      { pattern: /eval\s*\(/, message: 'eval() is dangerous - avoid dynamic code execution' },
      { pattern: /document\.write\s*\(/, message: 'document.write can be unsafe - use safer DOM methods' }
    ];

    securityPatterns.forEach(({ pattern, message }) => {
      try {
        if (safeRegexTest(pattern, code)) {
          errors.push(`Security: ${message}`);
        }
      } catch (error) {
        console.warn('Security pattern check failed:', error);
      }
    });

    // Language-specific security checks
    switch (language) {
      case 'JavaScript':
        if (code.includes('dangerouslySetInnerHTML')) {
          errors.push('Security: dangerouslySetInnerHTML can lead to XSS - sanitize input');
        }
        break;
      case 'Python':
        if (code.includes('input(') && code.includes('eval(')) {
          errors.push('Security: Never use eval() with user input - major security risk');
        }
        break;
      case 'Java':
        if (code.includes('Runtime.getRuntime().exec(')) {
          errors.push('Security: Runtime.exec() can be dangerous - validate all inputs');
        }
        break;
    }

  } catch (error) {
    console.warn('Security vulnerability detection failed:', error);
  }

  return errors;
};

// PERFORMANCE ISSUE DETECTION
const detectPerformanceIssues = (code: string, language: string, lines: string[]): string[] => {
  const errors: string[] = [];

  try {
    // Universal performance issues
    const performancePatterns = [
      { pattern: /for.*for.*for/s, message: 'Nested loops detected - consider optimization' },
      { pattern: /while.*while/s, message: 'Nested while loops - check for efficiency' },
      { pattern: /console\.log.*for|for.*console\.log/s, message: 'Logging inside loops - performance impact' },
      { pattern: /\.length/g, message: 'Multiple .length calls - cache in variable' }
    ];

    performancePatterns.forEach(({ pattern, message }) => {
      try {
        const matches = code.match(pattern);
        if (matches && matches.length > 2) {
          errors.push(`Performance: ${message}`);
        }
      } catch (error) {
        console.warn('Performance pattern check failed:', error);
      }
    });

    // Check for very long functions
    let functionLength = 0;
    let inFunction = false;

    lines.forEach((line, index) => {
      if (line.includes('function ') || line.includes('def ') || line.includes('public ') || line.includes('private ')) {
        inFunction = true;
        functionLength = 0;
      }
      if (inFunction) {
        functionLength++;
        if (line.includes('}') || (language === 'Python' && line.trim() && !line.startsWith(' '))) {
          if (functionLength > 50) {
            errors.push(`Performance: Function too long (${functionLength} lines) - consider breaking down`);
          }
          inFunction = false;
        }
      }
    });

  } catch (error) {
    console.warn('Performance issue detection failed:', error);
  }

  return errors;
};

// CODE QUALITY ISSUE DETECTION
const detectCodeQualityIssues = (code: string, language: string, lines: string[]): string[] => {
  const errors: string[] = [];

  try {
    // Check for code smells
    const qualityPatterns = [
      { pattern: /TODO|FIXME|HACK/i, message: 'TODO/FIXME comments found - address before production' },
      { pattern: /magic number/i, message: 'Magic numbers detected - use named constants' },
      { pattern: /copy.*paste/i, message: 'Possible copy-paste code - consider refactoring' }
    ];

    qualityPatterns.forEach(({ pattern, message }) => {
      try {
        if (safeRegexTest(pattern, code)) {
          errors.push(`Code Quality: ${message}`);
        }
      } catch (error) {
        console.warn('Quality pattern check failed:', error);
      }
    });

    // Check for duplicated code
    const codeLines = lines.filter(line => line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('#'));
    const duplicates = new Map();

    codeLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 10) {
        duplicates.set(trimmed, (duplicates.get(trimmed) || 0) + 1);
      }
    });

    duplicates.forEach((count, line) => {
      if (count > 2) {
        errors.push(`Code Quality: Duplicated code detected - "${line.substring(0, 30)}..." appears ${count} times`);
      }
    });

    // Check for missing comments
    const codeLineCount = codeLines.length;
    const commentCount = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('#')).length;
    
    if (codeLineCount > 20 && commentCount === 0) {
      errors.push('Code Quality: No comments found - add documentation for complex logic');
    }

    // Check function/variable naming
    const badNames = ['temp', 'tmp', 'var1', 'var2', 'data', 'info', 'obj', 'item'];
    badNames.forEach(badName => {
      if (code.includes(badName)) {
        errors.push(`Code Quality: Poor variable name '${badName}' - use descriptive names`);
      }
    });

  } catch (error) {
    console.warn('Code quality detection failed:', error);
  }

  return errors;
};

// LOGICAL ERROR DETECTION
const detectLogicalErrors = (code: string, language: string, lines: string[]): string[] => {
  const errors: string[] = [];

  try {
    // Common logical errors
    const logicalPatterns = [
      { pattern: /if\s*\(\s*true\s*\)/, message: 'Always-true condition - logic error' },
      { pattern: /if\s*\(\s*false\s*\)/, message: 'Always-false condition - dead code' },
      { pattern: /while\s*\(\s*true\s*\)/, message: 'Infinite loop detected - ensure exit condition' },
      { pattern: /for\s*\(\s*;\s*;\s*\)/, message: 'Infinite for loop - missing conditions' },
      { pattern: /=\s*=/, message: 'Possible typo - double equals without space' },
      { pattern: /!\s*=/, message: 'Possible typo - exclamation equals without space' }
    ];

    logicalPatterns.forEach(({ pattern, message }) => {
      try {
        if (safeRegexTest(pattern, code)) {
          errors.push(`Logic: ${message}`);
        }
      } catch (error) {
        console.warn('Logical pattern check failed:', error);
      }
    });

    // Check for unreachable code
    let foundReturn = false;
    lines.forEach((line, index) => {
      if (line.includes('return')) {
        foundReturn = true;
      } else if (foundReturn && line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('}')) {
        errors.push(`Logic: Line ${index + 1} - Unreachable code after return statement`);
        foundReturn = false;
      }
      if (line.includes('}')) {
        foundReturn = false;
      }
    });

    // REMOVED FAULTY NULL CHECK PATTERNS - they were incorrectly flagging valid Java code
    // The original patterns were too broad and flagged valid method calls as potential null references
    
    // Only check for actual risky null patterns in specific contexts
    if (language === 'JavaScript' || language === 'TypeScript') {
      // Only flag JavaScript/TypeScript specific null issues
      if (code.includes('.length') && !code.includes('null') && !code.includes('undefined') && !code.includes('?.')) {
        // Only warn if no null checks are present anywhere in the code
        const hasNullChecks = code.includes('if (') && (code.includes('!= null') || code.includes('!== null'));
        if (!hasNullChecks && code.split('\n').length > 10) {
          errors.push(`Logic: Consider adding null checks for better safety`);
        }
      }
    }

  } catch (error) {
    console.warn('Logical error detection failed:', error);
  }

  return errors;
};

// Enhanced function to detect if input is plain text vs code with error handling
const isPlainText = (text: string): boolean => {
  try {
    if (!text || typeof text !== 'string') {
      return true;
    }

    // More comprehensive code indicators with safe regex operations
    const codeIndicators = [
      /[{}();=<>!&|]+/,
      /\b(var|let|const|int|string|float|double|bool|boolean|char|void|class|def|function|public|private|protected|static|final|abstract|interface|enum|struct|union|namespace|using|import|include|require|from|as|in|is|not|and|or|if|else|elif|for|while|do|switch|case|default|break|continue|return|yield|try|catch|except|finally|throw|throws|new|delete|this|super|self|null|undefined|true|false|None|True|False)\b/,
      /\w+\s*\(.*\)/,
      /\w+\[.*\]/,
      /\w+\.\w+/,
      /\/\/|\/\*|\*\/|#|<!--/,
      /#include|import|require|using|from.*import/,
      /["'`][^"'`]*["'`]/,
      /\+\+|--|&&|\|\||==|!=|<=|>=|=>|->|\*=|\+=|-=|\/=/,
      /^\s{4,}/m,
      /;\s*$/m,
      /\{\s*\w+/,
      /\[.*\]|\{.*\}/
    ];
    
    // Count how many code indicators are present safely
    let indicatorCount = 0;
    codeIndicators.forEach(pattern => {
      try {
        if (safeRegexTest(pattern, text)) {
          indicatorCount++;
        }
      } catch (error) {
        console.warn('Code indicator check failed:', error);
      }
    });
    
    // If we have multiple indicators, it's likely code
    return indicatorCount < 2 && text.length < 100;
  } catch (error) {
    console.warn('Plain text detection failed:', error);
    return false; // Assume it's code if detection fails
  }
};

// Enhanced generic error detection with comprehensive error handling
const detectGenericErrors = (code: string, lines: string[]): string[] => {
  const errors: string[] = [];
  
  try {
    // Check for unmatched brackets/parentheses globally
    try {
      const openParens = safeRegexMatch(/\(/g, code);
      const closeParens = safeRegexMatch(/\)/g, code);
      const openParenCount = openParens ? openParens.length : 0;
      const closeParenCount = closeParens ? closeParens.length : 0;
      
      if (openParenCount !== closeParenCount) {
        errors.push(`Unmatched parentheses: ${openParenCount} opening, ${closeParenCount} closing`);
      }
    } catch (error) {
      console.warn('Generic parentheses check failed:', error);
    }
    
    try {
      const openBrackets = safeRegexMatch(/\{/g, code);
      const closeBrackets = safeRegexMatch(/\}/g, code);
      const openBracketCount = openBrackets ? openBrackets.length : 0;
      const closeBracketCount = closeBrackets ? closeBrackets.length : 0;
      
      if (openBracketCount !== closeBracketCount) {
        errors.push(`Unmatched curly brackets: ${openBracketCount} opening, ${closeBracketCount} closing`);
      }
    } catch (error) {
      console.warn('Generic curly brackets check failed:', error);
    }
    
    try {
      const openSquare = safeRegexMatch(/\[/g, code);
      const closeSquare = safeRegexMatch(/\]/g, code);
      const openSquareCount = openSquare ? openSquare.length : 0;
      const closeSquareCount = closeSquare ? closeSquare.length : 0;
      
      if (openSquareCount !== closeSquareCount) {
        errors.push(`Unmatched square brackets: ${openSquareCount} opening, ${closeSquareCount} closing`);
      }
    } catch (error) {
      console.warn('Generic square brackets check failed:', error);
    }
    
  } catch (error) {
    console.warn('Generic error detection failed:', error);
  }
  
  return errors;
};