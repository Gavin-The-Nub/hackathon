import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { GenuineResult, LanguageId, RequiredConstruct } from '../types';

export function checkConstructs(
  code: string,
  functionName: string,
  requiredConstructs: RequiredConstruct[],
  runId = 'run-verify',
  language: LanguageId = 'javascript'
): GenuineResult {
  if (!requiredConstructs || requiredConstructs.length === 0) {
    return {
      runId,
      label: 'GENUINE',
      reason: null,
    };
  }

  // Handle Python construct verification via syntax pattern analysis
  if (language === 'python') {
    for (const construct of requiredConstructs) {
      let satisfied = false;
      if (construct === 'for_loop') {
        satisfied = /\bfor\s+[a-zA-Z0-9_,\s()]+\s+in\b/.test(code);
      } else if (construct === 'while_loop') {
        satisfied = /\bwhile\b/.test(code);
      } else if (construct === 'any_loop') {
        satisfied = /\bfor\s+[a-zA-Z0-9_,\s()]+\s+in\b/.test(code) || /\bwhile\b/.test(code);
      } else if (construct === 'recursion') {
        // Look for recursive call to functionName in the body
        const fnPattern = new RegExp(`def\\s+${functionName}\\s*\\([^)]*\\):([\\s\\S]*)`);
        const match = code.match(fnPattern);
        if (match && match[1]) {
          const body = match[1];
          satisfied = new RegExp(`\\b${functionName}\\s*\\(`).test(body);
        }
      }

      if (!satisfied) {
        return {
          runId,
          label: 'CORRECT_NOT_GENUINE',
          reason: 'missing_construct',
          missingConstruct: construct,
        };
      }
    }

    return {
      runId,
      label: 'GENUINE',
      reason: null,
    };
  }

  let ast: any;
  try {
    ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
  } catch (err) {
    return {
      runId,
      label: 'GENUINE_UNVERIFIED',
      reason: 'parse_failed',
    };
  }

  // Find the target function node
  let targetFnNode: any = null;

  walk.simple(ast, {
    FunctionDeclaration(node: any) {
      if (node.id?.name === functionName) {
        targetFnNode = node;
      }
    },
    VariableDeclarator(node: any) {
      if (
        node.id?.name === functionName &&
        (node.init?.type === 'FunctionExpression' || node.init?.type === 'ArrowFunctionExpression')
      ) {
        targetFnNode = node.init;
      }
    },
    AssignmentExpression(node: any) {
      if (
        node.left?.name === functionName &&
        (node.right?.type === 'FunctionExpression' || node.right?.type === 'ArrowFunctionExpression')
      ) {
        targetFnNode = node.right;
      }
    },
  });

  if (!targetFnNode) {
    // If function declaration isn't cleanly isolated, check whole AST as fallback
    targetFnNode = ast;
  }

  for (const construct of requiredConstructs) {
    let satisfied = false;

    walk.simple(targetFnNode, {
      ForStatement() {
        if (construct === 'for_loop' || construct === 'any_loop') satisfied = true;
      },
      WhileStatement() {
        if (construct === 'while_loop' || construct === 'any_loop') satisfied = true;
      },
      DoWhileStatement() {
        if (construct === 'while_loop' || construct === 'any_loop') satisfied = true;
      },
      ForInStatement() {
        if (construct === 'any_loop') satisfied = true;
      },
      ForOfStatement() {
        if (construct === 'any_loop') satisfied = true;
      },
      CallExpression(node: any) {
        if (construct === 'recursion' && node.callee?.name === functionName) {
          satisfied = true;
        }
      },
    });

    if (!satisfied) {
      return {
        runId,
        label: 'CORRECT_NOT_GENUINE',
        reason: 'missing_construct',
        missingConstruct: construct,
      };
    }
  }

  return {
    runId,
    label: 'GENUINE',
    reason: null,
  };
}
