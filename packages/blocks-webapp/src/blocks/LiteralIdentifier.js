import {identifierType} from '../block-types/types';
import {FaItalic} from 'react-icons/all';

const block = {
    title: 'Identifier',
    // category: defaultCategory,
    icon: FaItalic,
    topRight: 'value',
    outputs: [{
        key: 'value',
        type: identifierType,
        control: true,
    }],
};
export default block;