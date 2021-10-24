import {anyReversedType, anyType} from '../block-types/types';
import OutputControlHandle from '../components/rete/controls/OutputControlHandle';
import {compilerCategory} from '../block-categories/categories';

export function compileBlock(title, compilerKey, displayFn) {
    function queryFor(inputKey) {
        return async function(control, node, editor) {
            let value = editor.compilers[compilerKey].getInput(node, inputKey);
            return displayFn ? displayFn(value) : value;
        };
    }

    return {
        title,
        showIcon: true,/////
        topLeft: 'input',
        topRight: 'reversed',
        category: compilerCategory,
        inputs: [{
            key: 'input',
            title: 'Input',
            type: anyType,
        }, {
            key: 'reversed',
            title: 'Input',
            type: anyReversedType,
        }],
        controls: [{
            key: 'reversedDisplay',
            title: 'Display',
            config: {
                controlType: OutputControlHandle,
                controlProps: {
                    query: queryFor('reversed'),
                },
            },
        }, {
            key: 'display',
            config: {
                controlType: OutputControlHandle,
                controlProps: {
                    query: queryFor('input'),
                },
            },
        }],
    };
}