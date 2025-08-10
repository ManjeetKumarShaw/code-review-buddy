import { detectErrors } from './languageDetection';

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// Mock AI service - In a real app, you would integrate with OpenAI API
export class AIService {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async explainCode(code: string, language: string): Promise<AIResponse> {
    try {
      // Simulate API delay
      await this.delay(1500);
      
      // Mock explanation based on language and code patterns
      const explanation = this.generateExplanation(code, language);
      
      return {
        success: true,
        data: explanation
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate code explanation'
      };
    }
  }

  static async reviewCode(code: string, language: string): Promise<AIResponse> {
    try {
      await this.delay(2000);
      
      // Use our enhanced error detection utility
      const errors = detectErrors(code, language);
      const review = this.generateReview(code, language, errors);
      
      return {
        success: true,
        data: review
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate code review'
      };
    }
  }

  static async suggestImprovements(code: string, language: string): Promise<AIResponse> {
    try {
      await this.delay(1800);
      
      const improvements = this.generateImprovements(code, language);
      
      return {
        success: true,
        data: improvements
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate improvement suggestions'
      };
    }
  }

  static async generatePRComment(code: string, language: string): Promise<AIResponse> {
    try {
      await this.delay(1600);
      
      const errors = detectErrors(code, language);
      const prComment = this.generatePRCommentText(code, language, errors);
      
      return {
        success: true,
        data: prComment
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate PR comment'
      };
    }
  }

  private static generateExplanation(code: string, language: string): string {
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
    
    // Language-specific explanations
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
    
    explanation += `\n\n**Purpose**: This code appears to implement core functionality with proper ${language} syntax and conventions.`;
    
    return explanation;
  }

