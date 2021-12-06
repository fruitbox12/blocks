import {anyReversedType, anyType} from '../block-types/types';
import OutputControlHandle from '../components/rete/controls/OutputControlHandle';
import {compilerCategory} from '../block-categories/categories';
import {resolveImportRefs} from '../compilers/MotokoCompiler';

export function compileBlock(title, compilerKey, displayFn) {
    function queryFor(inputKey) {
        return (control, node, editor) => {
            let value = editor.compilers[compilerKey].getInput(node, inputKey);
            let string = displayFn ? displayFn(value) : value;
            const [prefixes, code] = resolveImportRefs(string);
            return [...prefixes, code].join(' ');
        };
    }

    return {
        title,
        category: compilerCategory,
        icon: compilerCategory.data.icon,
        topLeft: 'input',
        topRight: 'reversed',
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
