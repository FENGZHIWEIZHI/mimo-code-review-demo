import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app)

uploaded_files = {}
analysis_results = {}

MIMO_API_KEY = os.getenv('MIMO_API_KEY', 'your-api-key')
MIMO_API_URL = os.getenv('MIMO_API_URL', 'https://api.xiaomimimo.com/v1')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_id = f"file_{len(uploaded_files) + 1}"

    file_content = file.read().decode('utf-8')

    language = detect_language(file.filename, file_content)

    uploaded_files[file_id] = {
        'filename': file.filename,
        'content': file_content,
        'language': language
    }
    
    return jsonify({
        'file_id': file_id,
        'filename': file.filename,
        'language': language
    })

@app.route('/api/analyze/<file_id>', methods=['GET'])
def analyze_code(file_id):
    if file_id not in uploaded_files:
        return jsonify({'error': 'File not found'}), 404
    
    file_info = uploaded_files[file_id]

    if file_id in analysis_results:
        return jsonify(analysis_results[file_id])

    try:
        issues = analyze_with_mimo(file_info['content'], file_info['language'])
        summary = generate_code_summary(file_info['content'], file_info['language'])

        result = {
            'issues': issues,
            'summary': summary
        }
        analysis_results[file_id] = result
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/issues/<file_id>', methods=['GET'])
def get_issues(file_id):
    if file_id not in analysis_results:
        return jsonify({'error': 'Analysis not found'}), 404
    
    return jsonify({
        'issues': analysis_results[file_id]['issues']
    })

@app.route('/api/suggestions/<issue_id>', methods=['GET'])
def get_suggestions(issue_id):
    issue = None
    for file_id, result in analysis_results.items():
        for i in result['issues']:
            if i['id'] == issue_id:
                issue = i
                break
        if issue:
            break
    
    if not issue:
        return jsonify({'error': 'Issue not found'}), 404

    suggestions = generate_suggestions(issue)
    
    return jsonify({
        'suggestions': suggestions
    })

@app.route('/api/apply-suggestion', methods=['POST'])
def apply_suggestion():
    data = request.get_json()
    file_id = data.get('file_id')
    suggestion_id = data.get('suggestion_id')
    
    if not file_id or not suggestion_id:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    if file_id not in uploaded_files:
        return jsonify({'error': 'File not found'}), 404

    suggestion = None
    for result in analysis_results.values():
        for issue in result['issues']:
            for s in issue.get('suggestions', []):
                if s['id'] == suggestion_id:
                    suggestion = s
                    break
            if suggestion:
                break
        if suggestion:
            break
    
    if not suggestion:
        return jsonify({'error': 'Suggestion not found'}), 404

    file_content = uploaded_files[file_id]['content']
    updated_code = apply_code_change(file_content, suggestion)

    uploaded_files[file_id]['content'] = updated_code
    
    return jsonify({
        'success': True,
        'updated_code': updated_code
    })

def detect_language(filename, content):
    extensions = {
        '.js': 'javascript',
        '.ts': 'typescript',
        '.py': 'python',
        '.java': 'java',
        '.c': 'c',
        '.cpp': 'cpp',
        '.cs': 'csharp',
        '.go': 'go',
        '.rb': 'ruby',
        '.php': 'php',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.rs': 'rust',
        '.html': 'html',
        '.css': 'css',
        '.json': 'json',
        '.xml': 'xml',
        '.yaml': 'yaml',
        '.yml': 'yaml'
    }

    for ext, lang in extensions.items():
        if filename.endswith(ext):
            return lang

    if 'import React' in content or 'from React' in content:
        return 'javascript'
    elif 'import ' in content and 'from ' in content:
        return 'python'
    elif 'public class' in content:
        return 'java'
    
    return 'text'