  private static generateReview(code: string, language: string, errors: string[]): string {
    let review = `## 🔍 Code Review Results\n\n`;
    
    if (errors.length === 0) {
      review += `✅ **Excellent! No critical issues detected!**\n\n`;
      review += `Your ${language} code follows proper syntax rules and best practices. Great job!\n\n`;
      
      // Add positive feedback based on code quality indicators
      const hasComments = code.includes('//') || code.includes('#') || code.includes('/*');
      const hasProperStructure = this.checkCodeStructure(code, language);
      
      if (hasComments) {
        review += `✨ **Well Documented**: Your code includes comments, which is excellent for maintainability.\n\n`;
      }
      
      if (hasProperStructure) {
        review += `🏗️ **Good Structure**: Your code follows ${language} structural conventions.\n\n`;
      }
      
    } else {
      review += `⚠️ **Found ${errors.length} issue${errors.length > 1 ? 's' : ''} that need attention:**\n\n`;
      
      // Categorize errors by severity - moved inside the else block
      const criticalErrors = errors.filter(error => 
        error.includes('Missing') || error.includes('Unmatched') || error.includes('syntax')
      );
      const warnings = errors.filter(error => 
        error.includes('Consider') || error.includes('should') || error.includes('recommend')
      );
      const styleIssues = errors.filter(error => 
        !criticalErrors.includes(error) && !warnings.includes(error)
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
    }
    
    // Add code metrics
    review += `## 📊 Code Metrics:\n\n`;
    const metrics = this.calculateCodeMetrics(code);
    review += `- **Lines of Code**: ${metrics.lines}\n`;
    review += `- **Complexity Score**: ${metrics.complexity}/10\n`;
    review += `- **Readability**: ${metrics.readability}\n`;
    
    // Add specific recommendations
    review += `\n## 🎯 Recommendations:\n\n`;
    if (errors.length === 0) {
      review += `Your code is in excellent shape! Consider:\n`;
      review += `- Adding unit tests to ensure reliability\n`;
      review += `- Code review with team members\n`;
      review += `- Performance optimization if needed\n`;
    } else {
      review += `Priority actions to improve your code:\n`;
      const criticalErrors = errors.filter(error => 
        error.includes('Missing') || error.includes('Unmatched') || error.includes('syntax')
      );
      const warnings = errors.filter(error => 
        error.includes('Consider') || error.includes('should') || error.includes('recommend')
      );
      
      if (criticalErrors.length > 0) {
        review += `1. **Fix critical issues first** - these prevent compilation/execution\n`;
      }
      if (warnings.length > 0) {
        review += `2. **Address warnings** - these improve code quality\n`;
      }
      review += `3. **Test your fixes** - ensure changes don't break functionality\n`;
    }
    
    review += `\n---\n*Analysis completed for ${language} code*`;
    
    return review;
  }

  private static generateImprovements(code: string, language: string): string {
    let improvements = `## Suggested Improvements\n\n`;
    
    // General improvements
    improvements += `### Code Quality\n\n`;
    
    if (!code.includes('//') && !code.includes('#') && !code.includes('/*')) {
      improvements += `📝 **Add Comments**: Include inline comments to explain complex logic and improve code readability.\n\n`;
    }
    
    // Language-specific improvements
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
    
    improvements += `### Performance\n\n`;
    improvements += `⚡ **Optimization**: Review algorithms for potential performance improvements.\n\n`;
    improvements += `🧪 **Testing**: Add unit tests to ensure code reliability.\n\n`;
    improvements += `♻️ **Refactoring**: Consider extracting reusable code into separate functions.\n\n`;
    
    improvements += `### Best Practices\n\n`;
    improvements += `✨ **Error Handling**: Implement proper error handling and validation.\n\n`;
    improvements += `📋 **Code Standards**: Follow ${language} coding conventions and style guidelines.`;
    
    return improvements;
  }

  private static generatePRCommentText(code: string, language: string, errors: string[]): string {
    let comment = `## 🔍 Code Review Summary\n\n`;
    
    comment += `**Language**: ${language}\n`;
    comment += `**Lines of Code**: ${code.split('\n').length}\n\n`;
    
    if (errors.length === 0) {
      comment += `### ✅ Approval Status: **APPROVED**\n\n`;
      comment += `Great work! The code follows ${language} best practices and doesn't contain any obvious issues.\n\n`;
    } else {
      comment += `### ⚠️ Review Status: **NEEDS CHANGES**\n\n`;
      comment += `Found ${errors.length} issue(s) that should be addressed:\n\n`;
      errors.forEach((error) => {
        comment += `- ${error}\n`;
      });
      comment += `\n`;
    }
    
    comment += `### 📋 Checklist\n\n`;
    comment += `- [${errors.length === 0 ? 'x' : ' '}] No syntax errors detected\n`;
    comment += `- [${code.includes('//') || code.includes('#') ? 'x' : ' '}] Code is documented\n`;
    comment += `- [x] Code follows ${language} conventions\n\n`;
    
    comment += `### 💡 Next Steps\n\n`;
    if (errors.length > 0) {
      comment += `Please address the issues mentioned above and update the PR.\n\n`;
    } else {
      comment += `Code looks good to merge! 🚀\n\n`;
    }
    
    comment += `*This review was generated by Code Review Buddy*`;
    
    return comment;
  }

  private static checkCodeStructure(code: string, language: string): boolean {
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
  }

  private static calculateCodeMetrics(code: string) {
    const lines = code.split('\n').filter(line => line.trim()).length;
    
    // Simple complexity calculation based on control structures
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch'];
    const complexity = Math.min(10, Math.max(1, 
      complexityKeywords.reduce((count, keyword) => 
        count + (code.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length, 0
      )
    ));
    
    // Readability based on comments, variable names, and line length
    const hasComments = code.includes('//') || code.includes('#') || code.includes('/*');
    const avgLineLength = code.split('\n').reduce((sum, line) => sum + line.length, 0) / lines;
    const readability = hasComments && avgLineLength < 100 ? 'Good' : 
                       hasComments || avgLineLength < 100 ? 'Fair' : 'Needs Improvement';
    
    return { lines, complexity, readability };
  }
}