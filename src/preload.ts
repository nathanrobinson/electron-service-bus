try {
    const { ipcRenderer } = require("electron");
    (<any>window).ipcRenderer = ipcRenderer;

    const win = (<any>window);
    const _nodeSetImmediate = win.nodeSetImmediate;
    const _setImmediate = win.setImmediate;

    if (!!_nodeSetImmediate) {
        setInterval(() => {
            const win2 = (<any>window);
            if (!win2.nodeSetImmediate) {
                win2.nodeSetImmediate = _nodeSetImmediate;
            }
            _nodeSetImmediate(() => {});
        }, 1000);
    } else {
        console.error('nodeSetImmediate is not defined!');
    }

    if (!!_setImmediate) {
        setInterval(() => {
            const win2 = (<any>window);
            if (!win2.setImmediate) {
                win2.setImmediate = _setImmediate;
            }
        }, 1000);
        _setImmediate(() => {});
    } else {
        console.error('setImmediate is not defined!');
    }
} catch (error) {
    console.error('Preload Error!', error);
    throw error;
}
