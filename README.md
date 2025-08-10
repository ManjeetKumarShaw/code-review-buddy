# Code Review Buddy 🚀

A modern React.js application that provides AI-powered code analysis and review capabilities for multiple programming languages.

## ✨ Features

- **Multi-language Support**: Python, JavaScript, Java, C++, and Other
- **Smart Language Detection**: Automatically detects code language and validates against selection
- **Comprehensive Code Analysis**:
  - 🧠 **Code Explanation**: Plain-English summary of what the code does
  - 🧪 **Code Review**: Detects syntax errors, logical issues, and potential bugs
  - 💡 **Improvement Suggestions**: Performance, readability, and best practice recommendations
  - 💬 **PR Comment Generation**: Professional pull request review comments
- **Modern UI/UX**:
  - 🌙 Dark/Light mode toggle
  - 📱 Responsive design
  - ⚡ Loading states and error handling
  - 📋 Copy-to-clipboard functionality
  - 🎨 Tailwind CSS styling

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language Detection**: Custom algorithms with pattern matching
- **AI Integration**: Mock service (ready for OpenAI API integration)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd code-review-buddy
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 💻 Usage

1. **Select Programming Language**: Choose from Python, JavaScript, Java, C++, or Other
2. **Paste Your Code**: Enter your code in the text area
3. **Choose Analysis Type**: Click any of the four analysis buttons:
   - 🧠 Explain Code
   - 🧪 Review Code  
   - 💡 Suggest Improvements
   - 💬 Generate PR Comment
4. **View Results**: Each analysis appears in a dedicated section
5. **Copy Results**: Use the copy icon to copy any result to clipboard

## 🔧 Error Detection Capabilities

### Python
- Missing colons after control statements
- Incorrect indentation
- Undefined variables
- Import statement issues

### JavaScript
- Missing semicolons
- Unmatched brackets
- Console.log typos
- Variable declaration issues

### Java
- Missing semicolons
- Missing main method
- Unmatched brackets
- Access modifier issues

### C++
- Missing includes
- Missing namespace declarations
- Syntax errors
- Semicolon issues

## 🎨 Customization

The app uses Tailwind CSS for styling and supports:
- Dark/Light theme switching
- Responsive design for all screen sizes
- Accessible color schemes
- Modern card-based layout

## 🔮 Future Enhancements

- Real OpenAI API integration
- Support for more programming languages
- Advanced error detection patterns
- Code formatting suggestions
- Export functionality for reports
- User preferences and history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- Icons from Lucide React
- Inspired by modern developer tools
