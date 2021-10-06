import React, {useContext} from 'react';
import Rete from 'rete';
import AreaPlugin from 'rete-area-plugin';
import ConnectionPlugin from 'rete-connection-plugin';
import ConnectionMasteryPlugin from 'rete-connection-mastery-plugin';
import ContextMenuPlugin from '../../plugins/rete-react-contextmenu-plugin';
import HistoryPlugin from 'rete-history-plugin';
import CommentPlugin from 'rete-comment-plugin';
import ReactRenderPlugin from 'rete-react-render-plugin';
import EventsContext, {EDITOR_CHANGE_EVENT, ENGINE_NOTIFY_EVENT, ERROR_EVENT} from '../../contexts/EventsContext';
import NodeHandle from './nodes/NodeHandle';
import BlockComponent from '../../editor/components/BlockComponent';
import {BLOCK_MAP} from '../../editor/blocks';
import useListener from '../../hooks/useListener';

export default function Editor({onSetup, onChange}) {
    let name = process.env.REACT_APP_EDITOR_NAME;
    let version = process.env.REACT_APP_EDITOR_VERSION;

    let events = useContext(EventsContext);
    let editor = null;
    let engine = null;

    ///
    // useListener(events, EDITOR_PROCESS_EVENT, () => {
    //     let compiler = new Compiler(editor);
    //     let result = compiler.compile('2');///////
    //     console.log('Compiled:', result);
    // });

    useListener(events, ENGINE_NOTIFY_EVENT, async () => {
        if(editor && engine) {
            await engine.abort();
            await engine.process(editor.toJSON());
        }
    });

    let setupEditor = (element) => {
        if(!element) {
            if(editor) {
                editor.clear();
                editor.destroy();
            }
            return;
        }

        let id = name + '@' + version;

        editor = new Rete.NodeEditor(id, element);
        editor.use(ReactRenderPlugin, {
            component: NodeHandle,
        });
        editor.use(HistoryPlugin);
        editor.use(CommentPlugin);
        editor.use(ConnectionPlugin);
        editor.use(ConnectionMasteryPlugin);
        editor.use(ContextMenuPlugin, {});

        engine = new Rete.Engine(id);

        editor._engine = engine; ////////temp

        for(let block of BLOCK_MAP.values()) {
            let node = new BlockComponent(block);
            editor.register(node);
            engine.register(node);
        }

        editor.on(['nodecreated', 'noderemoved', 'connectioncreated', 'connectionremoved'], async () => {
            await engine.abort();

            let state = editor.toJSON();
            // console.log('State:', state);
            await engine.process(state);

            // await editor.trigger('process');
        });
        editor.on('zoom', ({source}) => {
            return source !== 'dblclick';
        });
        editor.on('process', (...args) => {
            let state = editor.toJSON();
            events.emit(EDITOR_CHANGE_EVENT, state);
            if(onChange) {
                onChange(state, editor, engine);
            }
        });
        editor.on('renderconnection', ({el, connection}) => {
            el.querySelector('.connection').classList.add(
                `socket-input-category-${connection.input.socket.data.category}`,
                `socket-output-category-${connection.output.socket.data.category}`,
            );
        });
        editor.on('error', err => events.emit(ERROR_EVENT, err));

        async function loadState(state) {
            if(!state) {
                return;
            }
            // for(let [key, node] of Object.entries(state.nodes)) {
            //     if(!BLOCK_MAP.has(node.name)) {
            //         delete state.nodes[key];
            //         console.warn('Unknown block:', node.name);
            //     }
            // }
            return await editor.fromJSON(state);
        }

        (async () => {
            if(onSetup) {
                await onSetup(loadState, editor, engine);
            }

            editor.view.resize();
            AreaPlugin.zoomAt(editor);
            // events.emit(PROCESS_EVENT);
            // await engine.abort();
            // await engine.process(editor.toJSON());
        })().catch(err => events.emit(ERROR_EVENT, err));
    };

    return (
        <div style={{width: '100%', height: '100vh'}}>
            <div ref={setupEditor}/>
        </div>
    );
}