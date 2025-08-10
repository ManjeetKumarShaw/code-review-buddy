import { detectErrors } from './languageDetection';

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// Safe helper functions for AI service operations
const safeStringOperation = (operation: () => string, fallback: string = 'Analysis completed with limited results'): string => {
  try {
    return operation();
  } catch (error) {
    console.warn('String operation failed:', error);
    return fallback;
  }
};

const safeArrayOperation = <T>(operation: () => T[], fallback: T[] = []): T[] => {
  try {
    return operation();
  } catch (error) {
    console.warn('Array operation failed:', error);
    return fallback;
  }
};

const validateInput = (code: string, language: string): { isValid: boolean; error?: string } => {
  try {
    if (!code || typeof code !== 'string') {
      return { isValid: false, error: 'Invalid code input: Code must be a non-empty string' };
    }
    
    if (code.length > 100000) {
      return { isValid: false, error: 'Code too long: Maximum 100,000 characters allowed' };
    }
    
    if (!language || typeof language !== 'string') {
      return { isValid: false, error: 'Invalid language: Language must be specified' };
    }
    
    const validLanguages = ['Python', 'JavaScript', 'Java', 'C++', 'Other'];
    if (!validLanguages.includes(language)) {
      return { isValid: false, error: `Invalid language: Must be one of ${validLanguages.join(', ')}` };
    }
    
    // Check for potentially problematic content
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return { isValid: false, error: 'Empty code: Please provide code to analyze' };
    }
    
    return { isValid: true };
  } catch (error) {
    console.warn('Input validation failed:', error);
    return { isValid: false, error: 'Input validation encountered an error' };
  }
};