def analyze_with_mimo(code, language):

    if language == 'python':
        return [
            {
                'id': 'issue_1',
                'file_id': 'dummy',
                'line_start': 10,
                'line_end': 10,
                'column_start': 5,
                'column_end': 15,
                'severity': 'error',
                'type': 'bug',
                'message': '未使用的导入',
                'code': 'import unused_module'
            },
            {
                'id': 'issue_2',
                'file_id': 'dummy',
                'line_start': 25,
                'line_end': 27,
                'column_start': 1,
                'column_end': 20,
                'severity': 'warning',
                'type': 'performance',
                'message': '循环中不必要的列表创建',
                'code': 'for i in range(10):\n    new_list = []\n    new_list.append(i)'
            }
        ]
    elif language == 'javascript' or language == 'typescript':
        return [
            {
                'id': 'issue_3',
                'file_id': 'dummy',
                'line_start': 5,
                'line_end': 5,
                'column_start': 1,
                'column_end': 10,
                'severity': 'error',
                'type': 'bug',
                'message': '未声明的变量',
                'code': 'console.log(undeclaredVar);'
            },
            {
                'id': 'issue_4',
                'file_id': 'dummy',
                'line_start': 15,
                'line_end': 15,
                'column_start': 10,
                'column_end': 20,
                'severity': 'warning',
                'type': 'style',
                'message': '使用let而不是var',
                'code': 'var counter = 0;'
            }
        ]
    else:
        return [
            {
                'id': 'issue_5',
                'file_id': 'dummy',
                'line_start': 1,
                'line_end': 1,
                'column_start': 1,
                'column_end': 10,
                'severity': 'info',
                'type': 'style',
                'message': '建议添加文件头部注释',
                'code': language
            }
        ]

def generate_code_summary(code, language):
    
    if language == 'python':
        return "这是一个Python文件，包含基本的函数定义和控制流。代码结构清晰，但存在一些未使用的导入和潜在的性能问题。建议优化循环中的列表创建，并移除未使用的导入。"
    elif language == 'javascript' or language == 'typescript':
        return "这是一个JavaScript/TypeScript文件，包含变量声明、函数定义和事件处理。代码逻辑基本合理，但存在未声明变量的错误和一些风格问题。建议使用现代JavaScript语法，如let/const替代var，并确保所有变量都已正确声明。"
    else:
        return f"这是一个{language}文件。代码结构基本合理，但建议添加更多的注释和文档字符串，以提高代码的可维护性。"

def generate_suggestions(issue):
    if issue['type'] == 'bug':
        return [
            {
                'id': f'suggestion_{issue["id"]}_1',
                'issue_id': issue['id'],
                'description': '修复bug',
                'original_code': issue['code'],
                'suggested_code': fix_bug(issue['code'], issue['message']),
                'explanation': f'这个修改解决了"{issue["message"]}"的问题'
            }
        ]
    elif issue['type'] == 'performance':
        return [
            {
                'id': f'suggestion_{issue["id"]}_1',
                'issue_id': issue['id'],
                'description': '优化性能',
                'original_code': issue['code'],
                'suggested_code': optimize_performance(issue['code']),
                'explanation': '这个修改提高了代码的执行效率'
            }
        ]
    elif issue['type'] == 'style':
        return [
            {
                'id': f'suggestion_{issue["id"]}_1',
                'issue_id': issue['id'],
                'description': '改进代码风格',
                'original_code': issue['code'],
                'suggested_code': improve_style(issue['code']),
                'explanation': '这个修改使代码更符合最佳实践'
            }
        ]
    else:
        return [
            {
                'id': f'suggestion_{issue["id"]}_1',
                'issue_id': issue['id'],
                'description': '一般改进',
                'original_code': issue['code'],
                'suggested_code': issue['code'],
                'explanation': '建议进一步审查此代码'
            }
        ]

def fix_bug(code, message):
    if '未使用的导入' in message:
        return ''
    elif '未声明的变量' in message:
        return 'let undeclaredVar = "";\nconsole.log(undeclaredVar);'
    else:
        return code

def optimize_performance(code):
    if '循环中不必要的列表创建' in code:
        return 'new_list = []\nfor i in range(10):\n    new_list.append(i)'
    else:
        return code

def improve_style(code):
    if 'var counter' in code:
        return code.replace('var', 'let')
    elif '建议添加文件头部注释' in code:
        return f'// 这是一个{code}文件\n// 创建日期: {datetime.now().strftime("%Y-%m-%d")}\n\n{code}'
    else:
        return code

def apply_code_change(original_code, suggestion):
    return original_code.replace(suggestion['original_code'], suggestion['suggested_code'])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)