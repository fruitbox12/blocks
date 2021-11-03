import {asyncType, boolType, effectType, paramType, unitType} from '../block-types/types';
import {computeMemberName, memberBlock} from '../block-patterns/member-patterns';
import {functionCategory} from '../block-categories/categories';
import {stringSelectProp} from '../block-patterns/control-patterns';

const defaultReturnType = effectType.of(unitType);

const block = memberBlock({
    category: functionCategory,
    topRight: 'body',
    computeTitle(node, editor) {
        let name = computeMemberName(node, editor);
        // return name;/////
        let {params, asyncKind} = editor.compilers.motoko.getInputArgs(node);
        let returnType = editor.compilers.type.getInput(node, 'body')?.generics[0];
        if(asyncKind) {
            returnType = asyncType.of(returnType);
        }
        return name && params && `${name}(${params.join(', ')})${returnType ? ' : ' + editor.compilers.motoko.getTypeString(returnType) : ''}`;
    },
    shortcuts: [{
        block: 'Return',
    }, {
        block: 'FunctionCall',
        nodeKey: 'functionNode',
    }],
    inputs: [{
        key: 'params',
        type: paramType,
        multi: true,
    }/*, {
        key: 'returnType',
        type: typeType.of(valueType),
    }*/, {
        key: 'body',
        type: effectType,
        optional: true,
    }],
    // outputs: [{
    //     key: 'reference',
    //     type: valueType,
    //     toMotoko({name}) {
    //         return name;
    //     },
    // }],
    controls: [{
        key: 'shared',
        type: boolType,
    }, stringSelectProp({
        key: 'asyncKind',
        optional: true,
    }, ['async', 'query'])],
}, {
    toMotoko({visibility, shared, asyncKind, name, params, body}, node, compiler) {
        // TODO: dry with State modifiers
        let modifiers = [visibility !== 'system' && visibility, shared && 'shared', asyncKind === 'query' && asyncKind].filter(m => m).join(' '); //TODO: combine into single control

        let returnType = body ? compiler.inferType(node, 'body') : defaultReturnType;
        if(!returnType) {
            return;
        }
        returnType = returnType.generics[0]; // Unwrap `Effect<>`
        if(asyncKind) {
            returnType = asyncType.of(returnType);
        }
        let returnString = compiler.getTypeString(returnType);
        if(!returnString) {
            return;///
        }
        return `${modifiers && modifiers + ' '}func${name ? ' ' + name : ''}(${params.join(', ')})${returnString !== '()' ? ': ' + returnString : ''} { ${body || ''} };`;
    },
});
export default block;