// Mock AI service - In a real app, you would integrate with OpenAI API
export class AIService {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      try {
        setTimeout(resolve, Math.max(0, Math.min(ms, 10000))); // Cap delay at 10 seconds
      } catch (error) {
        console.warn('Delay function failed:', error);
        resolve(); // Resolve immediately if setTimeout fails
      }
    });
  }

  static async explainCode(code: string, language: string): Promise<AIResponse> {
    try {
      // Validate input first
      const validation = validateInput(code, language);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Input validation failed'
        };
      }

      // Simulate API delay safely
      await this.delay(1500);
      
      // Mock explanation based on language and code patterns
      const explanation = this.generateExplanation(code, language);
      
      return {
        success: true,
        data: explanation
      };
    } catch (error) {
      console.error('Code explanation failed:', error);
      return {
        success: false,
        error: 'Failed to generate code explanation. Please try again.'
      };
    }
  }

  static async reviewCode(code: string, language: string): Promise<AIResponse> {
    try {
      // Validate input first
      const validation = validateInput(code, language);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Input validation failed'
        };
      }

      await this.delay(2000);
      
      // Use our enhanced error detection utility safely
      let errors: string[] = [];
      try {
        errors = detectErrors(code, language);
      } catch (error) {
        console.warn('Error detection failed, using fallback:', error);
        errors = ['Error detection encountered issues, but basic analysis completed'];
      }
      
      const review = this.generateReview(code, language, errors);
      
      return {
        success: true,
        data: review
      };
    } catch (error) {
      console.error('Code review failed:', error);
      return {
        success: false,
        error: 'Failed to generate code review. Please try again.'
      };
    }
  }

  static async suggestImprovements(code: string, language: string): Promise<AIResponse> {
    try {
      // Validate input first
      const validation = validateInput(code, language);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Input validation failed'
        };
      }

      await this.delay(1800);
      
      const improvements = this.generateImprovements(code, language);
      
      return {
        success: true,
        data: improvements
      };
    } catch (error) {
      console.error('Improvement suggestions failed:', error);
      return {
        success: false,
        error: 'Failed to generate improvement suggestions. Please try again.'
      };
    }
  }

  static async generatePRComment(code: string, language: string): Promise<AIResponse> {
    try {
      // Validate input first
      const validation = validateInput(code, language);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Input validation failed'
        };
      }

      await this.delay(1600);
      
      // Use error detection safely
      let errors: string[] = [];
      try {
        errors = detectErrors(code, language);
      } catch (error) {
        console.warn('Error detection failed for PR comment, using fallback:', error);
        errors = ['Analysis completed with potential issues'];
      }
      
      const prComment = this.generatePRCommentText(code, language, errors);
      
      return {
        success: true,
        data: prComment
      };
    } catch (error) {
      console.error('PR comment generation failed:', error);
      return {
        success: false,
        error: 'Failed to generate PR comment. Please try again.'
      };
    }
  }

  private static generateExplanation(code: string, language: string): string {
    return safeStringOperation(() => {
      const lines = code.split('\n').length;
      const hasClasses = code.includes('class ');
      const hasFunctions = code.match(/(def |function |void |int |public )/);
      
      let explanation = `## Code Overview\n\n`;
      explanation += `This ${language} code snippet contains ${lines} lines of code.\n\n`;
      
      if (hasClasses) {
        explanation += `**Classes**: The code defines one or more classes, suggesting an object-oriented approach.\n\n`;
      }
      
      if (hasFunctions) {
        explanation += `**Functions/Methods**: The code contains function or method definitions for modular programming.\n\n`;
      }
      
      // Language-specific explanations with error handling
      try {
        switch (language) {
          case 'Python':
            explanation += `**Python Features**: `;
            if (code.includes('import ')) explanation += `Uses imports for external modules. `;
            if (code.includes('def ')) explanation += `Defines functions using 'def' keyword. `;
            if (code.includes('print(')) explanation += `Contains print statements for output. `;
            break;
            
          case 'JavaScript':
            explanation += `**JavaScript Features**: `;
            if (code.includes('const ') || code.includes('let ')) explanation += `Uses modern variable declarations. `;
            if (code.includes('function ')) explanation += `Defines functions. `;
            if (code.includes('console.log')) explanation += `Contains console logging for debugging. `;
            break;
            
          case 'Java':
            explanation += `**Java Features**: `;
            if (code.includes('public class')) explanation += `Defines a public class. `;
            if (code.includes('public static void main')) explanation += `Contains a main method for program entry. `;
            if (code.includes('System.out.print')) explanation += `Uses standard output for printing. `;
            break;
            
          case 'C++':
            explanation += `**C++ Features**: `;
            if (code.includes('#include')) explanation += `Uses preprocessor directives for includes. `;
            if (code.includes('using namespace')) explanation += `Utilizes namespaces. `;
            if (code.includes('cout')) explanation += `Uses stream output for printing. `;
            break;
        }
      } catch (error) {
        console.warn('Language-specific explanation failed:', error);
        explanation += `**${language} Features**: Contains ${language}-specific syntax and patterns. `;
      }
      
      explanation += `\n\n**Purpose**: This code appears to implement core functionality with proper ${language} syntax and conventions.`;
      
      return explanation;
    }, `## Code Overview\n\nThis ${language} code has been analyzed successfully. The code appears to follow standard programming conventions.`);
  }

  private static generateReview(code: string, language: string, errors: string[]): string {
    return safeStringOperation(() => {
      let review = `## 🔍 Code Review Results\n\n`;
      
      if (errors.length === 0 || (errors.length === 1 && errors[0].includes('No errors detected'))) {
        review += `✅ **Excellent! No critical issues detected!**\n\n`;
        review += `Your ${language} code follows proper syntax rules and best practices. Great job!\n\n`;
        
        // Add positive feedback based on code quality indicators
        try {
          const hasComments = code.includes('//') || code.includes('#') || code.includes('/*');
          const hasProperStructure = this.checkCodeStructure(code, language);
          
          if (hasComments) {
            review += `✨ **Well Documented**: Your code includes comments, which is excellent for maintainability.\n\n`;
          }
          
          if (hasProperStructure) {
            review += `🏗️ **Good Structure**: Your code follows ${language} structural conventions.\n\n`;
          }
        } catch (error) {
          console.warn('Quality indicator check failed:', error);
        }
        
      } else {
        const validErrors = errors.filter(err => err && typeof err === 'string' && err.trim() !== '');
        review += `⚠️ **Found ${validErrors.length} issue${validErrors.length > 1 ? 's' : ''} that need attention:**\n\n`;
        
        // Categorize errors by severity safely
        try {
          const criticalErrors = safeArrayOperation(() => 
            validErrors.filter(error => 
              error.includes('Missing') || error.includes('Unmatched') || error.includes('syntax')
            )
          );
          const warnings = safeArrayOperation(() => 
            validErrors.filter(error => 
              error.includes('Consider') || error.includes('should') || error.includes('recommend')
            )
          );
          const styleIssues = safeArrayOperation(() => 
            validErrors.filter(error => 
              !criticalErrors.includes(error) && !warnings.includes(error)
            )
          );
          
          if (criticalErrors.length > 0) {
            review += `### 🚨 Critical Issues (${criticalErrors.length}):\n`;
            criticalErrors.forEach((error, index) => {
              review += `${index + 1}. **${error}**\n`;
            });
            review += `\n`;
          }
          
          if (warnings.length > 0) {
            review += `### ⚠️ Warnings (${warnings.length}):\n`;
            warnings.forEach((error, index) => {
              review += `${index + 1}. ${error}\n`;
            });
            review += `\n`;
          }
          
          if (styleIssues.length > 0) {
            review += `### 💡 Style & Best Practices (${styleIssues.length}):\n`;
            styleIssues.forEach((error, index) => {
              review += `${index + 1}. ${error}\n`;
            });
            review += `\n`;
          }
        } catch (error) {
          console.warn('Error categorization failed:', error);
          review += `### Issues Found:\n`;
          validErrors.forEach((error, index) => {
            review += `${index + 1}. ${error}\n`;
          });
          review += `\n`;
        }
      }
      
      // Add code metrics safely
      try {
        review += `## 📊 Code Metrics:\n\n`;
        const metrics = this.calculateCodeMetrics(code);
        review += `- **Lines of Code**: ${metrics.lines}\n`;
        review += `- **Complexity Score**: ${metrics.complexity}/10\n`;
        review += `- **Readability**: ${metrics.readability}\n`;
      } catch (error) {
        console.warn('Code metrics calculation failed:', error);
        review += `## 📊 Code Metrics:\n\n`;
        review += `- **Analysis**: Code metrics could not be calculated, but basic review completed\n`;
      }
      
      // Add specific recommendations safely
      try {
        review += `\n## 🎯 Recommendations:\n\n`;
        if (errors.length === 0 || (errors.length === 1 && errors[0].includes('No errors detected'))) {
          review += `Your code is in excellent shape! Consider:\n`;
          review += `- Adding unit tests to ensure reliability\n`;
          review += `- Code review with team members\n`;
          review += `- Performance optimization if needed\n`;
        } else {
          review += `Priority actions to improve your code:\n`;
          const criticalErrors = safeArrayOperation(() => 
            errors.filter(error => 
              error.includes('Missing') || error.includes('Unmatched') || error.includes('syntax')
            )
          );
          const warnings = safeArrayOperation(() => 
            errors.filter(error => 
              error.includes('Consider') || error.includes('should') || error.includes('recommend')
            )
          );
          
          if (criticalErrors.length > 0) {
            review += `1. **Fix critical issues first** - these prevent compilation/execution\n`;
          }
          if (warnings.length > 0) {
            review += `2. **Address warnings** - these improve code quality\n`;
          }
          review += `3. **Test your fixes** - ensure changes don't break functionality\n`;
        }
      } catch (error) {
        console.warn('Recommendations generation failed:', error);
        review += `\n## 🎯 Recommendations:\n\n`;
        review += `- Review the issues mentioned above\n`;
        review += `- Test your code thoroughly\n`;
        review += `- Consider following ${language} best practices\n`;
      }
      
      review += `\n---\n*Analysis completed for ${language} code*`;
      
      return review;
    }, `## 🔍 Code Review Results\n\nYour ${language} code has been analyzed. The review process completed successfully.`);
  }

  private static generateImprovements(code: string, language: string): string {
    return safeStringOperation(() => {
      let improvements = `## Suggested Improvements\n\n`;
      
      // General improvements
      improvements += `### Code Quality\n\n`;
      
      try {
        if (!code.includes('//') && !code.includes('#') && !code.includes('/*')) {
          improvements += `📝 **Add Comments**: Include inline comments to explain complex logic and improve code readability.\n\n`;
        }
      } catch (error) {
        console.warn('Comment check failed:', error);
      }
      
      // Language-specific improvements with error handling
      try {
        switch (language) {
          case 'Python':
            if (!code.includes('"""') && !code.includes("'''")) {
              improvements += `📚 **Docstrings**: Add docstrings to functions and classes for better documentation.\n\n`;
            }
            if (code.includes('print(')) {
              improvements += `🔧 **Logging**: Consider using the logging module instead of print statements for production code.\n\n`;
            }
            break;
            
          case 'JavaScript':
            if (code.includes('var ')) {
              improvements += `🔧 **Modern Syntax**: Replace 'var' with 'const' or 'let' for better scoping.\n\n`;
            }
            if (!code.includes('const ') && !code.includes('let ')) {
              improvements += `🔧 **Variable Declarations**: Use 'const' for constants and 'let' for variables.\n\n`;
            }
            break;
            
          case 'Java':
            if (!code.includes('private ') && code.includes('public ')) {
              improvements += `🔒 **Encapsulation**: Consider using private access modifiers where appropriate.\n\n`;
            }
            break;
            
          case 'C++':
            if (!code.includes('const')) {
              improvements += `🔒 **Const Correctness**: Use 'const' keyword for variables that don't change.\n\n`;
            }
            break;
        }
      } catch (error) {
        console.warn('Language-specific improvements failed:', error);
        improvements += `🔧 **${language} Best Practices**: Follow ${language} coding conventions and style guidelines.\n\n`;
      }
      
      improvements += `### Performance\n\n`;
      improvements += `⚡ **Optimization**: Review algorithms for potential performance improvements.\n\n`;
      improvements += `🧪 **Testing**: Add unit tests to ensure code reliability.\n\n`;
      improvements += `♻️ **Refactoring**: Consider extracting reusable code into separate functions.\n\n`;
      
      improvements += `### Best Practices\n\n`;
      improvements += `✨ **Error Handling**: Implement proper error handling and validation.\n\n`;
      improvements += `📋 **Code Standards**: Follow ${language} coding conventions and style guidelines.`;
      
      return improvements;
    }, `## Suggested Improvements\n\nYour ${language} code can be enhanced with standard best practices for better maintainability and performance.`);
  }

  private static generatePRCommentText(code: string, language: string, errors: string[]): string {
    return safeStringOperation(() => {
      let comment = `## 🔍 Code Review Summary\n\n`;
      
      try {
        comment += `**Language**: ${language}\n`;
        comment += `**Lines of Code**: ${code.split('\n').length}\n\n`;
      } catch (error) {
        console.warn('Basic metrics failed:', error);
        comment += `**Language**: ${language}\n\n`;
      }
      
      const validErrors = errors.filter(err => err && typeof err === 'string' && err.trim() !== '');
      
      if (validErrors.length === 0 || (validErrors.length === 1 && validErrors[0].includes('No errors detected'))) {
        comment += `### ✅ Approval Status: **APPROVED**\n\n`;
        comment += `Great work! The code follows ${language} best practices and doesn't contain any obvious issues.\n\n`;
      } else {
        comment += `### ⚠️ Review Status: **NEEDS CHANGES**\n\n`;
        comment += `Found ${validErrors.length} issue(s) that should be addressed:\n\n`;
        validErrors.forEach((error) => {
          comment += `- ${error}\n`;
        });
        comment += `\n`;
      }
      
      try {
        comment += `### 📋 Checklist\n\n`;
        comment += `- [${validErrors.length === 0 ? 'x' : ' '}] No syntax errors detected\n`;
        comment += `- [${code.includes('//') || code.includes('#') ? 'x' : ' '}] Code is documented\n`;
        comment += `- [x] Code follows ${language} conventions\n\n`;
      } catch (error) {
        console.warn('Checklist generation failed:', error);
        comment += `### 📋 Review Complete\n\n`;
      }
      
      comment += `### 💡 Next Steps\n\n`;
      if (validErrors.length > 0) {
        comment += `Please address the issues mentioned above and update the PR.\n\n`;
      } else {
        comment += `Code looks good to merge! 🚀\n\n`;
      }
      
      comment += `*This review was generated by Code Review Buddy*`;
      
      return comment;
    }, `## 🔍 Code Review Summary\n\nYour ${language} code has been reviewed successfully.`);
  }

  private static checkCodeStructure(code: string, language: string): boolean {
    try {
      switch (language) {
        case 'Java':
          return code.includes('public class') && code.includes('{') && code.includes('}');
        case 'Python':
          return code.includes('def ') || code.includes('class ') || code.includes('import ');
        case 'JavaScript':
          return code.includes('function ') || code.includes('=>') || code.includes('const ') || code.includes('let ');
        case 'C++':
          return code.includes('#include') && (code.includes('int main') || code.includes('void main'));
        default:
          return true;
      }
    } catch (error) {
      console.warn('Code structure check failed:', error);
      return true; // Assume good structure if check fails
    }
  }

  private static calculateCodeMetrics(code: string) {
    try {
      const lines = code.split('\n').filter(line => line.trim()).length;
      
      // Simple complexity calculation based on control structures
      const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch'];
      let complexity = 1;
      
      try {
        complexity = Math.min(10, Math.max(1, 
          complexityKeywords.reduce((count, keyword) => {
            try {
              const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
              return count + (matches ? matches.length : 0);
            } catch (error) {
              console.warn(`Complexity calculation failed for keyword ${keyword}:`, error);
              return count;
            }
          }, 0) || 1
        ));
      } catch (error) {
        console.warn('Complexity calculation failed:', error);
        complexity = 1;
      }
      
      // Readability based on comments, variable names, and line length
      let readability = 'Good';
      try {
        const hasComments = code.includes('//') || code.includes('#') || code.includes('/*');
        const codeLines = code.split('\n');
        const avgLineLength = codeLines.reduce((sum, line) => sum + line.length, 0) / Math.max(1, codeLines.length);
        
        if (hasComments && avgLineLength < 100) {
          readability = 'Good';
        } else if (hasComments || avgLineLength < 100) {
          readability = 'Fair';
        } else {
          readability = 'Needs Improvement';
        }
      } catch (error) {
        console.warn('Readability calculation failed:', error);
        readability = 'Good';
      }
      
      return { lines, complexity, readability };
    } catch (error) {
      console.warn('Code metrics calculation completely failed:', error);
      return { lines: 0, complexity: 1, readability: 'Good' };
    }
  }
}